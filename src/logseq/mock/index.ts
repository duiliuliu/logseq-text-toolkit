// Mock Logseq API
import { LogseqAPI } from '../logseq.ts';
import App from './app.ts';
import Editor from './editor.ts';
import UI from './ui.ts';
import { getSettings, updateSettings, onSettingsChanged } from './settings.ts';
import { getDocument } from '../utils.ts';

const mockLogseq: LogseqAPI & {
  onSettingsChanged?: <T = any>(cb: (a: T, b: T) => void) => () => void;
} = {
  ready: (fn?: () => void) => {
    const promise = Promise.resolve();
    if (typeof fn === 'function') {
      promise.then(fn);
    }
    return promise;
  },
  
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
    console.log('provideModel called with model:', model);
    console.log('model keys:', Object.keys(model));
    console.log('model.settingToggle:', typeof model.settingToggle);
    
    // 将模型方法暴露到全局，以便元素通过 data-on-click 调用
    Object.assign(globalThis, model);
    
    // 直接在 globalThis 上设置函数，确保能被访问到
    if (model.settingToggle) {
      (globalThis as any).settingToggle = model.settingToggle;
      console.log('Directly set settingToggle on globalThis');
    }
    
    // 同时将模型方法添加到 mockLogseq 本身，符合官方 API 规范
    Object.assign(mockLogseq, model);
    return mockLogseq;
  },
  
  // 提供UI
  provideUI: (config: any) => {
    console.log('Provided UI:', config);
    
    // 检查是否指定了path，如果没有指定则使用默认路径
    const targetPath = config.path || 'body';
    
    // 查找目标元素
    let targetElement: HTMLElement | null;
    const doc = getDocument();
    try {
      targetElement = doc.querySelector(targetPath);
      console.log('Found target element:', targetElement);
    } catch (error) {
      console.error('Error finding target element:', error);
      targetElement = null;
    }
    
    // 如果找不到目标元素，默认使用body
    if (!targetElement) {
      console.warn(`Target element '${targetPath}' not found, using body instead`);
      targetElement = doc.body;
    }
    
    // 确保config.key存在
    if (!config.key) {
      console.warn('No key provided for provideUI, generating random key');
      config.key = `logseq-ui-${Date.now()}`;
    }
    
    // 创建容器元素
    const containerId = config.key;
    let container = doc.getElementById(containerId);
    
    if (config.template) {
      // 如果有模板，创建或更新容器
      if (!container) {
        container = doc.createElement('div');
        container.id = containerId;
        container.style.position = 'fixed';
        container.style.zIndex = '9999';
        // 移除默认的display:none，让SelectToolbar能够正常显示
        targetElement.appendChild(container);
        console.log('Created container:', container);
      }
      container.innerHTML = config.template;
      console.log('Updated container template');
    } else {
      // 如果没有模板，移除容器
      if (container) {
        container.remove();
        console.log('Removed container:', containerId);
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
