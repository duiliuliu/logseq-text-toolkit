import type { ToolbarManager as IToolbarManager, ActionExecutorFn } from './types.ts';
import type { ToolbarItem, ToolbarGroup } from '../../components/Toolbar/types.ts';
import type { SelectedData } from '../../components/Toolbar/textProcessor.ts';
import { configParser } from './ConfigParser.ts';
import { eventBus } from './EventBus.ts';
import { actionExecutor } from './ActionExecutor.ts';

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
   * 注册功能
   */
  registerAction(id: string, handler: ActionExecutorFn): void {
    actionExecutor.registerExecutor(id, handler);
  }

  /**
   * 执行功能
   */
  async executeAction(item: ToolbarItem, selectedData: SelectedData): Promise<string> {
    try {
      const processedText = await actionExecutor.execute(item, selectedData);
      
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
