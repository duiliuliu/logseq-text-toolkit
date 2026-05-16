/**
 * 综合测试 utils.ts 核心函数
 * 此文件直接从 utils.ts 提取核心函数用于测试
 */

// 从 utils.ts 提取的核心函数（移除了外部依赖

interface ToolbarItem {
  id?: string;
  label?: string;
  binding?: string;
  icon?: string;
  invoke?: string;
  invokeParams?: any;
  regex?: string;
  replacement?: string;
  hidden?: boolean;
}

/**
 * 检查文本是否已有格式
 */
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

/**
 * 将原始文本中的格式标记解析为 Logseq 支持的嵌套格式
 */
const parseNestedFormat = (text: string): string => {
  if (text.startsWith('[:') && text.endsWith(']')) {
    return text;
  }
  
  // 使用从外到内的策略：递归地处理最外层的格式
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

/**
 * 检测 invokeParams 中的包裹模式，并提取前缀和后缀
 */
const parseWrapperPattern = (invokeParams: string): { prefix: string; suffix: string } | null => {
  const match = invokeParams.match(/^(.*)\${selectedText}(.*)$/);
  if (match) {
    return { prefix: match[1], suffix: match[2] };
  }
  
  return null;
};

/**
 * 判断文本是否需要用引号包裹
 */
const needsQuotes = (text: string): boolean => {
  if (text.startsWith('[:') && text.endsWith(']')) {
    return false;
  }
  
  return text.includes(' ') || text.includes('\u00A0') || text.includes('\u3000') || 
         text.includes('"') || text.includes("'");
};

/**
 * 处理文本的引号包裹逻辑
 */
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

/**
 * 智能处理嵌套格式
 */
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

/**
 * 替换文本 - 核心逻辑
 */
const replaceText = (item: ToolbarItem, text: string): string => {
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
      if (item.invokeParams) {
        const invokeParamsStr = String(item.invokeParams);
        const wrapper = parseWrapperPattern(invokeParamsStr);
        
        if (wrapper && hasExistingFormat(line)) {
          const nestedText = parseNestedFormat(line);
          return handleNestedQuotes(wrapper.prefix, wrapper.suffix, line, nestedText);
        } else {
          const wrapper = parseWrapperPattern(invokeParamsStr);
          if (wrapper) {
            return wrapWithQuotesIfNeeded(wrapper.prefix, wrapper.suffix, line);
          }
          return invokeParamsStr.replace(/\${selectedText}/g, line);
        }
      }
      return line;
    });
    
    if (processedLines.length === 1) {
      return processedLines[0];
    }
    
    return processedLines.map(line => `[:div ${line}]`).join('');
  } else {
    if (item.invokeParams) {
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
    return text;
  }
};

console.log('='.repeat(80));
console.log('utils.ts 核心函数测试');
console.log('='.repeat(80));
console.log('');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// 测试用例
const testCases = [
  {
    category: '普通场景测试',
    tests: [
      { name: '简单文本加粗', input: 'text', item: { invokeParams: '**${selectedText}**' },
      expected: '**text**' },
      { name: '带空格文本加颜色', input: '带空格的文本', item: { invokeParams: '[:span.red ${selectedText}]' },
      expected: '[:span.red "带空格的文本"]' },
      { name: '空文本', input: '', item: { invokeParams: '**${selectedText}**' },
      expected: '' },
      { name: '纯空格', input: '   ', item: { invokeParams: '**${selectedText}**' },
      expected: '' },
    ]
  },
  {
    category: '嵌套格式测试',
    tests: [
      { name: '嵌套格式（内粗体', input: '==**粗体高亮**==', item: { invokeParams: '[:span.purple ${selectedText}]' },
      expected: '[:span.purple [:mark [:b 粗体高亮]]' },
      { name: '已嵌套 hiccup', input: '[:b 加粗文本]', item: { invokeParams: '[:span.red ${selectedText}]' },
      expected: '[:span.red [:b 加粗文本]]' },
    ]
  },
  {
    category: '特殊字符测试',
    tests: [
      { name: '包含引号', input: '带"引号"的文本', item: { invokeParams: '[:span.yellow ${selectedText}]' },
      expected: '[:span.yellow "带\"引号\"的文本"]' },
    ]
  },
];

for (const testGroup of testCases) {
  console.log('');
  console.log(testGroup.category);
  console.log('-'.repeat(80));
  
  for (const test of testGroup.tests) {
    totalTests++;
    
    const result = replaceText(test.item, test.input);
    const passed = result === test.expected;
    
    if (passed) {
      passedTests++;
      console.log(`✓ ${test.name} - 测试通过`);
    } else {
      failedTests++;
      console.log(`✗ ${test.name} - 测试失败`);
      console.log(`  输入: ${JSON.stringify(test.input)}`);
      console.log(`  期望: ${JSON.stringify(test.expected)}`);
      console.log(`  实际: ${JSON.stringify(result)}`);
    }
  }
}

console.log('');
console.log('='.repeat(80));
console.log(`测试结果: ${passedTests}/${totalTests} 通过, ${failedTests} 失败`);
console.log('='.repeat(80));
