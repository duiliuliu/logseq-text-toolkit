/**
 * Milestone 数据查询模块
 */

import type { BlockWithProperty, MilestoneItem, MilestoneData, MilestoneStatus } from './types';
import { PropertyEnumService } from './propertyEnum';
import { StatusCalculator } from './statusCalculator';
import logger from '../logger/index';
import { logseqAPI } from '../../logseq';

export class MilestoneQuery {
  /**
   * 格式化属性键，如果没有前缀则添加 :user.property/ 前缀
   */
  private static formatPropertyKey(key?: string): string | undefined {
    if (!key) return undefined;
    
    // 如果已有前缀，直接返回
    if (key.startsWith(':user.property/') || key.startsWith(':logseq.property/')) {
      return key;
    }
    
    // 移除可能的前导冒号
    const cleanKey = key.startsWith(':') ? key.slice(1) : key;
    
    // 添加 :user.property/ 前缀
    return `:user.property/${cleanKey}`;
  }

  /**
   * 获取当前block的指定属性值
   */
  private static async getCurrentBlockPropertyValue(
    blockUuid: string | undefined,
    propertyKey: string
  ): Promise<string | undefined> {
    if (!blockUuid || !logseqAPI) {
      return undefined;
    }

    try {
      const block = await logseqAPI.Editor.getBlock(blockUuid, { includeChildren: false });
      if (!block || !block.properties) {
        return undefined;
      }

      // 处理带前缀的属性键
      const cleanKey = propertyKey.startsWith(':') ? propertyKey.slice(1) : propertyKey;
      const keysToTry = [propertyKey, `:${cleanKey}`, cleanKey];
      
      for (const key of keysToTry) {
        const value = block.properties[key];
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            // 尝试多种可能的标题键名
            if (value['title']) return value['title'];
            if (value['block/title']) return value['block/title'];
            if (value[':block/title']) return value[':block/title'];
          }
          return String(value);
        }
      }
      
      return undefined;
    } catch (error) {
      logger.warn('[MilestoneQuery] Failed to get block property value:', error);
      return undefined;
    }
  }

  /**
   * 执行带过滤条件的查询
   */
  static async query(
    config: {
      filterTag?: string;
      property?: string;
      filterPropKey?: string;
      milestonePropKey?: string;
      milestoneList?: string[];
      dateField?: string;
      currentBlockUuid?: string;
    }
  ): Promise<MilestoneData> {
    const { filterTag, property, filterPropKey, milestonePropKey, milestoneList, dateField = 'scheduled', currentBlockUuid } = config;
    
    // 格式化属性键
    const formattedFilterPropKey = this.formatPropertyKey(filterPropKey);
    const formattedMilestonePropKey = this.formatPropertyKey(milestonePropKey);
    
    // 如果有 filterPropKey，尝试从当前 block 获取属性值
    let filterPropValue: string | undefined;
    if (formattedFilterPropKey && currentBlockUuid) {
      filterPropValue = await this.getCurrentBlockPropertyValue(currentBlockUuid, formattedFilterPropKey);
    }

    try {
      // 优先使用 milestonePropKey 模式
      if (formattedMilestonePropKey) {
        if (formattedFilterPropKey && filterPropValue) {
          return await this.queryByMilestonePropWithFilter(formattedMilestonePropKey, formattedFilterPropKey, filterPropValue, filterTag, milestoneList, dateField);
        }
        if (filterTag) {
          return await this.queryByMilestonePropWithTag(formattedMilestonePropKey, filterTag, milestoneList, dateField);
        }
        return await this.queryByMilestoneProp(formattedMilestonePropKey, milestoneList, dateField);
      }

      if (milestoneList && milestoneList.length > 0) {
        if (formattedFilterPropKey && filterPropValue) {
          return await this.queryByMilestoneListWithProperty(milestoneList, filterTag, formattedFilterPropKey, filterPropValue, dateField, formattedMilestonePropKey);
        }
        return await this.queryByMilestoneList(milestoneList, filterTag, dateField, formattedMilestonePropKey);
      }

      if (property) {
        return await this.queryByPropertyEnum(property, filterTag, dateField, formattedMilestonePropKey);
      }

      if (filterTag) {
        return await this.queryByTag(filterTag, dateField, formattedMilestonePropKey);
      }

      return await this.queryDefault(dateField);
    } catch (error) {
      logger.error('[MilestoneQuery] Query failed:', error);
      return this.createEmptyData();
    }
  }

  /**
   * 通过 milestonePropKey 读取里程碑节点，带属性过滤
   */
  private static async queryByMilestonePropWithFilter(
    milestonePropKey: string,
    filterPropKey: string,
    filterPropValue: string,
    filterTag: string | undefined,
    milestoneList: string[] | undefined,
    dateField: string = 'scheduled'
  ): Promise<MilestoneData> {
    const targetBlocks = await this.getBlocksByProperty(filterPropKey, filterPropValue, filterTag, milestonePropKey);
    
    if (targetBlocks.length === 0) {
      return milestoneList ? {
        items: milestoneList.map(stage => ({
          id: `milestone-${stage}`,
          label: stage,
          status: 'pending' as const,
          progress: 0,
          date: null,
        })),
        totalCount: milestoneList.length,
        completedCount: 0,
        pendingCount: milestoneList.length,
        overallProgress: 0,
      } : this.createEmptyData();
    }

    // 从块中提取里程碑节点
    const stageMap = new Map<string, BlockWithProperty[]>();
    
    for (const block of targetBlocks) {
      const stageValue = this.getBlockPropertyValue(block, milestonePropKey);
      if (stageValue) {
        if (!stageMap.has(stageValue)) {
          stageMap.set(stageValue, []);
        }
        stageMap.get(stageValue)!.push(block);
      }
    }

    // 确定最终的节点列表
    let stages: string[];
    if (milestoneList && milestoneList.length > 0) {
      stages = milestoneList;
    } else {
      stages = Array.from(stageMap.keys());
    }

    const items: MilestoneItem[] = [];
    
    // 处理每个节点，应用"已跳过"逻辑
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const blocks = stageMap.get(stage) || [];
      
      let status: MilestoneStatus = 'pending';
      let progress = 0;
      let date: string | null = null;

      if (blocks.length > 0) {
        status = StatusCalculator.calculateFromBlocks(blocks, dateField);
        progress = StatusCalculator.calculateProgress(blocks, dateField);
        date = StatusCalculator.getScheduledDate(blocks, dateField);
      } else {
        // 检查是否存在后续已完成的阶段
        for (let j = i + 1; j < stages.length; j++) {
          const laterStage = stages[j];
          const laterBlocks = stageMap.get(laterStage) || [];
          if (laterBlocks.length > 0) {
            const laterStatus = StatusCalculator.calculateFromBlocks(laterBlocks, dateField);
            if (laterStatus === 'completed') {
              status = 'skipped';
              break;
            }
          }
        }
      }

      items.push({
        id: `milestone-${stage}`,
        label: stage,
        status,
        progress,
        date,
        blockId: blocks[0]?.id,
        blockUuid: blocks[0]?.uuid,
      });
    }

    return {
      items,
      totalCount: items.length,
      completedCount: items.filter(i => i.status === 'completed').length,
      inProgressCount: items.filter(i => i.status === 'in_progress').length,
      pendingCount: items.filter(i => i.status === 'pending').length,
      skippedCount: items.filter(i => i.status === 'skipped').length,
      overallProgress: this.calculateOverallProgress(items),
    };
  }

  /**
   * 通过 milestonePropKey 读取里程碑节点，带标签过滤
   */
  private static async queryByMilestonePropWithTag(
    milestonePropKey: string,
    filterTag: string,
    milestoneList: string[] | undefined,
    dateField: string = 'scheduled'
  ): Promise<MilestoneData> {
    const targetBlocks = await this.getBlocksByTag(filterTag, milestonePropKey);
    
    if (targetBlocks.length === 0) {
      return milestoneList ? {
        items: milestoneList.map(stage => ({
          id: `milestone-${stage}`,
          label: stage,
          status: 'pending' as const,
          progress: 0,
          date: null,
        })),
        totalCount: milestoneList.length,
        completedCount: 0,
        pendingCount: milestoneList.length,
        overallProgress: 0,
      } : this.createEmptyData();
    }

    // 从块中提取里程碑节点
    const stageMap = new Map<string, BlockWithProperty[]>();
    
    for (const block of targetBlocks) {
      const stageValue = this.getBlockPropertyValue(block, milestonePropKey);
      if (stageValue) {
        if (!stageMap.has(stageValue)) {
          stageMap.set(stageValue, []);
        }
        stageMap.get(stageValue)!.push(block);
      }
    }

    // 确定最终的节点列表
    let stages: string[];
    if (milestoneList && milestoneList.length > 0) {
      stages = milestoneList;
    } else {
      stages = Array.from(stageMap.keys());
    }

    const items: MilestoneItem[] = [];
    
    // 处理每个节点，应用"已跳过"逻辑
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const blocks = stageMap.get(stage) || [];
      
      let status: MilestoneStatus = 'pending';
      let progress = 0;
      let date: string | null = null;

      if (blocks.length > 0) {
        status = StatusCalculator.calculateFromBlocks(blocks, dateField);
        progress = StatusCalculator.calculateProgress(blocks, dateField);
        date = StatusCalculator.getScheduledDate(blocks, dateField);
      } else {
        // 检查是否存在后续已完成的阶段
        for (let j = i + 1; j < stages.length; j++) {
          const laterStage = stages[j];
          const laterBlocks = stageMap.get(laterStage) || [];
          if (laterBlocks.length > 0) {
            const laterStatus = StatusCalculator.calculateFromBlocks(laterBlocks, dateField);
            if (laterStatus === 'completed') {
              status = 'skipped';
              break;
            }
          }
        }
      }

      items.push({
        id: `milestone-${stage}`,
        label: stage,
        status,
        progress,
        date,
        blockId: blocks[0]?.id,
        blockUuid: blocks[0]?.uuid,
      });
    }

    return {
      items,
      totalCount: items.length,
      completedCount: items.filter(i => i.status === 'completed').length,
      inProgressCount: items.filter(i => i.status === 'in_progress').length,
      pendingCount: items.filter(i => i.status === 'pending').length,
      skippedCount: items.filter(i => i.status === 'skipped').length,
      overallProgress: this.calculateOverallProgress(items),
    };
  }

  /**
   * 通过 milestonePropKey 读取里程碑节点
   */
  private static async queryByMilestoneProp(
    milestonePropKey: string,
    milestoneList: string[] | undefined,
    dateField: string = 'scheduled'
  ): Promise<MilestoneData> {
    // 获取所有有这个属性的块
    const targetBlocks = await this.getBlocksWithProperty(milestonePropKey);
    
    if (targetBlocks.length === 0) {
      return milestoneList ? {
        items: milestoneList.map(stage => ({
          id: `milestone-${stage}`,
          label: stage,
          status: 'pending' as const,
          progress: 0,
          date: null,
        })),
        totalCount: milestoneList.length,
        completedCount: 0,
        pendingCount: milestoneList.length,
        overallProgress: 0,
      } : this.createEmptyData();
    }

    // 从块中提取里程碑节点
    const stageMap = new Map<string, BlockWithProperty[]>();
    
    for (const block of targetBlocks) {
      const stageValue = this.getBlockPropertyValue(block, milestonePropKey);
      if (stageValue) {
        if (!stageMap.has(stageValue)) {
          stageMap.set(stageValue, []);
        }
        stageMap.get(stageValue)!.push(block);
      }
    }

    // 确定最终的节点列表
    let stages: string[];
    if (milestoneList && milestoneList.length > 0) {
      stages = milestoneList;
    } else {
      // 从属性值中获取所有可能的节点
      stages = await this.getDistinctPropertyValues(milestonePropKey);
    }

    const items: MilestoneItem[] = [];
    
    // 处理每个节点，应用"已跳过"逻辑
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const blocks = stageMap.get(stage) || [];
      
      let status: MilestoneStatus = 'pending';
      let progress = 0;
      let date: string | null = null;

      if (blocks.length > 0) {
        status = StatusCalculator.calculateFromBlocks(blocks, dateField);
        progress = StatusCalculator.calculateProgress(blocks, dateField);
        date = StatusCalculator.getScheduledDate(blocks, dateField);
      } else {
        // 检查是否存在后续已完成的阶段
        for (let j = i + 1; j < stages.length; j++) {
          const laterStage = stages[j];
          const laterBlocks = stageMap.get(laterStage) || [];
          if (laterBlocks.length > 0) {
            const laterStatus = StatusCalculator.calculateFromBlocks(laterBlocks, dateField);
            if (laterStatus === 'completed') {
              status = 'skipped';
              break;
            }
          }
        }
      }

      items.push({
        id: `milestone-${stage}`,
        label: stage,
        status,
        progress,
        date,
        blockId: blocks[0]?.id,
        blockUuid: blocks[0]?.uuid,
      });
    }

    return {
      items,
      totalCount: items.length,
      completedCount: items.filter(i => i.status === 'completed').length,
      inProgressCount: items.filter(i => i.status === 'in_progress').length,
      pendingCount: items.filter(i => i.status === 'pending').length,
      skippedCount: items.filter(i => i.status === 'skipped').length,
      overallProgress: this.calculateOverallProgress(items),
    };
  }

  /**
   * 获取块属性值
   */
  private static getBlockPropertyValue(block: BlockWithProperty, propertyK: string): string | null {
    // 处理带或不带冒号的属性名
    const cleanKey = propertyK.startsWith(':') ? propertyK.slice(1) : propertyK;
    const keys = [propertyK, `:${cleanKey}`, cleanKey];
    
    for (const key of keys) {
      const value = block.properties?.[key];
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          // 尝试多种可能的标题键名
          if (value['title']) return value['title'];
          if (value['block/title']) return value['block/title'];
          if (value[':block/title']) return value[':block/title'];
        }
        return String(value);
      }
    }
    return null;
  }

  /**
   * 获取所有有特定属性的块
   */
  private static async getBlocksWithProperty(propertyK: string): Promise<BlockWithProperty[]> {
    if (!logseqAPI) {
      logger.warn('[MilestoneQuery] Logseq API not initialized');
      return [];
    }

    const cleanKey = propertyK.startsWith(':') ? propertyK.slice(1) : propertyK;
    
    const query = `[:find (pull ?b [* {:${cleanKey} [*]}])
                    :where
                    [?b :${cleanKey}]]`;

    try {
      const result = await logseqAPI.DB.datascriptQuery(query);
      return this.parseBlocksResult(result);
    } catch (error) {
      logger.error('[MilestoneQuery] getBlocksWithProperty failed:', error);
      return [];
    }
  }

  /**
   * 获取某个属性的所有不同值
   */
  private static async getDistinctPropertyValues(propertyK: string): Promise<string[]> {
    if (!logseqAPI) {
      logger.warn('[MilestoneQuery] Logseq API not initialized');
      return [];
    }

    const cleanKey = propertyK.startsWith(':') ? propertyK.slice(1) : propertyK;
    
    const query = `[:find (pull ?val [:block/title :db/id])
                    :where
                    [_ :${cleanKey} ?val]]`;

    try {
      const result = await logseqAPI.DB.datascriptQuery(query);
      const values: string[] = [];
      
      for (const row of result) {
        if (row && Array.isArray(row)) {
          for (const item of row) {
            if (item && item['block/title']) {
              values.push(item['block/title']);
            } else if (item && typeof item === 'string') {
              values.push(item);
            }
          }
        }
      }
      
      // 去重并排序
      return Array.from(new Set(values)).sort();
    } catch (error) {
      logger.error('[MilestoneQuery] getDistinctPropertyValues failed:', error);
      return [];
    }
  }

  /**
   * 通过标签获取块
   */
  private static async getBlocksByTag(
    tag: string,
    milestonePropKey?: string
  ): Promise<BlockWithProperty[]> {
    if (!logseqAPI) {
      return [];
    }

    const pullSpec = milestonePropKey 
      ? `[* {${milestonePropKey} [:block/title]}]` 
      : `[*]`;

    const query = `[:find (pull ?b ${pullSpec})
                    :where
                    [?b :block/tags ?t]
                    [?t :block/title "${tag}"]]`;

    try {
      const result = await logseqAPI.DB.datascriptQuery(query);
      return this.parseBlocksResult(result);
    } catch (error) {
      logger.error('[MilestoneQuery] getBlocksByTag failed:', error);
      return [];
    }
  }

  /**
   * 根据里程碑列表 + 标签 + 属性过滤查询
   */
  private static async queryByMilestoneListWithProperty(
    milestoneList: string[],
    filterTag: string | undefined,
    filterPropKey: string,
    filterPropValue: string,
    dateField: string = 'scheduled',
    milestonePropKey?: string
  ): Promise<MilestoneData> {
    const items: MilestoneItem[] = [];
    const hasBlocksForStage: Record<string, boolean> = {};

    const targetBlocks = await this.getBlocksByProperty(filterPropKey, filterPropValue, filterTag, milestonePropKey);
    
    if (targetBlocks.length === 0) {
      return {
        items: milestoneList.map(stage => ({
          id: `milestone-${stage}`,
          label: stage,
          status: 'pending' as const,
          progress: 0,
          date: null,
        })),
        totalCount: milestoneList.length,
        completedCount: 0,
        pendingCount: milestoneList.length,
        overallProgress: 0,
      };
    }

    // 第一遍：先收集所有阶段的块信息
    for (const stage of milestoneList) {
      const blocks = await this.getBlocksByStageAndParent(stage, targetBlocks, milestonePropKey);
      hasBlocksForStage[stage] = blocks.length > 0;
    }

    // 第二遍：应用"已跳过"逻辑
    for (let i = 0; i < milestoneList.length; i++) {
      const stage = milestoneList[i];
      const blocks = await this.getBlocksByStageAndParent(stage, targetBlocks, milestonePropKey);
      
      let status: MilestoneStatus = 'pending';
      let progress = 0;
      let date: string | null = null;

      if (blocks.length > 0) {
        status = StatusCalculator.calculateFromBlocks(blocks, dateField);
        progress = StatusCalculator.calculateProgress(blocks, dateField);
        date = StatusCalculator.getScheduledDate(blocks, dateField);
      } else {
        // 检查是否存在后续已完成的阶段
        for (let j = i + 1; j < milestoneList.length; j++) {
          const laterStage = milestoneList[j];
          const laterBlocks = await this.getBlocksByStageAndParent(laterStage, targetBlocks);
          if (laterBlocks.length > 0) {
            const laterStatus = StatusCalculator.calculateFromBlocks(laterBlocks, dateField);
            if (laterStatus === 'completed') {
              status = 'skipped';
              break;
            }
          }
        }
      }

      items.push({
        id: `milestone-${stage}`,
        label: stage,
        status,
        progress,
        date,
        blockId: blocks[0]?.id,
        blockUuid: blocks[0]?.uuid,
      });
    }

    return {
      items,
      totalCount: items.length,
      completedCount: items.filter(i => i.status === 'completed').length,
      inProgressCount: items.filter(i => i.status === 'in_progress').length,
      pendingCount: items.filter(i => i.status === 'pending').length,
      skippedCount: items.filter(i => i.status === 'skipped').length,
      overallProgress: this.calculateOverallProgress(items),
    };
  }

  /**
   * 根据属性键名和属性值获取块
   */
  private static async getBlocksByProperty(
    filterPropKey: string,
    filterPropValue: string,
    filterTag?: string,
    milestonePropKey?: string
  ): Promise<BlockWithProperty[]> {
    if (!logseqAPI) {
      logger.warn('[MilestoneQuery] Logseq API not initialized');
      return [];
    }

    const formattedKey = filterPropKey.startsWith(':') ? filterPropKey.slice(1) : filterPropKey;

    const pullSpec = milestonePropKey 
      ? `[* {${milestonePropKey} [:block/title]}]` 
      : `[*]`;

    let query = `[:find (pull ?b ${pullSpec})
                    :where
                    [?b :${formattedKey} ?val]
                    [?val :block/title "${filterPropValue}"]]`;

    if (filterTag) {
      query = `[:find (pull ?b ${pullSpec})
                :where
                [?b :${formattedKey} ?val]
                [?val :block/title "${filterPropValue}"]
                [?b :block/tags ?t]
                [?t :block/title "${filterTag}"]]`;
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
    parentBlocks: BlockWithProperty[],
    milestonePropKey?: string
  ): Promise<BlockWithProperty[]> {
    if (!logseqAPI) {
      return [];
    }

    const parentUuids = parentBlocks.map(b => b.uuid).filter(Boolean);
    
    if (parentUuids.length === 0) {
      return [];
    }

    const pullSpec = milestonePropKey 
      ? `[* {${milestonePropKey} [:block/title]}]` 
      : `[*]`;

    const parentIdPattern = parentUuids.map(uuid => `["${uuid}"]`).join(' | ');
    const query = `[:find (pull ?child ${pullSpec})
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
   * 根据里程碑列表 + 标签查询
   */
  private static async queryByMilestoneList(
    milestoneList: string[],
    filterTag: string | undefined,
    dateField: string = 'scheduled',
    milestonePropKey?: string
  ): Promise<MilestoneData> {
    const items: MilestoneItem[] = [];

    // 第一遍：先收集所有阶段的块信息
    const stageBlocksMap: Map<string, BlockWithProperty[]> = new Map();
    for (const stage of milestoneList) {
      const blocks = await this.getBlocksByStage(stage, filterTag, milestonePropKey);
      stageBlocksMap.set(stage, blocks);
    }

    // 第二遍：应用"已跳过"逻辑
    for (let i = 0; i < milestoneList.length; i++) {
      const stage = milestoneList[i];
      const blocks = stageBlocksMap.get(stage) || [];
      
      let status: MilestoneStatus = 'pending';
      let progress = 0;
      let date: string | null = null;

      if (blocks.length > 0) {
        status = StatusCalculator.calculateFromBlocks(blocks, dateField);
        progress = StatusCalculator.calculateProgress(blocks, dateField);
        date = StatusCalculator.getScheduledDate(blocks, dateField);
      } else {
        // 检查是否存在后续已完成的阶段
        for (let j = i + 1; j < milestoneList.length; j++) {
          const laterStage = milestoneList[j];
          const laterBlocks = stageBlocksMap.get(laterStage) || [];
          if (laterBlocks.length > 0) {
            const laterStatus = StatusCalculator.calculateFromBlocks(laterBlocks, dateField);
            if (laterStatus === 'completed') {
              status = 'skipped';
              break;
            }
          }
        }
      }

      items.push({
        id: `milestone-${stage}`,
        label: stage,
        status,
        progress,
        date,
        blockId: blocks[0]?.id,
        blockUuid: blocks[0]?.uuid,
      });
    }

    return {
      items,
      totalCount: items.length,
      completedCount: items.filter(i => i.status === 'completed').length,
      inProgressCount: items.filter(i => i.status === 'in_progress').length,
      pendingCount: items.filter(i => i.status === 'pending').length,
      skippedCount: items.filter(i => i.status === 'skipped').length,
      overallProgress: this.calculateOverallProgress(items),
    };
  }

  /**
   * 根据阶段关键词 + 标签获取对应块
   */
  private static async getBlocksByStage(
    stage: string,
    filterTag?: string,
    milestonePropKey?: string
  ): Promise<BlockWithProperty[]> {
    if (!logseqAPI) {
      return [];
    }

    const pullSpec = milestonePropKey 
      ? `[* {${milestonePropKey} [:block/title]}]` 
      : `[*]`;

    let query = `[:find (pull ?b ${pullSpec}) :where
                  [?b :block/content ?c]
                  [(clojure.string/includes? ?c "${stage}")]]`;
    
    if (filterTag) {
      query = `[:find (pull ?b ${pullSpec}) :where
                [?b :block/content ?c]
                [(clojure.string/includes? ?c "${stage}")]
                [?b :block/tags ?t]
                [?t :block/title "${filterTag}"]]`;
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
    tag?: string,
    milestonePropKey?: string
  ): Promise<BlockWithProperty[]> {
    if (!logseqAPI) {
      return [];
    }

    const pullSpec = milestonePropKey 
      ? `[* {${milestonePropKey} [:block/title]}]` 
      : `[*]`;

    let query = `[:find (pull ?b ${pullSpec}) :where
                  [?b :block/content ?c]
                  [(clojure.string/includes? ?c "${label}")]]`;
    
    if (tag) {
      query = `[:find (pull ?b ${pullSpec}) :where
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
      blockId: enumItem.blocks[0]?.id,
      blockUuid: enumItem.blocks[0]?.uuid,
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
    dateField: string = 'scheduled',
    milestonePropKey?: string
  ): Promise<MilestoneData> {
    if (!logseqAPI) {
      return this.createEmptyData();
    }

    const pullSpec = milestonePropKey 
      ? `[* {${milestonePropKey} [:block/title]}]` 
      : `[*]`;

    const query = `[:find (pull ?b ${pullSpec})
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

        // 从 item.properties 初始化，并收集所有 :user.property/ 和 :logseq.property/ 前缀的属性
        const properties: { [key: string]: any } = { ...(item.properties || {}) };
        
        // 遍历 item 的所有 key，收集带 :user.property/ 或 :logseq.property/ 前缀的属性
        for (const key of Object.keys(item)) {
          if (key.startsWith(':user.property/') || key.startsWith(':logseq.property/')) {
            properties[key] = item[key];
          }
        }

        blocks.push({
          id: item.id?.toString() || '',
          uuid: item.uuid || '',
          content: item.content || item['block/title'] || item[':block/title'] || '',
          properties,
          createdAt: item['created-at'] || item[':block/created-at'] || '',
          updatedAt: item['updated-at'] || item[':block/updated-at'] || '',
          scheduled: item['scheduled'] || item['block/scheduled'] || item[':logseq.property/scheduled'] || '',
          deadline: item['deadline'] || item['block/deadline'] || item[':logseq.property/deadline'] || '',
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
          blockId: groupBlocks[0]?.id,
          blockUuid: groupBlocks[0]?.uuid,
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
      blockId: block.id,
      blockUuid: block.uuid,
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
        
        // 从 item.properties 初始化，并收集所有 :user.property/ 和 :logseq.property/ 前缀的属性
        const properties: { [key: string]: any } = { ...(item.properties || {}) };
        
        // 遍历 item 的所有 key，收集带 :user.property/ 或 :logseq.property/ 前缀的属性
        for (const key of Object.keys(item)) {
          if (key.startsWith(':user.property/') || key.startsWith(':logseq.property/')) {
            properties[key] = item[key];
          }
        }
        
        blocks.push({
          id: item.id?.toString() || '',
          uuid: item.uuid || '',
          content: item.content || item['block/title'] || item[':block/title'] || '',
          properties,
          createdAt: item['created-at'] || item[':block/created-at'] || '',
          updatedAt: item['updated-at'] || item[':block/updated-at'] || '',
          scheduled: item['scheduled'] || item['block/scheduled'] || item[':logseq.property/scheduled'] || '',
          deadline: item['deadline'] || item['block/deadline'] || item[':logseq.property/deadline'] || '',
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
