// Mock Logseq API
import { LogseqAPI } from '../logseq.ts';

const mockLogseq: LogseqAPI = {
  ready: () => Promise.resolve(),
  settings: {},
  updateSettings: (settings: Record<string, any>) => {
    console.log('Updated settings:', settings);
    mockLogseq.settings = { ...settings };
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
    }
  },
  provideModel: (model: Record<string, any>) => {
    console.log('Provided model:', model);
  },
  provideUI: (config: any) => {
    console.log('Provided UI:', config);
  }
};

window.logseq = mockLogseq;

export default mockLogseq;
