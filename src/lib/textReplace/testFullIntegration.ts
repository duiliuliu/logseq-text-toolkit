/**
 * 完整测试 utils.ts 的修复
 */

const parseNestedFormat = (text: string): string => {
  if (text.startsWith('[:') && text.endsWith(']')) {
    return text;
  }
  
  const processOuterFormat = (str: string): string => {
    const outerFormats = [
      { regex: /\*\*([^*]+)\*\*/g, tag: 'b' },
      { regex: /(?<!\*)\*([^*]+)\*(?!\*)/g, tag: 'i' },
      { regex: /~~([^~]+)~~/g, tag: 's' },
      { regex: /==([^=]+)==/g, tag: 'mark' },
      { regex: /`([^`]+)`/g, tag: 'code' },
    ];
    
    const recursiveProcess = (s: string): string => {
      const hasAnyFormat = outerFormats.some(f => f.regex.test(s));
      if (!hasAnyFormat) {
        return s;
      }
      
      let processed = s;
      
      for (const { regex, tag } of outerFormats) {
        processed = processed.replace(regex, (match, content) => {
          const innerContent = recursiveProcess(content);
          
          const isHiccupFormat = innerContent.startsWith('[:') && innerContent.endsWith(']');
          
          if (isHiccupFormat) {
            return `[:${tag} ${innerContent}]`;
          } else if (innerContent.includes(' ') || 
                     innerContent.includes('"') || 
                     innerContent.includes("'")) {
            return `[:${tag} "${innerContent}"]`;
          } else {
            return `[:${tag} ${innerContent}]`;
          }
        });
      }
      
      return processed;
    };
    
    return recursiveProcess(str);
  };
  
  return processOuterFormat(text);
};

const hasExistingFormat = (text: string): boolean => {
  if (text.startsWith('[:') && text.endsWith(']')) {
    return true;
  }
  
  const formatPatterns = [
    /\*\*[^*]+\*\*/,
    /\*[^*]+\*/,
    /~~[^~]+~~/,
    /==[^=]+==/,
    /`[^`]+`/,
  ];
  
  return formatPatterns.some(pattern => pattern.test(text));
};

const parseWrapperPattern = (invokeParams: string): { prefix: string; suffix: string } | null => {
  const match = invokeParams.match(/^(.*)\${selectedText}(.*)$/);
  if (match) {
    return { prefix: match[1], suffix: match[2] };
  }
  return null;
};

const needsQuotes = (text: string): boolean => {
  if (text.startsWith('[:') && text.endsWith(']')) {
    return false;
  }
  
  return text.includes(' ') || text.includes('\u00A0') || text.includes('\u3000') || 
         text.includes('"') || text.includes("'");
};

const wrapWithQuotesIfNeeded = (prefix: string, suffix: string, text: string): string => {
  const prefixHasQuote = prefix.endsWith('"') || prefix.endsWith("'");
  const suffixHasQuote = suffix.startsWith('"') || suffix.startsWith("'");
  
  if (needsQuotes(text) && !prefixHasQuote && !suffixHasQuote) {
    return prefix + `"${text}"` + suffix;
  }
  
  if (!needsQuotes(text) && prefixHasQuote && suffixHasQuote) {
    const cleanPrefix = prefix.slice(0, -1);
    const cleanSuffix = suffix.slice(1);
    return cleanPrefix + text + cleanSuffix;
  }
  
  return prefix + text + suffix;
};

const handleNestedQuotes = (prefix: string, suffix: string, text: string, nestedText: string): string => {
  const prefixHasQuote = prefix.endsWith('"') || prefix.endsWith("'");
  const suffixHasQuote = suffix.startsWith('"') || suffix.startsWith("'");
  
  const isAlreadyNested = text.startsWith('[:') && text.endsWith(']');
  
  const isEntirelyWrappedFormat = (
    (text.startsWith('**') && text.endsWith('**')) ||
    (text.startsWith('*') && text.endsWith('*') && !text.startsWith('**')) ||
    (text.startsWith('~~') && text.endsWith('~~')) ||
    (text.startsWith('==') && text.endsWith('==')) ||
    (text.startsWith('`') && text.endsWith('`'))
  );
  
  const hasFormatMarkers = text.includes('**') || text.includes('*') || text.includes('~~') || text.includes('==') || text.includes('`');
  const isPartiallyFormatted = hasFormatMarkers && !isEntirelyWrappedFormat;
  
  if (isAlreadyNested) {
    if (prefixHasQuote && suffixHasQuote) {
      const cleanPrefix = prefix.slice(0, -1);
      const cleanSuffix = suffix.slice(1);
      return cleanPrefix + text + cleanSuffix;
    } else {
      return prefix + text + suffix;
    }
  }
  
  if (isEntirelyWrappedFormat) {
    if (prefixHasQuote && suffixHasQuote) {
      const cleanPrefix = prefix.slice(0, -1);
      const cleanSuffix = suffix.slice(1);
      return cleanPrefix + nestedText + cleanSuffix;
    } else {
      return wrapWithQuotesIfNeeded(prefix, suffix, nestedText);
    }
  }
  
  if (isPartiallyFormatted) {
    return wrapWithQuotesIfNeeded(prefix, suffix, nestedText);
  }
  
  return wrapWithQuotesIfNeeded(prefix, suffix, nestedText);
};

const replaceText = (item, text: string): string => {
  if (!text || text.trim() === '') {
    return '';
  }
  
  const hasNewlines = text.includes('\n');
  
  if (hasNewlines) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      return '';
    }
    
    const processedLines = lines.map(line => {
      const wrapper = parseWrapperPattern(String(item.invokeParams));
      
      if (wrapper && hasExistingFormat(line)) {
        const nestedText = parseNestedFormat(line);
        return handleNestedQuotes(wrapper.prefix, wrapper.suffix, line, nestedText);
      } else {
        if (wrapper) {
          return wrapWithQuotesIfNeeded(wrapper.prefix, wrapper.suffix, line);
        }
        return String(item.invokeParams).replace(/\${selectedText}/g, line);
      }
    });
    
    if (processedLines.length === 1) {
      return processedLines[0];
    }
    
    return processedLines.map(line => `[:div ${line}]`).join('');
  } else {
    const wrapper = parseWrapperPattern(String(item.invokeParams));
    
    if (wrapper && hasExistingFormat(text)) {
      const nestedText = parseNestedFormat(text);
      return handleNestedQuotes(wrapper.prefix, wrapper.suffix, text, nestedText);
    } else {
      if (wrapper) {
        return wrapWithQuotesIfNeeded(wrapper.prefix, wrapper.suffix, text);
      }
      return String(item.invokeParams).replace(/\${selectedText}/g, text);
    }
  }
};

console.log('=== 完整测试 ===\n');

const testCases = [
  { name: '多层混合格式', input: '==**高亮加粗**==', item: { invokeParams: '[:span.purple ${selectedText}]' }, expected: '[:span.purple [:mark [:b 高亮加粗]]]' },
  { name: '极端多种格式混合', input: '**粗体** 和 *斜体* 和 ~~删除~~ 和 ==高亮== 和 `代码`', item: { invokeParams: '[:span.red ${selectedText}]' }, expected: '[:span.red [:b 粗体]] 和 [:span.red [:i 斜体]] 和 [:span.red [:s 删除]] 和 [:span.red [:mark 高亮]] 和 [:span.red [:code 代码]]' },
  { name: '普通嵌套', input: '[:b "加粗"]', item: { invokeParams: '[:span.red ${selectedText}]' }, expected: '[:span.red [:b "加粗"]]' },
  { name: '复杂嵌套', input: '[:u.red [:b "嵌套文本"]]', item: { invokeParams: '[:span.green ${selectedText}]' }, expected: '[:span.green [:u.red [:b "嵌套文本"]]]' },
];

let passed = 0;
let failed = 0;

for (const test of testCases) {
  const output = replaceText(test.item, test.input);
  const success = output === test.expected;
  
  if (success) {
    console.log(`✅ ${test.name}`);
    passed++;
  } else {
    console.log(`❌ ${test.name}`);
    console.log(`   输入: ${test.input}`);
    console.log(`   期望: ${test.expected}`);
    console.log(`   实际: ${output}`);
    failed++;
  }
}

console.log(`\n总计: ${passed}/${testCases.length} 通过`);
