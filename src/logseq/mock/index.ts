// Mock Logseq API
import { LogseqAPI } from '../logseq.ts';
import defaultSettings from '../../config/defaultSettings.ts';

const SETTINGS_KEY = 'text-toolkit-settings';
const settingsChangeHandlers: Array<(newSettings: any, oldSettings: any) => void> = [];

const loadSettings = (): Record<string, any> => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return defaultSettings as unknown as Record<string, any>;
};

const saveSettings = (settings: Record<string, any>): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

const initialSettings = loadSettings();

const mockLogseq: LogseqAPI & {
  onSettingsChanged?: <T = any>(cb: (a: T, b: T) => void) => () => void;
} = {
  ready: () => Promise.resolve(),
  get settings() {
    return initialSettings;
  },
  set settings(value) {
    const oldSettings = { ...initialSettings };
    Object.assign(initialSettings, value);
    saveSettings(initialSettings);
    settingsChangeHandlers.forEach(cb => cb(initialSettings, oldSettings));
  },
  updateSettings: (settings: Record<string, any>) => {
    console.log('Updated settings:', settings);
    const oldSettings = { ...initialSettings };
    Object.assign(initialSettings, settings);
    saveSettings(initialSettings);
    settingsChangeHandlers.forEach(cb => cb(initialSettings, oldSettings));
    return Promise.resolve();
  },
  App: {
    registerCommand: (command: any) => {
      console.log('Registered command:', command);
    },
    on: (event: string, callback: (...args: any[]) => void) => {
      console.log('Registered event listener:', event);
      if (event === 'selectionChange') {
        document.addEventListener('mouseup', () => {
          const selection = window.getSelection();
          if (selection && selection.toString()) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            callback({
              text: selection.toString(),
              rect: {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height
              }
            });
          }
        });
      }
    },
    off: (event: string) => {
      console.log('Unregistered event listener:', event);
    },
    getUserConfigs: () => Promise.resolve({
      darkMode: false,
      preferredLanguage: 'zh-CN'
    }),
    registerUIItem: (slot: string, config: any) => {
      console.log('Registered UI item:', slot, config);
    }
  },
  Editor: {
    getCurrentPage: () => Promise.resolve({
      uuid: 'test-page',
      id: 'test-page',
      name: 'Test Page'
    }),
    getCurrentBlock: () => Promise.resolve({
      uuid: 'test-block',
      content: 'Test block content'
    }),
    updateBlock: (blockId: string, content: string) => {
      console.log('Updated block:', blockId, content);
      return Promise.resolve(true);
    },
    replaceSelectedText: (text: string) => {
      console.log('Replaced selected text:', text);
      return Promise.resolve(true);
    }
  },
  UI: {
    showMsg: (msg: string, opts?: any) => {
      console.log('Show message:', msg, opts);
      // 使用 Toast 组件显示消息
      const type = opts?.type || 'info';
      const timeout = opts?.timeout || 3000;
      if ((window as any).addToast) {
        (window as any).addToast(msg, type, timeout);
      }
    }
  },
  provideModel: (model: Record<string, any>) => {
    console.log('Provided model:', model);
  },
  provideUI: (config: any) => {
    console.log('Provided UI:', config);
  }
};

mockLogseq.onSettingsChanged = <T = any>(cb: (a: T, b: T) => void): (() => void) => {
  console.log('Registered settings change handler');
  settingsChangeHandlers.push(cb);
  return () => {
    const index = settingsChangeHandlers.indexOf(cb);
    if (index !== -1) {
      settingsChangeHandlers.splice(index, 1);
    }
  };
};

window.logseq = mockLogseq;

export default mockLogseq;
