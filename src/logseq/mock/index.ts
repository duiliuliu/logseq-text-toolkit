// Mock Logseq API
import App from './app.ts';
import Editor, { findElementByBlockId } from './editor.ts';
import UI from './ui.ts';
import { getSettings, updateSettings, onSettingsChanged } from './settings.ts';
import { getDocument } from '../utils.ts';
import type { ILSPluginUser } from '@logseq/libs/dist/LSPlugin.user';

// 简单的 EventEmitter 实现
class EventEmitter {
  private events: Map<string, Array<(...args: any[]) => void>> = new Map();

  on(event: string, listener: (...args: any[]) => void) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)?.push(listener);
    return this;
  }

  off(event: string, listener?: (...args: any[]) => void) {
    if (!this.events.has(event)) return this;
    if (!listener) {
      this.events.delete(event);
    } else {
      const listeners = this.events.get(event);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    }
    return this;
  }

  emit(event: string, ...args: any[]) {
    if (!this.events.has(event)) return false;
    const listeners = this.events.get(event);
    listeners?.forEach(listener => listener(...args));
    return true;
  }
}

// 模拟 baseInfo
const baseInfo = {
  id: 'logseq-text-toolkit',
  mode: 'iframe' as const,
  settings: {
    disabled: false
  },
  effect: true,
  iir: false,
  lsr: ''
};

const mockLogseq = Object.assign(new EventEmitter(), {
  // 基本属性
  connected: true,
  baseInfo,
  effect: true,
  logger: console,
  get settings() {
    const settings = getSettings();
    if (!('disabled' in settings)) {
      (settings as any).disabled = false;
    }
    return settings;
  },
  set settings(value) {
    updateSettings(value);
  },
  version: '0.2.12',
  isMainUIVisible: false,
  caller: {},

  // ready 方法
  ready: (modelOrCallback?: any, callback?: any) => {
    const promise = Promise.resolve();
    if (typeof modelOrCallback === 'function') {
      promise.then(modelOrCallback);
    } else if (typeof callback === 'function') {
      promise.then(callback);
      if (modelOrCallback) {
        mockLogseq.provideModel(modelOrCallback);
      }
    } else if (modelOrCallback) {
      mockLogseq.provideModel(modelOrCallback);
    }
    return promise;
  },

  // beforeunload 方法
  beforeunload: (callback: () => Promise<void>) => {
    console.log('beforeunload callback registered');
    window.addEventListener('beforeunload', async (e) => {
      await callback();
    });
  },

  // provideModel 方法
  provideModel: (model: Record<string, any>) => {
    console.log('provideModel called with model:', model);
    Object.assign(globalThis, model);
    Object.assign(mockLogseq, model);
    return mockLogseq;
  },

  // provideTheme 方法
  provideTheme: (theme: any) => {
    console.log('provideTheme called:', theme);
    return mockLogseq;
  },

  // provideStyle 方法
  provideStyle: (style: any) => {
    console.log('provideStyle called:', style);
    
    // 获取文档对象
    const doc = getDocument();
    
    // 创建style元素
    const styleElement = doc.createElement('style');
    styleElement.type = 'text/css';
    
    // 设置style内容
    if (typeof style === 'string') {
      styleElement.textContent = style;
    } else if (typeof style === 'object' && style.content) {
      styleElement.textContent = style.content;
    }
    
    // 将style元素添加到head中
    const head = doc.head || doc.getElementsByTagName('head')[0];
    if (head) {
      head.appendChild(styleElement);
      console.log('Style applied to document head');
    }
    
    return mockLogseq;
  },

  // provideUI 方法
  provideUI: (config: any) => {
    console.log('Provided UI:', config);

    const targetPath = config.path || 'body';
    let targetElement: HTMLElement | null;
    const doc = getDocument();
    try {
      targetElement = doc.querySelector(targetPath);
      console.log('Found target element:', targetElement);
    } catch (error) {
      console.error('Error finding target element:', error);
      targetElement = null;
    }

    if (!targetElement) {
      console.warn(`Target element '${targetPath}' not found, using body instead`);
      targetElement = doc.body;
    }

    if (!config.key) {
      console.warn('No key provided for provideUI, generating random key');
      config.key = `logseq-ui-${Date.now()}`;
    }

    // 支持 slot 渲染
    if (config.slot) {
      let slotElement = doc.getElementById(config.key);
      if (!slotElement) {
        slotElement = doc.createElement('div');
        slotElement.id = config.key;
        slotElement.className = `logseq-macro-slot ${config.slot}`;
        targetElement.appendChild(slotElement);
        console.log('Created slot element:', config.key);
      }
      if (config.template) {
        slotElement.innerHTML = config.template;
        console.log('Updated slot template');
      }
      return mockLogseq;
    }

    // 默认容器渲染
    const containerId = config.key;
    let container = doc.getElementById(containerId);

    if (config.template) {
      if (!container) {
        container = doc.createElement('div');
        container.id = containerId;
        container.style.position = 'fixed';
        container.style.zIndex = '9999';
        targetElement.appendChild(container);
        console.log('Created container:', container);
      }
      container.innerHTML = config.template;
      console.log('Updated container template');
    } else {
      if (container) {
        container.remove();
        console.log('Removed container:', containerId);
      }
    }

    return mockLogseq;
  },

  // useSettingsSchema 方法
  useSettingsSchema: (schemas: any[]) => {
    console.log('useSettingsSchema called:', schemas);
    return mockLogseq;
  },

  // updateSettings 方法
  updateSettings: (attrs: Record<string, any>) => {
    console.log('updateSettings called:', attrs);
    updateSettings(attrs);
  },

  // onSettingsChanged 方法
  onSettingsChanged: <T = any>(cb: (a: T, b: T) => void) => {
    return onSettingsChanged(cb);
  },

  // showSettingsUI 方法
  showSettingsUI: () => {
    console.log('showSettingsUI called');
  },

  // hideSettingsUI 方法
  hideSettingsUI: () => {
    console.log('hideSettingsUI called');
  },

  // setMainUIAttrs 方法
  setMainUIAttrs: (attrs: any) => {
    console.log('setMainUIAttrs called:', attrs);
  },

  // setMainUIInlineStyle 方法
  setMainUIInlineStyle: (style: any) => {
    console.log('setMainUIInlineStyle called:', style);
  },

  // showMainUI 方法
  showMainUI: (opts?: any) => {
    console.log('showMainUI called:', opts);
    mockLogseq.isMainUIVisible = true;
  },

  // hideMainUI 方法
  hideMainUI: (opts?: any) => {
    console.log('hideMainUI called:', opts);
    mockLogseq.isMainUIVisible = false;
  },

  // toggleMainUI 方法
  toggleMainUI: () => {
    console.log('toggleMainUI called');
    mockLogseq.isMainUIVisible = !mockLogseq.isMainUIVisible;
  },

  // resolveResourceFullUrl 方法
  resolveResourceFullUrl: (filePath: string) => {
    console.log('resolveResourceFullUrl called:', filePath);
    return filePath;
  },

  // 各个 API 模块
  App,
  Editor,
  UI,

  // 其他模块（简单实现）
  DB: {
    q: () => Promise.resolve([]),
    customQuery: () => Promise.resolve([]),
    datascriptQuery: async (query: string, ...inputs: any[]) => {
      console.log('Mock DB datascriptQuery called:', query, inputs);
      
      try {
        // 解析 parentBlockId（检查 inputs 或者从查询中提取）
        let parentBlockId: string | null = null;
        
        // 首先检查 inputs
        if (inputs && inputs.length > 0) {
          const firstInput = inputs[0];
          if (typeof firstInput === 'string' && firstInput.startsWith('#uuid')) {
            parentBlockId = firstInput.replace(/#uuid\s+"([^"]+)"/, '$1');
          }
        }
        
        // 如果 inputs 没有找到，从查询中提取
        if (!parentBlockId) {
          const uuidMatch = query.match(/#uuid\s+"([^"]+)"/);
          if (uuidMatch) {
            parentBlockId = uuidMatch[1];
          }
        }
        
        // 如果还是没有找到，尝试从查询中提取不带 #uuid 格式的块 ID
        if (!parentBlockId) {
          const blockIdMatch = query.match(/["']([^"']+task-parent[^"']+)["']/);
          if (blockIdMatch) {
            parentBlockId = blockIdMatch[1];
          }
        }
        
        if (!parentBlockId) {
          return Promise.resolve([]);
        }
        
        // 移除可能的 # 前缀
        const cleanBlockId = parentBlockId.startsWith('#') ? parentBlockId.slice(1) : parentBlockId;
        
        // 分析查询，确定嵌套级别和是否只查询叶子节点
        let maxDepth = 1;
        let onlyLeaves = false;
        
        // 检查是否有 or-join，判断嵌套级别
        if (query.includes('or-join')) {
          // 计算嵌套级别：看有多少个 m1, m2, m3 变量
          const m2Match = query.match(/m2/);
          const m3Match = query.match(/m3/);
          const m4Match = query.match(/m4/);
          
          if (m4Match) {
            maxDepth = 5; // 支持 5 层
          } else if (m3Match) {
            maxDepth = 3;
          } else if (m2Match) {
            maxDepth = 2;
          } else {
            maxDepth = 2;
          }
        }
        
        // 检查是否有叶子节点过滤
        if (query.includes('not')) {
          onlyLeaves = true;
        }
        
        // 使用 getAllNestedChildren 获取嵌套子块
        const children = await Editor.getAllNestedChildren(cleanBlockId, maxDepth);
        
        if (!children || !Array.isArray(children)) {
          return [];
        }
        
        // 如果只需要叶子节点，进行过滤
        let filteredBlocks = children;
        if (onlyLeaves) {
          const doc = getDocument();
          
          filteredBlocks = children.filter(block => {
            // 检查这个块是否有子节点
            const element = findElementByBlockId(block.uuid, doc);
            if (!element) {
              return true;
            }
            
            // 检查是否有子块
            const hasChildren = Array.from(element.children).some(child => 
              child.classList.contains('block') || child.hasAttribute('data-block-id')
            );
            
            return !hasChildren;
          });
        }
        
        // 为叶子节点过滤补充 parent 信息
        // 为每个块添加 parent 引用（简单处理）
        const blocksWithParent = filteredBlocks.map(block => {
          // 模拟 parent 属性
          return {
            ...block,
            // 这里我们不需要真正的 parent，因为 leaf 过滤已经完成
          };
        });
        
        // V2 查询格式：返回 [[块对象], [块对象], ...]
        const results = blocksWithParent.map(child => [child]);
        return results;
      } catch (error) {
        console.error('[Mock DB] datascriptQuery error:', error);
        return [];
      }
    },
    onChanged: () => () => {}
  },
  Git: {
    execCommand: () => Promise.resolve({ stdout: '', stderr: '', exitCode: 0 })
  },
  Utils: {
    toJs: (obj: {}) => Promise.resolve(obj)
  },
  Assets: {
    listFilesOfCurrentGraph: () => Promise.resolve([])
  },
  Request: {},
  FileStorage: {},
  Experiments: {}
} as any);

// 挂载到全局
globalThis.logseq = mockLogseq;

export default mockLogseq;
