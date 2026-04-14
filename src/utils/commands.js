// src/utils/commands.js
import { getSelectedText } from './state';

// 命令定义
const commands = {
  'bold': {
    label: '加粗',
    execute: (text) => `**${text}**`
  },
  'highlight': {
    label: '高亮',
    execute: (text) => `==${text}==`
  },
  'file-link': {
    label: '文件链接',
    execute: (text) => `[[${text}]]`
  },
  'comment': {
    label: '评论',
    execute: (text, comment) => {
      // 这里需要与注解功能集成
      return text;
    }
  },
  'wrap-cloze': {
    label: 'Wrap with cloze',
    execute: (text) => ` {{cloze ${text}}}`
  },
  'wrap-red-hl': {
    label: 'Wrap with red highlight',
    execute: (text) => `[[#red]]==${text}==`
  },
  'wrap-green-hl': {
    label: 'Wrap with green highlight',
    execute: (text) => `[[#green]]==${text}==`
  },
  'wrap-blue-hl': {
    label: 'Wrap with blue highlight',
    execute: (text) => `[[#blue]]==${text}==`
  },
  'wrap-red-text': {
    label: 'Wrap with red text',
    execute: (text) => `[[$red]]==${text}==`
  },
  'wrap-green-text': {
    label: 'Wrap with green text',
    execute: (text) => `[[$green]]==${text}==`
  },
  'wrap-blue-text': {
    label: 'Wrap with blue text',
    execute: (text) => `[[$blue]]==${text}==`
  },
  'repl-clear': {
    label: 'Remove formatting',
    execute: (text) => {
      // 移除各种格式
      return text.replace(/\[\[(?:#|\$)(?:red|green|blue)\]\]|==([^=]*)==|~~([^~]*)~~|\^\^([^\^]*)\^\^|\*\*([^\*]*)\*\*|\*([^\*]*)\*|_([^_]*)_|\$([^\$]*)\$|`([^`]*)`/g, '$1$2$3$4$5$6$7$8');
    }
  }
};

// 注册命令
export const registerCommands = () => {
  Object.keys(commands).forEach((commandId) => {
    try {
      logseq.App.registerCommand({
        id: `text-toolkit:${commandId}`,
        label: commands[commandId].label,
        handler: async () => {
          const selectedText = getSelectedText();
          if (selectedText) {
            const result = commands[commandId].execute(selectedText);
            // 实现替换选中文本的逻辑
            try {
              await logseq.Editor.replaceSelectedText(result);
              console.log(`执行命令 ${commandId}，结果: ${result}`);
            } catch (error) {
              console.error(`替换选中文本失败:`, error);
            }
          }
        }
      });
    } catch (error) {
      console.error(`注册命令 ${commandId} 失败:`, error);
    }
  });
};

// 执行命令
export const executeCommand = async (commandId, ...args) => {
  if (commands[commandId]) {
    const selectedText = getSelectedText();
    if (selectedText) {
      const result = commands[commandId].execute(selectedText, ...args);
      // 实现替换选中文本的逻辑
      try {
        await logseq.Editor.replaceSelectedText(result);
        return result;
      } catch (error) {
        console.error(`替换选中文本失败:`, error);
        return null;
      }
    }
  }
  return null;
};

export default commands;