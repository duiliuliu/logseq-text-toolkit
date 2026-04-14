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
  }
};

// 注册命令
export const registerCommands = () => {
  Object.keys(commands).forEach((commandId) => {
    try {
      logseq.App.registerCommand({
        id: `text-toolkit:${commandId}`,
        label: commands[commandId].label,
        handler: () => {
          const selectedText = getSelectedText();
          if (selectedText) {
            const result = commands[commandId].execute(selectedText);
            // 这里需要实现替换选中文本的逻辑
            console.log(`执行命令 ${commandId}，结果: ${result}`);
          }
        }
      });
    } catch (error) {
      console.error(`注册命令 ${commandId} 失败:`, error);
    }
  });
};

// 执行命令
export const executeCommand = (commandId, ...args) => {
  if (commands[commandId]) {
    const selectedText = getSelectedText();
    if (selectedText) {
      return commands[commandId].execute(selectedText, ...args);
    }
  }
  return null;
};

export default commands;