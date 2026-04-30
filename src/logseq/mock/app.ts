import { getDocument } from '../utils.ts';

const eventListeners: Map<string, Array<(...args: any[]) => void>> = new Map();

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
  }
};

export default App;
