// 直接从 @logseq/libs 导入类型定义
import { BlockEntity, PageEntity, LogseqApp, LogseqEditor, LogseqUI } from '@logseq/libs/dist/LSPlugin';

// 重新导出这些类型，以便其他模块使用
export {
  BlockEntity,
  PageEntity,
  LogseqApp,
  LogseqEditor,
  LogseqUI
};

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
