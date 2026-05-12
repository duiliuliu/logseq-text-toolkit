/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * Mock Logseq Editor API
 * 支持 HTTP API 调用模式
 */

import { getSelection, getDocument } from '../utils.ts';
import { httpClient } from './httpClient';

const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
};

const Editor: any = {
  httpClient: httpClient,

  getCurrentBlock: () => {
    console.log('Get current block');

    const selection = getSelection();
    const doc = getDocument();

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let currentElement: Node | null = range.commonAncestorContainer;

      while (currentElement && currentElement.nodeType === Node.TEXT_NODE) {
        currentElement = currentElement.parentElement;
      }

      if (currentElement && currentElement instanceof HTMLElement) {
        const blockId = generateBlockId(currentElement);
        const content = currentElement.textContent || '';

        return Promise.resolve({
          uuid: blockId,
          content: content,
          properties: JSON.parse(currentElement.dataset.properties || '{}')
        });
      }
    }

    return Promise.resolve({
      uuid: 'default-block',
      content: 'Default block content',
      properties: {}
    });
  },

  getPage: async function(this: any, pageName: string) {
    if (httpClient.isEnabled()) {
      try {
        return await httpClient.getPage(pageName);
      } catch (err) {
        logger.warn('[Mock Editor] HTTP getPage failed, using mock:', err);
      }
    }
    logger.info(`[Mock] Editor.getPage: ${pageName}`);
    return Promise.resolve(null);
  },

  createPage: async function(this: any, pageName: string, content: string, options?: any) {
    if (httpClient.isEnabled()) {
      try {
        return await httpClient.createPage(pageName, content, options);
      } catch (err) {
        logger.warn('[Mock Editor] HTTP createPage failed, using mock:', err);
      }
    }
    logger.info(`[Mock] Editor.createPage: ${pageName}`, options);
    const message = `创建页面: ${pageName}`;
    if ((window as any).addToast) {
      (window as any).addToast(message, 'success', 3000);
    }
    return Promise.resolve({
      name: pageName,
      uuid: `mock-uuid-${Date.now()}`,
      'page/original-name': pageName,
    });
  },

  getBlock: async function(this: any, blockUuid: string) {
    if (httpClient.isEnabled()) {
      try {
        return await httpClient.getBlock(blockUuid);
      } catch (err) {
        logger.warn('[Mock Editor] HTTP getBlock failed, using mock:', err);
      }
    }
    console.log('Get block:', blockUuid);
    const doc = getDocument();
    const element = findElementByBlockId(blockUuid, doc);
    if (element) {
      return Promise.resolve({
        id: blockUuid,
        uuid: blockUuid,
        content: element.textContent || '',
        properties: JSON.parse(element.dataset.properties || '{}')
      });
    }
    return Promise.resolve(null);
  },

  updateBlock: async function(this: any, blockUuid: string, content: string) {
    if (httpClient.isEnabled()) {
      try {
        return await httpClient.updateBlock(blockUuid, content);
      } catch (err) {
        logger.warn('[Mock Editor] HTTP updateBlock failed, using mock:', err);
      }
    }
    console.log('Update block:', blockUuid, content);

    const doc = getDocument();
    const element = findElementByBlockId(blockUuid, doc);

    if (element) {
      if (content !== undefined) {
        element.textContent = content;
      }
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  },

  upsertBlockProperty: async function(this: any, blockUuid: string, property: string, value: any) {
    if (httpClient.isEnabled()) {
      try {
        return await httpClient.upsertBlockProperty(blockUuid, property, value);
      } catch (err) {
        logger.warn('[Mock Editor] HTTP upsertBlockProperty failed, using mock:', err);
      }
    }
    logger.info(`[Mock] Editor.upsertBlockProperty: ${blockUuid}`, { property, value });
    return Promise.resolve(true);
  },

  renamePage: async function(this: any, oldName: string, newName: string) {
    if (httpClient.isEnabled()) {
      try {
        return await httpClient.renamePage(oldName, newName);
      } catch (err) {
        logger.warn('[Mock Editor] HTTP renamePage failed, using mock:', err);
      }
    }
    logger.info(`[Mock] Editor.renamePage: ${oldName} -> ${newName}`);
    return Promise.resolve(true);
  },

  insertBlock: async function(this: any, parentUuid: string, content: string, position: string = 'last') {
    if (httpClient.isEnabled()) {
      try {
        return await httpClient.insertBlock(parentUuid, content, position);
      } catch (err) {
        logger.warn('[Mock Editor] HTTP insertBlock failed, using mock:', err);
      }
    }
    logger.info(`[Mock] Editor.insertBlock: parent=${parentUuid}, content=${content}, position=${position}`);
    return Promise.resolve({ uuid: `mock-block-${Date.now()}`, content });
  },

  deleteBlock: async function(this: any, blockUuid: string) {
    if (httpClient.isEnabled()) {
      try {
        return await httpClient.deleteBlock(blockUuid);
      } catch (err) {
        logger.warn('[Mock Editor] HTTP deleteBlock failed, using mock:', err);
      }
    }
    logger.info(`[Mock] Editor.deleteBlock: ${blockUuid}`);
    return Promise.resolve(true);
  },

  addTag: async function(this: any, blockUuid: string, tagName: string) {
    if (httpClient.isEnabled()) {
      try {
        return await httpClient.addTag(blockUuid, tagName);
      } catch (err) {
        logger.warn('[Mock Editor] HTTP addTag failed, using mock:', err);
      }
    }
    logger.info(`[Mock] Editor.addTag: ${blockUuid} -> ${tagName}`);
    return Promise.resolve(true);
  },

  getBlockChildren: (blockId: string) => {
    const doc = getDocument();
    
    const parentElement = findElementByBlockId(blockId, doc);
    
    if (!parentElement) {
      return Promise.resolve([]);
    }
    
    const children: any[] = [];
    Array.from(parentElement.children).forEach(child => {
      if (child.classList.contains('block') || child.hasAttribute('data-block-id')) {
        const id = generateBlockId(child as HTMLElement);
        const props = JSON.parse((child as HTMLElement).dataset.properties || '{}');
        children.push({
          id,
          uuid: id,
          content: child.textContent || '',
          properties: props
        });
      }
    });
    
    return Promise.resolve(children);
  },

  getAllNestedChildren: (blockId: string, maxDepth: number = 5) => {
    const doc = getDocument();
    
    const results: any[] = [];
    
    const traverse = (currentId: string, currentDepth: number) => {
      if (maxDepth !== -1 && currentDepth > maxDepth) {
        return;
      }
      
      const parentElement = findElementByBlockId(currentId, doc);
      if (!parentElement) {
        return;
      }
      
      Array.from(parentElement.children).forEach(child => {
        if (child.classList.contains('block') || child.hasAttribute('data-block-id')) {
          const id = generateBlockId(child as HTMLElement);
          const props = JSON.parse((child as HTMLElement).dataset.properties || '{}');
          
          const block = {
            id,
            uuid: id,
            content: child.textContent || '',
            properties: props,
            tags: (child as HTMLElement).textContent?.includes('#task') ? [{ title: 'task' }] : undefined
          };
          
          results.push(block);
          
          if (maxDepth === -1 || currentDepth < maxDepth) {
            traverse(id, currentDepth + 1);
          }
        }
      });
    };
    
    traverse(blockId, 1);
    
    return Promise.resolve(results);
  },

  getEditingCursorPosition: () => {
    console.log('Get editing cursor position');

    const selection = getSelection();
    const doc = getDocument();

    let rect: DOMRect | null = null;

    try {
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        rect = range.getBoundingClientRect();
        const focusNode = selection.focusNode;

        if (rect.width === 0 && focusNode?.parentElement) {
          rect = (focusNode.parentElement as HTMLElement).getBoundingClientRect();
        }
      } else {
        const mainContentContainer = doc.getElementById('main-content-container');
        if (mainContentContainer) {
          rect = mainContentContainer.getBoundingClientRect();
        }
      }
    } catch {
      const mainContentContainer = doc.getElementById('main-content-container');
      if (mainContentContainer) {
        rect = mainContentContainer.getBoundingClientRect();
      }
    }

    if (rect) {
      return Promise.resolve({
        top: 0,
        left: 0,
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
        }
      });
    }

    return Promise.resolve(null);
  },

  insertAtEditingCursor: (text: string) => {
    console.log('Insert at editing cursor:', text);
    const selection = getSelection();
    const doc = getDocument();
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      const textNode = doc.createTextNode(text);
      range.insertNode(textNode);
      range.collapse(false);
      
      selection.removeAllRanges();
      selection.addRange(range);
    }
    return Promise.resolve();
  },

  registerSlashCommand: (name: string, callback: Function) => {
    console.log('Register slash command:', name);
    globalThis.logseqSlashCommands = globalThis.logseqSlashCommands || {};
    globalThis.logseqSlashCommands[name] = callback;
  },

  scrollToBlockInPage: (pageName: string) => {
    console.log('scrollToBlockInPage:', pageName);
    return Promise.resolve();
  }
};

function generateBlockId(element: HTMLElement): string {
  const path: string[] = [];
  let current: Element | null = element;

  while (current) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector = `#${current.id}`;
    } else if (current.classList.length > 0) {
      const classes = Array.from(current.classList).join('.');
      selector += `.${classes}`;
    } else {
      const siblings = current.parentElement?.children;
      let index = 0;
      if (siblings) {
        for (let i = 0; i < siblings.length; i++) {
          if (siblings[i] === current) {
            index = i;
            break;
          }
        }
        selector += `:nth-child(${index + 1})`;
      }
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(' > ');
}

function findElementByBlockId(blockId: string, doc: Document): HTMLElement | null {
  if (blockId === 'default-block') {
    return doc.getElementById('main-content-container');
  }

  const byId = doc.getElementById(blockId);
  if (byId) {
    return byId;
  }

  const byDataBlockId = doc.querySelector(`[data-block-id="${blockId}"]`);
  if (byDataBlockId) {
    return byDataBlockId as HTMLElement;
  }

  if (blockId.startsWith('#')) {
    try {
      const elements = doc.querySelectorAll(blockId);
      if (elements.length > 0) {
        return elements[0] as HTMLElement;
      }
    } catch (error) {
      console.error('Error finding element by selector:', error);
    }
  }

  const allElements = doc.querySelectorAll('*');
  for (const element of allElements) {
    if (element.textContent?.includes(blockId)) {
      return element as HTMLElement;
    }
  }

  return null;
}

export default Editor;
export { findElementByBlockId };
