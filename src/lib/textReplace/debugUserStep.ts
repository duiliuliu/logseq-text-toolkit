/**
 * 追踪用户问题的测试 - 逐步执行
 */

console.log('='.repeat(80));
console.log('用户问题分步测试');
console.log('='.repeat(80));

const testInput = '数组越大 → **扫描越久 → STW（暂停时间）越长 → 服务卡顿**。';
console.log('\n1. 输入文本:', JSON.stringify(testInput));

// 检查是否有格式
const hasFormat = /\*\*[^*]+\*\*/.test(testInput);
console.log('2. 检测到格式标记:', hasFormat ? '是' : '否');

// 第一步：调用 parseNestedFormat
console.log('\n3. 调用 parseNestedFormat:');

const parseNestedFormat = (text) => {
  const outerFormats = [
    { regex: /\*\*([^*]+)\*\*/g, tag: 'b' },
  ];
  
  const recursiveProcess = (s) => {
    for (const { regex, tag } of outerFormats) {
      s = s.replace(regex, (_match, content) => {
        console.log(`   匹配到: ${_match}，内容: ${JSON.stringify(content)}`);
        const innerContent = recursiveProcess(content);
        return `[:${tag} ${innerContent}]`;
      });
    }
    return s;
  };
  
  return recursiveProcess(text);
};

const nestedResult = parseNestedFormat(testInput);
console.log('   parseNestedFormat 结果:', JSON.stringify(nestedResult));

// 第二步：调用 handleNestedQuotes
console.log('\n4. 调用 handleNestedQuotes:');
console.log('   prefix:', '[:span.blue ');
console.log('   suffix:', ']');
console.log('   text:', JSON.stringify(testInput));
console.log('   nestedText:', JSON.stringify(nestedResult));

const wrapWithQuotesIfNeeded = (prefix, suffix, text) => {
  console.log(`   wrapWithQuotesIfNeeded 被调用:`);
  console.log(`      text: ${JSON.stringify(text)}`);
  console.log(`      text.startsWith('[:'): ${text.startsWith('[')}`);
  console.log(`      text.includes('['): ${text.includes('[')}`);
  
  if (text.startsWith('[') && text.endsWith(']')) {
    console.log('      → 直接返回，不加引号');
    return prefix + text + suffix;
  }
  
  if (text.includes('[')) {
    console.log('      → 包含 [，直接返回，不加引号');
    return prefix + text + suffix;
  }
  
  const needsQuotes = text.includes(' ');
  if (needsQuotes) {
    console.log('      → 需要引号，包裹起来');
    return prefix + `"${text}"` + suffix;
  }
  return prefix + text + suffix;
};

const handleNestedQuotes = (prefix, suffix, text, nestedText) => {
  const nestedContainsHiccup = nestedText.includes('[');
  console.log(`   nestedContainsHiccup: ${nestedContainsHiccup}`);
  
  if (nestedContainsHiccup) {
    console.log('   → 包含 hiccup 片段，不包裹引号');
    return prefix + nestedText + suffix;
  }
  return wrapWithQuotesIfNeeded(prefix, suffix, nestedText);
};

const finalResult = handleNestedQuotes('[:span.blue ', ']', testInput, nestedResult);
console.log('\n5. 最终结果:', JSON.stringify(finalResult));
console.log('   期望结果:', JSON.stringify('[:span.blue 数组越大 → [:b 扫描越久 → STW（暂停时间）越长 → 服务卡顿]。]'));
console.log('   匹配:', finalResult === '[:span.blue 数组越大 → [:b 扫描越久 → STW（暂停时间）越长 → 服务卡顿]。]' ? '✅ 是' : '❌ 否');
console.log('\n' + '='.repeat(80));
