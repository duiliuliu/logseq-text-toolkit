/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * utils.ts 正式逻辑与测试逻辑对比验证
 */

interface ToolbarItem {
  id: string;
  label: string;
  binding?: string;
  icon?: string;
  invoke: string;
  invokeParams: any;
  regex?: string;
  replacement?: string;
  hidden?: boolean;
}

interface RegexReplaceParams {
  regex: string;
  replacement: string;
  flags?: string;
}

type InvokeParams = string | RegexReplaceParams;

function isRegexReplaceParams(params: InvokeParams): params is RegexReplaceParams {
  return typeof params === 'object' && params !== null && 'regex' in params;
}

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

const parseNestedFormat = (text: string): string => {
  if (text.startsWith('[:') && text.endsWith(']')) {
    return text;
  }
  
  let result = text;
  
  result = result.replace(/\*\*([^*]+)\*\*/g, '[:b "$1"]');
  result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '[:i "$1"]');
  result = result.replace(/~~([^~]+)~~/g, '[:s "$1"]');
  result = result.replace(/==([^=]+)==/g, '[:mark "$1"]');
  result = result.replace(/`([^`]+)`/g, '[:code "$1"]');
  
  return result;
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

// 正式逻辑 - 包含空文本检查
const replaceTextOfficial = (item: ToolbarItem, text: string): string => {
  // 处理空文本和纯空白文本 - 正式逻辑
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
        if (isRegexReplaceParams(item.invokeParams)) {
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
            if (wrapper) {
              return wrapWithQuotesIfNeeded(wrapper.prefix, wrapper.suffix, line);
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
      if (isRegexReplaceParams(item.invokeParams)) {
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

// 测试逻辑 - 不包含空文本检查（与旧测试文件一致）
const replaceTextTest = (item: ToolbarItem, text: string): string => {
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
        if (isRegexReplaceParams(item.invokeParams)) {
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
            if (wrapper) {
              return wrapWithQuotesIfNeeded(wrapper.prefix, wrapper.suffix, line);
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
      if (isRegexReplaceParams(item.invokeParams)) {
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

interface TestCase {
  name: string;
  item: ToolbarItem;
  input: string;
  expected: string;
  category: 'normal' | 'extreme' | 'edge';
}

const toolbarItems: ToolbarItem[] = [
  { id: 'wrap-bold', label: 'Bold', invoke: 'replace', invokeParams: '**${selectedText}**' },
  { id: 'wrap-red-text', label: 'Red text', invoke: 'replace', invokeParams: '[:span.red ${selectedText}]' },
  { id: 'wrap-blue-text', label: 'Blue text', invoke: 'replace', invokeParams: '[:span.blue ${selectedText}]' },
  { id: 'wrap-green-text', label: 'Green text', invoke: 'replace', invokeParams: '[:span.green ${selectedText}]' },
];

const criticalTests: TestCase[] = [
  { name: '空文本', item: toolbarItems.find(i => i.id === 'wrap-bold')!, input: '', expected: '', category: 'edge' },
  { name: '纯空格', item: toolbarItems.find(i => i.id === 'wrap-blue-text')!, input: '   ', expected: '', category: 'edge' },
  { name: '普通文本', item: toolbarItems.find(i => i.id === 'wrap-bold')!, input: '普通文本', expected: '**普通文本**', category: 'normal' },
  { name: '带空格文本', item: toolbarItems.find(i => i.id === 'wrap-red-text')!, input: '带 空格 的 文本', expected: '[:span.red "带 空格 的 文本"]', category: 'normal' },
  { name: '已有格式嵌套', item: toolbarItems.find(i => i.id === 'wrap-red-text')!, input: '[:b "加粗"]', expected: '[:span.red [:b "加粗"]]', category: 'normal' },
];

console.log('='.repeat(80));
console.log('utils.ts 正式逻辑验证');
console.log('='.repeat(80));
console.log();

console.log('🔍 关键测试用例验证：\n');

let passedOfficial = 0;
let passedTest = 0;
let total = criticalTests.length;

for (const testCase of criticalTests) {
  const officialResult = replaceTextOfficial(testCase.item, testCase.input);
  const testResult = replaceTextTest(testCase.item, testCase.input);
  const expected = testCase.expected;
  
  const officialMatch = officialResult === expected;
  const testMatch = testResult === expected;
  
  console.log(`测试: ${testCase.name}`);
  console.log(`  输入: ${JSON.stringify(testCase.input)}`);
  console.log(`  期望: ${JSON.stringify(expected)}`);
  console.log(`  正式逻辑结果: ${JSON.stringify(officialResult)} ${officialMatch ? '✅' : '❌'}`);
  console.log(`  测试逻辑结果: ${JSON.stringify(testResult)} ${testMatch ? '✅' : '❌'}`);
  
  if (officialMatch) passedOfficial++;
  if (testMatch) passedTest++;
  
  if (!officialMatch && testMatch) {
    console.log(`  ⚠️ 差异: 正式逻辑已修复，测试逻辑未修复`);
  } else if (officialMatch && !testMatch) {
    console.log(`  ⚠️ 差异: 测试逻辑需要更新`);
  }
  
  console.log();
}

console.log('='.repeat(80));
console.log('结果统计');
console.log('='.repeat(80));
console.log(`正式逻辑通过: ${passedOfficial}/${total} (${(passedOfficial/total*100).toFixed(1)}%)`);
console.log(`测试逻辑通过: ${passedTest}/${total} (${(passedTest/total*100).toFixed(1)}%)`);
console.log();

if (passedOfficial === total) {
  console.log('✅ 正式逻辑全部通过！');
} else {
  console.log('❌ 正式逻辑有失败项，需要进一步修复。');
}

if (passedTest < passedOfficial) {
  console.log('⚠️ 测试逻辑需要更新以匹配正式逻辑。');
}
