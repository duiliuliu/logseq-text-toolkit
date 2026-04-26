import type { ActionExecutor as IActionExecutor, ActionExecutorFn } from './types.ts';
import type { ToolbarItem } from '../../components/Toolbar/types.ts';
import type { SelectedData } from '../../components/Toolbar/textProcessor.ts';
import { processSelectedData } from '../../components/Toolbar/textProcessor.ts';

/**
 * 功能执行器实现
 */
export class ActionExecutor implements IActionExecutor {
  // 使用 funcmode + clickfunc 组合作为键
  private executors: Map<string, ActionExecutorFn> = new Map();
  private language: string = 'zh-CN';

  constructor(language: string = 'zh-CN') {
    this.language = language;
    this.registerDefaultExecutors();
  }

  /**
   * 执行功能
   */
  async execute(item: ToolbarItem, selectedData: SelectedData): Promise<string> {
    // 生成组合键
    const key = this.generateKey(item.funcmode, item.clickfunc);
    
    // 检查是否有对应的执行器
    if (this.executors.has(key)) {
      const executor = this.executors.get(key)!;
      return await executor(item, selectedData);
    }

    // 使用默认处理逻辑
    return await processSelectedData(item, selectedData, this.language);
  }

  /**
   * 注册执行器（按 funcmode）
   */
  registerExecutor(mode: string, executor: ActionExecutorFn): void {
    // 当只提供 funcmode 时，使用 funcmode 作为主要标识符
    this.executors.set(mode, executor);
  }

  /**
   * 注册执行器（按 funcmode + clickfunc）
   */
  registerClickFuncExecutor(clickFunc: string, executor: ActionExecutorFn): void {
    // 当提供 clickfunc 时，需要同时提供 funcmode
    // 默认使用 'invoke' 作为 funcmode
    const key = this.generateKey('invoke', clickFunc);
    this.executors.set(key, executor);
  }

  /**
   * 注册执行器（完整组合）
   */
  registerCombinedExecutor(funcmode: string, clickfunc: string, executor: ActionExecutorFn): void {
    const key = this.generateKey(funcmode, clickfunc);
    this.executors.set(key, executor);
  }

  /**
   * 设置语言
   */
  setLanguage(language: string): void {
    this.language = language;
  }

  /**
   * 生成组合键
   */
  private generateKey(funcmode: string, clickfunc: any): string {
    if (clickfunc) {
      return `${funcmode}:${String(clickfunc)}`;
    }
    return funcmode;
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
