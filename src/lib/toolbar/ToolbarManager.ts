import type { ToolbarManager as IToolbarManager, ActionExecutorFn } from './types.ts';
import type { ToolbarItem, ToolbarGroup } from '../../components/Toolbar/types.ts';
import type { SelectedData } from '../../components/Toolbar/textProcessor.ts';
import { configParser } from './ConfigParser.ts';
import { eventBus } from './EventBus.ts';
import { processSelectedData } from '../../components/Toolbar/textProcessor.ts';

/**
 * 工具栏管理器实现
 */
export class ToolbarManager implements IToolbarManager {
  private isInitialized: boolean = false;
  private modeExecutors: Map<string, ActionExecutorFn> = new Map();
  private clickFuncExecutors: Map<string, ActionExecutorFn> = new Map();
  private language: string = 'zh-CN';

  /**
   * 事件总线
   */
  public eventBus = eventBus;

  /**
   * 初始化
   */
  initialize(config: any): void {
    if (this.isInitialized) {
      console.warn('ToolbarManager already initialized');
      return;
    }

    // 验证并解析配置
    if (configParser.validate(config)) {
      configParser.parse(config);
      this.isInitialized = true;
      console.log('ToolbarManager initialized successfully');
    } else {
      console.error('Invalid toolbar config');
    }
  }

  /**
   * 注册功能（按 funcmode）
   */
  registerAction(id: string, handler: ActionExecutorFn): void {
    this.modeExecutors.set(id, handler);
  }

  /**
   * 注册功能（按 clickfunc）
   */
  registerClickFuncAction(clickFunc: string, handler: ActionExecutorFn): void {
    this.clickFuncExecutors.set(clickFunc, handler);
  }

  /**
   * 执行功能
   */
  async executeAction(item: ToolbarItem, selectedData: SelectedData): Promise<string> {
    try {
      let processedText: string;
      
      // 先检查是否有 clickfunc 执行器
      if (item.clickfunc && this.clickFuncExecutors.has(item.clickfunc)) {
        const executor = this.clickFuncExecutors.get(item.clickfunc)!;
        processedText = await executor(item, selectedData);
      } 
      // 再检查是否有 funcmode 执行器
      else if (this.modeExecutors.has(item.funcmode)) {
        const executor = this.modeExecutors.get(item.funcmode)!;
        processedText = await executor(item, selectedData);
      }
      // 使用默认处理逻辑
      else {
        processedText = await processSelectedData(item, selectedData, this.language);
      }
      
      // 发布文本处理完成事件
      this.eventBus.emit('textProcessed', {
        processedText,
        originalItem: item
      });

      return processedText;
    } catch (error) {
      console.error('Error executing action:', error);
      throw error;
    }
  }

  /**
   * 获取工具栏项目
   */
  getToolbarItems(): (ToolbarItem | ToolbarGroup)[] {
    return configParser.getItems();
  }

  /**
   * 设置语言
   */
  setLanguage(language: string): void {
    this.language = language;
  }

  /**
   * 是否已初始化
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * 重置
   */
  reset(): void {
    this.isInitialized = false;
    this.modeExecutors.clear();
    this.clickFuncExecutors.clear();
    eventBus.clear();
  }
}

// 导出单例实例
export const toolbarManager = new ToolbarManager();
