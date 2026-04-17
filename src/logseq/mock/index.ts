// Mock Logseq API
import { LogseqAPI } from '../logseq.ts';
import App from './app.ts';
import Editor from './editor.ts';
import UI from './ui.ts';
import { getSettings, updateSettings, onSettingsChanged } from './settings.ts';

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
    
    // 检查是否指定了path，如果没有指定则使用默认路径
    const targetPath = config.path || 'body';
    
    // 查找目标元素
    let targetElement: HTMLElement | null;
    if (targetPath.startsWith('#')) {
      targetElement = document.querySelector(targetPath);
    } else {
      targetElement = document.querySelector(targetPath);
    }
    
    // 如果找不到目标元素，默认使用body
    if (!targetElement) {
      targetElement = document.body;
    }
    
    // 创建容器元素
    const containerId = config.key || `logseq-ui-${Date.now()}`;
    let container = document.getElementById(containerId);
    
    if (config.template) {
      // 如果有模板，创建或更新容器
      if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.style.display = 'none'; // 默认不显示
        container.style.position = 'fixed';
        container.style.zIndex = '9999';
        targetElement.appendChild(container);
      }
      container.innerHTML = config.template;
    } else {
      // 如果没有模板，移除容器
      if (container) {
        container.remove();
      }
    }
  }
};

// 添加设置变化监听
type SettingsCallback<T = any> = (a: T, b: T) => void;
mockLogseq.onSettingsChanged = <T = any>(cb: SettingsCallback<T>): (() => void) => {
  return onSettingsChanged(cb);
};



// 挂载到全局
globalThis.logseq = mockLogseq;

export default mockLogseq;
