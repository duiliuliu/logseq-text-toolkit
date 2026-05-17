/**
 * 综合测试 utils.ts 核心函数
 * 此文件直接从 utils.ts 导入函数进行测试
 */

import { replaceText, regexReplaceText } from './utils';
import type { ToolbarItem } from '../../components/Toolbar/types';

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
    category: '用户问题测试',
    tests: [
      { name: '混合格式文本（用户原始问题）', 
        input: '数组越大 → **扫描越久 → STW（暂停时间）越长 → 服务卡顿**。', 
        item: { invokeParams: '[:span.blue ${selectedText}]' as any },
        expected: '[:span.blue 数组越大 → [:b 扫描越久 → STW（暂停时间）越长 → 服务卡顿]。]' }
    ]
  },
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
    
    const result = replaceText(test.item as ToolbarItem, test.input);
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
