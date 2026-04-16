// src/utils/commands.ts
import { getSelectedText } from './state.js';

interface Command {
  label: string;
  execute: (...args: any[]) => string;
}

interface Commands {
  [key: string]: Command;
}

// 命令定义
const commands: Commands = {
  'bold': {
    label: '加粗',
    execute: (text: string) => `**${text}**`
  },
  'highlight': {
    label: '高亮',
    execute: (text: string) => `==${text}==`
  },
  'file-link': {
    label: '文件链接',
    execute: (text: string) => `[[${text}]]`
  },
  'comment': {
    label: '评论',
    execute: (text: string, _comment?: string) => {
      // 这里需要与注解功能集成
      return text;
    }
  }
};

// 注册命令
export const registerCommands = (): void => {
  Object.keys(commands).forEach((commandId) => {
    try {
      if (typeof logseq !== 'undefined' && logseq.App && logseq.App.registerCommand) {
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
      }
    } catch (error) {
      console.error(`注册命令 ${commandId} 失败:`, error);
    }
  });
};

// 执行命令
export const executeCommand = (commandId: string, ...args: any[]): string | null => {
  if (commands[commandId]) {
    const selectedText = getSelectedText();
    if (selectedText) {
      return commands[commandId].execute(selectedText, ...args);
    }
  }
  return null;
};

export default commands;
