import { getSelection, getDocument } from '../utils.ts';

const Editor: any = {
  // 获取当前块
  getCurrentBlock: () => {
    console.log('Get current block');

    const selection = getSelection();
    const doc = getDocument();

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let currentElement: Node | null = range.commonAncestorContainer;

      // 向上查找，找到一个合适的块元素
      while (currentElement && currentElement.nodeType === Node.TEXT_NODE) {
        currentElement = currentElement.parentElement;
      }

      if (currentElement && currentElement instanceof HTMLElement) {
        // 生成一个基于元素路径的唯一ID
        const blockId = generateBlockId(currentElement);
        const content = currentElement.textContent || '';

        return Promise.resolve({
          uuid: blockId,
          content: content,
          properties: {}
        });
      }
    }

    // 没有选中内容时，返回默认块
    return Promise.resolve({
      uuid: 'default-block',
      content: 'Default block content',
      properties: {}
    });
  },

  // 更新块内容
  updateBlock: (blockId: string, content: string) => {
    console.log('Update block:', blockId, content);

    const doc = getDocument();

    // 根据blockId找到对应的元素
    const element = findElementByBlockId(blockId, doc);

    if (element) {
      element.textContent = content;
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
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
