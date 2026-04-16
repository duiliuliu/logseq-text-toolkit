/**
 * 编辑器共享工具函数
 * 提供 mock 和 logseq 环境中都使用的通用逻辑
 */

/**
 * 替换选中的文字（共享逻辑）
 * @param {Function} getCurrentBlockFn - 获取当前块的函数
 * @param {Function} updateBlockFn - 更新块的函数
 * @param {string} processedText - 处理后的文字
 * @returns {Promise<boolean>} 替换是否成功
 */
export const replaceSelectedTextCommon = async (getCurrentBlockFn, updateBlockFn, processedText) => {
  try {
    const block = await getCurrentBlockFn();
    if (!block) {
      console.error('No block selected');
      return false;
    }
    
    const success = await updateBlockFn(block.uuid, processedText);
    return success;
  } catch (error) {
    console.error('Error replacing selected text:', error);
    return false;
  }
};

export default {
  replaceSelectedTextCommon
};
