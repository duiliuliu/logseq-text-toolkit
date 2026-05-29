/**
 * Milestone 数据查询模块
 */

import type { BlockWithProperty, MilestoneItem, MilestoneData, MilestoneStatus } from './types';
import { PropertyEnumService } from './propertyEnum';
import { StatusCalculator } from './statusCalculator';
import logger from '../logger/index';

let logseqAPI: any = null;

export function setLogseqAPI(api: any): void {
  logseqAPI = api;
}

export class MilestoneQuery {
  /**
   * 执行带过滤条件的查询
   */
  static async query(
    config: {
      tag?: string;
      property?: string;
      propertyK?: string;
      propertyV?: string;
      list?: string[];
      dateField?: string;
    }
  ): Promise<MilestoneData> {
    const { tag, property, propertyK, propertyV, list, dateField = 'scheduled' } = config;

    try {
      if (list && list.length > 0) {
        if (propertyK && propertyV) {
          return await this.queryByStageListWithProperty(list, tag, propertyK, propertyV, dateField);
        }
        return await this.queryByStageList(list, tag, dateField);
      }

      if (property) {
        return await this.queryByPropertyEnum(property, tag, dateField);
      }

      if (tag) {
        return await this.queryByTag(tag, dateField);
      }

      return await this.queryDefault(dateField);
    } catch (error) {
      logger.error('[MilestoneQuery] Query failed:', error);
      return this.createEmptyData();
    }
  }

  /**
   * 根据阶段列表 + 标签 + 属性过滤查询
   */
  private static async queryByStageListWithProperty(
    list: string[],
    tag: string | undefined,
    propertyK: string,
    propertyV: string,
    dateField: string = 'scheduled'
  ): Promise<MilestoneData> {
    const items: MilestoneItem[] = [];

    const targetBlocks = await this.getBlocksByProperty(propertyK, propertyV, tag);
    
    if (targetBlocks.length === 0) {
      return {
        items: list.map(stage => ({
          id: `milestone-${stage}`,
          label: stage,
          status: 'pending' as const,
          progress: 0,
          date: null,
        })),
        totalCount: list.length,
        completedCount: 0,
        pendingCount: list.length,
        overallProgress: 0,
      };
    }

    for (const stage of list) {
      const blocks = await this.getBlocksByStageAndParent(stage, targetBlocks);
      
      let status: MilestoneStatus = 'pending';
      let progress = 0;
      let date: string | null = null;

      if (blocks.length > 0) {
        status = StatusCalculator.calculateFromBlocks(blocks, dateField);
        progress = StatusCalculator.calculateProgress(blocks, dateField);
        date = StatusCalculator.getScheduledDate(blocks, dateField);
      }

      items.push({
        id: `milestone-${stage}`,
        label: stage,
        status,
        progress,
        date,
      });
    }

    return {
      items,
      totalCount: items.length,
      completedCount: items.filter(i => i.status === 'completed').length,
      inProgressCount: items.filter(i => i.status === 'in_progress').length,
      pendingCount: items.filter(i => i.status === 'pending').length,
      overallProgress: this.calculateOverallProgress(items),
    };
  }

  /**
   * 根据属性键名和属性值获取块
   */
  private static async getBlocksByProperty(
    propertyK: string,
    propertyV: string,
    tag?: string
  ): Promise<BlockWithProperty[]> {
    if (!logseqAPI) {
      logger.warn('[MilestoneQuery] Logseq API not initialized');
      return [];
    }

    const formattedKey = propertyK.startsWith(':') ? propertyK.slice(1) : propertyK;

    let query = `[:find (pull ?b [*])
                    :where
                    [?b :${formattedKey} ?val]
                    [?val :block/title "${propertyV}"]]`;

    if (tag) {
      query = `[:find (pull ?b [*])
                :where
                [?b :${formattedKey} ?val]
                [?val :block/title "${propertyV}"]
                [?b :block/tags ?t]
                [?t :block/title "${tag}"]]`;
    }

    try {
      const result = await logseqAPI.DB.datascriptQuery(query);
      return this.parseBlocksResult(result);
    } catch (error) {
      logger.error('[MilestoneQuery] getBlocksByProperty failed:', error);
      return [];
    }
  }

  /**
   * 在父块列表中查找包含特定阶段关键词的子块
   */
  private static async getBlocksByStageAndParent(
    stage: string,
    parentBlocks: BlockWithProperty[]
  ): Promise<BlockWithProperty[]> {
    if (!logseqAPI) {
      return [];
    }

    const parentUuids = parentBlocks.map(b => b.uuid).filter(Boolean);
    
    if (parentUuids.length === 0) {
      return [];
    }

    const parentIdPattern = parentUuids.map(uuid => `["${uuid}"]`).join(' | ');
    const query = `[:find (pull ?child [*])
                    :where
                    [?child :block/parent ?parent]
                    [?parent :block/uuid ${parentIdPattern}]
                    [?child :block/content ?c]
                    [(clojure.string/includes? ?c "${stage}")]]`;

    try {
      const result = await logseqAPI.DB.datascriptQuery(query);
      return this.parseBlocksResult(result);
    } catch (error) {
      logger.error('[MilestoneQuery] getBlocksByStageAndParent failed:', error);
      return [];
    }
  }

  /**
   * 根据阶段列表 + 标签查询
   */
  private static async queryByStageList(
    list: string[],
    tag: string | undefined,
    dateField: string = 'scheduled'
  ): Promise<MilestoneData> {
    const items: MilestoneItem[] = [];

    for (const stage of list) {
      const blocks = await this.getBlocksByStage(stage, tag);
      
      let status: MilestoneStatus = 'pending';
      let progress = 0;
      let date: string | null = null;

      if (blocks.length > 0) {
        status = StatusCalculator.calculateFromBlocks(blocks, dateField);
        progress = StatusCalculator.calculateProgress(blocks, dateField);
        date = StatusCalculator.getScheduledDate(blocks, dateField);
      }

      items.push({
        id: `milestone-${stage}`,
        label: stage,
        status,
        progress,
        date,
      });
    }

    return {
      items,
      totalCount: items.length,
      completedCount: items.filter(i => i.status === 'completed').length,
      inProgressCount: items.filter(i => i.status === 'in_progress').length,
      pendingCount: items.filter(i => i.status === 'pending').length,
      overallProgress: this.calculateOverallProgress(items),
    };
  }

  /**
   * 根据阶段关键词 + 标签获取对应块
   */
  private static async getBlocksByStage(
    stage: string,
    tag?: string
  ): Promise<BlockWithProperty[]> {
    if (!logseqAPI) {
      return [];
    }

    let query = `[:find (pull ?b [*]) :where
                  [?b :block/content ?c]
                  [(clojure.string/includes? ?c "${stage}")]]`;
    
    if (tag) {
      query = `[:find (pull ?b [*]) :where
                [?b :block/content ?c]
                [(clojure.string/includes? ?c "${stage}")]
                [?b :block/tags ?t]
                [?t :block/title "${tag}"]]`;
    }

    try {
      const result = await logseqAPI.DB.datascriptQuery(query);
      return this.parseBlocksResult(result);
    } catch (error) {
      logger.error('[MilestoneQuery] getBlocksByStage failed:', error);
      return [];
    }
  }

  /**
   * 根据标签获取对应块
   */
  private static async getBlocksByLabel(
    label: string,
    tag?: string
  ): Promise<BlockWithProperty[]> {
    if (!logseqAPI) {
      return [];
    }

    let query = `[:find (pull ?b [*]) :where
                  [?b :block/content ?c]
                  [(clojure.string/includes? ?c "${label}")]]`;
    
    if (tag) {
      query = `[:find (pull ?b [*]) :where
                [?b :block/content ?c]
                [(clojure.string/includes? ?c "${label}")]
                [?b :block/tags ?t]
                [?t :block/title "${tag}"]]`;
    }

    try {
      const result = await logseqAPI.DB.datascriptQuery(query);
      return this.parseBlocksResult(result);
    } catch (error) {
      logger.error('[MilestoneQuery] getBlocksByLabel failed:', error);
      return [];
    }
  }

  /**
   * 根据属性枚举查询
   */
  private static async queryByPropertyEnum(
    property: string,
    tag?: string,
    dateField: string = 'scheduled'
  ): Promise<MilestoneData> {
    const enums = tag 
      ? await PropertyEnumService.getPropertyEnumsWithTag(property, tag)
      : await PropertyEnumService.getPropertyEnums(property);

    const items: MilestoneItem[] = enums.map((enumItem, index) => ({
      id: `milestone-${index}`,
      label: enumItem.value,
      status: StatusCalculator.calculateFromBlocks(enumItem.blocks, dateField),
      progress: StatusCalculator.calculateProgress(enumItem.blocks, dateField),
      date: StatusCalculator.getScheduledDate(enumItem.blocks, dateField),
      color: undefined,
    }));

    return {
      items,
      totalCount: items.length,
      completedCount: items.filter(i => i.status === 'completed').length,
      inProgressCount: items.filter(i => i.status === 'in_progress').length,
      pendingCount: items.filter(i => i.status === 'pending').length,
      overallProgress: this.calculateOverallProgress(items),
    };
  }

  /**
   * 根据标签查询
   */
  private static async queryByTag(
    tag: string,
    dateField: string = 'scheduled'
  ): Promise<MilestoneData> {
    if (!logseqAPI) {
      return this.createEmptyData();
    }

    const query = `[:find (pull ?b [*])
                    :where
                    [?b :block/tags ?t]
                    [?t :block/title "${tag}"]]`;

    try {
      const result = await logseqAPI.DB.datascriptQuery(query);
      return this.parseBlocksToMilestone(result, undefined, dateField);
    } catch (error) {
      logger.error('[MilestoneQuery] queryByTag failed:', error);
      return this.createEmptyData();
    }
  }

  /**
   * 解析块数据为里程碑数据
   */
  private static parseBlocksToMilestone(
    result: any[],
    property?: string,
    dateField: string = 'scheduled'
  ): MilestoneData {
    const blocks: BlockWithProperty[] = [];

    for (const row of result) {
      if (!row || !Array.isArray(row)) continue;

      for (const item of row) {
        if (!item) continue;

        blocks.push({
          id: item.id?.toString() || '',
          uuid: item.uuid || '',
          content: item.content || item['block/title'] || '',
          properties: item.properties || {},
          createdAt: item['created-at'] || '',
          updatedAt: item['updated-at'] || '',
        });
      }
    }

    const groupByProperty = (blocks: BlockWithProperty[], prop: string) => {
      const groups = new Map<string, BlockWithProperty[]>();

      blocks.forEach(block => {
        const value = block.properties?.[prop]?.toString() || 'Unknown';
        if (!groups.has(value)) {
          groups.set(value, []);
        }
        groups.get(value)!.push(block);
      });

      return groups;
    };

    if (property) {
      const groups = groupByProperty(blocks, property);
      const items: MilestoneItem[] = [];

      let index = 0;
      groups.forEach((groupBlocks, value) => {
        items.push({
          id: `milestone-${index++}`,
          label: value,
          status: StatusCalculator.calculateFromBlocks(groupBlocks, dateField),
          progress: StatusCalculator.calculateProgress(groupBlocks, dateField),
          date: StatusCalculator.getScheduledDate(groupBlocks, dateField),
        });
      });

      return {
        items,
        totalCount: items.length,
        completedCount: items.filter(i => i.status === 'completed').length,
        inProgressCount: items.filter(i => i.status === 'in_progress').length,
        pendingCount: items.filter(i => i.status === 'pending').length,
        overallProgress: this.calculateOverallProgress(items),
      };
    }

    const items: MilestoneItem[] = blocks.map((block, index) => ({
      id: `milestone-${index}`,
      label: block.content.substring(0, 50),
      status: StatusCalculator.calculateFromBlocks([block], dateField),
      progress: StatusCalculator.calculateProgress([block], dateField),
      date: StatusCalculator.getScheduledDate([block], dateField),
    }));

    return {
      items,
      totalCount: items.length,
      completedCount: items.filter(i => i.status === 'completed').length,
      inProgressCount: items.filter(i => i.status === 'in_progress').length,
      pendingCount: items.filter(i => i.status === 'pending').length,
      overallProgress: this.calculateOverallProgress(items),
    };
  }

  /**
   * 解析查询结果
   */
  private static parseBlocksResult(result: any[]): BlockWithProperty[] {
    const blocks: BlockWithProperty[] = [];

    if (!result || !Array.isArray(result)) {
      return blocks;
    }

    for (const row of result) {
      if (!row || !Array.isArray(row)) continue;
      for (const item of row) {
        if (!item) continue;
        blocks.push({
          id: item.id?.toString() || '',
          uuid: item.uuid || '',
          content: item.content || item['block/title'] || '',
          properties: item.properties || {},
          createdAt: item['created-at'] || '',
          updatedAt: item['updated-at'] || '',
        });
      }
    }

    return blocks;
  }

  /**
   * 计算总体进度
   */
  private static calculateOverallProgress(items: MilestoneItem[]): number {
    if (items.length === 0) return 0;
    
    const totalProgress = items.reduce((sum, item) => {
      return sum + (item.progress || 0);
    }, 0);

    return Math.round(totalProgress / items.length);
  }

  /**
   * 默认查询
   */
  private static async queryDefault(dateField: string = 'scheduled'): Promise<MilestoneData> {
    return {
      items: [],
      totalCount: 0,
      completedCount: 0,
      overallProgress: 0,
    };
  }

  /**
   * 创建空数据
   */
  private static createEmptyData(): MilestoneData {
    return {
      items: [],
      totalCount: 0,
      completedCount: 0,
      overallProgress: 0,
    };
  }
}
