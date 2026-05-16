/**
 * 测试修复后的 parseNestedFormat 函数
 */

const parseNestedFormat = (text: string): string => {
  if (text.startsWith('[:') && text.endsWith(']')) {
    return text;
  }
  
  const processOuterFormat = (str: string): string => {
    const outerFormats = [
      { regex: /\*\*([^*]+)\*\*/g, tag: 'b' },
      { regex: /(?<!\*)\*([^*]+)\*(?!\*)/g, tag: 'i' },
      { regex: /~~([^~]+)~~/g, tag: 's' },
      { regex: /==([^=]+)==/g, tag: 'mark' },
      { regex: /`([^`]+)`/g, tag: 'code' },
    ];
    
    const recursiveProcess = (s: string): string => {
      const hasAnyFormat = outerFormats.some(f => f.regex.test(s));
      if (!hasAnyFormat) {
        return s;
      }
      
      let processed = s;
      
      for (const { regex, tag } of outerFormats) {
        processed = processed.replace(regex, (match, content) => {
          const innerContent = recursiveProcess(content);
          
          const isHiccupFormat = innerContent.startsWith('[:') && innerContent.endsWith(']');
          
          if (isHiccupFormat) {
            return `[:${tag} ${innerContent}]`;
          } else if (innerContent.includes(' ') || 
                     innerContent.includes('"') || 
                     innerContent.includes("'")) {
            return `[:${tag} "${innerContent}"]`;
          } else {
            return `[:${tag} ${innerContent}]`;
          }
        });
      }
      
      return processed;
    };
    
    return recursiveProcess(str);
  };
  
  return processOuterFormat(text);
};

console.log('=== 测试修复后的 parseNestedFormat ===\n');

const testCases = [
  // 根据用户要求修正测试用例：
  // - 输入无空格 → 输出无引号
  // - 输入有空格 → 输出有引号
  { input: '==**高亮加粗**==', expected: '[:mark [:b 高亮加粗]]', description: '高亮包裹粗体（无空格）' },
  { input: '**粗体**', expected: '[:b 粗体]', description: '纯粗体（无空格）' },
  { input: '==高亮==', expected: '[:mark 高亮]', description: '纯高亮（无空格）' },
  { input: '**粗体** 和 *斜体*', expected: '[:b 粗体] 和 [:i 斜体]', description: '多个格式（无空格）' },
  { input: '**带 空格 的 文本**', expected: '[:b "带 空格 的 文本"]', description: '带空格的内容' },
  { input: '==**带 空格 的 加粗**==', expected: '[:mark [:b "带 空格 的 加粗"]]', description: '高亮包裹带空格粗体' },
  { input: '*斜体*', expected: '[:i 斜体]', description: '纯斜体（无空格）' },
  { input: '~~删除~~', expected: '[:s 删除]', description: '纯删除（无空格）' },
  { input: '`代码`', expected: '[:code 代码]', description: '纯代码（无空格）' },
];

let passed = 0;
let failed = 0;

for (const test of testCases) {
  const output = parseNestedFormat(test.input);
  const success = output === test.expected;
  
  if (success) {
    console.log(`✅ ${test.description}`);
    passed++;
  } else {
    console.log(`❌ ${test.description}`);
    console.log(`   输入: ${test.input}`);
    console.log(`   期望: ${test.expected}`);
    console.log(`   实际: ${output}`);
    failed++;
  }
}

console.log(`\n总计: ${passed}/${testCases.length} 通过`);
