
// 直接复制当前修复后的函数
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
    return prefix + '"' + text + '"' + suffix;
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

const replaceText = (item, text) => {
  const hasNewlines = text.includes('\n');
  
  if (hasNewlines) {
    return text;
  }
  
  if (item.invokeParams) {
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
  
  return text;
};

// 测试用户的问题
const testUserIssue = () => {
  console.log('='.repeat(80));
  console.log('测试用户的问题');
  console.log('='.repeat(80));
  
  const item = {
    invokeParams: '[:span.blue ${selectedText}]'
  };
  
  const input = '数组越大 → **扫描越久 → STW（暂停时间）越长 → 服务卡顿**。';
  const result = replaceText(item, input);
  
  console.log('\n输入: ' + JSON.stringify(input));
  console.log('输出: ' + JSON.stringify(result));
  
  const expected = '[:span.blue 数组越大 → [:b 扫描越久 → STW（暂停时间）越长 → 服务卡顿]。]';
  console.log('期望: ' + JSON.stringify(expected));
  
  console.log('\n匹配成功: ' + (result === expected ? '✅ YES' : '❌ NO'));
};

testUserIssue();
