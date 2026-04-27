/**
 * 功能执行器实现
 */

import type { ActionExecutor as IActionExecutor, ActionExecutorFn } from './types.ts';
import type { ToolbarItem } from '../../components/Toolbar/types.ts';
import type { SelectedData } from '../../components/Toolbar/textProcessor.ts';
import { replaceText, regexReplaceText, updateBlockContent } from '../../lib/textReplace/utils.ts';
import { logseqAPI } from '../../logseq/index.ts';
import { t } from '../../translations/i18n.ts';
import { logger } from '../logger/logger.ts';

/**
 * 功能执行器实现
 */
export class ActionExecutor implements IActionExecutor {
  private modeExecutors: Map<string, ActionExecutorFn> = new Map();
  private language: string = 'zh-CN';

  constructor(language: string = 'zh-CN') {
    this.language = language;
    this.registerDefaultExecutors();
  }

  /**
   * 执行功能
   */
  async execute(item: ToolbarItem, selectedData: SelectedData): Promise<string> {
    // 先检查是否有 invoke 执行器
    if (this.modeExecutors.has(item.invoke)) {
      const executor = this.modeExecutors.get(item.invoke)!;
      return await executor(item, selectedData);
    }

    // 使用默认处理逻辑
    return await this.defaultExecutor(item, selectedData);
  }

  /**
   * 默认执行器
   */
  private async defaultExecutor(item: ToolbarItem, selectedData: SelectedData): Promise<string> {
    const selectedText = selectedData.text;
    if (!selectedText) {
      return selectedText;
    }
    
    let result = selectedText;
    switch (item.invoke) {
      case 'replace':
      case 'regexReplace':
        result = await this.handleReplace(item, selectedData);
        break;
      case 'add':
      case 'invoke':
        result = replaceText(item, selectedText);
        break;
      case 'console':
        break;
    }
    return result;
  }

  /**
   * 处理文本替换
   */
  private async handleReplace(item: ToolbarItem, selectedData: SelectedData): Promise<string> {
    try {
      const selectedText = selectedData.text;
      if (!selectedText) {
        logseqAPI.UI.showMsg(t('toolbar.noSelection', this.language), { type: 'error' });
        return selectedText;
      }
      
      let processedText: string;
      if (item.invoke === 'regexReplace') {
        processedText = regexReplaceText(item, selectedText);
      } else {
        processedText = replaceText(item, selectedText);
      }
      
      const success = await updateBlockContent(selectedData, processedText, this.language);
      
      if (!success) {
        logseqAPI.UI.showMsg(t('toolbar.replaceFailed', this.language), { type: 'error' });
      }
      
      return processedText;
    } catch (error) {
      try {
        logseqAPI.UI.showMsg(`${t('toolbar.replaceFailed', this.language)}: ${error instanceof Error ? error.message : String(error)}`, { type: 'error' });
      } catch (uiError) {
        logger.error('Error showing message:', uiError);
      }
      return selectedData.text;
    }
  }

  /**
   * 注册执行器（按 invoke）
   */
  registerExecutor(mode: string, executor: ActionExecutorFn): void {
    this.modeExecutors.set(mode, executor);
  }



  /**
   * 设置语言
   */
  setLanguage(language: string): void {
    this.language = language;
  }

  /**
   * 注册默认执行器
   */
  private registerDefaultExecutors(): void {
    // 默认执行器直接使用 processSelectedData
    // 这里可以添加特殊处理
  }
}

// 导出单例实例
export const actionExecutor = new ActionExecutor();
