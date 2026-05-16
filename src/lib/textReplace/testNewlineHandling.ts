/**
 * 换行处理测试
 */

interface ToolbarItem {
  id: string;
  label: string;
  invoke: string;
  invokeParams: any;
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
  
  return text.includes(' ') || text.includes('"') || text.includes("'");
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

const processTextWithNewlines = (text: string): string => {
  if (!text.includes('\n')) {
    return text;
  }
  
  const lines = text.split('\n');
  const processedLines = lines
    .map(line => line.trim())
    .filter(line => line !== '');
  
  if (processedLines.length === 0) {
    return '';
  }
  
  if (processedLines.length === 1) {
    return processedLines[0];
  }
  
  return processedLines.map(line => `[:div ${line}]`).join('');
};

const replaceText = (item: ToolbarItem, text: string): string => {
  // 处理空文本和纯空白文本
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
        if (typeof item.invokeParams === 'object' && item.invokeParams !== null && 'regex' in item.invokeParams) {
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
            const wrapper = parseWrapperPattern(invokeParamsStr);
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
      if (typeof item.invokeParams === 'object' && item.invokeParams !== null && 'regex' in item.invokeParams) {
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

const testCases = [
  {
    name: '普通文本 - 单行',
    input: '这是一段普通文本',
    expected: '这是一段普通文本',
    function: (text: string) => text
  },
  {
    name: '换行文本 - 两行',
    input: '第一行\n第二行',
    expected: '[:div 第一行][:div 第二行]',
    function: processTextWithNewlines
  },
  {
    name: '换行文本 - 三行',
    input: '第一行\n第二行\n第三行',
    expected: '[:div 第一行][:div 第二行][:div 第三行]',
    function: processTextWithNewlines
  },
  {
    name: '换行文本 - 包含空行',
    input: '第一行\n\n第二行',
    expected: '[:div 第一行][:div 第二行]',
    function: processTextWithNewlines
  },
  {
    name: '换行文本 - 开头换行',
    input: '\n第一行\n第二行',
    expected: '[:div 第一行][:div 第二行]',
    function: processTextWithNewlines
  },
  {
    name: '换行文本 - 结尾换行',
    input: '第一行\n第二行\n',
    expected: '[:div 第一行][:div 第二行]',
    function: processTextWithNewlines
  },
  {
    name: '纯换行 - 多个连续换行',
    input: '\n\n\n',
    expected: '',
    function: processTextWithNewlines
  },
];

const integrationTestCases = [
  {
    name: '普通文本应用颜色',
    item: {
      id: 'wrap-red-text',
      label: 'Red text',
      invoke: 'replace',
      invokeParams: '[:span.red ${selectedText}]'
    },
    input: '普通文本',
    expected: '[:span.red 普通文本]'
  },
  {
    name: '包含空格的文本应用颜色',
    item: {
      id: 'wrap-red-text',
      label: 'Red text',
      invoke: 'replace',
      invokeParams: '[:span.red ${selectedText}]'
    },
    input: '带 空格 的 文本',
    expected: '[:span.red "带 空格 的 文本"]'
  },
  {
    name: '包含换行的文本应用颜色',
    item: {
      id: 'wrap-red-text',
      label: 'Red text',
      invoke: 'replace',
      invokeParams: '[:span.red ${selectedText}]'
    },
    input: '第一行\n第二行',
    expected: '[:div [:span.red 第一行]][:div [:span.red 第二行]]'
  },
  {
    name: '包含换行和格式的文本应用颜色',
    item: {
      id: 'wrap-red-text',
      label: 'Red text',
      invoke: 'replace',
      invokeParams: '[:span.red ${selectedText}]'
    },
    input: '普通文本\n**加粗文本**',
    expected: '[:div [:span.red 普通文本]][:div [:span.red [:b "加粗文本"]]]'
  },
  {
    name: '嵌套格式（Logseq）应用颜色 - 单行',
    item: {
      id: 'wrap-red-text',
      label: 'Red text',
      invoke: 'replace',
      invokeParams: '[:span.red ${selectedText}]'
    },
    input: '[:span.blue "蓝色文本"]',
    expected: '[:span.red [:span.blue "蓝色文本"]]'
  },
  {
    name: '嵌套格式（Logseq）应用颜色 - 多行',
    item: {
      id: 'wrap-red-text',
      label: 'Red text',
      invoke: 'replace',
      invokeParams: '[:span.red ${selectedText}]'
    },
    input: '[:span.blue "第一行"]\n[:span.green "第二行"]',
    expected: '[:div [:span.red [:span.blue "第一行"]]][:div [:span.red [:span.green "第二行"]]]'
  },
  {
    name: '混合嵌套和Markdown格式 - 多行',
    item: {
      id: 'wrap-blue-text',
      label: 'Blue text',
      invoke: 'replace',
      invokeParams: '[:span.blue ${selectedText}]'
    },
    input: '**加粗文本**\n[:span.red "红色文本"]\n普通文本',
    expected: '[:div [:span.blue [:b "加粗文本"]]][:div [:span.blue [:span.red "红色文本"]]][:div [:span.blue 普通文本]]'
  },
  {
    name: '已有嵌套格式再嵌套 - 三行',
    item: {
      id: 'wrap-underline',
      label: 'Underline',
      invoke: 'replace',
      invokeParams: '[:u ${selectedText}]'
    },
    input: '[:span.red "红色"]\n[:span.blue "蓝色"]\n普通',
    expected: '[:div [:u [:span.red "红色"]]][:div [:u [:span.blue "蓝色"]]][:div [:u 普通]]'
  },
  {
    name: '带引号的文本',
    item: {
      id: 'wrap-italic',
      label: 'Italic',
      invoke: 'replace',
      invokeParams: '*${selectedText}*'
    },
    input: '带引号的"文本"',
    expected: '*"带引号的\"文本\""*'
  },
  {
    name: '粗体包裹普通文本',
    item: {
      id: 'wrap-bold',
      label: 'Bold',
      invoke: 'replace',
      invokeParams: '**${selectedText}**'
    },
    input: '普通文本',
    expected: '**普通文本**'
  },
  {
    name: '粗体包裹带空格的文本',
    item: {
      id: 'wrap-bold',
      label: 'Bold',
      invoke: 'replace',
      invokeParams: '**${selectedText}**'
    },
    input: '带空格的文本',
    expected: '**带空格的文本**'
  },
];

console.log('=== 换行处理测试 ===\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase) => {
  try {
    const result = testCase.function(testCase.input);
    const isPass = result === testCase.expected;
    
    if (isPass) {
      console.log(`✅ ${testCase.name}: 测试通过`);
      passed++;
    } else {
      console.log(`❌ ${testCase.name}: 测试失败`);
      console.log(`   Input: ${JSON.stringify(testCase.input)}`);
      console.log(`   Expected: ${JSON.stringify(testCase.expected)}`);
      console.log(`   Got: ${JSON.stringify(result)}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${testCase.name}: 测试出错`);
    console.log(`   Error: ${error}`);
    failed++;
  }
  
  console.log('');
});

console.log('\n=== 集成测试 - replaceText 函数 ===\n');

integrationTestCases.forEach((testCase) => {
  try {
    const result = replaceText(testCase.item, testCase.input);
    const isPass = result === testCase.expected;
    
    if (isPass) {
      console.log(`✅ ${testCase.name}: 测试通过`);
      passed++;
    } else {
      console.log(`❌ ${testCase.name}: 测试失败`);
      console.log(`   Input: ${JSON.stringify(testCase.input)}`);
      console.log(`   Expected: ${JSON.stringify(testCase.expected)}`);
      console.log(`   Got: ${JSON.stringify(result)}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${testCase.name}: 测试出错`);
    console.log(`   Error: ${error}`);
    failed++;
  }
  
  console.log('');
});

console.log('=== 测试结果 ===');
console.log(`✅ 通过: ${passed}`);
console.log(`❌ 失败: ${failed}`);
console.log(`📊 总计: ${passed + failed}`);
