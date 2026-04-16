/**
 * Logseq编辑器服务
 * 提供与Logseq编辑器相关的操作，如获取当前块和更新块内容
 */

/**
 * 获取当前选中的块
 * @returns {Promise<Object|null>} 当前块对象或null
 */
export const getCurrentBlock = async () => {
  try {
    // 检查logseq是否可用
    if (typeof logseq === 'undefined') {
      console.error('Logseq API is not available');
      return null;
    }
    
    // 获取当前块
    const block = await logseq.Editor.getCurrentBlock();
    return block;
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
    // 检查logseq是否可用
    if (typeof logseq === 'undefined') {
      console.error('Logseq API is not available');
      return false;
    }
    
    // 更新块内容
    const success = await logseq.Editor.updateBlock(blockId, content);
    return success;
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
