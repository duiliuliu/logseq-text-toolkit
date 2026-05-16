/**
 * 分析 parseNestedFormat 的问题
 */

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

console.log('=== parseNestedFormat 问题分析 ===\n');

const testCases = [
  '==**高亮加粗**==',
  '**粗体**',
  '==高亮==',
  '[:mark "文本"]'
];

for (const input of testCases) {
  const output = parseNestedFormat(input);
  console.log(`输入: ${input}`);
  console.log(`输出: ${output}`);
  console.log();
}

// 分析问题
console.log('=== 问题分析 ===\n');
console.log('问题: parseNestedFormat 在转换时硬编码添加双引号\n');
console.log('例如: ==**高亮加粗**== 被转换为 [:mark "[:b "高亮加粗"]"]');
console.log('     - 外层 ==...== 被替换为 [:mark "$1"]，$1 = [:b "高亮加粗"]');
console.log('     - 内层 **...** 被替换为 [:b "$1"]，$1 = 高亮加粗');
console.log('     - 结果: [:mark "[:b "高亮加粗"]"]');
console.log('\n问题: 双引号嵌套导致引号不匹配\n');
console.log('期望: [:span.purple [:mark [:b 高亮加粗]]] - 内容不加引号');
console.log('期望: [:span.purple [:mark [:b "带空格的内容"]]] - 带空格的内容才加引号');
