/**
 * Logseq API 统一接口
 * 根据环境提供一致的Logseq API接口
 */

import * as logseqImpl from './editor.ts';
import * as mockImpl from '../test/mock.ts';
import { LogseqAPI } from '../types/logseq.ts';

// 存储提供的模型
const providedModels: Record<string, any> = {};

// 存储提供的UI
const providedUIs: Record<string, any> = {};

/**
 * 提供模型（mock实现）
 * @param {Record<string, any>} model 模型对象
 */
const provideModelMock = (model: Record<string, any>): void => {
  console.log('Mock provideModel:', model);
  Object.assign(providedModels, model);
  // 同时也将模型挂载到window对象上，方便模板调用
  Object.assign(window, model);
};

/**
 * 提供UI（mock实现）
 * @param {Record<string, any>} config UI配置
 */
const provideUIMock = (config: Record<string, any>): void => {
  console.log('Mock provideUI:', config);
  if (!config.template) {
    // 如果template为空，移除对应的UI
    delete providedUIs[config.key];
    const element = document.getElementById(config.key);
    if (element) {
      element.remove();
    }
    return;
  }

  providedUIs[config.key] = config;
  
  // 在测试模式下，直接在DOM中创建元素
  if (config.path) {
    const container = document.querySelector(config.path) || document.getElementById('root');
    if (container) {
      const existingElement = document.getElementById(config.key);
      if (existingElement) {
        existingElement.remove();
      }
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = config.template;
      const newElement = tempDiv.firstElementChild;
      if (newElement) {
        container.appendChild(newElement);
      }
    }
  }
};

/**
 * 注册UI项（mock实现）
 * @param {string} slot 插槽位置
 * @param {Record<string, any>} config UI配置
 */
const registerUIItemMock = (slot: string, config: Record<string, any>): void => {
  console.log('Mock registerUIItem:', slot, config);
  // 在测试模式下，不做实际注册
};

/**
 * 获取Logseq API实例
 * @returns {LogseqAPI} Logseq API实例
 */
export const getLogseqAPI = (): LogseqAPI => {
  // 检查是否在测试模式下
  const isTestMode = import.meta.env.MODE === 'test';
  
  if (isTestMode) {
    console.log('Using mock Logseq API (test mode)');
    // 从mock.js中获取mock的logseq对象
    const mockLogseq = window.logseq || {
      App: {
        registerCommand: (command: any) => console.log('Mock registerCommand:', command),
        on: (event: string, _callback: (...args: any[]) => void) => console.log('Mock on:', event),
        off: (event: string) => console.log('Mock off:', event),
        getUserConfigs: () => Promise.resolve({
          darkMode: false,
          preferredLanguage: 'zh-CN'
        })
      },
      UI: {
        showMsg: (msg: string, opts: any = {}) => {
          console.log('Mock UI.showMsg:', msg, opts);
          // 创建一个简单的错误提示框
          const notification = document.createElement('div');
          notification.style.position = 'fixed';
          notification.style.top = '20px';
          notification.style.right = '20px';
          notification.style.padding = '12px 16px';
          notification.style.backgroundColor = opts.type === 'error' ? '#fee2e2' : '#fef3c7';
          notification.style.color = opts.type === 'error' ? '#b91c1c' : '#92400e';
          notification.style.borderRadius = '6px';
          notification.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          notification.style.zIndex = '10000';
          notification.style.transition = 'all 0.3s ease';
          notification.textContent = msg;
          
          document.body.appendChild(notification);
          
          // 3秒后自动移除
          setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
              if (document.body.contains(notification)) {
                document.body.removeChild(notification);
              }
            }, 300);
          }, 3000);
        }
      },
      ready: () => Promise.resolve(),
      settings: {},
      updateSettings: (settings: any) => {
        console.log('Mock updateSettings:', settings);
        return Promise.resolve();
      }
    };
    
    return {
      // 编辑器相关API
      Editor: {
        getCurrentBlock: mockLogseq.Editor?.getCurrentBlock || (() => Promise.resolve({ uuid: 'test-block', content: 'Test block content' })),
        updateBlock: mockLogseq.Editor?.updateBlock || ((blockId: string, content: string) => {
          console.log('Mock updateBlock:', blockId, content);
          return Promise.resolve(true);
        }),
        replaceSelectedText: mockLogseq.Editor?.replaceSelectedText || ((text: string) => {
          console.log('Mock replaceSelectedText:', text);
          return Promise.resolve(true);
        })
      },
      // 应用相关API
      App: {
        ...mockLogseq.App,
        registerUIItem: registerUIItemMock
      },
      // UI相关API
      UI: {
        showMsg: mockLogseq.UI.showMsg
      },
      // 其他API
      ready: mockLogseq.ready,
      settings: mockLogseq.settings,
      updateSettings: mockLogseq.updateSettings,
      provideModel: provideModelMock,
      provideUI: provideUIMock
    };
  } else {
    console.log('Using official Logseq API (production mode)');
    // 检查logseq对象是否存在，这是正常的异常逻辑
    if (typeof logseq === 'undefined' || !logseq.Editor) {
      console.warn('Logseq API is not available, falling back to mock implementation');
      // fallback to mock implementation if logseq is not available
      const mockLogseq = {
        App: {
          registerCommand: (command: any) => console.log('Mock registerCommand:', command),
          on: (event: string, _callback: (...args: any[]) => void) => console.log('Mock on:', event),
          off: (event: string) => console.log('Mock off:', event),
          getUserConfigs: () => Promise.resolve({
            darkMode: false,
            preferredLanguage: 'zh-CN'
          }),
          registerUIItem: registerUIItemMock
        },
        ready: () => Promise.resolve(),
        settings: {},
        updateSettings: (settings: any) => {
          console.log('Mock updateSettings:', settings);
          return Promise.resolve();
        },
        provideModel: provideModelMock,
        provideUI: provideUIMock
      };
      
      return {
        // 编辑器相关API
        Editor: {
          getCurrentBlock: mockLogseq.Editor?.getCurrentBlock || (() => Promise.resolve({ uuid: 'test-block', content: 'Test block content' })),
          updateBlock: mockLogseq.Editor?.updateBlock || ((blockId: string, content: string) => {
            console.log('Mock updateBlock:', blockId, content);
            return Promise.resolve(true);
          }),
          replaceSelectedText: mockLogseq.Editor?.replaceSelectedText || ((text: string) => {
            console.log('Mock replaceSelectedText:', text);
            return Promise.resolve(true);
          })
        },
        // 应用相关API
        App: mockLogseq.App,
        // UI相关API
        UI: {
          showMsg: (msg: string, opts: any = {}) => {
            console.log('Mock UI.showMsg:', msg, opts);
          }
        },
        // 其他API
        ready: mockLogseq.ready,
        settings: mockLogseq.settings,
        updateSettings: mockLogseq.updateSettings,
        provideModel: mockLogseq.provideModel,
        provideUI: mockLogseq.provideUI
      };
    }
    
    return {
      // 编辑器相关API
      Editor: {
        getCurrentBlock: logseqImpl.getCurrentBlock,
        updateBlock: logseqImpl.updateBlock,
        replaceSelectedText: logseqImpl.replaceSelectedText
      },
      // 应用相关API
      App: {
        registerCommand: (command: any) => logseq.App.registerCommand(command),
        on: (event: string, callback: (...args: any[]) => void) => logseq.App.on(event, callback),
        off: (event: string) => logseq.App.off(event),
        getUserConfigs: () => logseq.App.getUserConfigs(),
        registerUIItem: (slot: string, config: any) => logseq.App.registerUIItem(slot, config)
      },
      // UI相关API
      UI: {
        showMsg: (msg: string, opts: any = {}) => logseq.UI.showMsg(msg, opts)
      },
      // 其他API
      ready: () => logseq.ready(),
      settings: logseq.settings,
      updateSettings: (settings: any) => logseq.updateSettings(settings),
      provideModel: (model: any) => logseq.provideModel(model),
      provideUI: (config: any) => logseq.provideUI(config)
    };
  }
};

// 导出统一的Logseq API实例
export const logseqAPI = getLogseqAPI();

export default logseqAPI;
