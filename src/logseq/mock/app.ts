import { getDocument } from '../utils.ts';

const eventListeners: Map<string, Array<(...args: any[]) => void>> = new Map();

// Mock logger
const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
};

const App: any = {
  registerCommand: (command: any) => {
    console.log('Registered command:', command);
  },
  
  on: (event: string, callback: (...args: any[]) => void) => {
    console.log('Registered event listener:', event);
    
    if (!eventListeners.has(event)) {
      eventListeners.set(event, []);
    }
    eventListeners.get(event)?.push(callback);
    
    if (event === 'selectionChange') {
      const doc = getDocument();
      doc.addEventListener('mouseup', () => {
        const selection = doc.getSelection();
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

    return () => {
      App.off(event, callback);
    };
  },
  
  off: (event: string, callback?: (...args: any[]) => void) => {
    console.log('Unregistered event listener:', event);
    
    if (callback && eventListeners.has(event)) {
      const listeners = eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    } else {
      eventListeners.delete(event);
    }
  },
  
  getUserConfigs: () => {
    console.log('Get user configs');
    return Promise.resolve({
      preferredThemeMode: 'light',
      preferredFormat: 'markdown',
      preferredDateFormat: 'yyyy-MM-dd',
      preferredStartOfWeek: '1',
      preferredLanguage: 'zh-CN',
      preferredWorkflow: 'linear',
      currentGraph: 'test-graph',
      showBracket: true,
      enabledFlashcards: false,
      enabledJournals: true
    });
  },
  
  getAppInfo: () => {
    console.log('Get app info');
    return Promise.resolve({
      preferredLanguage: 'zh-CN',
      version: '0.10.0'
    });
  },
  
  registerUIItem: (slot: string, config: any) => {
    console.log('Registered UI item:', slot, config);
    
    const tryAddUIItem = () => {
      const doc = getDocument();
      const toolbarElement = doc.getElementById('toolbar');
      if (toolbarElement) {
        const existingElement = doc.getElementById(config.key);
        if (existingElement) {
          existingElement.remove();
        }
        
        const element = doc.createElement('div');
        element.id = config.key;
        element.innerHTML = config.template;
        toolbarElement.appendChild(element);
        console.log('Added UI item to toolbar:', config.key);
        
        const clickableElements = element.querySelectorAll('[data-on-click]');
        clickableElements.forEach(clickable => {
          clickable.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const functionName = clickable.getAttribute('data-on-click');
            if (functionName && typeof (globalThis as any)[functionName] === 'function') {
              console.log('Calling function:', functionName);
              (globalThis as any)[functionName]();
            } else {
              console.warn('Function not found:', functionName);
            }
          });
        });
        
        return true;
      }
      return false;
    };
    
    if (!tryAddUIItem()) {
      const observer = new MutationObserver((_, obs) => {
        if (tryAddUIItem()) {
          obs.disconnect();
        }
      });
      
      const doc = getDocument();
      observer.observe(doc.body, {
        childList: true,
        subtree: true
      });
      
      setTimeout(() => {
        observer.disconnect();
        console.warn('Timeout waiting for toolbar element, UI item not added:', config.key);
      }, 5000);
    }
  },

  onMacroRendererSlotted: (callback: Function) => {
    console.log('Mock App.onMacroRendererSlotted registered');
    globalThis.logseqMacroRendererCallback = callback;
  },
  
  trigger: (event: string, ...args: any[]) => {
    console.log('Trigger event:', event, args);
    const listeners = eventListeners.get(event);
    listeners?.forEach(callback => callback(...args));
  },
  
  pushState: (page: string, params: any) => {
    logger.info(`[Mock] App.pushState: ${page}`, params);
    const message = params.date 
      ? `跳转到日期页面: ${params.date}` 
      : params.name 
        ? `跳转到页面: ${params.name}`
        : `跳转到页面: ${page}`;
    // 显示 Toast 提示
    if ((window as any).addToast) {
      (window as any).addToast(message, 'info', 3000);
    } else {
      alert(message);
    }
  }
};

// Mock Editor
export const Editor: any = {
  getPage: async (pageName: string) => {
    logger.info(`[Mock] Editor.getPage: ${pageName}`);
    // Mock: 总是返回 null，表示页面不存在
    return Promise.resolve(null);
  },
  
  createPage: async (pageName: string, content: string, options?: any) => {
    logger.info(`[Mock] Editor.createPage: ${pageName}`, options);
    // Mock: 模拟创建页面
    const message = `创建页面: ${pageName}`;
    if ((window as any).addToast) {
      (window as any).addToast(message, 'success', 3000);
    } else {
      alert(message);
    }
    return Promise.resolve({
      name: pageName,
      uuid: `mock-uuid-${Date.now()}`,
      'page/original-name': pageName,
    });
  },
  
  getBlock: async (blockUuid: string) => {
    logger.info(`[Mock] Editor.getBlock: ${blockUuid}`);
    return Promise.resolve(null);
  },
  
  updateBlock: async (blockUuid: string, content: string) => {
    logger.info(`[Mock] Editor.updateBlock: ${blockUuid}`, content);
    return Promise.resolve(true);
  },
};

export default App;
