// 测试 replaceText 和 regexReplaceText 函数
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
            const wrapper = parseWrapperPattern(invokeParamsStr);
            if (wrapper) {
              return wrapWithQuotesIfNeeded(wrapper.prefix, wrapper.suffix, line);
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
const test = (name, fn, expected) => {
  try {
    const result = fn();
    const success = result === expected;
    console.log(`  ${success ? '✅' : '❌'} ${name}`);
    if (!success) {
      console.log(`     Expected: ${JSON.stringify(expected)}`);
      console.log(`     Got:      ${JSON.stringify(result)}`);
    }
    return success;
  } catch (e) {
    console.log(`  ❌ ${name} (Error: ${e.message})`);
    return false;
  }
};

// 主测试程序
console.log("=".repeat(80));
console.log("测试 replaceText 和 regexReplaceText 函数");
console.log("=".repeat(80));

const tests = [];

// 1. 用户原始问题
console.log("\n📝 测试 replaceText 函数");
const test1Item = {
  invokeParams: '[:span.blue ${selectedText}]'
};
const test1Input = '数组越大 → **扫描越久 → STW（暂停时间）越长 → 服务卡顿**。';
const test1Expected = '[:span.blue 数组越大 → [:b 扫描越久 → STW（暂停时间）越长 → 服务卡顿]。]';

tests.push(test(
  "用户原始问题测试", 
  () => replaceText(test1Item, test1Input), 
  test1Expected
));

// 2. 简单纯文本包裹
const test2Item = {
  invokeParams: '[:i ${selectedText}]'
};
const test2Input = 'Hello World';
const test2Expected = '[:i "Hello World"]';
tests.push(test(
  "简单纯文本包裹", 
  () => replaceText(test2Item, test2Input), 
  test2Expected
));

// 3. 已有 hiccup 格式的文本
const test3Item = {
  invokeParams: '[:div ${selectedText}]'
};
const test3Input = '[:b "Hello"]';
const test3Expected = '[:div [:b "Hello"]]';
tests.push(test(
  "已有 hiccup 格式的文本", 
  () => replaceText(test3Item, test3Input), 
  test3Expected
));

// 4. regexReplaceText 测试 - 字符串格式
console.log("\n🔍 测试 regexReplaceText 函数");
const test4Item = {
  invokeParams: '/World/Logseq/g'
};
const test4Input = 'Hello World, this is World';
const test4Expected = 'Hello Logseq, this is Logseq';
tests.push(test(
  "regexReplaceText 字符串格式测试", 
  () => regexReplaceText(test4Item, test4Input), 
  test4Expected
));

// 5. regexReplaceText 测试 - 对象格式
const test5Item = {
  invokeParams: { regex: 'World', replacement: 'Logseq', flags: 'g' }
};
const test5Input = 'Hello World, this is World';
const test5Expected = 'Hello Logseq, this is Logseq';
tests.push(test(
  "regexReplaceText 对象格式测试", 
  () => regexReplaceText(test5Item, test5Input), 
  test5Expected
));

// 6. 多行文本测试
console.log("\n📋 测试多行文本");
const test6Item = {
  invokeParams: '[:i ${selectedText}]'
};
const test6Input = 'Line 1\nLine 2\nLine 3';
const test6Expected = '[:div [:i "Line 1"]][:div [:i "Line 2"]][:div [:i "Line 3"]]';
tests.push(test(
  "多行文本处理", 
  () => replaceText(test6Item, test6Input), 
  test6Expected
));

// 7. 空文本测试
const test7Item = {
  invokeParams: '[:i ${selectedText}]'
};
const test7Input = '';
const test7Expected = '';
tests.push(test(
  "空文本处理", 
  () => replaceText(test7Item, test7Input), 
  test7Expected
));

// 统计结果
console.log("\n" + "=".repeat(80));
const passed = tests.filter(t => t).length;
const total = tests.length;
console.log(`📊 结果: ${passed}/${total} 测试通过`);
console.log("=".repeat(80));
