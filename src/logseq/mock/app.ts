/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * Mock Logseq App API
 * 支持 HTTP API 调用模式
 */

import { getDocument } from '../utils.ts';
import { httpClient, HTTPAPIConfig } from './httpClient';

const eventListeners: Map<string, Array<(...args: any[]) => void>> = new Map();

const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
};

const App: any = {
  httpClient: httpClient,

  setHTTPAPIConfig: (config: HTTPAPIConfig | null) => {
    if (config) {
      httpClient.setConfig(config.baseUrl, config.token);
      logger.info('[Mock App] HTTP API configured:', config.baseUrl);
    } else {
      httpClient.disable();
      logger.info('[Mock App] HTTP API disabled');
    }
  },

  useHTTPAPI: function(this: any, baseUrl: string, token: string): any {
    httpClient.setConfig(baseUrl, token);
    
    const wrappedApp: any = {};
    const self = this;

    for (const key of Object.keys(App)) {
      if (key === 'useHTTPAPI' || key === 'httpClient' || key === 'setHTTPAPIConfig') continue;
      
      wrappedApp[key] = async function(...args: any[]) {
        if (httpClient.isEnabled()) {
          const methodName = `logseq.App.${key}`;
          try {
            return await httpClient.callMethod(methodName, args);
          } catch (err) {
            logger.warn(`[Mock App] HTTP call failed for ${key}, falling back to mock:`, err);
          }
        }
        return App[key].call(self, ...args);
      };
    }

    return wrappedApp;
  },

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

  getUserConfigs: async function(this: any) {
    if (httpClient.isEnabled()) {
      try {
        return await httpClient.getUserConfigs();
      } catch (err) {
        logger.warn('[Mock App] HTTP getUserConfigs failed, using mock:', err);
      }
    }
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

  onThemeModeChanged: (callback: (event: { mode: string }) => void) => {
    console.log('[Mock App] onThemeModeChanged registered');
    return () => console.log('[Mock App] onThemeModeChanged unregistered');
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
    if ((window as any).addToast) {
      (window as any).addToast(message, 'info', 3000);
    } else {
      alert(message);
    }
  }
};

export default App;
