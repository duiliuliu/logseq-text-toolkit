/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * utils.ts 全功能测试套件（依赖导入版本）
 * 直接从 utils.ts 导入函数，不复制代码
 */

import {
  replaceText,
  regexReplaceText,
  hasExistingFormat,
  parseNestedFormat,
  parseWrapperPattern,
  needsQuotes,
  wrapWithQuotesIfNeeded,
  handleNestedQuotes,
  isRegexReplaceParams
} from './utils';
import type { ToolbarItem } from '../../components/Toolbar/types';

console.log('='.repeat(80));
console.log('utils.ts 全功能测试套件');
console.log('='.repeat(80));
console.log('');

const testResults: {
  [category: string]: {
    passed: number;
    failed: number;
    tests: {
      name: string;
      passed: boolean;
      expected: string;
      actual: string;
    }[];
  };
} = {};

// 普通场景测试
testResults['普通场景'] = {
  passed: 0,
  failed: 0,
  tests: []
};

const normalTestCases = [
  {
    name: '普通文本 - 粗体',
    item: { invokeParams: '[:b ${selectedText}]' },
    text: 'hello',
    expected: '[:b hello]'
  },
  {
    name: '普通文本 - 斜体',
    item: { invokeParams: '[:i ${selectedText}]' },
    text: 'world',
    expected: '[:i world]'
  },
  {
    name: '普通文本 - 红色文本',
    item: { invokeParams: '[:span.red ${selectedText}]' },
    text: 'test',
    expected: '[:span.red test]'
  },
  {
    name: '带空格文本 - 粗体',
    item: { invokeParams: '[:b ${selectedText}]' },
    text: 'hello world',
    expected: '[:b "hello world"]'
  },
  {
    name: '带空格文本 - 红色文本',
    item: { invokeParams: '[:span.red ${selectedText}]' },
    text: 'hello world',
    expected: '[:span.red "hello world"]'
  },
  {
    name: '带空格文本 - 高亮',
    item: { invokeParams: '[:mark ${selectedText}]' },
    text: 'hello world',
    expected: '[:mark "hello world"]'
  },
  {
    name: '已有粗体 - 再次应用粗体',
    item: { invokeParams: '[:b ${selectedText}]' },
    text: '**bold text**',
    expected: '[:b [:b bold text]]'
  },
  {
    name: '已有斜体 - 应用红色',
    item: { invokeParams: '[:span.red ${selectedText}]' },
    text: '*italic text*',
    expected: '[:span.red [:i italic text]]'
  },
  {
    name: '已有删除线 - 应用下划线',
    item: { invokeParams: '[:u ${selectedText}]' },
    text: '~~strikethrough~~',
    expected: '[:u [:s strikethrough]]'
  },
  {
    name: '已有 hiccup - 单层嵌套',
    item: { invokeParams: '[:div ${selectedText}]' },
    text: '[:b "simple text"]',
    expected: '[:div [:b "simple text"]]'
  },
  {
    name: '已有 hiccup - 多层嵌套',
    item: { invokeParams: '[:div ${selectedText}]' },
    text: '[:span.red [:b "bold and red"]]',
    expected: '[:div [:span.red [:b "bold and red"]]]'
  },
  {
    name: '已有 hiccup - 复杂嵌套',
    item: { invokeParams: '[:div ${selectedText}]' },
    text: '[:span.purple [:mark [:b "bold, marked and purple"]]]',
    expected: '[:div [:span.purple [:mark [:b "bold, marked and purple"]]]]'
  },
  {
    name: '换行文本 - 两行',
    item: { invokeParams: '[:i ${selectedText}]' },
    text: 'line one\nline two',
    expected: '[:div [:i "line one"]][:div [:i "line two"]]'
  },
  {
    name: '换行文本 - 三行',
    item: { invokeParams: '[:b ${selectedText}]' },
    text: 'line one\nline two\nline three',
    expected: '[:div [:b "line one"]][:div [:b "line two"]][:div [:b "line three"]]'
  },
  {
    name: '换行文本 - 带空行',
    item: { invokeParams: '[:mark ${selectedText}]' },
    text: 'line one\n\nline two',
    expected: '[:div [:mark "line one"]][:div [:mark "line two"]]'
  },
  {
    name: 'Markdown 嵌套 hiccup',
    item: { invokeParams: '[:div ${selectedText}]' },
    text: '**bold ==highlighted== text**',
    expected: '[:div [:b bold [:mark highlighted] text]]'
  },
  {
    name: 'Hiccup 嵌套 Markdown',
    item: { invokeParams: '[:div ${selectedText}]' },
    text: '[:span.red hello ==world==]',
    expected: '[:div [:span.red hello [:mark world]]]'
  },
  {
    name: '多层混合格式',
    item: { invokeParams: '[:div ${selectedText}]' },
    text: '**bold *italic* ==marked==**',
    expected: '[:div [:b bold [:i italic] [:mark marked]]]'
  },
  {
    name: 'Remove Formatting - 普通文本',
    item: { invokeParams: '${selectedText}' },
    text: 'plain text',
    expected: 'plain text'
  },
  {
    name: 'Remove Formatting - 简单格式',
    item: { invokeParams: '${selectedText}' },
    text: '**bold text**',
    expected: 'bold text'
  },
  {
    name: 'Remove Formatting - Markdown格式',
    item: { invokeParams: '${selectedText}' },
    text: '**bold *italic* ==marked==**',
    expected: 'bold italic marked'
  },
  {
    name: 'Remove Formatting - 带引号文本',
    item: { invokeParams: '${selectedText}' },
    text: '[:span.red "text with quotes"]',
    expected: 'text with quotes'
  }
];

console.log('📋 测试统计:');
console.log(`   - 普通场景: ${normalTestCases.length} 个`);

// 极端场景测试
testResults['极端场景'] = {
  passed: 0,
  failed: 0,
  tests: []
};

const extremeTestCases = [
  {
    name: '极端深层嵌套 - 4层',
    item: { invokeParams: '[:div ${selectedText}]' },
    text: '**==*`deep nest`*==**',
    expected: '[:div [:b [:mark [:i [:code deep nest]]]]]'
  },
  {
    name: '极端深层嵌套 - 5层',
    item: { invokeParams: '[:div ${selectedText}]' },
    text: '[:div **==*`very deep`*==**]',
    expected: '[:div [:div [:b [:mark [:i [:code very deep]]]]]]'
  },
  {
    name: '极端多种格式混合',
    item: { invokeParams: '[:div ${selectedText}]' },
    text: '**bold ==marked== *italic* ~~strike~~**',
    expected: '[:div [:b bold [:mark marked] [:i italic] [:s strike]]]'
  },
  {
    name: '极端换行加嵌套',
    item: { invokeParams: '[:div ${selectedText}]' },
    text: 'line one\n**==bold marked==**\nline three',
    expected: '[:div "line one"][:div [:b [:mark bold marked]]][:div "line three"]'
  },
  {
    name: '极端特殊字符 - 引号',
    item: { invokeParams: '[:span.red ${selectedText}]' },
    text: 'text with "double quotes"',
    expected: '[:span.red "text with \"double quotes\""]'
  },
  {
    name: '极端特殊字符 - 单引号',
    item: { invokeParams: '[:span.blue ${selectedText}]' },
    text: 'text with \'single quotes\'',
    expected: '[:span.blue "text with \'single quotes\'"]'
  },
  {
    name: '极端特殊字符 - 混合引号',
    item: { invokeParams: '[:span.purple ${selectedText}]' },
    text: '\'mixed\' "quotes" here',
    expected: '[:span.purple "\'mixed\' \"quotes\" here"]'
  },
  {
    name: '极端非断行空格',
    item: { invokeParams: '[:span.red ${selectedText}]' },
    text: 'text\u00A0with\u00A0nbsp',
    expected: '[:span.red "text\u00A0with\u00A0nbsp"]'
  },
  {
    name: '极端全角空格',
    item: { invokeParams: '[:span.blue ${selectedText}]' },
    text: 'text\u3000with\u3000ideographic space',
    expected: '[:span.blue "text\u3000with\u3000ideographic space"]'
  },
  {
    name: '极端嵌套hiccup中的空格',
    item: { invokeParams: '[:div ${selectedText}]' },
    text: '[:b "nested with space"]',
    expected: '[:div [:b "nested with space"]]'
  },
  {
    name: '极端多层嵌套hiccup中的空格',
    item: { invokeParams: '[:div ${selectedText}]' },
    text: '[:span.red [:b "many spaces here"]]',
    expected: '[:div [:span.red [:b "many spaces here"]]]'
  },
  {
    name: '极端换行加空格',
    item: { invokeParams: '[:div ${selectedText}]' },
    text: 'line with space\n   indented',
    expected: '[:div "line with space"][:div indented]'
  },
  {
    name: '极端换行加嵌套',
    item: { invokeParams: '[:div ${selectedText}]' },
    text: 'first line\n==**bold marked**==\nlast line',
    expected: '[:div "first line"][:div [:mark [:b bold marked]]][:div "last line"]'
  },
  {
    name: 'Remove Formatting - 嵌套格式',
    item: { invokeParams: '${selectedText}' },
    text: '**==*`deep nest`*==**',
    expected: 'deep nest'
  },
  {
    name: 'Remove Formatting - 换行格式',
    item: { invokeParams: '${selectedText}' },
    text: '**bold line**\n*italic line*',
    expected: 'bold line\nitalic line'
  },
  {
    name: 'Remove Formatting - 复杂嵌套',
    item: { invokeParams: '${selectedText}' },
    text: '[:span.red **==*`deep`*==**]',
    expected: 'deep'
  }
];

console.log(`   - 极端场景: ${extremeTestCases.length} 个`);

// 边界场景测试
testResults['边界场景'] = {
  passed: 0,
  failed: 0,
  tests: []
};

const edgeTestCases = [
  {
    name: '边界空文本',
    item: { invokeParams: '[:b ${selectedText}]' },
    text: '',
    expected: ''
  },
  {
    name: '边界仅换行',
    item: { invokeParams: '[:b ${selectedText}]' },
    text: '\n\n\n',
    expected: ''
  },
  {
    name: '边界仅空格',
    item: { invokeParams: '[:b ${selectedText}]' },
    text: '   ',
    expected: ''
  },
  {
    name: '边界仅换行和空格',
    item: { invokeParams: '[:b ${selectedText}]' },
    text: ' \n  \n ',
    expected: ''
  },
  {
    name: '边界纯粗体标记',
    item: { invokeParams: '[:span.red ${selectedText}]' },
    text: '****',
    expected: '[:span.red **]'
  },
  {
    name: '边界空hiccup格式',
    item: { invokeParams: '[:div ${selectedText}]' },
    text: '[:span.red ]',
    expected: '[:div [:span.red ]]'
  },
  {
    name: '边界单字符',
    item: { invokeParams: '[:b ${selectedText}]' },
    text: 'a',
    expected: '[:b a]'
  },
  {
    name: '边界单字符带空格',
    item: { invokeParams: '[:b ${selectedText}]' },
    text: 'a ',
    expected: '[:b "a "]'
  },
  {
    name: '边界 Emoji',
    item: { invokeParams: '[:span.red ${selectedText}]' },
    text: '😊',
    expected: '[:span.red 😊]'
  },
  {
    name: '边界中文标点',
    item: { invokeParams: '[:span.blue ${selectedText}]' },
    text: '数组越大 → 扫描越久 → 服务卡顿。',
    expected: '[:span.blue "数组越大 → 扫描越久 → 服务卡顿。"]'
  },
  {
    name: '边界特殊符号',
    item: { invokeParams: '[:mark ${selectedText}]' },
    text: '!@#$%^&*()',
    expected: '[:mark "!@#$%^&*()"]'
  },
  {
    name: '边界嵌套空粗体',
    item: { invokeParams: '[:div ${selectedText}]' },
    text: '** **',
    expected: '[:div [:b " "]]'
  },
  {
    name: '边界嵌套不完整标记',
    item: { invokeParams: '[:div ${selectedText}]' },
    text: '**half bold',
    expected: '[:div "**half bold"]'
  },
  {
    name: 'Remove Formatting - 空hiccup',
    item: { invokeParams: '${selectedText}' },
    text: '[:span.red ]',
    expected: ''
  }
];

console.log(`   - 边界场景: ${edgeTestCases.length} 个`);
console.log(`   - 总计: ${normalTestCases.length + extremeTestCases.length + edgeTestCases.length} 个`);
console.log('');

// 运行所有测试
const allTestCases = [
  ...normalTestCases.map(tc => ({ ...tc, category: '普通场景' })),
  ...extremeTestCases.map(tc => ({ ...tc, category: '极端场景' })),
  ...edgeTestCases.map(tc => ({ ...tc, category: '边界场景' }))
];

for (const testCase of allTestCases) {
  try {
    const actual = replaceText(testCase.item as ToolbarItem, testCase.text);
    const passed = actual === testCase.expected;
    
    testResults[testCase.category].tests.push({
      name: testCase.name,
      passed: passed,
      expected: testCase.expected,
      actual: actual
    });
    
    if (passed) {
      testResults[testCase.category].passed++;
    } else {
      testResults[testCase.category].failed++;
    }
  } catch (e) {
    console.error(`❌ ${testCase.name} - 测试异常:`, e);
    testResults[testCase.category].tests.push({
      name: testCase.name,
      passed: false,
      expected: testCase.expected,
      actual: `ERROR: ${e}`
    });
    testResults[testCase.category].failed++;
  }
}

// 打印测试结果
let totalPassed = 0;
let totalFailed = 0;

for (const [category, results] of Object.entries(testResults)) {
  console.log('\n' + '='.repeat(80));
  console.log(`📂 ${category}测试`);
  console.log('='.repeat(80));
  
  for (const test of results.tests) {
    if (test.passed) {
      console.log(`  ✅ ${test.name}`);
    } else {
      console.log(`  ❌ ${test.name}`);
      console.log(`     输入: ${JSON.stringify(test.expected.startsWith(':') ? test.expected : 'see test case')}`);
      console.log(`     期望: ${JSON.stringify(test.expected)}`);
      console.log(`     实际: ${JSON.stringify(test.actual)}`);
    }
  }
  
  totalPassed += results.passed;
  totalFailed += results.failed;
}

// 打印总结
console.log('\n' + '='.repeat(80));
console.log('📊 测试结果汇总');
console.log('='.repeat(80));
console.log(`✅ 通过: ${totalPassed}`);
console.log(`❌ 失败: ${totalFailed}`);
console.log(`📈 总计: ${totalPassed + totalFailed}`);
console.log(`🎯 通过率: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2)}%`);

if (totalFailed > 0) {
  console.log('\n❌ 失败测试列表:');
  for (const [category, results] of Object.entries(testResults)) {
    for (const test of results.tests) {
      if (!test.passed) {
        console.log(`   - [${category}] ${test.name}`);
      }
    }
  }
}

console.log('\n' + '='.repeat(80));
console.log('测试完成！');
console.log('='.repeat(80));
