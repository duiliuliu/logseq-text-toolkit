/**
 * 测试用户问题 - 完整复制 utils.ts 的最新逻辑
 */

// 完整复制 utils.ts 中的相关函数
const hasExistingFormat = (text) => {
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

const parseNestedFormat = (text) => {
  if (text.startsWith('[:') && text.endsWith(']')) {
    return text;
  }
  
  const processOuterFormat = (str) => {
    const outerFormats = [
      { regex: /\*\*([^*]+)\*\*/g, tag: 'b' },
      { regex: /(?<!\*)\*([^*]+)\*(?!\*)/g, tag: 'i' },
      { regex: /~~([^~]+)~~/g, tag: 's' },
      { regex: /==([^=]+)==/g, tag: 'mark' },
      { regex: /`([^`]+)`/g, tag: 'code' },
    ];
    
    const recursiveProcess = (s) => {
      const hasAnyFormat = outerFormats.some(f => f.regex.test(s));
      if (!hasAnyFormat) {
        return s;
      }
      
      let processed = s;
      
      for (const { regex, tag } of outerFormats) {
        processed = processed.replace(regex, (_match, content) => {
          const innerContent = recursiveProcess(content);
          const isHiccupFormat = innerContent.startsWith('[:') && innerContent.endsWith(']');
          const containsHiccup = innerContent.includes('[:');
          
          if (isHiccupFormat || containsHiccup) {
            return `[:${tag} ${innerContent}]`;
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

const parseWrapperPattern = (invokeParams) => {
  const match = invokeParams.match(/^(.*)\${selectedText}(.*)$/);
  if (match) {
    return { prefix: match[1], suffix: match[2] };
  }
  return null;
};

const needsQuotes = (text) => {
  if (text.startsWith('[:') && text.endsWith(']')) {
    return false;
  }
  return text.includes(' ') || text.includes('\u00A0') || text.includes('\u3000') || 
         text.includes('"') || text.includes("'");
};

const wrapWithQuotesIfNeeded = (prefix, suffix, text) => {
  if (text.startsWith('[:') && text.endsWith(']')) {
    return prefix + text + suffix;
  }
  
  if (text.includes('[:')) {
    return prefix + text + suffix;
  }
  
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

const handleNestedQuotes = (prefix, suffix, text, nestedText) => {
  const prefixHasQuote = prefix.endsWith('"') || prefix.endsWith("'");
  const suffixHasQuote = suffix.startsWith('"') || suffix.startsWith("'");
  
  const isAlreadyNested = text.startsWith('[:') && text.endsWith(']');
  const nestedIsHiccup = nestedText.startsWith('[:') && nestedText.endsWith(']');
  const nestedContainsHiccup = nestedText.includes('[:');
  
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
      if (nestedIsHiccup || nestedContainsHiccup) {
        return prefix + nestedText + suffix;
      }
      return wrapWithQuotesIfNeeded(prefix, suffix, nestedText);
    }
  }
  
  if (isPartiallyFormatted) {
    if (nestedIsHiccup || nestedContainsHiccup) {
      return prefix + nestedText + suffix;
    }
    return wrapWithQuotesIfNeeded(prefix, suffix, nestedText);
  }
  
  if (nestedIsHiccup || nestedContainsHiccup) {
    return prefix + nestedText + suffix;
  }
  return wrapWithQuotesIfNeeded(prefix, suffix, nestedText);
};

const replaceText = (item, text) => {
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
      if (item.regex && item.replacement) {
        const regex = new RegExp(item.regex, 'g');
        return line.replace(regex, item.replacement);
      } else if (item.invokeParams) {
        if (typeof item.invokeParams === 'object' && item.invokeParams.regex) {
          const { regex: pattern, replacement, flags = 'g' } = item.invokeParams;
          const regex = new RegExp(pattern, flags);
          return line.replace(regex, replacement);
        } else {
          const invokeParamsStr = String(item.invokeParams);
          const wrapper = parseWrapperPattern(invokeParamsStr);
          
          if (wrapper && hasExistingFormat(line)) {
            const nestedText = parseNestedFormat(line);
            return handleNestedQuotes(wrapper.prefix, wrapper.suffix, line, nestedText);
          } else {
            const wrapperCheck = parseWrapperPattern(invokeParamsStr);
            if (wrapperCheck) {
              return wrapWithQuotesIfNeeded(wrapperCheck.prefix, wrapperCheck.suffix, line);
            }
            return invokeParamsStr.replace(/\${selectedText}/g, line);
          }
        }
      }
      return line;
    });
    
    if (processedLines.length === 1) {
      return processedLines[0];
    }
    
    return processedLines.map(line => `[:div ${line}]`).join('');
  } else {
    if (item.regex && item.replacement) {
      const regex = new RegExp(item.regex, 'g');
      return text.replace(regex, item.replacement);
    } else if (item.invokeParams) {
      if (typeof item.invokeParams === 'object' && item.invokeParams.regex) {
        const { regex: pattern, replacement, flags = 'g' } = item.invokeParams;
        const regex = new RegExp(pattern, flags);
        return text.replace(regex, replacement);
      } else {
        const invokeParamsStr = String(item.invokeParams);
        const wrapper = parseWrapperPattern(invokeParamsStr);
        
        if (wrapper && hasExistingFormat(text)) {
          const nestedText = parseNestedFormat(text);
          return handleNestedQuotes(wrapper.prefix, wrapper.suffix, text, nestedText);
        } else {
          if (wrapper) {
            return wrapWithQuotesIfNeeded(wrapper.prefix, wrapper.suffix, text);
          }
          return invokeParamsStr.replace(/\${selectedText}/g, text);
        }
      }
    }
    return text;
  }
};

// 测试用例
console.log('='.repeat(80));
console.log('测试 utils.ts replaceText 函数');
console.log('='.repeat(80));

const tests = [
  {
    name: '用户原始问题',
    item: { invokeParams: '[:span.blue ${selectedText}]' },
    input: '数组越大 → **扫描越久 → STW（暂停时间）越长 → 服务卡顿**。',
    expected: '[:span.blue 数组越大 → [:b 扫描越久 → STW（暂停时间）越长 → 服务卡顿]。]'
  },
  {
    name: '简单版本',
    item: { invokeParams: '[:span.red ${selectedText}]' },
    input: 'text **bold** more',
    expected: '[:span.red text [:b bold] more]'
  }
];

let passed = 0;
let failed = 0;

tests.forEach((test) => {
  const result = replaceText(test.item, test.input);
  const success = result === test.expected;
  
  console.log(`\n📋 ${test.name}`);
  if (success) {
    console.log('✅ 通过');
    passed++;
  } else {
    console.log('❌ 失败');
    console.log(`   输入: ${JSON.stringify(test.input)}`);
    console.log(`   期望: ${JSON.stringify(test.expected)}`);
    console.log(`   实际: ${JSON.stringify(result)}`);
    failed++;
  }
});

console.log('\n' + '='.repeat(80));
console.log(`结果: ${passed}/${tests.length} 通过`);
console.log('='.repeat(80));
