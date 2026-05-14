import { logseqAPI } from '../../logseq';
import logger from '../logger';
import { BlockEntity } from '../heatmap/types';

/**
 * 获取当前块的子块
 */
export async function getChildBlocks(blockUuid: string): Promise<BlockEntity[]> {
  try {
    // 获取当前块
    const block = await logseqAPI.Editor.getBlock(blockUuid);
    if (!block) {
      logger.warn('[BlockView] Block not found', { blockUuid });
      return [];
    }

    // 获取子块
    const children = await logseqAPI.DB.q(
      `[:find (pull ?b [*])
        :where
        [?b :block/parent ?parent]
        [(= ?parent [:block/uuid "${blockUuid}"])]]`
    );

    return children.map((result: any) => result[0] as BlockEntity);
  } catch (err) {
    logger.error('[BlockView] Query error', err);
    return [];
  }
}

/**
 * 获取特定查询的块数据
 * 暂时只实现获取子块
 */
export async function getBlocks(queryType: string, queryValue: string, blockUuid?: string): Promise<BlockEntity[]> {
  // 目前只支持获取当前块的子块
  if (blockUuid) {
    return getChildBlocks(blockUuid);
  }

  // TODO: 后续支持通过 tag、page 等查询
  return [];
}
