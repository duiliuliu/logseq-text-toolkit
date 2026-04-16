/**
 * Mock编辑器服务
 * 提供在测试环境中模拟Logseq编辑器的功能
 */

/**
 * 获取当前选中的DOM元素
 * @returns {HTMLElement|null} 当前选中的DOM元素或null
 */
export const getCurrentElement = () => {
  try {
    // 获取当前选中的文本范围
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null;
    }
    
    // 获取包含选中内容的元素
    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer;
    
    // 确保返回的是元素节点
    while (element && element.nodeType !== Node.ELEMENT_NODE) {
      element = element.parentNode;
    }
    
    return element;
  } catch (error) {
    console.error('Error getting current element:', error);
    return null;
  }
};

/**
 * 更新DOM元素的内容
 * @param {HTMLElement} element - 要更新的DOM元素
 * @param {string} content - 新的内容
 * @returns {boolean} 更新是否成功
 */
export const updateElement = (element, content) => {
  try {
    if (!element) {
      console.error('No element provided');
      return false;
    }
    
    // 替换元素的文本内容
    element.textContent = content;
    return true;
  } catch (error) {
    console.error('Error updating element:', error);
    return false;
  }
};

/**
 * 替换选中的文字
 * @param {string} processedText - 处理后的文字
 * @returns {boolean} 替换是否成功
 */
export const replaceSelectedText = (processedText) => {
  try {
    // 获取当前选中的元素
    const element = getCurrentElement();
    if (!element) {
      console.error('No element selected');
      return false;
    }
    
    // 更新元素内容
    const success = updateElement(element, processedText);
    return success;
  } catch (error) {
    console.error('Error replacing selected text:', error);
    return false;
  }
};

export default {
  getCurrentElement,
  updateElement,
  replaceSelectedText
};
