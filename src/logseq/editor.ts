/**
 * Logseq编辑器服务
 * 提供与Logseq编辑器相关的操作，如获取当前块和更新块内容
 */

import { replaceSelectedTextCommon } from '../utils/textProcessor.ts';
import { BlockEntity, BlockUUID } from '../types/logseq.ts';

/**
 * 获取当前选中的块
 * @returns {Promise<BlockEntity|null>} 当前块对象或null
 */
export const getCurrentBlock = async (): Promise<BlockEntity | null> => {
  try {
    if (typeof logseq === 'undefined') {
      console.error('Logseq API is not available');
      return null;
    }
    
    const block = await logseq.Editor.getCurrentBlock();
    return block;
  } catch (error) {
    console.error('Error getting current block:', error);
    return null;
  }
};

/**
 * 更新块内容
 * @param {BlockUUID} blockId - 块的UUID
 * @param {string} content - 新的内容
 * @returns {Promise<boolean>} 更新是否成功
 */
export const updateBlock = async (blockId: BlockUUID, content: string): Promise<boolean> => {
  try {
    if (typeof logseq === 'undefined') {
      console.error('Logseq API is not available');
      return false;
    }
    
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
export const replaceSelectedText = async (processedText: string): Promise<boolean> => {
  return replaceSelectedTextCommon(getCurrentBlock, updateBlock, processedText);
};

export default {
  getCurrentBlock,
  updateBlock,
  replaceSelectedText
};
