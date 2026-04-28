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
    flags?: string;
  } | string;
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
    },
    // 用户提供的测试用例
    {
      name: 'User test case 1',
      input: 'thsi is a **bold text** .',
      expected: 'thsi is a bold text .'
    },
    {
      name: 'User test case 2',
      input: 'a *italic text* sentance',
      expected: 'a italic text sentance'
    },
    {
      name: 'User test case 3',
      input: 'these sentance are [:mark.red red text] red texts',
      expected: 'these sentance are red text red texts'
    },
    {
      name: 'User test case 4',
      input: 'use highlight feature to change the word, like:[:mark.yellow yellow text]\'',
      expected: 'use highlight feature to change the word, like:yellow text\''
    },
    {
      name: 'User test case 5 (failed case)',
      input: 'AI \'s [:u.red biggest] a',
      expected: 'AI \'s biggest a'
    },
    // 复杂测试用例
    {
      name: 'Complex case 1: Nested formats',
      input: '**bold and *italic* text**',
      expected: 'bold and *italic* text'
    },
    {
      name: 'Complex case 2: Multiple formats in sequence',
      input: '**bold** *italic* ~~strikethrough~~ `code`',
      expected: 'bold italic strikethrough code'
    },
    {
      name: 'Complex case 3: Format with punctuation',
      input: '**bold!** *italic?* ~~strikethrough.~~',
      expected: 'bold! italic? strikethrough.'
    },
    {
      name: 'Complex case 4: Mark with special characters',
      input: '[:mark.red red text with !@#$%^&*()]',
      expected: 'red text with !@#$%^&*()'
    },
    {
      name: 'Complex case 5: Mixed mark types',
      input: '[:mark.red red] [:span.blue blue] [:u.green green]',
      expected: 'red blue green'
    },
    {
      name: 'Inline comment format',
      input: '[:span.inline-comment {:data-comment "评论"} "文字"]',
      expected: '文字'
    },
    {
      name: 'Inline comment with special characters',
      input: '[:span.inline-comment {:data-comment "test comment"} "text with special chars !@#$"]',
      expected: 'text with special chars !@#$'
    },
    {
      name: 'Mixed formats with inline comment',
      input: '**bold** and [:span.inline-comment {:data-comment "note"} "commented text"]',
      expected: 'bold and commented text'
    }
  ];
  
  // 模拟remove-formatting工具项
  const removeFormattingItem = {
    id: 'remove-formatting',
    funcmode: 'regexReplace',
    clickfunc: {
      regex: '\\[:span\\.inline-comment\\s*\\{[^}]*\\}\\s*"([^"]*)"\\]|\\[:(?:mark|span|u)\\.(?:red|blue|yellow|green|purple)\\s+([^\\]]*)\\]|==([^=]*)==|~~([^~]*)~~|\\*\\*([^\\*]*)\\*\\*|\\*([^\\*]*)\\*|`([^`]*)`',
      replacement: '$1$2$3$4$5$6$7'
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
