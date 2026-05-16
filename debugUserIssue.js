
// 调试用户反馈的问题
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
  
  // 使用从外到内的策略：递归地处理最外层的格式
  const processOuterFormat = (str) => {
    // 定义外层格式及其对应的 hiccup 标签
    const outerFormats = [
      { regex: /\*\*([^*]+)\*\*/g, tag: 'b' },
      { regex: /(?<!\*)\*([^*]+)\*(?!\*)/g, tag: 'i' },
      { regex: /~~([^~]+)~~/g, tag: 's' },
      { regex: /==([^=]+)==/g, tag: 'mark' },
      { regex: /`([^`]+)`/g, tag: 'code' },
    ];
    
    // 递归处理从外到内
    const recursiveProcess = (s) => {
      // 如果没有格式标记，直接返回
      const hasAnyFormat = outerFormats.some(f => f.regex.test(s));
      if (!hasAnyFormat) {
        return s;
      }
      
      let processed = s;
      
      // 处理每个外层格式
      for (const { regex, tag } of outerFormats) {
        processed = processed.replace(regex, (match, content) => {
          // 递归处理内层内容
          const innerContent = recursiveProcess(content);
          
          // 判断是否需要引号
          const isHiccupFormat = innerContent.startsWith('[:') && innerContent.endsWith(']');
          
          if (isHiccupFormat) {
            // 已经是 hiccup 格式，直接返回
            return `[:${tag} ${innerContent}]`;
          } else if (innerContent.includes(' ') || 
                     innerContent.includes('"') || 
                     innerContent.includes("'")) {
            // 普通文本但包含需要引号的字符
            return `[:${tag} "${innerContent}"]`;
          } else {
            // 普通文本，不需要引号
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
  // 跳过已经是完整 hiccup 格式的文本
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
  console.log('  needsQuotes(text):', needsQuotes(text));
  
  // 如果文本本身就是完整的 hiccup 格式，不要包裹引号
  if (text.startsWith('[:') && text.endsWith(']')) {
    console.log('  text is hiccup format, return:', prefix + text + suffix);
    return prefix + text + suffix;
  }
  
  // 检查前缀和后缀是否有引号
  const prefixHasQuote = prefix.endsWith('"') || prefix.endsWith("'");
  const suffixHasQuote = suffix.startsWith('"') || suffix.startsWith("'");
  
  // 如果需要引号但没有提供，则添加引号
  if (needsQuotes(text) && !prefixHasQuote && !suffixHasQuote) {
    return prefix + '"' + text + '"' + suffix;
  }
  
  // 如果不需要引号但提供了引号，则移除引号
  if (!needsQuotes(text) && prefixHasQuote && suffixHasQuote) {
    const cleanPrefix = prefix.slice(0, -1);
    const cleanSuffix = suffix.slice(1);
    return cleanPrefix + text + cleanSuffix;
  }
  
  // 否则保持原样
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
  console.log('  nestedIsHiccup:', nestedIsHiccup);
  
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
    // 如果是已嵌套格式，直接使用原始文本
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
      // 如果nestedText本身是hiccup格式，不要包裹引号
      if (nestedIsHiccup) {
        console.log('  nestedIsHiccup, return directly');
        return prefix + nestedText + suffix;
      }
      return wrapWithQuotesIfNeeded(prefix, suffix, nestedText);
    }
  }
  
  if (isPartiallyFormatted) {
    // 如果nestedText本身是hiccup格式，不要包裹引号
    if (nestedIsHiccup) {
      return prefix + nestedText + suffix;
    }
    return wrapWithQuotesIfNeeded(prefix, suffix, nestedText);
  }
  
  // 如果nestedText本身是hiccup格式，不要包裹引号
  if (nestedIsHiccup) {
    return prefix + nestedText + suffix;
  }
  return wrapWithQuotesIfNeeded(prefix, suffix, nestedText);
};

// 模拟完整的 replaceText 函数
const replaceText = (item, text) => {
  const hasNewlines = text.includes('\n');
  
  if (hasNewlines) {
    return text; // 简化处理
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
      // 直接替换时也需要检查是否需要引号包裹
      if (wrapper) {
        return wrapWithQuotesIfNeeded(wrapper.prefix, wrapper.suffix, text);
      }
      return invokeParamsStr.replace(/\${selectedText}/g, text);
    }
  }
  
  return text;
};

// 测试用户反馈的问题
const testUserIssue = () => {
  console.log('='.repeat(80));
  console.log('测试用户反馈的问题');
  console.log('='.repeat(80));
  
  // 模拟用户场景 - 使用完整的 replaceText 流程
  const item = {
    invokeParams: '[:span.blue ${selectedText}]'
  };
  const input = '**扫描越久 → STW（暂停时间）越长 → 服务卡顿**';
  console.log('\n输入:', JSON.stringify(input));
  
  const result = replaceText(item, input);
  
  console.log('\n最终结果:', JSON.stringify(result));
  
  // 测试另一个可能的问题场景
  console.log('\n');
  console.log('='.repeat(80));
  console.log('测试另一个场景: isPartiallyFormatted 情况');
  console.log('='.repeat(80));
  const input2 = '数组越大 → **扫描越久 → STW（暂停时间）越长 → 服务卡顿**。';
  console.log('输入:', JSON.stringify(input2));
  const result2 = replaceText(item, input2);
  console.log('结果:', JSON.stringify(result2));
};

testUserIssue();

