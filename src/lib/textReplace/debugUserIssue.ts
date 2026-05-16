
// 调试用户反馈的问题

// 复制需要的函数
const hasExistingFormat = (text: string): boolean => {
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

const parseNestedFormat = (text: string): string => {
  if (text.startsWith('[:') && text.endsWith(']')) {
    return text;
  }
  
  // 使用从外到内的策略：递归地处理最外层的格式
  const processOuterFormat = (str: string): string => {
    // 定义外层格式及其对应的 hiccup 标签
    const outerFormats = [
      { regex: /\*\*([^*]+)\*\*/g, tag: 'b' },
      { regex: /(?<!\*)\*([^*]+)\*(?!\*)/g, tag: 'i' },
      { regex: /~~([^~]+~~/g, tag: 's' },
      { regex: /==([^=]+)==/g, tag: 'mark' },
      { regex: /`([^`]+)`/g, tag: 'code' },
    ];
    
    // 递归处理从外到内
    const recursiveProcess = (s: string): string => {
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
          // 不需要引号的情况：
          // 1. 内容已经是完整的 hiccup 格式（以 [: 开头，以 ] 结尾）
          // 2. 内容包含嵌套的 hiccup 格式
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

const parseWrapperPattern = (invokeParams: string): { prefix: string; suffix: string } | null => {
  const match = invokeParams.match(/^(.*)\${selectedText}(.*)$/);
  if (match) {
    return { prefix: match[1], suffix: match[2] };
  }
  
  return null;
};

const needsQuotes = (text: string): boolean => {
  // 跳过已经是完整 hiccup 格式的文本
  if (text.startsWith('[:') && text.endsWith(']')) {
    return false;
  }
  
  return text.includes(' ') || text.includes('\u00A0') || text.includes('\u3000') || 
         text.includes('"') || text.includes("'");
};

const wrapWithQuotesIfNeeded = (prefix: string, suffix: string, text: string): string => {
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
    return prefix + `"${text}"` + suffix;
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

const handleNestedQuotes = (prefix: string, suffix: string, text: string, nestedText: string): string => {
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

// 测试用户反馈的问题
const testUserIssue = () => {
  console.log('='.repeat(80));
  console.log('测试用户反馈的问题');
  console.log('='.repeat(80));
  
  const input = '**扫描越久 → STW（暂停时间）越长 → 服务卡顿**';
  console.log('\n输入:', JSON.stringify(input));
  
  console.log('\n步骤1: 检查是否有现有格式:', hasExistingFormat(input));
  
  console.log('\n步骤2: parseNestedFormat 结果:', JSON.stringify(parseNestedFormat(input)));
  
  const wrapperPattern = '[:span.blue ${selectedText}]';
  console.log('\n步骤3: parseWrapperPattern 结果:', parseWrapperPattern(wrapperPattern));
  
  if (parseWrapperPattern(wrapperPattern)) {
    const { prefix, suffix } = parseWrapperPattern(wrapperPattern)!;
    const nestedText = parseNestedFormat(input);
    const result = handleNestedQuotes(prefix, suffix, input, nestedText);
    
    console.log('\n最终结果:', JSON.stringify(result));
  }
};

testUserIssue();

