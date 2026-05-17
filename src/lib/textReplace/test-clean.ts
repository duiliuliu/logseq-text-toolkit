/**
 * 干净的测试文件：直接测试 utils.ts 中的 replaceText 和 regexReplaceText
 */
import { replaceText, regexReplaceText } from './utils';

// Mock 类型定义
interface ToolbarItem {
  id?: string;
  label?: string;
  invoke?: string;
  invokeParams?: any;
  regex?: string;
  replacement?: string;
}

// 测试函数
function test(name: string, fn: () => any, expected: any): boolean {
  try {
    const result = fn();
    const success = result === expected;
    if (success) {
      console.log(`✅ ${name}`);
    } else {
      console.log(`❌ ${name}`);
      console.log(`   Expected: ${JSON.stringify(expected)}`);
      console.log(`   Got:      ${JSON.stringify(result)}`);
    }
    return success;
  } catch (e) {
    console.log(`❌ ${name} (Error: ${(e as Error).message})`);
    return false;
  }
}

// 测试用例数组
interface TestCase {
  name: string;
  item: ToolbarItem;
  input: string;
  expected: string;
}

const testCases: TestCase[] = [];

// 1. 用户原始问题
testCases.push({
  name: '用户原始问题 - 混合格式文本',
  item: { invokeParams: '[:span.blue ${selectedText}]' },
  input: '数组越大 → **扫描越久 → STW（暂停时间）越长 → 服务卡顿**。',
  expected: '[:span.blue 数组越大 → [:b 扫描越久 → STW（暂停时间）越长 → 服务卡顿]。]'
});

// 2. 简单纯文本包裹
testCases.push({
  name: '简单纯文本包裹',
  item: { invokeParams: '[:i ${selectedText}]' },
  input: 'Hello World',
  expected: '[:i "Hello World"]'
});

// 3. 已有 hiccup 格式的文本
testCases.push({
  name: '已有 hiccup 格式的文本',
  item: { invokeParams: '[:div ${selectedText}]' },
  input: '[:b "Hello"]',
  expected: '[:div [:b "Hello"]]'
});

// 4. 多行文本测试
testCases.push({
  name: '多行文本处理',
  item: { invokeParams: '[:i ${selectedText}]' },
  input: 'Line 1\nLine 2\nLine 3',
  expected: '[:div [:i "Line 1"]][:div [:i "Line 2"]][:div [:i "Line 3"]]'
});

// 5. 空文本测试
testCases.push({
  name: '空文本处理',
  item: { invokeParams: '[:i ${selectedText}]' },
  input: '',
  expected: ''
});

// 6. 纯粗体格式
testCases.push({
  name: '纯粗体格式',
  item: { invokeParams: '[:b ${selectedText}]' },
  input: '**bold**',
  expected: '[:b bold]'
});

// 7. 斜体格式
testCases.push({
  name: '斜体格式',
  item: { invokeParams: '[:i ${selectedText}]' },
  input: '*italic*',
  expected: '[:i italic]'
});

// 8. 带空格的中文文本
testCases.push({
  name: '带空格的中文文本',
  item: { invokeParams: '[:span.blue ${selectedText}]' },
  input: '这是 测试 文本',
  expected: '[:span.blue "这是 测试 文本"]'
});

// 运行测试
console.log('='.repeat(80));
console.log('测试 utils.ts 中的 replaceText 和 regexReplaceText 函数');
console.log('='.repeat(80));

const results: boolean[] = [];
testCases.forEach((tc) => {
  console.log(`\n📋 ${tc.name}`);
  results.push(test(
    tc.name,
    () => replaceText(tc.item as any, tc.input),
    tc.expected
  ));
});

// regexReplaceText 测试
console.log('\n' + '='.repeat(80));
console.log('regexReplaceText 测试');
console.log('='.repeat(80));

const regexResults: boolean[] = [];
regexResults.push(test(
  'regexReplaceText 字符串格式',
  () => regexReplaceText({ invokeParams: '/World/Logseq/g' } as any, 'Hello World, this is World'),
  'Hello Logseq, this is Logseq'
));
regexResults.push(test(
  'regexReplaceText 对象格式',
  () => regexReplaceText({ invokeParams: { regex: 'World', replacement: 'Logseq', flags: 'g' } } as any, 'Hello World, this is World'),
  'Hello Logseq, this is Logseq'
));

// 汇总结果
console.log('\n' + '='.repeat(80));
const allResults = [...results, ...regexResults];
const passed = allResults.filter(r => r).length;
const total = allResults.length;
console.log(`📊 测试结果: ${passed}/${total} 通过`);
console.log(`🎯 通过率: ${((passed / total) * 100).toFixed(2)}%`);
console.log('='.repeat(80));

// 显示失败测试
const failedIndices = results.map((r, i) => r ? -1 : i).filter(i => i >= 0);
if (failedIndices.length > 0) {
  console.log('\n❌ 失败的测试:');
  failedIndices.forEach((idx) => {
    console.log(`   - ${testCases[idx].name}`);
  });
}
