
// 调试用户反馈的问题 - 修复后的版本
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
  console.log('wrapWithQuotesIfNeeded called:');
  console.log('  prefix:', JSON.stringify(prefix));
  console.log('  suffix:', JSON.stringify(suffix));
  console.log('  text:', JSON.stringify(text));
  console.log('  text.startsWith("[:"):', text.startsWith('[:'));
  console.log('  text.endsWith("]"):', text.endsWith(']'));
  console.log('  text.includes("[:"):', text.includes('[:'));
  console.log('  needsQuotes(text):', needsQuotes(text));
  
  if (text.startsWith('[:') && text.endsWith(']')) {
    console.log('  text is hiccup format, return:', prefix + text + suffix);
    return prefix + text + suffix;
  }
  
  if (text.includes('[:')) {
    console.log('  text contains hiccup fragment, return:', prefix + text + suffix);
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
  console.log('\nhandleNestedQuotes called:');
  console.log('  prefix:', JSON.stringify(prefix));
  console.log('  suffix:', JSON.stringify(suffix));
  console.log('  original text:', JSON.stringify(text));
  console.log('  nestedText:', JSON.stringify(nestedText));
  
  const prefixHasQuote = prefix.endsWith('"') || prefix.endsWith("'");
  const suffixHasQuote = suffix.startsWith('"') || suffix.startsWith("'");
  
  const isAlreadyNested = text.startsWith('[:') && text.endsWith(']');
  const nestedIsHiccup = nestedText.startsWith('[:') && nestedText.endsWith(']');
  const nestedContainsHiccup = nestedText.includes('[:');
  console.log('  nestedIsHiccup:', nestedIsHiccup);
  console.log('  nestedContainsHiccup:', nestedContainsHiccup);
  
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
        console.log('  nestedIsHiccup or contains hiccup, return directly');
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
    
    console.log('\n=== replaceText debug info ===');
    console.log('text:', JSON.stringify(text));
    console.log('wrapper:', wrapper);
    console.log('hasExistingFormat(text):', hasExistingFormat(text));
    
    if (wrapper && hasExistingFormat(text)) {
      const nestedText = parseNestedFormat(text);
      console.log('nestedText:', JSON.stringify(nestedText));
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

const testUserIssue = () => {
  console.log('='.repeat(80));
  console.log('测试用户反馈的问题 - 修复后');
  console.log('='.repeat(80));
  
  const item = {
    invokeParams: '[:span.blue ${selectedText}]'
  };
  
  const input1 = '**扫描越久 → STW（暂停时间）越长 → 服务卡顿**';
  console.log('\n测试1: 纯格式内容');
  console.log('输入:', JSON.stringify(input1));
  const result1 = replaceText(item, input1);
  console.log('结果:', JSON.stringify(result1));
  
  const input2 = '数组越大 → **扫描越久 → STW（暂停时间）越长 → 服务卡顿**。';
  console.log('\n\n测试2: 混合内容（用户原始问题）');
  console.log('输入:', JSON.stringify(input2));
  const result2 = replaceText(item, input2);
  console.log('结果:', JSON.stringify(result2));
  console.log('\n验证: 结果中是否有多余的引号包裹整个字符串?');
  console.log('期望: "[:span.blue 数组越大 → [:b \"扫描越久 → STW（暂停时间）越长 → 服务卡顿\"]。]"');
  console.log('实际: ' + JSON.stringify(result2));
};

testUserIssue();
