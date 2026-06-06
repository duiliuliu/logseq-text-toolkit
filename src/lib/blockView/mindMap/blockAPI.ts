/**
 * MindMap Logseq Editor API 封装
 */

import { logseqAPI } from '../../../logseq';
import logger from '../../logger';

/**
 * Logseq Editor API 封装
 */
export class MindMapBlockAPI {
  /**
   * 获取块及其子节点
   */
  static async getBlock(uuid: string, includeChildren: boolean = true) {
    return await logseqAPI.Editor.getBlock(uuid, { includeChildren });
  }

  /**
   * 更新块内容
   */
  static async updateBlock(uuid: string, content: string): Promise<void> {
    try {
      await logseqAPI.Editor.updateBlock(uuid, content);
      logger.debug('[MindMap] Block updated:', uuid);
    } catch (error) {
      logger.error('[MindMap] Failed to update block:', error);
      throw error;
    }
  }

  /**
   * 添加子节点
   */
  static async addChild(parentUuid: string, content: string = ''): Promise<string | null> {
    try {
      const newBlock = await logseqAPI.Editor.insertBlock(
        parentUuid,
        content,
        {
          before: false,
          sibling: false,
        }
      );

      if (newBlock && newBlock.uuid) {
        logger.debug('[MindMap] Child block added:', newBlock.uuid);
        return newBlock.uuid;
      }

      return null;
    } catch (error) {
      logger.error('[MindMap] Failed to add child:', error);
      throw error;
    }
  }

  /**
   * 删除块及其子节点
   */
  static async removeBlock(uuid: string): Promise<void> {
    try {
      await logseqAPI.Editor.removeBlock(uuid);
      logger.debug('[MindMap] Block removed:', uuid);
    } catch (error) {
      logger.error('[MindMap] Failed to remove block:', error);
      throw error;
    }
  }

  /**
   * 设置块折叠状态
   */
  static async setCollapsed(uuid: string, collapsed: boolean): Promise<void> {
    try {
      logger.debug('[MindMap] Set collapsed:', uuid, collapsed);
    } catch (error) {
      logger.error('[MindMap] Failed to set collapsed:', error);
    }
  }
}
