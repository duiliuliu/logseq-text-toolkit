import type { ToolbarManager as IToolbarManager, ActionExecutorFn } from './types.ts';
import type { ToolbarItem, ToolbarGroup } from '../../components/Toolbar/types.ts';
import type { SelectedData } from '../../components/Toolbar/textProcessor.ts';
import { configParser } from './ConfigParser.ts';
import { eventBus } from './EventBus.ts';
import { actionExecutor } from './ActionExecutor.ts';
import { registerExecutors } from './ExecutorRegistry.ts';

/**
 * 工具栏管理器实现
 */
export class ToolbarManager implements IToolbarManager {
  private isInitialized: boolean = false;

  /**
   * 事件总线
   */
  public eventBus = eventBus;

  /**
   * 初始化
   */
  initialize(config: any): void {
    if (this.isInitialized) {
      return;
    }

    // 注册执行器
    registerExecutors();

    // 验证并解析配置
    if (configParser.validate(config)) {
      configParser.parse(config);
      this.isInitialized = true;
    }
  }

  /**
   * 注册功能（按 invoke）
   */
  registerAction(id: string, handler: ActionExecutorFn): void {
    actionExecutor.registerExecutor(id, handler);
  }

  /**
   * 注册功能（按 invokeParams）
   */
  registerClickFuncAction(clickFunc: string, handler: ActionExecutorFn): void {
    actionExecutor.registerClickFuncExecutor(clickFunc, handler);
  }

  /**
   * 执行功能
   */
  async executeAction(item: ToolbarItem, selectedData: SelectedData): Promise<string> {
    try {
      // 发布项目点击事件
      this.eventBus.emit('ltt-itemClick', {
        item,
        selectedData
      });

      // 检查是否是 invoke 类型的功能，如果是，则通过事件总线触发
      if (item.invoke === 'invoke' && item.invokeParams) {
        switch (item.invokeParams) {
          case 'inlineComment':
          case 'comment':
            this.eventBus.emit('ltt-invoke:comment', { selectedData });
            return selectedData.text;
          default:
            return selectedData.text;
        }
      }

      // 使用默认处理逻辑
      const processedText = await actionExecutor.execute(item, selectedData);
      
      // 发布文本处理完成事件
      this.eventBus.emit('ltt-textProcessed', {
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
    actionExecutor.setLanguage(language);
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
    eventBus.clear();
  }
}

// 导出单例实例
export const toolbarManager = new ToolbarManager();
