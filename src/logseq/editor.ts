/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * Logseq编辑器服务
 * 提供与Logseq编辑器相关的操作，如获取当前块和更新块内容
 */

import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import logger from './logger';

type BlockUUID = string;

export const getCurrentBlock = async (): Promise<BlockEntity | null> => {
  try {
    if (typeof logseq === 'undefined') {
      logger.error('Logseq API is not available');
      return null;
    }
    
    const block = await logseq.Editor.getCurrentBlock();
    return block;
  } catch (error) {
    logger.error('Error getting current block:', error);
    return null;
  }
};

export const updateBlock = async (blockId: BlockUUID, content: string): Promise<boolean> => {
  try {
    if (typeof logseq === 'undefined') {
      logger.error('Logseq API is not available');
      return false;
    }
    
    const success = await logseq.Editor.updateBlock(blockId, content);
    return success;
  } catch (error) {
    logger.error('Error updating block:', error);
    return false;
  }
};

export default {
  getCurrentBlock,
  updateBlock
};
