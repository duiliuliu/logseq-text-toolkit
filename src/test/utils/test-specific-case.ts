// 测试特定案例：a [:u.red few]  ye

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
        console.log(`Pattern: ${pattern}`);
        console.log(`Replacement: ${replacement}`);
        console.log(`Input: ${text}`);
        
        const regex = new RegExp(pattern, flags);
        const result = text.replace(regex, replacement);
        console.log(`Output: ${result}`);
        return result;
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
function testSpecificCase() {
  console.log('Testing specific case...');
  
  // 用户提供的案例
  const testText = "a [:u.red few]  ye";
  console.log(`Input: ${testText}`);
  
  const result = regexReplaceText(removeFormattingItem, testText);
  console.log(`Output: ${result}`);
  
  // 预期结果
  const expected = "a few  ye";
  console.log(`Expected: ${expected}`);
  
  // 验证结果
  if (result === expected) {
    console.log('✅ Test PASSED');
  } else {
    console.log('❌ Test FAILED');
  }
  
  // 测试其他类似案例
  console.log('\nTesting other similar cases...');
  
  const otherCases = [
    "[:u.red test]",
    "a [:mark.red red] text",
    "[:span.blue blue] text"
  ];
  
  otherCases.forEach((text, index) => {
    const result = regexReplaceText(removeFormattingItem, text);
    console.log(`Case ${index + 1}: ${text} => ${result}`);
  });
}

// 运行测试
testSpecificCase();