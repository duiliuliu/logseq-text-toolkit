/**
 * Logseq API 统一接口
 * 根据环境提供一致的Logseq API接口
 */

// 导入正式的Logseq实现
import * as logseqImpl from './editor.js';

// 导入mock的Logseq实现
import * as mockImpl from '../../test/mock/editor.js';

// 存储提供的模型
const providedModels = {};

// 存储提供的UI
const providedUIs = {};

/**
 * 提供模型（mock实现）
 * @param {Object} model 模型对象
 */
const provideModelMock = (model) => {
  console.log('Mock provideModel:', model);
  Object.assign(providedModels, model);
  // 同时也将模型挂载到window对象上，方便模板调用
  Object.assign(window, model);
};

/**
 * 提供UI（mock实现）
 * @param {Object} config UI配置
 */
const provideUIMock = (config) => {
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
 * @param {Object} config UI配置
 */
const registerUIItemMock = (slot, config) => {
  console.log('Mock registerUIItem:', slot, config);
  // 在测试模式下，不做实际注册
};

/**
 * 获取Logseq API实例
 * @returns {Object} Logseq API实例
 */
export const getLogseqAPI = () => {
  // 检查是否在测试模式下
  const isTestMode = import.meta.env.MODE === 'test';
  
  if (isTestMode) {
    console.log('Using mock Logseq API (test mode)');
    // 从mock.js中获取mock的logseq对象
    const mockLogseq = window.logseq || {
      App: {
        registerCommand: (command) => console.log('Mock registerCommand:', command),
        on: (event, callback) => console.log('Mock on:', event),
        off: (event) => console.log('Mock off:', event),
        getUserConfigs: () => Promise.resolve({
          darkMode: false,
          preferredLanguage: 'zh-CN'
        })
      },
      ready: () => Promise.resolve(),
      settings: {},
      updateSettings: (settings) => {
        console.log('Mock updateSettings:', settings);
        return Promise.resolve();
      }
    };
    
    return {
      // 编辑器相关API
      Editor: {
        getCurrentBlock: mockImpl.getCurrentBlock,
        updateBlock: mockImpl.updateBlock,
        replaceSelectedText: mockImpl.replaceSelectedText
      },
      // 应用相关API
      App: {
        ...mockLogseq.App,
        registerUIItem: registerUIItemMock
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
          registerCommand: (command) => console.log('Mock registerCommand:', command),
          on: (event, callback) => console.log('Mock on:', event),
          off: (event) => console.log('Mock off:', event),
          getUserConfigs: () => Promise.resolve({
            darkMode: false,
            preferredLanguage: 'zh-CN'
          }),
          registerUIItem: registerUIItemMock
        },
        ready: () => Promise.resolve(),
        settings: {},
        updateSettings: (settings) => {
          console.log('Mock updateSettings:', settings);
          return Promise.resolve();
        },
        provideModel: provideModelMock,
        provideUI: provideUIMock
      };
      
      return {
        // 编辑器相关API
        Editor: {
          getCurrentBlock: mockImpl.getCurrentBlock,
          updateBlock: mockImpl.updateBlock,
          replaceSelectedText: mockImpl.replaceSelectedText
        },
        // 应用相关API
        App: mockLogseq.App,
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
        registerCommand: (command) => logseq.App.registerCommand(command),
        on: (event, callback) => logseq.App.on(event, callback),
        off: (event) => logseq.App.off(event),
        getUserConfigs: () => logseq.App.getUserConfigs(),
        registerUIItem: (slot, config) => logseq.App.registerUIItem(slot, config)
      },
      // 其他API
      ready: () => logseq.ready(),
      settings: logseq.settings,
      updateSettings: (settings) => logseq.updateSettings(settings),
      provideModel: (model) => logseq.provideModel(model),
      provideUI: (config) => logseq.provideUI(config)
    };
  }
};

// 导出统一的Logseq API实例
export const logseqAPI = getLogseqAPI();

export default logseqAPI;
