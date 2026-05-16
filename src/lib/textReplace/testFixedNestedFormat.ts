/**
 * 测试修复后的 parseNestedFormat 函数
 */

const parseNestedFormat = (text: string): string => {
  if (text.startsWith('[:') && text.endsWith(']')) {
    return text;
  }
  
  // 递归解析嵌套格式，从内到外处理
  let result = text;
  
  // 第一步：将内层 Markdown 格式转换为 hiccup，不添加引号
  result = result.replace(/\*\*([^*]+)\*\*/g, '[:b $1]');
  result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '[:i $1]');
  result = result.replace(/~~([^~]+)~~/g, '[:s $1]');
  result = result.replace(/==([^=]+)==/g, '[:mark $1]');
  result = result.replace(/`([^`]+)`/g, '[:code $1]');
  
  // 第二步：修复可能形成的嵌套hiccup，添加引号保护
  const fixNestedHiccup = (str: string): string => {
    let fixed = str;
    let changed = true;
    
    while (changed) {
      changed = false;
      
      fixed = fixed.replace(/(\[:[\w.]+)\s+(\[:[^\]]+\])\]/g, (match, outer, inner) => {
        const innerMatch = inner.match(/^\[:([\w.]+)\s+(.+)\]$/);
        if (innerMatch) {
          const [, tag, content] = innerMatch;
          if (!content.startsWith('"') && !content.startsWith('[:') && content.trim() !== '') {
            const contentWithQuote = `"${content.trim()}"`;
            changed = true;
            return `[:${tag} ${contentWithQuote}]`;
          }
        }
        return match;
      });
    }
    
    return fixed;
  };
  
  result = fixNestedHiccup(result);
  
  return result;
};

console.log('=== 测试修复后的 parseNestedFormat ===\n');

const testCases = [
  { input: '==**高亮加粗**==', description: '高亮包裹粗体' },
  { input: '**粗体**', description: '纯粗体' },
  { input: '==高亮==', description: '纯高亮' },
  { input: '*斜体*', description: '纯斜体' },
  { input: '~~删除~~', description: '纯删除' },
  { input: '`代码`', description: '纯代码' },
  { input: '**粗体** 和 *斜体*', description: '多个格式' },
];

for (const test of testCases) {
  const output = parseNestedFormat(test.input);
  console.log(`${test.description}:`);
  console.log(`  输入: ${test.input}`);
  console.log(`  输出: ${output}`);
  console.log();
}
