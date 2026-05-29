/**
 * Milestone 状态计算器
 */

import type { BlockWithProperty, MilestoneStatus } from './types';

const parseTimestamp = (value: any): number | null => {
  if (!value) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
};

const parseCustomProperty = (value: any): number | null => {
  if (!value) return null;
  
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  
  if (typeof value === 'string') {
    const asNumber = Number(value);
    if (Number.isFinite(asNumber)) {
      return asNumber;
    }
    
    const asDate = new Date(value);
    if (!isNaN(asDate.getTime())) {
      return asDate.getTime();
    }
    
    const logseqDateMatch = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (logseqDateMatch) {
      const [, year, month, day] = logseqDateMatch;
      const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.getTime();
      }
    }
  }
  
  return null;
};

const getTimestampByField = (block: any, dateField: string = 'scheduled'): number | null => {
  switch (dateField) {
    case 'scheduled':
      return parseTimestamp(block?.['scheduled'] ?? block?.['block/scheduled'] ?? block?.[':logseq.property/scheduled']);
    case 'deadline':
      return parseTimestamp(block?.['deadline'] ?? block?.['block/deadline'] ?? block?.[':logseq.property/deadline']);
    case 'created-at':
      return parseTimestamp(block?.['created-at'] ?? block?.['block/created-at']);
    case 'updated-at':
      return parseTimestamp(block?.['updated-at'] ?? block?.['block/updated-at']);
    default:
      const customValue = block?.['block/properties']?.[dateField];
      return parseCustomProperty(customValue);
  }
};

export class StatusCalculator {
  /**
   * 从块列表计算状态
   * 
   * 规则：
   * - 无块 → pending
   * - 有块 + scheduled 已过（早于今天）→ completed
   * - 有块 + scheduled 在今天或未来 → in_progress
   */
  static calculateFromBlocks(
    blocks: BlockWithProperty[],
    dateField: string = 'scheduled'
  ): MilestoneStatus {
    if (blocks.length === 0) {
      return 'pending';
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const timestamps = blocks
      .map(b => getTimestampByField(b, dateField))
      .filter(Boolean) as number[];

    if (timestamps.length === 0) {
      const statuses = blocks
        .map(b => {
          const status = b.properties?.[':logseq.property/status'] ?? b.properties?.status;
          return status?.toString().toLowerCase();
        })
        .filter(Boolean);

      if (statuses.some(s => s === 'done')) {
        return 'completed';
      }
      if (statuses.some(s => s === 'doing' || s === 'in-progress' || s === 'wip')) {
        return 'in_progress';
      }
      return 'in_progress';
    }

    const minTimestamp = Math.min(...timestamps);

    if (minTimestamp < today) {
      return 'completed';
    }

    return 'in_progress';
  }

  /**
   * 计算单个阶段的进度百分比
   * 
   * 公式：(scheduled - today) / (scheduled - created) × 100%
   */
  static calculateProgress(
    blocks: BlockWithProperty[],
    dateField: string = 'scheduled'
  ): number {
    if (blocks.length === 0) {
      return 0;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const scheduledTimestamps = blocks
      .map(b => getTimestampByField(b, dateField))
      .filter(Boolean) as number[];

    const createdTimestamps = blocks
      .map(b => parseTimestamp(b.createdAt))
      .filter(Boolean) as number[];

    if (scheduledTimestamps.length === 0) {
      const completedCount = blocks.filter(b => {
        const status = b.properties?.[':logseq.property/status'] ?? b.properties?.status;
        return status?.toString().toLowerCase() === 'done';
      }).length;
      return Math.round((completedCount / blocks.length) * 100);
    }

    const startTimestamp = createdTimestamps.length > 0
      ? Math.min(...createdTimestamps)
      : today;

    const endTimestamp = Math.min(...scheduledTimestamps);

    const totalDuration = endTimestamp - startTimestamp;
    const elapsedDuration = today - startTimestamp;

    if (totalDuration <= 0) {
      return 100;
    }

    if (elapsedDuration <= 0) {
      return 0;
    }

    if (elapsedDuration >= totalDuration) {
      return 100;
    }

    const progress = (elapsedDuration / totalDuration) * 100;
    return Math.min(100, Math.max(0, Math.round(progress)));
  }

  /**
   * 获取该阶段的 scheduled 日期（用于显示）
   */
  static getScheduledDate(
    blocks: BlockWithProperty[],
    dateField: string = 'scheduled'
  ): string | null {
    const timestamps = blocks
      .map(b => getTimestampByField(b, dateField))
      .filter(Boolean) as number[];

    if (timestamps.length === 0) return null;

    const minTimestamp = Math.min(...timestamps);
    const date = new Date(minTimestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 获取该阶段的创建日期
   */
  static getCreatedDate(blocks: BlockWithProperty[]): string | null {
    const timestamps = blocks
      .map(b => parseTimestamp(b.createdAt))
      .filter(Boolean) as number[];

    if (timestamps.length === 0) return null;

    const minTimestamp = Math.min(...timestamps);
    const date = new Date(minTimestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
