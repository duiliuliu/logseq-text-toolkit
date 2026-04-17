// Mock Logseq API
import { LogseqAPI } from '../logseq.ts';
import App from './app.ts';
import Editor from './editor.ts';
import UI from './ui.ts';
import { getSettings, updateSettings, onSettingsChanged, resetSettings } from './settings.ts';

const mockLogseq: LogseqAPI & {
  onSettingsChanged?: <T = any>(cb: (a: T, b: T) => void) => () => void;
} = {
  ready: () => Promise.resolve(),
  
  // 动态获取设置
  get settings() {
    return getSettings();
  },
  
  // 动态设置设置
  set settings(value) {
    updateSettings(value);
  },
  
  // 更新设置
  updateSettings: (settings: Record<string, any>) => {
    return updateSettings(settings);
  },
  
  // App API
  App,
  
  // Editor API
  Editor,
  
  // UI API
  UI,
  
  // 提供模型
  provideModel: (model: Record<string, any>) => {
    console.log('Provided model:', model);
  },
  
  // 提供UI
  provideUI: (config: any) => {
    console.log('Provided UI:', config);
  }
};

// 添加设置变化监听
type SettingsCallback<T = any> = (a: T, b: T) => void;
mockLogseq.onSettingsChanged = <T = any>(cb: SettingsCallback<T>): (() => void) => {
  return onSettingsChanged(cb);
};

// 导出重置设置的方法
export const resetMockSettings = resetSettings;

// 挂载到全局
globalThis.logseq = mockLogseq;

export default mockLogseq;
