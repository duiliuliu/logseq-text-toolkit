// Mock Logseq API
window.logseq = {
  ready: () => Promise.resolve(),
  settings: {}, // 添加settings属性
  updateSettings: (settings) => {
    console.log('Updated settings:', settings);
    window.logseq.settings = { ...settings };
    return Promise.resolve();
  },
  App: {
    registerCommand: (command) => {
      console.log('Registered command:', command);
    },
    on: (event, callback) => {
      console.log('Registered event listener:', event);
      // 模拟选择事件
      if (event === 'selectionChange') {
        document.addEventListener('mouseup', () => {
          const selection = window.getSelection();
          if (selection.toString()) {
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
    off: (event) => {
      console.log('Unregistered event listener:', event);
    },
    getUserConfigs: () => Promise.resolve({
      darkMode: false,
      preferredLanguage: 'zh-CN'
    })
  },
  Editor: {
    getCurrentPage: () => Promise.resolve({
      id: 'test-page',
      name: 'Test Page'
    }),
    getCurrentBlock: async () => {
      // 模拟获取当前块
      const currentContent = localStorage.getItem('mock-block-content') || '';
      return {
        uuid: 'mock-block-uuid',
        content: currentContent,
        properties: {},
        format: 'markdown',
        children: [],
        parent: null,
        left: null,
        right: null,
        collapsed: false,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };
    },
    updateBlock: async (blockId, content) => {
      // 模拟更新块内容
      localStorage.setItem('mock-block-content', content);
      
      // 同时更新DOM中的内容，以便在测试页面中看到变化
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let element = range.commonAncestorContainer;
        
        // 确保返回的是元素节点
        while (element && element.nodeType !== Node.ELEMENT_NODE) {
          element = element.parentNode;
        }
        
        if (element) {
          element.textContent = content;
        }
      }
      
      return true;
    }
  }
};