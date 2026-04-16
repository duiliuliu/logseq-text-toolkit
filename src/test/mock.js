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
    })
  }
};