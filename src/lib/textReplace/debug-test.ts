/**
 * 调试测试脚本 - 验证核心函数行为
 */

import { needsQuotes, wrapWithQuotesIfNeeded, replaceText, parseNestedFormat } from './utils';

console.log('='.repeat(80));
console.log('核心函数行为验证');
console.log('='.repeat(80));

// 测试 needsQuotes 函数
console.log('\n--- needsQuotes 函数测试 ---');
const testTexts = [
  { text: 'Hello World', description: '带空格的普通文本' },
  { text: 'Hello\u00A0World', description: '包含不间断空格' },
  { text: 'Hello"World', description: '包含双引号' },
  { text: "Hello'World", description: '包含单引号' },
  { text: '[:b text]', description: '完整 hiccup 格式' },
  { text: 'Hello[:b World]', description: '包含 hiccup 片段' },
];

for (const { text, description } of testTexts) {
  const result = needsQuotes(text);
  console.log(`${description}: ${result ? '✅ 需要引号' : '❌ 不需要引号'}`);
}

// 测试 wrapWithQuotesIfNeeded 函数
console.log('\n--- wrapWithQuotesIfNeeded 函数测试 ---');
const wrapTestCases = [
  { prefix: '[:span.red ', suffix: ']', text: '带空格的文本', expected: '[:span.red 带空格的文本]' },
  { prefix: '[:span.red ', suffix: ']', text: '带"引号"的文本', expected: '[:span.red "带\\"引号\\"的文本"]' },
  { prefix: '[:span.red ', suffix: ']', text: '[:b 粗体]', expected: '[:span.red [:b 粗体]]' },
];

for (const { prefix, suffix, text, expected } of wrapTestCases) {
  const result = wrapWithQuotesIfNeeded(prefix, suffix, text);
  const passed = result === expected;
  console.log(`${passed ? '✓' : '✗'} 输入: "${text}"`);
  if (!passed) {
    console.log(`  期望: ${expected}`);
    console.log(`  实际: ${result}`);
  }
}

// 测试 replaceText 函数
console.log('\n--- replaceText 函数测试 ---');
const replaceTestCases = [
  { 
    name: '用户问题测试',
    input: '数组越大 → **扫描越久 → STW（暂停时间）越长 → 服务卡顿**。',
    invokeParams: '[:span.blue ${selectedText}]',
    expected: '[:span.blue 数组越大 → [:b 扫描越久 → STW（暂停时间）越长 → 服务卡顿]。]'
  },
  { 
    name: '带空格文本',
    input: '带空格的文本',
    invokeParams: '[:span.red ${selectedText}]',
    expected: '[:span.red 带空格的文本]'
  },
];

for (const { name, input, invokeParams, expected } of replaceTestCases) {
  const result = replaceText({ invokeParams } as any, input);
  const passed = result === expected;
  console.log(`${passed ? '✓' : '✗'} ${name}`);
  if (!passed) {
    console.log(`  输入: ${JSON.stringify(input)}`);
    console.log(`  期望: ${JSON.stringify(expected)}`);
    console.log(`  实际: ${JSON.stringify(result)}`);
  }
}

// 测试 parseNestedFormat 函数
console.log('\n--- parseNestedFormat 函数测试 ---');
const parseTestCases = [
  { input: '**bold text**', expected: '[:b bold text]' },
  { input: 'text **bold** more', expected: 'text [:b bold] more' },
];

for (const { input, expected } of parseTestCases) {
  const result = parseNestedFormat(input);
  const passed = result === expected;
  console.log(`${passed ? '✓' : '✗'} 输入: "${input}"`);
  if (!passed) {
    console.log(`  期望: ${expected}`);
    console.log(`  实际: ${result}`);
  }
}

console.log('\n' + '='.repeat(80));
