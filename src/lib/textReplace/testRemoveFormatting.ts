/**
 * 测试正则表达式清理功能
 */

const removeFormattingRegex = /\[:span\.inline-comment\s*\{[^}]*\}\s*([^\]]*)\]|\[:(?:mark|span|u|sub|sup|b|i|s|code|cloze|div)(?:\.(?:red|blue|yellow|green|purple))?\s*([^\]]*)\]|==([^=]*)==|~~([^~]*)~~|\*\*([^\*]*)\*\*|\*([^\*]*)\*|`([^`]*)`/g;

const testCases = [
  {
    name: '普通文本 - 无格式',
    input: '普通文本',
    expected: '普通文本'
  },
  {
    name: '简单 hiccup 格式（不带引号）',
    input: '[:span.red 普通文本]',
    expected: '普通文本'
  },
  {
    name: '简单 hiccup 格式（带引号）',
    input: '[:span.red "带空格的文本"]',
    expected: '带空格的文本'
  },
  {
    name: '嵌套 hiccup 格式',
    input: '[:span.red [:b "加粗文本"]]',
    expected: '加粗文本'
  },
  {
    name: '多层嵌套 hiccup 格式',
    input: '[:span.blue [:u [:b "三层嵌套"]]]',
    expected: '三层嵌套'
  },
  {
    name: '换行 hiccup 格式',
    input: '[:div [:span.red 第一行]][:div [:span.blue 第二行]]',
    expected: '第一行第二行'
  },
  {
    name: 'Markdown 粗体',
    input: '**粗体文本**',
    expected: '粗体文本'
  },
  {
    name: 'Markdown 斜体',
    input: '*斜体文本*',
    expected: '斜体文本'
  },
  {
    name: 'Markdown 删除线',
    input: '~~删除线文本~~',
    expected: '删除线文本'
  },
  {
    name: 'Markdown 高亮',
    input: '==高亮文本==',
    expected: '高亮文本'
  },
  {
    name: 'Markdown 代码',
    input: '`代码文本`',
    expected: '代码文本'
  },
  {
    name: '混合格式 - hiccup + markdown',
    input: '[:span.red **混合文本**]',
    expected: '混合文本'
  },
  {
    name: '混合格式 - 多种标记',
    input: '==**粗体高亮**==  [:span.blue *斜体蓝色*]',
    expected: '粗体高亮  斜体蓝色'
  },
  {
    name: '带引号的嵌套文本',
    input: '[:span.red "带引号的文本"]',
    expected: '带引号的文本'
  },
  {
    name: '复杂嵌套 - 多层加换行',
    input: '[:div [:span.red [:b "第一层"]]][:div [:span.blue [:u **第二层**]]]',
    expected: '第一层第二层'
  },
  {
    name: '内联注释格式',
    input: '[:span.inline-comment {:some "data"} 注释文本]',
    expected: '注释文本'
  },
  {
    name: '多种颜色格式',
    input: '[:span.red 红色] [:span.blue 蓝色] [:span.green 绿色]',
    expected: '红色 蓝色 绿色'
  }
];

function testRemoveFormatting(input: string, expected: string): boolean {
  let result = input;
  
  // 多次应用正则表达式以处理嵌套格式
  let previousResult;
  let iterations = 0;
  
  do {
    previousResult = result;
    result = result.replace(removeFormattingRegex, '$1$2$3$4$5$6$7');
    iterations++;
  } while (result !== previousResult && iterations < 10);
  
  // 清理可能残留的引号
  result = result.replace(/"/g, '');
  
  const passed = result === expected;
  
  if (!passed) {
    console.log(`❌ ${testCase.name}`);
    console.log(`   Input: ${JSON.stringify(input)}`);
    console.log(`   Expected: ${JSON.stringify(expected)}`);
    console.log(`   Got: ${JSON.stringify(result)}`);
  }
  
  return passed;
}

console.log('=== 正则表达式清理测试 ===\n');

let passedCount = 0;
let failedCount = 0;

for (const testCase of testCases) {
  let result = testCase.input;
  
  // 多次应用正则表达式以处理嵌套格式
  let previousResult;
  let iterations = 0;
  
  do {
    previousResult = result;
    result = result.replace(removeFormattingRegex, '$1$2$3$4$5$6$7');
    iterations++;
  } while (result !== previousResult && iterations < 10);
  
  // 清理可能残留的引号
  result = result.replace(/"/g, '');
  
  const passed = result === testCase.expected;
  
  if (passed) {
    console.log(`✅ ${testCase.name}`);
    passedCount++;
  } else {
    console.log(`❌ ${testCase.name}`);
    console.log(`   Input: ${JSON.stringify(testCase.input)}`);
    console.log(`   Expected: ${JSON.stringify(testCase.expected)}`);
    console.log(`   Got: ${JSON.stringify(result)}`);
    failedCount++;
  }
}

console.log(`\n=== 测试结果 ===`);
console.log(`✅ 通过: ${passedCount}`);
console.log(`❌ 失败: ${failedCount}`);
console.log(`📊 总计: ${testCases.length}`);
