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
  { input: '==**高亮加粗**==', expected: '[:mark [:b "高亮加粗"]]', description: '高亮包裹粗体' },
  { input: '**粗体**', expected: '[:b 粗体]', description: '纯粗体' },
  { input: '==高亮==', expected: '[:mark 高亮]', description: '纯高亮' },
  { input: '**粗体** 和 *斜体*', expected: '[:b 粗体] 和 [:i 斜体]', description: '多个格式' },
  { input: '**带 空格 的 文本**', expected: '[:b "带 空格 的 文本"]', description: '带空格的内容' },
  { input: '==**==**==', expected: '[:mark [:b "="]]', description: '复杂嵌套' },
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
