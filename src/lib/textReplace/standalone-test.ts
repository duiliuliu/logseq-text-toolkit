/**
 * 独立测试脚本 - 不依赖 logseq 运行时
 */

// 复制需要测试的函数（不依赖外部模块的部分）

export const validateInputText = (text: string): string => {
  if (typeof text !== 'string') {
    console.warn('Input is not a string, converting to empty string');
    return '';
  }
  return text;
};

export const needsQuotes = (text: string): boolean => {
  const safeText = validateInputText(text);
  if (safeText.startsWith('[:') && safeText.endsWith(']')) {
    return false;
  }
  return safeText.includes('"') || safeText.includes("'");
};

export const escapeHiccupText = (text: string): string => {
  const safeText = validateInputText(text);
  return safeText.replace(/"/g, '\\"');
};

export const wrapWithQuotesIfNeeded = (prefix: string, suffix: string, text: string): string => {
  const safePrefix = validateInputText(prefix);
  const safeSuffix = validateInputText(suffix);
  const safeText = validateInputText(text);
  
  if (safeText.startsWith('[:') && safeText.endsWith(']')) {
    return safePrefix + safeText + safeSuffix;
  }
  
  if (safeText.includes('[:')) {
    return safePrefix + safeText + safeSuffix;
  }
  
  const prefixHasQuote = safePrefix.endsWith('"') || safePrefix.endsWith("'");
  const suffixHasQuote = safeSuffix.startsWith('"') || safeSuffix.startsWith("'");
  
  if (needsQuotes(safeText) && !prefixHasQuote && !suffixHasQuote) {
    return safePrefix + `"${escapeHiccupText(safeText)}"` + safeSuffix;
  }
  
  if (!needsQuotes(safeText) && prefixHasQuote && suffixHasQuote) {
    const cleanPrefix = safePrefix.slice(0, -1);
    const cleanSuffix = safeSuffix.slice(1);
    return cleanPrefix + safeText + cleanSuffix;
  }
  
  return safePrefix + safeText + safeSuffix;
};

export const parseNestedFormat = (text: string): string => {
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
    
    const MAX_RECURSION_DEPTH = 5;
    const recursiveProcess = (s: string, depth: number = 0): string => {
      if (depth > MAX_RECURSION_DEPTH) {
        return s;
      }
      
      const hasAnyFormat = outerFormats.some(f => f.regex.test(s));
      if (!hasAnyFormat) {
        return s;
      }
      
      let processed = s;
      
      for (const { regex, tag } of outerFormats) {
        processed = processed.replace(regex, (_match, content) => {
          const innerContent = recursiveProcess(content, depth + 1);
          const isHiccupFormat = innerContent.startsWith('[:') && innerContent.endsWith(']');
          const containsHiccup = innerContent.includes('[:');
          
          if (isHiccupFormat || containsHiccup) {
            return `[:${tag} ${innerContent}]`;
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

export const handleNestedQuotes = (prefix: string, suffix: string, text: string, nestedText: string): string => {
  const safePrefix = validateInputText(prefix);
  const safeSuffix = validateInputText(suffix);
  const safeText = validateInputText(text);
  const safeNestedText = validateInputText(nestedText);
  
  const prefixHasQuote = safePrefix.endsWith('"') || safePrefix.endsWith("'");
  const suffixHasQuote = safeSuffix.startsWith('"') || safeSuffix.startsWith("'");
  
  const isAlreadyNested = safeText.startsWith('[:') && safeText.endsWith(']');
  const nestedIsHiccup = safeNestedText.startsWith('[:') && safeNestedText.endsWith(']');
  const nestedContainsHiccup = safeNestedText.includes('[:');
  
  const isEntirelyWrappedFormat = (
    (safeText.startsWith('**') && safeText.endsWith('**')) ||
    (safeText.startsWith('*') && safeText.endsWith('*') && !safeText.startsWith('**')) ||
    (safeText.startsWith('~~') && safeText.endsWith('~~')) ||
    (safeText.startsWith('==') && safeText.endsWith('==')) ||
    (safeText.startsWith('`') && safeText.endsWith('`'))
  );
  
  const hasFormatMarkers = safeText.includes('**') || safeText.includes('*') || safeText.includes('~~') || safeText.includes('==') || safeText.includes('`');
  const isPartiallyFormatted = hasFormatMarkers && !isEntirelyWrappedFormat;
  
  if (isAlreadyNested) {
    if (prefixHasQuote && suffixHasQuote) {
      const cleanPrefix = safePrefix.slice(0, -1);
      const cleanSuffix = safeSuffix.slice(1);
      return cleanPrefix + safeText + cleanSuffix;
    } else {
      return safePrefix + safeText + safeSuffix;
    }
  }
  
  if (isEntirelyWrappedFormat) {
    if (prefixHasQuote && suffixHasQuote) {
      const cleanPrefix = safePrefix.slice(0, -1);
      const cleanSuffix = safeSuffix.slice(1);
      return cleanPrefix + safeNestedText + cleanSuffix;
    } else {
      if (nestedIsHiccup || nestedContainsHiccup) {
        return safePrefix + safeNestedText + safeSuffix;
      }
      return wrapWithQuotesIfNeeded(safePrefix, safeSuffix, safeNestedText);
    }
  }
  
  if (isPartiallyFormatted) {
    if (nestedIsHiccup || nestedContainsHiccup) {
      return safePrefix + safeNestedText + safeSuffix;
    }
    return wrapWithQuotesIfNeeded(safePrefix, safeSuffix, safeNestedText);
  }
  
  if (nestedIsHiccup || nestedContainsHiccup) {
    return safePrefix + safeNestedText + safeSuffix;
  }
  return wrapWithQuotesIfNeeded(safePrefix, safeSuffix, safeNestedText);
};

export const parseWrapperPattern = (invokeParams: string): { prefix: string; suffix: string } | null => {
  const match = invokeParams.match(/^(.*)\${selectedText}(.*)$/);
  if (match) {
    return { prefix: match[1], suffix: match[2] };
  }
  return null;
};

export const hasExistingFormat = (text: string): boolean => {
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

// 测试函数
function runTests() {
  console.log('='.repeat(80));
  console.log('独立测试 - 核心函数验证');
  console.log('='.repeat(80));
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  // 测试 parseNestedFormat
  console.log('\n--- parseNestedFormat 测试 ---');
  const parseTests = [
    { input: '**bold text**', expected: '[:b bold text]' },
    { input: 'text **bold** more', expected: 'text [:b bold] more' },
    { input: '数组越大 → **扫描越久 → STW越长 → 服务卡顿**。', expected: '数组越大 → [:b 扫描越久 → STW越长 → 服务卡顿]。' },
  ];
  
  for (const { input, expected } of parseTests) {
    totalTests++;
    const result = parseNestedFormat(input);
    const passed = result === expected;
    if (passed) {
      passedTests++;
      console.log(`✓ parseNestedFormat("${input}")`);
    } else {
      failedTests++;
      console.log(`✗ parseNestedFormat("${input}")`);
      console.log(`  期望: ${expected}`);
      console.log(`  实际: ${result}`);
    }
  }
  
  // 测试 needsQuotes
  console.log('\n--- needsQuotes 测试 ---');
  const needsQuotesTests = [
    { input: 'Hello World', expected: false },
    { input: '带空格的文本', expected: false },
    { input: '带"引号"的文本', expected: true },
    { input: "带'引号'的文本", expected: true },
    { input: '[:b text]', expected: false },
  ];
  
  for (const { input, expected } of needsQuotesTests) {
    totalTests++;
    const result = needsQuotes(input);
    const passed = result === expected;
    if (passed) {
      passedTests++;
      console.log(`✓ needsQuotes("${input}") = ${result}`);
    } else {
      failedTests++;
      console.log(`✗ needsQuotes("${input}")`);
      console.log(`  期望: ${expected}, 实际: ${result}`);
    }
  }
  
  // 测试 wrapWithQuotesIfNeeded
  console.log('\n--- wrapWithQuotesIfNeeded 测试 ---');
  const wrapTests = [
    { prefix: '[:span.red ', suffix: ']', text: '带空格的文本', expected: '[:span.red 带空格的文本]' },
    { prefix: '[:span.red ', suffix: ']', text: '带"引号"的文本', expected: '[:span.red "带\\"引号\\"的文本"]' },
    { prefix: '[:span.red ', suffix: ']', text: '[:b 粗体]', expected: '[:span.red [:b 粗体]]' },
    { prefix: '[:span.red ', suffix: ']', text: '文本[:b 粗体]更多', expected: '[:span.red 文本[:b 粗体]更多]' },
  ];
  
  for (const { prefix, suffix, text, expected } of wrapTests) {
    totalTests++;
    const result = wrapWithQuotesIfNeeded(prefix, suffix, text);
    const passed = result === expected;
    if (passed) {
      passedTests++;
      console.log(`✓ wrapWithQuotesIfNeeded("${prefix}", "${suffix}", "${text}")`);
    } else {
      failedTests++;
      console.log(`✗ wrapWithQuotesIfNeeded("${prefix}", "${suffix}", "${text}")`);
      console.log(`  期望: ${expected}`);
      console.log(`  实际: ${result}`);
    }
  }
  
  // 测试 handleNestedQuotes
  console.log('\n--- handleNestedQuotes 测试 ---');
  const nestedTests = [
    { 
      prefix: '[:span.blue ', 
      suffix: ']', 
      text: '数组越大 → **扫描越久 → STW越长 → 服务卡顿**。', 
      nestedText: '数组越大 → [:b 扫描越久 → STW越长 → 服务卡顿]。',
      expected: '[:span.blue 数组越大 → [:b 扫描越久 → STW越长 → 服务卡顿]。]'
    },
  ];
  
  for (const { prefix, suffix, text, nestedText, expected } of nestedTests) {
    totalTests++;
    const result = handleNestedQuotes(prefix, suffix, text, nestedText);
    const passed = result === expected;
    if (passed) {
      passedTests++;
      console.log(`✓ handleNestedQuotes (混合格式文本)`);
    } else {
      failedTests++;
      console.log(`✗ handleNestedQuotes (混合格式文本)`);
      console.log(`  输入文本: ${text}`);
      console.log(`  嵌套文本: ${nestedText}`);
      console.log(`  期望: ${expected}`);
      console.log(`  实际: ${result}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`测试结果: ${passedTests}/${totalTests} 通过, ${failedTests} 失败`);
  console.log('='.repeat(80));
}

runTests();
