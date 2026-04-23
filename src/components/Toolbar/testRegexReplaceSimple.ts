// 直接测试regexReplaceText函数的逻辑，避免依赖浏览器环境

/**
 * 模拟ToolbarItem类型
 */
interface ToolbarItem {
  id: string;
  funcmode: string;
  clickfunc: {
    regex: string;
    replacement: string;
  };
}

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
 * 测试正则表达式是否能够正确清除defaultSettings.json中的数据格式
 */
function testRegexReplace() {
  console.log('Testing regexReplaceText function...');
  
  // 测试用例
  const testCases = [
    {
      name: 'Bold text',
      input: '**bold text**',
      expected: 'bold text'
    },
    {
      name: 'Italic text',
      input: '*italic text*',
      expected: 'italic text'
    },
    {
      name: 'Strikethrough text',
      input: '~~strikethrough text~~',
      expected: 'strikethrough text'
    },
    {
      name: 'Mark red',
      input: '[:mark.red red text]',
      expected: 'red text'
    },
    {
      name: 'Mark blue',
      input: '[:mark.blue blue text]',
      expected: 'blue text'
    },
    {
      name: 'Mark yellow',
      input: '[:mark.yellow yellow text]',
      expected: 'yellow text'
    },
    {
      name: 'Mark green',
      input: '[:mark.green green text]',
      expected: 'green text'
    },
    {
      name: 'Mark purple',
      input: '[:mark.purple purple text]',
      expected: 'purple text'
    },
    {
      name: 'Span red',
      input: '[:span.red red text]',
      expected: 'red text'
    },
    {
      name: 'Span blue',
      input: '[:span.blue blue text]',
      expected: 'blue text'
    },
    {
      name: 'Span yellow',
      input: '[:span.yellow yellow text]',
      expected: 'yellow text'
    },
    {
      name: 'Span green',
      input: '[:span.green green text]',
      expected: 'green text'
    },
    {
      name: 'Span purple',
      input: '[:span.purple purple text]',
      expected: 'purple text'
    },
    {
      name: 'Underline red',
      input: '[:u.red red text]',
      expected: 'red text'
    },
    {
      name: 'Underline blue',
      input: '[:u.blue blue text]',
      expected: 'blue text'
    },
    {
      name: 'Underline yellow',
      input: '[:u.yellow yellow text]',
      expected: 'yellow text'
    },
    {
      name: 'Underline green',
      input: '[:u.green green text]',
      expected: 'green text'
    },
    {
      name: 'Underline purple',
      input: '[:u.purple purple text]',
      expected: 'purple text'
    },
    {
      name: 'Inline code',
      input: '`code`',
      expected: 'code'
    },
    {
      name: 'Multiple formats',
      input: '**bold** and *italic* and [:mark.red red]',
      expected: 'bold and italic and red'
    }
  ];
  
  // 模拟remove-formatting工具项
  const removeFormattingItem = {
    id: 'remove-formatting',
    funcmode: 'regexReplace',
    clickfunc: {
      regex: '\[\[:(mark|span|u)\.(red|blue|yellow|green|purple)\s+([^\]]*)\]\]|==([^=]*)==|~~([^~]*)~~|\^\^([^\^]*)\^\^|\*\*([^\*]*)\*\*|\*([^\*]*)\*|`([^`]*)`',
      replacement: '$3$4$5$6$7$8$9'
    }
  } as ToolbarItem;
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(testCase => {
    const result = regexReplaceText(removeFormattingItem, testCase.input);
    if (result === testCase.expected) {
      console.log(`✅ ${testCase.name}: PASSED`);
      passed++;
    } else {
      console.log(`❌ ${testCase.name}: FAILED`);
      console.log(`   Input: ${testCase.input}`);
      console.log(`   Expected: ${testCase.expected}`);
      console.log(`   Got: ${result}`);
      failed++;
    }
  });
  
  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// 运行测试
const result = testRegexReplace();

// 输出测试结果
console.log(`\nFinal Test Result: ${result ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
