import type { ToolbarItem, ToolbarGroup } from '../../components/Toolbar/types.ts';
import type { SelectedData } from '../../components/Toolbar/textProcessor.ts';

// 事件类型定义
export type EventType = 
  | 'selectionChange'
  | 'itemClick'
  | 'textProcessed'
  | 'showToolbar'
  | 'hideToolbar';

// 事件数据类型
export interface EventData {
  [key: string]: any;
}

// 选择变化事件数据
export interface SelectionChangeEvent extends EventData {
  selectedData: SelectedData;
}

// 工具栏项目点击事件数据
export interface ItemClickEvent extends EventData {
  item: ToolbarItem;
  selectedData: SelectedData;
}

// 文本处理完成事件数据
export interface TextProcessedEvent extends EventData {
  processedText: string;
  originalItem: ToolbarItem;
}

// 功能执行器类型
export type ActionExecutorFn = (item: ToolbarItem, selectedData: SelectedData) => Promise<string>;

// 配置解析器接口
export interface ConfigParser {
  parse(config: any): (ToolbarItem | ToolbarGroup)[];
  validate(config: any): boolean;
  getItem(id: string): ToolbarItem | ToolbarGroup | undefined;
  getItems(): (ToolbarItem | ToolbarGroup)[];
}

// 事件总线接口
export interface EventBus {
  on<T extends EventData>(event: EventType, handler: (data: T) => void): void;
  emit<T extends EventData>(event: EventType, data: T): void;
  off<T extends EventData>(event: EventType, handler: (data: T) => void): void;
  clear(): void;
}

// 工具栏管理器接口
export interface ToolbarManager {
  initialize(config: any): void;
  registerAction(id: string, handler: ActionExecutorFn): void;
  registerClickFuncAction(clickFunc: string, handler: ActionExecutorFn): void;
  executeAction(item: ToolbarItem, selectedData: SelectedData): Promise<string>;
  getToolbarItems(): (ToolbarItem | ToolbarGroup)[];
  isReady(): boolean;
  setLanguage(language: string): void;
  reset(): void;
  eventBus: EventBus;
}
