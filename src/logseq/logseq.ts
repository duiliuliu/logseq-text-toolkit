// Logseq API 类型定义
// 参考：https://github.com/logseq/logseq/blob/d1bbb5ad16384e93fb76d1b6f0f3c98010d9c68c/libs/src/LSPlugin.user.ts#L542

// 基础类型
export type UUID = string;
export type BlockUUID = UUID;
export type PageUUID = UUID;
export type TagName = string;
export type PropertyValue = string | number | boolean | null | undefined;
export type PropertyValueType = 'string' | 'number' | 'boolean' | 'date' | 'url' | 'select' | 'multi-select';

// 块类型
export interface BlockEntity {
  uuid: BlockUUID;
  content: string;
  properties?: Record<string, PropertyValue>;
  format?: string;
  children?: BlockEntity[];
  parent?: BlockUUID;
  page?: PageUUID;
  left?: BlockUUID;
  right?: BlockUUID;
  collapsed?: boolean;
  headingLevel?: number;
  marker?: string;
  priority?: string;
  propertiesSchema?: Record<string, PropertyValueType>;
  created?: number;
  updated?: number;
}

// 页面类型
export interface PageEntity {
  uuid: PageUUID;
  name: string;
  properties?: Record<string, PropertyValue>;
  format?: string;
  journal?: boolean;
  journalDay?: number;
  propertiesSchema?: Record<string, PropertyValueType>;
  created?: number;
  updated?: number;
}

// 编辑器API类型
export interface LogseqEditor {
  getCurrentBlock: () => Promise<BlockEntity | null>;
  updateBlock: (blockId: BlockUUID, content: string) => Promise<boolean>;
  replaceSelectedText: (text: string) => Promise<boolean>;
  getCurrentPage?: () => Promise<PageEntity | null>;
  // 其他编辑器API方法...
}

// 应用API类型
export interface LogseqApp {
  registerCommand: (command: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string) => void;
  getUserConfigs: () => Promise<{
    darkMode: boolean;
    preferredLanguage: string;
    // 其他配置...
  }>;
  registerUIItem: (slot: string, config: any) => void;
  // 其他应用API方法...
}

// UI API类型
export interface LogseqUI {
  showMsg: (msg: string, opts?: {
    type?: 'info' | 'error' | 'warning' | 'success';
    timeout?: number;
  }) => void;
  // 其他UI API方法...
}

// 完整的Logseq API类型
export interface LogseqAPI {
  Editor: LogseqEditor;
  App: LogseqApp;
  UI: LogseqUI;
  ready: () => Promise<void>;
  settings: Record<string, any>;
  updateSettings: (settings: Record<string, any>) => Promise<void>;
  provideModel: (model: Record<string, any>) => void;
  provideUI: (config: any) => void;
}
