/**
 * 详细调试 parseNestedFormat
 */

const parseNestedFormat = (text: string): string => {
  if (text.startsWith('[:') && text.endsWith(']')) {
    return text;
  }
  
  let result = text;
  console.log(`原始输入: ${result}`);
  
  // 第一步：将内层 Markdown 格式转换为 hiccup，不添加引号
  console.log('\n第一步：Markdown 转换');
  const old1 = result;
  result = result.replace(/\*\*([^*]+)\*\*/g, '[:b $1]');
  console.log(`  粗体转换: ${old1} -> ${result}`);
  
  const old2 = result;
  result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '[:i $1]');
  console.log(`  斜体转换: ${old2} -> ${result}`);
  
  const old3 = result;
  result = result.replace(/~~([^~]+)~~/g, '[:s $1]');
  console.log(`  删除转换: ${old3} -> ${result}`);
  
  const old4 = result;
  result = result.replace(/==([^=]+)==/g, '[:mark $1]');
  console.log(`  高亮转换: ${old4} -> ${result}`);
  
  const old5 = result;
  result = result.replace(/`([^`]+)`/g, '[:code $1]');
  console.log(`  代码转换: ${old5} -> ${result}`);
  
  console.log(`\n第一步结果: ${result}`);
  
  // 第二步：修复可能形成的嵌套hiccup
  console.log('\n第二步：修复嵌套');
  const fixNestedHiccup = (str: string): string => {
    let fixed = str;
    let changed = true;
    let step = 0;
    
    while (changed && step < 10) {
      changed = false;
      step++;
      const before = fixed;
      
      console.log(`  循环 ${step}: ${before}`);
      
      fixed = fixed.replace(/(\[:[\w.]+)\s+(\[:[^\]]+\])\]/g, (match, outer, inner) => {
        console.log(`    匹配到: outer="${outer}", inner="${inner}"`);
        const innerMatch = inner.match(/^\[:([\w.]+)\s+(.+)\]$/);
        if (innerMatch) {
          const [, tag, content] = innerMatch;
          console.log(`    提取: tag="${tag}", content="${content}"`);
          if (!content.startsWith('"') && !content.startsWith('[:') && content.trim() !== '') {
            const contentWithQuote = `"${content.trim()}"`;
            console.log(`    添加引号: "${content.trim()}" -> ${contentWithQuote}`);
            changed = true;
            return `[:${tag} ${contentWithQuote}]`;
          }
        }
        console.log(`    无需处理`);
        return match;
      });
      
      if (fixed !== before) {
        console.log(`    结果: ${fixed}`);
      }
    }
    
    return fixed;
  };
  
  result = fixNestedHiccup(result);
  
  console.log(`\n第二步结果: ${result}`);
  
  return result;
};

console.log('=== 详细调试 parseNestedFormat ===\n');
const output = parseNestedFormat('==**高亮加粗**==');
console.log('\n最终输出:', output);
