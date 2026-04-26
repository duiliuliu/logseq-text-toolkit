/**
 * 功能执行器实现
 */

import type { ActionExecutor as IActionExecutor, ActionExecutorFn } from './types.ts';
import type { ToolbarItem } from '../../components/Toolbar/types.ts';
import type { SelectedData } from '../../components/Toolbar/textProcessor.ts';
import { processSelectedData } from '../../components/Toolbar/textProcessor.ts';

/**
 * 功能执行器实现
 */
export class ActionExecutor implements IActionExecutor {
  private modeExecutors: Map<string, ActionExecutorFn> = new Map();
  private clickFuncExecutors: Map<string, ActionExecutorFn> = new Map();
  private language: string = 'zh-CN';

  constructor(language: string = 'zh-CN') {
    this.language = language;
    this.registerDefaultExecutors();
  }

  /**
   * 执行功能
   */
  async execute(item: ToolbarItem, selectedData: SelectedData): Promise<string> {
    // 先检查是否有 clickfunc 执行器
    if (item.clickfunc && this.clickFuncExecutors.has(item.clickfunc)) {
      const executor = this.clickFuncExecutors.get(item.clickfunc)!;
      return await executor(item, selectedData);
    }

    // 再检查是否有 funcmode 执行器
    if (this.modeExecutors.has(item.funcmode)) {
      const executor = this.modeExecutors.get(item.funcmode)!;
      return await executor(item, selectedData);
    }

    // 使用默认处理逻辑
    return await processSelectedData(item, selectedData, this.language);
  }

  /**
   * 注册执行器（按 funcmode）
   */
  registerExecutor(mode: string, executor: ActionExecutorFn): void {
    this.modeExecutors.set(mode, executor);
  }

  /**
   * 注册执行器（按 clickfunc）
   */
  registerClickFuncExecutor(clickFunc: string, executor: ActionExecutorFn): void {
    this.clickFuncExecutors.set(clickFunc, executor);
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
