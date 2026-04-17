// Mock Logseq App API
const eventListeners: Map<string, Array<(...args: any[]) => void>> = new Map();

const App = {
  // 注册命令
  registerCommand: (command: any) => {
    console.log('Registered command:', command);
  },
  
  // 注册事件监听器
  on: (event: string, callback: (...args: any[]) => void) => {
    console.log('Registered event listener:', event);
    
    if (!eventListeners.has(event)) {
      eventListeners.set(event, []);
    }
    eventListeners.get(event)?.push(callback);
    
    // 特殊处理 selectionChange 事件
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
  
  // 移除事件监听器
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
  
  // 获取用户配置
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
  
  // 注册UI项
  registerUIItem: (slot: string, config: any) => {
    console.log('Registered UI item:', slot, config);
    
    // 查找id=toolbar的元素
    const toolbarElement = document.getElementById('toolbar');
    if (toolbarElement) {
      // 检查是否已存在该key的元素
      const existingElement = document.getElementById(config.key);
      if (existingElement) {
        existingElement.remove();
      }
      
      // 创建新元素并添加到toolbar
      const element = document.createElement('div');
      element.id = config.key;
      element.innerHTML = config.template;
      toolbarElement.appendChild(element);
      console.log('Added UI item to toolbar:', config.key);
    } else {
      console.warn('Toolbar element not found, UI item not added:', config.key);
    }
  },
  
  // 触发事件
  trigger: (event: string, ...args: any[]) => {
    console.log('Trigger event:', event, args);
    const listeners = eventListeners.get(event);
    listeners?.forEach(callback => callback(...args));
  }
};

export default App;
