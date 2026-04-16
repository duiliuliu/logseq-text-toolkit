/**
 * Logseq API 统一接口
 * 根据环境提供一致的Logseq API接口
 */

// 导入正式的Logseq实现
import * as logseqImpl from './editor.js';

// 导入mock的Logseq实现
import * as mockImpl from '../../test/mock/editor.js';

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
      App: mockLogseq.App,
      // 其他API
      ready: mockLogseq.ready,
      settings: mockLogseq.settings,
      updateSettings: mockLogseq.updateSettings
    };
  } else {
    console.log('Using official Logseq API (production mode)');
    // 检查logseq对象是否存在，这是正常的异常逻辑
    if (typeof logseq === 'undefined' || !logseq.Editor) {
      console.warn('Logseq API is not available, falling back to mock implementation');
      //  fallback to mock implementation if logseq is not available
      const mockLogseq = {
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
        App: mockLogseq.App,
        // 其他API
        ready: mockLogseq.ready,
        settings: mockLogseq.settings,
        updateSettings: mockLogseq.updateSettings
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
        getUserConfigs: () => logseq.App.getUserConfigs()
      },
      // 其他API
      ready: () => logseq.ready(),
      settings: logseq.settings,
      updateSettings: (settings) => logseq.updateSettings(settings)
    };
  }
};

// 导出统一的Logseq API实例
export const logseqAPI = getLogseqAPI();

export default logseqAPI;
