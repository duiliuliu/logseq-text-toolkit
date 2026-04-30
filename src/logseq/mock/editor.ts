import { getSelection, getDocument } from '../utils.ts';

const Editor: any = {
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

  getBlock: (blockId: string) => {
    console.log('Get block:', blockId);
    const doc = getDocument();
    
    const element = findElementByBlockId(blockId, doc);
    if (element) {
      return Promise.resolve({
        id: blockId,
        uuid: blockId,
        content: element.textContent || '',
        properties: JSON.parse(element.dataset.properties || '{}')
      });
    }
    return Promise.resolve(null);
  },

  getBlockChildren: (blockId: string) => {
    console.log('Get block children:', blockId);
    const doc = getDocument();
    
    const parentElement = findElementByBlockId(blockId, doc);
    console.log('Parent element found:', parentElement);
    
    if (!parentElement) {
      return Promise.resolve([]);
    }
    
    const children: any[] = [];
    Array.from(parentElement.children).forEach(child => {
      console.log('Checking child:', child.className, child.hasAttribute('data-block-id'), (child as HTMLElement).dataset.properties);
      if (child.classList.contains('block') || child.hasAttribute('data-block-id')) {
        const id = generateBlockId(child as HTMLElement);
        const props = JSON.parse((child as HTMLElement).dataset.properties || '{}');
        console.log('Found block child:', id, props);
        children.push({
          id,
          uuid: id,
          content: child.textContent || '',
          properties: props
        });
      }
    });
    
    console.log('Returning children:', children);
    return Promise.resolve(children);
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

  updateBlock: (blockId: string, content: string, properties?: any) => {
    console.log('Update block:', blockId, content, properties);

    const doc = getDocument();
    const element = findElementByBlockId(blockId, doc);

    if (element) {
      if (content !== undefined) {
        element.textContent = content;
      }
      if (properties) {
        (element as HTMLElement).dataset.properties = JSON.stringify(properties);
      }
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
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
  }
};

// 生成基于元素路径的唯一ID（使用JS路径格式）
function generateBlockId(element: HTMLElement): string {
  const path: string[] = [];
  let current: Element | null = element;

  while (current) {
    let selector = current.tagName.toLowerCase();

    // 添加ID作为标识（优先使用ID）
    if (current.id) {
      selector = `#${current.id}`;
    } else if (current.classList.length > 0) {
      // 添加类名作为额外标识
      const classes = Array.from(current.classList).join('.');
      selector += `.${classes}`;
    } else {
      // 添加索引位置
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

// 根据blockId查找元素
function findElementByBlockId(blockId: string, doc: Document): HTMLElement | null {
  // 对于默认块，返回main-content-container
  if (blockId === 'default-block') {
    return doc.getElementById('main-content-container');
  }

  // 尝试解析blockId为选择器路径
  try {
    // 简单实现：尝试直接使用blockId作为选择器
    const elements = doc.querySelectorAll(blockId);
    if (elements.length > 0) {
      return elements[0] as HTMLElement;
    }
  } catch (error) {
    console.error('Error finding element by blockId:', error);
  }

  // 回退：查找包含blockId的元素
  const allElements = doc.querySelectorAll('*');
  for (const element of allElements) {
    if (element.textContent?.includes(blockId)) {
      return element as HTMLElement;
    }
  }

  return null;
}

export default Editor;
