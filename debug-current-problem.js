
const hasExistingFormat = (text) => {
  if (text.startsWith('[:') &amp;&amp; text.endsWith(']')) {
    return true;
  }
  
  const formatPatterns = [
    /\*\*[^*]+\*\*/,
    /\*[^*]+\*/,
    /~~[^~]+~~/,
    /==[^=]+==/,
    /`[^`]+`/,
  ];
  
  return formatPatterns.some(pattern =&gt; pattern.test(text));
};

const parseNestedFormat = (text) => {
  if (text.startsWith('[:') &amp;&amp; text.endsWith(']')) {
    return text;
  }
  
  const processOuterFormat = (str) => {
    const outerFormats = [
      { regex: /\*\*([^*]+)\*\*/g, tag: 'b' },
      { regex: /(?&lt;!\*)\*([^*]+)\*(?!\*)/g, tag: 'i' },
      { regex: /~~([^~]+)~~/g, tag: 's' },
      { regex: /==([^=]+)==/g, tag: 'mark' },
      { regex: /`([^`]+)`/g, tag: 'code' },
    ];
    
    const recursiveProcess = (s) => {
      const hasAnyFormat = outerFormats.some(f =&gt; f.regex.test(s));
      if (!hasAnyFormat) {
        return s;
      }
      
      let processed = s;
      
      for (const { regex, tag } of outerFormats) {
        processed = processed.replace(regex, (_match, content) => {
          const innerContent = recursiveProcess(content);
          
          const isHiccupFormat = innerContent.startsWith('[:') &amp;&amp; innerContent.endsWith(']');
          
          console.log(`parseNestedFormat: 处理 ${tag} 标签，内容：`, JSON.stringify(content));
          console.log(`parseNestedFormat: innerContent：`, JSON.stringify(innerContent));
          console.log(`parseNestedFormat: isHiccupFormat：`, isHiccupFormat);
          
          if (isHiccupFormat) {
            return `[:${tag} ${innerContent}]`;
          } else if (innerContent.includes(' ') || 
                     innerContent.includes('"') || 
                     innerContent.includes("'")) {
            console.log(`parseNestedFormat: 需要引号`);
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
  if (text.startsWith('[:') &amp;&amp; text.endsWith(']')) {
    return false;
  }
  return text.includes(' ') || text.includes('\u00A0') || text.includes('\u3000') || 
         text.includes('"') || text.includes("'");
};

const wrapWithQuotesIfNeeded = (prefix, suffix, text) => {
  console.log('\nwrapWithQuotesIfNeeded called:');
  console.log('  prefix:', JSON.stringify(prefix));
  console.log('  suffix:', JSON.stringify(suffix));
  console.log('  text:', JSON.stringify(text));
  console.log('  text.startsWith("[:"):', text.startsWith('[:'));
  console.log('  text.endsWith("]"):', text.endsWith(']'));
  console.log('  text.includes("[:"):', text.includes('[:'));
  console.log('  needsQuotes(text):', needsQuotes(text));
  
  if (text.startsWith('[:') &amp;&amp; text.endsWith(']')) {
    console.log('  text is hiccup format, return:', prefix + text + suffix);
    return prefix + text + suffix;
  }
  
  if (text.includes('[:')) {
    console.log('  text includes hiccup fragment, return:', prefix + text + suffix);
    return prefix + text + suffix;
  }
  
  const prefixHasQuote = prefix.endsWith('"') || prefix.endsWith("'");
  const suffixHasQuote = suffix.startsWith('"') || suffix.startsWith("'");
  
  if (needsQuotes(text) &amp;&amp; !prefixHasQuote &amp;&amp; !suffixHasQuote) {
    return prefix + `"${text}"` + suffix;
  }
  
  if (!needsQuotes(text) &amp;&amp; prefixHasQuote &amp;&amp; suffixHasQuote) {
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
  
  const isAlreadyNested = text.startsWith('[:') &amp;&amp; text.endsWith(']');
  const nestedIsHiccup = nestedText.startsWith('[:') &amp;&amp; nestedText.endsWith(']');
  const nestedContainsHiccup = nestedText.includes('[:');
  console.log('  nestedIsHiccup:', nestedIsHiccup);
  console.log('  nestedContainsHiccup:', nestedContainsHiccup);
  
  const isEntirelyWrappedFormat = (
    (text.startsWith('**') &amp;&amp; text.endsWith('**')) ||
    (text.startsWith('*') &amp;&amp; text.endsWith('*') &amp;&amp; !text.startsWith('**')) ||
    (text.startsWith('~~') &amp;&amp; text.endsWith('~~')) ||
    (text.startsWith('==') &amp;&amp; text.endsWith('==')) ||
    (text.startsWith('`') &amp;&amp; text.endsWith('`'))
  );
  
  const hasFormatMarkers = text.includes('**') || text.includes('*') || text.includes('~~') || text.includes('==') || text.includes('`');
  const isPartiallyFormatted = hasFormatMarkers &amp;&amp; !isEntirelyWrappedFormat;
  
  console.log('  isEntirelyWrappedFormat:', isEntirelyWrappedFormat);
  console.log('  isPartiallyFormatted:', isPartiallyFormatted);
  
  if (isAlreadyNested) {
    if (prefixHasQuote &amp;&amp; suffixHasQuote) {
      const cleanPrefix = prefix.slice(0, -1);
      const cleanSuffix = suffix.slice(1);
      return cleanPrefix + text + cleanSuffix;
    } else {
      return prefix + text + suffix;
    }
  }
  
  if (isEntirelyWrappedFormat) {
    if (prefixHasQuote &amp;&amp; suffixHasQuote) {
      const cleanPrefix = prefix.slice(0, -1);
      const cleanSuffix = suffix.slice(1);
      return cleanPrefix + nestedText + cleanSuffix;
    } else {
      if (nestedIsHiccup || nestedContainsHiccup) {
        console.log('  nestedIsHiccup or contains hiccup, return directly:', prefix + nestedText + suffix);
        return prefix + nestedText + suffix;
      }
      return wrapWithQuotesIfNeeded(prefix, suffix, nestedText);
    }
  }
  
  if (isPartiallyFormatted) {
    if (nestedIsHiccup || nestedContainsHiccup) {
      console.log('  isPartiallyFormatted, nestedContainsHiccup, return directly:', prefix + nestedText + suffix);
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
  console.log('='.repeat(80));
  console.log('replaceText 开始处理');
  console.log('='.repeat(80));
  console.log('\n输入文本:', JSON.stringify(text));
  
  const hasNewlines = text.includes('\n');
  
  if (hasNewlines) {
    return text;
  }
  
  if (item.invokeParams) {
    const invokeParamsStr = String(item.invokeParams);
    const wrapper = parseWrapperPattern(invokeParamsStr);
    
    console.log('\n解析 wrapper:', wrapper);
    console.log('hasExistingFormat(text):', hasExistingFormat(text));
    
    if (wrapper &amp;&amp; hasExistingFormat(text)) {
      const nestedText = parseNestedFormat(text);
      console.log('\nparseNestedFormat 结果:', JSON.stringify(nestedText));
      
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
  const item = {
    invokeParams: '[:span.blue ${selectedText}]'
  };
  
  const input = '数组越大 → **扫描越久 → STW（暂停时间）越长 → 服务卡顿**。';
  const result = replaceText(item, input);
  
  console.log('\n' + '='.repeat(80));
  console.log('最终结果:', JSON.stringify(result));
  
  const expected = '[:span.blue 数组越大 → [:b 扫描越久 → STW（暂停时间）越长 → 服务卡顿]。]';
  console.log('期望结果:', JSON.stringify(expected));
  console.log('匹配:', result === expected);
};

testUserIssue();
