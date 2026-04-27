// 测试Logseq中的实际情况，使用defaultSettings.json中的配置

// 模拟ToolbarItem类型
interface ToolbarItem {
  id: string;
  funcmode: string;
  clickfunc: {
    regex: string;
    replacement: string;
    flags?: string;
  } | string;
}

// 从defaultSettings.json中复制的remove-formatting配置
const removeFormattingItem = {
  id: 'remove-formatting',
  funcmode: 'regexReplace',
  clickfunc: {
    regex: '\\[:(?:mark|span|u)\\.(?:red|blue|yellow|green|purple)\\s+([^\\]]*)\\]|==([^=]*)==|~~([^~]*)~~|\\*\\*([^\\*]*)\\*\\*|\\*([^\\*]*)\\*|`([^`]*)`',
    replacement: '$1$2$3$4$5$6'
  }
} as ToolbarItem;

/**
 * 正则替换文本
 * @param item 工具栏项目
 * @param text 原始文本
 * @returns 替换后的文本
 */
function regexReplaceText(item: ToolbarItem, text: string): string {
  if (item.clickfunc) {
    try {
      // 处理对象格式的clickfunc（包含regex和replacement属性）
      if (typeof item.clickfunc === 'object' && item.clickfunc.regex && item.clickfunc.replacement) {
        const { regex: pattern, replacement, flags = 'g' } = item.clickfunc;
        const regex = new RegExp(pattern, flags);
        return text.replace(regex, replacement);
      }
      // 处理字符串格式的clickfunc（格式示例: /pattern/replacement/flags）
      else if (typeof item.clickfunc === 'string') {
        const regexMatch = item.clickfunc.match(/\/(.*)\/(.*)\/(.*)/);
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
}

/**
 * 测试函数
 */
function testLogseqCase() {
  console.log('Testing Logseq case...');
  
  // 用户提供的失败案例
  const testText = "AI 's [:u.red biggest] a";
  console.log(`Input: ${testText}`);
  
  const result = regexReplaceText(removeFormattingItem, testText);
  console.log(`Output: ${result}`);
  
  // 预期结果
  const expected = "AI 's biggest a";
  console.log(`Expected: ${expected}`);
  
  // 验证结果
  if (result === expected) {
    console.log('✅ Test PASSED');
  } else {
    console.log('❌ Test FAILED');
  }
  
  // 测试其他案例
  console.log('\nTesting other cases...');
  
  const otherCases = [
    "thsi is a **bold text** .",
    "a *italic text* sentance",
    "these sentance are [:mark.red red text] red texts",
    "use highlight feature to change the word, like:[:mark.yellow yellow text]'"
  ];
  
  otherCases.forEach((text, index) => {
    const result = regexReplaceText(removeFormattingItem, text);
    console.log(`Case ${index + 1}: ${text} => ${result}`);
  });
}

// 运行测试
testLogseqCase();