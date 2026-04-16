/**
 * Mock编辑器服务
 * 提供在测试环境中模拟Logseq编辑器的功能
 */

// 模拟Logseq的BlockEntity类型
const mockBlock = {
  uuid: 'mock-block-uuid',
  content: '',
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

/**
 * 获取当前选中的块
 * @returns {Promise<Object|null>} 当前块对象或null
 */
export const getCurrentBlock = async () => {
  try {
    // 模拟获取当前块
    // 在测试环境中，我们可以从localStorage或全局状态中获取模拟数据
    const currentContent = localStorage.getItem('mock-block-content') || '';
    
    return {
      ...mockBlock,
      content: currentContent
    };
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
    // 模拟更新块内容
    // 在测试环境中，我们可以将内容存储到localStorage中
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
  try {
    // 获取当前块
    const block = await getCurrentBlock();
    if (!block) {
      console.error('No block selected');
      return false;
    }
    
    // 更新块内容
    const success = await updateBlock(block.uuid, processedText);
    return success;
  } catch (error) {
    console.error('Error replacing selected text:', error);
    return false;
  }
};

export default {
  getCurrentBlock,
  updateBlock,
  replaceSelectedText
};
