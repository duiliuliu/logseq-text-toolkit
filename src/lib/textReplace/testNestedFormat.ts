/**
 * 嵌套格式处理测试
 * 测试文本格式识别和嵌套处理功能
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
    }
  }
  
  if (isEntirelyWrappedFormat) {
    if (prefixHasQuote && suffixHasQuote) {
      const cleanPrefix = prefix.slice(0, -1);
      const cleanSuffix = suffix.slice(1);
      return cleanPrefix + nestedText + cleanSuffix;
    }
  }
  
  if (isPartiallyFormatted) {
    return prefix + nestedText + suffix;
  }
  
  return prefix + nestedText + suffix;
};

const replaceText = (item: ToolbarItem, text: string): string => {
  if (item.invokeParams) {
    const invokeParamsStr = String(item.invokeParams);
    const wrapper = parseWrapperPattern(invokeParamsStr);
    
    if (wrapper && hasExistingFormat(text)) {
      const nestedText = parseNestedFormat(text);
      return handleNestedQuotes(wrapper.prefix, wrapper.suffix, text, nestedText);
    }
    
    return invokeParamsStr.replace(/\${selectedText}/g, text);
  }
  return text;
};

console.log('=== 嵌套格式处理测试 ===\n');

interface TestCase {
  name: string;
  item: ToolbarItem;
  input: string;
  expected: string;
}

const testCases: TestCase[] = [
  {
    name: '普通文本 - 不包含格式',
    item: {
      id: 'wrap-red-text',
      label: 'Red text',
      invoke: 'replace',
      invokeParams: '[:span.red "${selectedText}"]'
    },
    input: '这是一段普通文本',
    expected: '[:span.red "这是一段普通文本"]'
  },
  {
    name: '粗体文本 - 应用红颜色（部分内容加粗）',
    item: {
      id: 'wrap-red-text',
      label: 'Red text',
      invoke: 'replace',
      invokeParams: '[:span.red "${selectedText}"]'
    },
    input: '这是一段**文本**',
    expected: '[:span.red "这是一段[:b \"文本\"]"]'
  },
  {
    name: '斜体文本 - 应用蓝颜色（全部内容斜体）',
    item: {
      id: 'wrap-blue-text',
      label: 'Blue text',
      invoke: 'replace',
      invokeParams: '[:span.blue "${selectedText}"]'
    },
    input: '*斜体文本*',
    expected: '[:span.blue [:i "斜体文本"]]'
  },
  {
    name: '删除线文本 - 应用黄颜色',
    item: {
      id: 'wrap-yellow-text',
      label: 'Yellow text',
      invoke: 'replace',
      invokeParams: '[:span.yellow "${selectedText}"]'
    },
    input: '~~删除线~~',
    expected: '[:span.yellow [:s "删除线"]]'
  },
  {
    name: '高亮文本 - 应用紫色下划线',
    item: {
      id: 'wrap-purple-underline',
      label: 'Purple underline',
      invoke: 'replace',
      invokeParams: '[:u.purple "${selectedText}"]'
    },
    input: '==高亮文本==',
    expected: '[:u.purple [:mark "高亮文本"]]'
  },
  {
    name: '代码文本 - 应用绿颜色',
    item: {
      id: 'wrap-green-text',
      label: 'Green text',
      invoke: 'replace',
      invokeParams: '[:span.green "${selectedText}"]'
    },
    input: '`代码块`',
    expected: '[:span.green [:code "代码块"]]'
  },
  {
    name: '已有颜色格式文本 - 再应用颜色格式',
    item: {
      id: 'wrap-red-text',
      label: 'Red text',
      invoke: 'replace',
      invokeParams: '[:span.red "${selectedText}"]'
    },
    input: '[:span.blue "蓝色文本"]',
    expected: '[:span.red [:span.blue "蓝色文本"]]'
  },
  {
    name: '已有颜色格式文本 - 应用下划线',
    item: {
      id: 'wrap-green-underline',
      label: 'Green underline',
      invoke: 'replace',
      invokeParams: '[:u.green "${selectedText}"]'
    },
    input: '[:mark.red "红色高亮"]',
    expected: '[:u.green [:mark.red "红色高亮"]]'
  },
  {
    name: '纯粗体包裹 - 本身没有嵌套',
    item: {
      id: 'wrap-bold',
      label: 'Bold',
      invoke: 'replace',
      invokeParams: '**"${selectedText}"**'
    },
    input: '普通文本',
    expected: '**"普通文本"**'
  },
  {
    name: '已有粗体 - 再包裹粗体',
    item: {
      id: 'wrap-bold',
      label: 'Bold',
      invoke: 'replace',
      invokeParams: '**"${selectedText}"**'
    },
    input: '**已有粗体**',
    expected: '**[:b "已有粗体"]**'
  },
];

let passed = 0;
let failed = 0;

testCases.forEach(testCase => {
  try {
    const result = replaceText(testCase.item, testCase.input);
    const success = result === testCase.expected;
    
    if (success) {
      console.log(`✅ ${testCase.name}: 测试通过`);
      console.log(`   Input: ${testCase.input}`);
      console.log(`   Output: ${result}`);
      passed++;
    } else {
      console.log(`❌ ${testCase.name}: 测试失败`);
      console.log(`   Input: ${testCase.input}`);
      console.log(`   Expected: ${testCase.expected}`);
      console.log(`   Got: ${result}`);
      failed++;
    }
    console.log('');
  } catch (error) {
    console.log(`❌ ${testCase.name}: 异常`);
    console.log(`   Error: ${error}`);
    failed++;
    console.log('');
  }
});

console.log(`\n=== 测试结果 ===`);
console.log(`✅ 通过: ${passed}`);
console.log(`❌ 失败: ${failed}`);
console.log(`📊 总计: ${passed + failed}`);

if (import.meta.vitest) {
  describe('嵌套格式处理', () => {
    testCases.forEach(testCase => {
      it(testCase.name, () => {
        const result = replaceText(testCase.item, testCase.input);
        expect(result).toBe(testCase.expected);
      });
    });
  });
}

export { passed, failed };
