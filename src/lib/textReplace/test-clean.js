/**
 * 干净的测试文件：直接测试 utils.ts 中的 replaceText 和 regexReplaceText 函数
 * 使用从 utils.ts 复制的函数来避免导入问题
 */

// 复制 utils.ts 中的函数
const hasExistingFormat = (text) => {
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

const parseNestedFormat = (text) => {
  if (text.startsWith('[:') && text.endsWith(']')) {
    return text;
  }
  
  const processOuterFormat = (str) => {
    const outerFormats = [
      { regex: /\*\*([^*]+)\*\*/g, tag: 'b' },
      { regex: /(?<!\*)\*([^*]+)\*(?!\*)/g, tag: 'i' },
      { regex: /~~([^~]+)~~/g, tag: 's' },
      { regex: /==([^=]+)==/g, tag: 'mark' },
      { regex: /`([^`]+)`/g, tag: 'code' },
    ];
    
    const recursiveProcess = (s) => {
      const hasAnyFormat = outerFormats.some(f => f.regex.test(s));
      if (!hasAnyFormat) {
        return s;
      }
      
      let processed = s;
      
      for (const { regex, tag } of outerFormats) {
        processed = processed.replace(regex, (_match, content) => {
          const innerContent = recursiveProcess(content);
          
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

const parseWrapperPattern = (invokeParams) => {
  const match = invokeParams.match(/^(.*)\${selectedText}(.*)$/);
  if (match) {
    return { prefix: match[1], suffix: match[2] };
  }
  return null;
};

const needsQuotes = (text) => {
  if (text.startsWith('[:') && text.endsWith(']')) {
    return false;
  }
  return text.includes(' ') || text.includes('\u00A0') || text.includes('\u3000') || 
         text.includes('"') || text.includes("'");
};

const wrapWithQuotesIfNeeded = (prefix, suffix, text) => {
  if (text.startsWith('[:') && text.endsWith(']')) {
    return prefix + text + suffix;
  }
  
  if (text.includes('[:')) {
    return prefix + text + suffix;
  }
  
  const prefixHasQuote = prefix.endsWith('"') || prefix.endsWith("'");
  const suffixHasQuote = suffix.startsWith('"') || suffix.startsWith("'");
  
  if (needsQuotes(text) && !prefixHasQuote && !suffixHasQuote) {
    return prefix + `"${text}"` + suffix;
  }
  
  if (!needsQuotes(text) && prefixHasQuote && suffixHasQuote) {
    const cleanPrefix = prefix.slice(0, -1);
    const cleanSuffix = suffix.slice(1);
    return cleanPrefix + text + cleanSuffix;
  }
  
  return prefix + text + suffix;
};

const handleNestedQuotes = (prefix, suffix, text, nestedText) => {
  const prefixHasQuote = prefix.endsWith('"') || prefix.endsWith("'");
  const suffixHasQuote = suffix.startsWith('"') || suffix.startsWith("'");
  
  const isAlreadyNested = text.startsWith('[:') && text.endsWith(']');
  const nestedIsHiccup = nestedText.startsWith('[:') && nestedText.endsWith(']');
  const nestedContainsHiccup = nestedText.includes('[:');
  
  const isEntirelyWrappedFormat = (
    (text.startsWith('**') && text.endsWith('**')) ||
    (text.startsWith('*') && text.endsWith('*') && !text.startsWith('**')) ||
    (text.startsWith('~~') && text.endsWith('~~')) ||
    (text.startsWith('==') && text.endsWith('==')) ||
    (text.startsWith('`') && text.endsWith('`'))
  );
  
  const hasFormatMarkers = text.includes('**') || text.includes('*') || text.includes('~~') || text.includes('==') || text.includes('`');
  const isPartiallyFormatted = hasFormatMarkers && !isEntirelyWrappedFormat;
  
  if (isAlreadyNested) {
    if (prefixHasQuote && suffixHasQuote) {
      const cleanPrefix = prefix.slice(0, -1);
      const cleanSuffix = suffix.slice(1);
      return cleanPrefix + text + cleanSuffix;
    } else {
      return prefix + text + suffix;
    }
  }
  
  if (isEntirelyWrappedFormat) {
    if (prefixHasQuote && suffixHasQuote) {
      const cleanPrefix = prefix.slice(0, -1);
      const cleanSuffix = suffix.slice(1);
      return cleanPrefix + nestedText + cleanSuffix;
    } else {
      if (nestedIsHiccup || nestedContainsHiccup) {
        return prefix + nestedText + suffix;
      }
      return wrapWithQuotesIfNeeded(prefix, suffix, nestedText);
    }
  }
  
  if (isPartiallyFormatted) {
    if (nestedIsHiccup || nestedContainsHiccup) {
      return prefix + nestedText + suffix;
    }
    return wrapWithQuotesIfNeeded(prefix, suffix, nestedText);
  }
  
  if (nestedIsHiccup || nestedContainsHiccup) {
    return prefix + nestedText + suffix;
  }
  return wrapWithQuotesIfNeeded(prefix, suffix, nestedText);
};

const isRegexReplaceParams = (params) => {
  return typeof params === 'object' && params !== null && 'regex' in params;
};

const replaceText = (item, text) => {
  if (!text || text.trim() === '') {
    return '';
  }
  
  const hasNewlines = text.includes('\n');
  
  if (hasNewlines) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      return '';
    }
    
    const processedLines = lines.map(line => {
      if (item.regex && item.replacement) {
        const regex = new RegExp(item.regex, 'g');
        return line.replace(regex, item.replacement);
      } else if (item.invokeParams) {
        if (isRegexReplaceParams(item.invokeParams)) {
          const { regex: pattern, replacement, flags = 'g' } = item.invokeParams;
          const regex = new RegExp(pattern, flags);
          return line.replace(regex, replacement);
        } else {
          const invokeParamsStr = String(item.invokeParams);
          const wrapper = parseWrapperPattern(invokeParamsStr);
          
          if (wrapper && hasExistingFormat(line)) {
            const nestedText = parseNestedFormat(line);
            return handleNestedQuotes(wrapper.prefix, wrapper.suffix, line, nestedText);
          } else {
            const wrapperCheck = parseWrapperPattern(invokeParamsStr);
            if (wrapperCheck) {
              return wrapWithQuotesIfNeeded(wrapperCheck.prefix, wrapperCheck.suffix, line);
            }
            return invokeParamsStr.replace(/\${selectedText}/g, line);
          }
        }
      }
      return line;
    });
    
    if (processedLines.length === 1) {
      return processedLines[0];
    }
    
    return processedLines.map(line => `[:div ${line}]`).join('');
  } else {
    if (item.regex && item.replacement) {
      const regex = new RegExp(item.regex, 'g');
      return text.replace(regex, item.replacement);
    } else if (item.invokeParams) {
      if (isRegexReplaceParams(item.invokeParams)) {
        const { regex: pattern, replacement, flags = 'g' } = item.invokeParams;
        const regex = new RegExp(pattern, flags);
        return text.replace(regex, replacement);
      } else {
          const invokeParamsStr = String(item.invokeParams);
          const wrapper = parseWrapperPattern(invokeParamsStr);
          
          if (wrapper && hasExistingFormat(text)) {
            const nestedText = parseNestedFormat(text);
            return handleNestedQuotes(wrapper.prefix, wrapper.suffix, text, nestedText);
          } else {
            if (wrapper) {
              return wrapWithQuotesIfNeeded(wrapper.prefix, wrapper.suffix, text);
            }
            return invokeParamsStr.replace(/\${selectedText}/g, text);
          }
        }
    }
    return text;
  }
};

const regexReplaceText = (item, text) => {
  if (item.invokeParams) {
    try {
      if (isRegexReplaceParams(item.invokeParams)) {
        const { regex: pattern, replacement, flags = 'g' } = item.invokeParams;
        const regex = new RegExp(pattern, flags);
        return text.replace(regex, replacement);
      } else if (typeof item.invokeParams === 'string') {
        const regexMatch = item.invokeParams.match(/\/(.*)\/(.*)\/(.*)/);
        if (regexMatch) {
          const [, pattern, replacement, flags] = regexMatch;
          const regex = new RegExp(pattern, flags);
          return text.replace(regex, replacement);
        }
      }
    } catch (error) {
      console.error('Error parsing regex:', error);
    }
  }
  return text;
};

// 测试函数
function test(name, fn, expected) {
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
    console.log(`❌ ${name} (Error: ${e.message})`);
    return false;
  }
}

// 测试用例
console.log('='.repeat(80));
console.log('测试 replaceText 和 regexReplaceText 函数');
console.log('='.repeat(80));

const tests = [];

// 1. 用户原始问题
console.log('\n📋 用户原始问题 - 混合格式文本');
tests.push(test(
  '用户原始问题 - 混合格式文本',
  () => replaceText({ invokeParams: '[:span.blue ${selectedText}]' }, '数组越大 → **扫描越久 → STW（暂停时间）越长 → 服务卡顿**。'),
  '[:span.blue 数组越大 → [:b 扫描越久 → STW（暂停时间）越长 → 服务卡顿]。]'
));

// 2. 简单纯文本包裹
console.log('\n📋 简单纯文本包裹');
tests.push(test(
  '简单纯文本包裹',
  () => replaceText({ invokeParams: '[:i ${selectedText}]' }, 'Hello World'),
  '[:i "Hello World"]'
));

// 3. 已有 hiccup 格式的文本
console.log('\n📋 已有 hiccup 格式的文本');
tests.push(test(
  '已有 hiccup 格式的文本',
  () => replaceText({ invokeParams: '[:div ${selectedText}]' }, '[:b "Hello"]'),
  '[:div [:b "Hello"]]'
));

// 4. 多行文本测试
console.log('\n📋 多行文本处理');
tests.push(test(
  '多行文本处理',
  () => replaceText({ invokeParams: '[:i ${selectedText}]' }, 'Line 1\nLine 2\nLine 3'),
  '[:div [:i "Line 1"]][:div [:i "Line 2"]][:div [:i "Line 3"]]'
));

// 5. 空文本测试
console.log('\n📋 空文本处理');
tests.push(test(
  '空文本处理',
  () => replaceText({ invokeParams: '[:i ${selectedText}]' }, ''),
  ''
));

// 6. 纯粗体格式
console.log('\n📋 纯粗体格式');
tests.push(test(
  '纯粗体格式',
  () => replaceText({ invokeParams: '[:b ${selectedText}]' }, '**bold**'),
  '[:b bold]'
));

// 7. 斜体格式
console.log('\n📋 斜体格式');
tests.push(test(
  '斜体格式',
  () => replaceText({ invokeParams: '[:i ${selectedText}]' }, '*italic*'),
  '[:i italic]'
));

// 8. 带空格的中文文本
console.log('\n📋 带空格的中文文本');
tests.push(test(
  '带空格的中文文本',
  () => replaceText({ invokeParams: '[:span.blue ${selectedText}]' }, '这是 测试 文本'),
  '[:span.blue "这是 测试 文本"]'
));

// regexReplaceText 测试
console.log('\n' + '='.repeat(80));
console.log('regexReplaceText 测试');
console.log('='.repeat(80));

tests.push(test(
  'regexReplaceText 字符串格式',
  () => regexReplaceText({ invokeParams: '/World/Logseq/g' }, 'Hello World, this is World'),
  'Hello Logseq, this is Logseq'
));

tests.push(test(
  'regexReplaceText 对象格式',
  () => regexReplaceText({ invokeParams: { regex: 'World', replacement: 'Logseq', flags: 'g' } }, 'Hello World, this is World'),
  'Hello Logseq, this is Logseq'
));

// 汇总结果
console.log('\n' + '='.repeat(80));
const passed = tests.filter(r => r).length;
const total = tests.length;
console.log(`📊 测试结果: ${passed}/${total} 通过`);
console.log(`🎯 通过率: ${((passed / total) * 100).toFixed(2)}%`);
console.log('='.repeat(80));

// 显示失败测试
const failedTests = [];
tests.forEach((r, i) => {
  if (!r) {
    const testNames = [
      '用户原始问题 - 混合格式文本',
      '简单纯文本包裹',
      '已有 hiccup 格式的文本',
      '多行文本处理',
      '空文本处理',
      '纯粗体格式',
      '斜体格式',
      '带空格的中文文本',
      'regexReplaceText 字符串格式',
      'regexReplaceText 对象格式'
    ];
    failedTests.push(testNames[i]);
  }
});

if (failedTests.length > 0) {
  console.log('\n❌ 失败的测试:');
  failedTests.forEach((name) => {
    console.log(`   - ${name}`);
  });
}
