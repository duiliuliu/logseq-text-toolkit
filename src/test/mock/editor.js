/**
 * Mock编辑器服务
 * 提供在测试环境中模拟Logseq编辑器的功能
 */

import { replaceSelectedTextCommon } from '../../utils/textProcessor.js';

// 存储当前选中的DOM节点
let selectedDOMNode = null;
let selectionRange = null;

// 模拟Logseq的BlockEntity类型
const createMockBlock = (content, domNode) => ({
  uuid: 'mock-block-uuid',
  content: content,
  properties: {},
  format: 'markdown',
  children: [],
  parent: null,
  left: null,
  right: null,
  collapsed: false,
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  domNode: domNode
});

/**
 * 保存当前的选择范围
 */
const saveSelection = () => {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    selectionRange = selection.getRangeAt(0).cloneRange();
  }
};

/**
 * 恢复选中状态
 */
const restoreSelection = (element) => {
  try {
    const selection = window.getSelection();
    const range = document.createRange();
    
    // 选中整个元素的文本内容
    if (element.firstChild) {
      range.selectNodeContents(element);
    } else {
      range.selectNode(element);
    }
    
    selection.removeAllRanges();
    selection.addRange(range);
  } catch (error) {
    console.error('Failed to restore selection:', error);
  }
};

/**
 * 获取当前选中的块
 * @returns {Promise<Object|null>} 当前块对象或null
 */
export const getCurrentBlock = async () => {
  try {
    // 从localStorage获取内容
    const currentContent = localStorage.getItem('mock-block-content') || '';
    
    // 获取当前选中的DOM节点
    const selection = window.getSelection();
    let domNode = null;
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let element = range.commonAncestorContainer;
      
      // 确保返回的是元素节点
      while (element && element.nodeType !== Node.ELEMENT_NODE) {
        element = element.parentNode;
      }
      
      domNode = element;
      selectedDOMNode = element;
    }
    
    return createMockBlock(currentContent, domNode);
  } catch (error) {
    console.error('Error getting current block:', error);
    return null;
  }
};

/**
 * 更新块内容
 * @param {string} blockId - 块的UUID
 * @param {string} content - 新的内容
 * @returns {Promise<boolean>} 更新是否成功
 */
export const updateBlock = async (blockId, content) => {
  try {
    console.log('Updating block with content:', content);
    
    // 更新localStorage
    localStorage.setItem('mock-block-content', content);
    
    // 更新DOM中的内容
    let elementToUpdate = selectedDOMNode;
    
    // 如果没有保存的节点，尝试从selection获取
    if (!elementToUpdate) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let element = range.commonAncestorContainer;
        
        while (element && element.nodeType !== Node.ELEMENT_NODE) {
          element = element.parentNode;
        }
        
        elementToUpdate = element;
      }
    }
    
    if (elementToUpdate) {
      console.log('Updating element:', elementToUpdate);
      
      // 保存当前选择范围
      const selection = window.getSelection();
      let savedRange = null;
      if (selection && selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange();
      }
      
      // 更新内容 - 使用 textContent 直接替换
      elementToUpdate.textContent = content;
      
      // 重新选中整个内容
      setTimeout(() => {
        try {
          const newSelection = window.getSelection();
          const newRange = document.createRange();
          newRange.selectNodeContents(elementToUpdate);
          newSelection.removeAllRanges();
          newSelection.addRange(newRange);
        } catch (e) {
          console.error('Failed to restore selection:', e);
        }
      }, 0);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating block:', error);
    return false;
  }
};

/**
 * 替换选中的文字
 * @param {string} processedText - 处理后的文字
 * @returns {Promise<boolean>} 替换是否成功
 */
export const replaceSelectedText = async (processedText) => {
  return replaceSelectedTextCommon(getCurrentBlock, updateBlock, processedText);
};

export default {
  getCurrentBlock,
  updateBlock,
  replaceSelectedText
};
