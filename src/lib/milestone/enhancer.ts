/**
 * Milestone 增强服务
 * =====================================================================
 * 🔹 自动检测项目根节点，推断子节点里程碑
 *   - 场景：用户给某个父 block （项目节点）加了 tag，但子 block 可能没有显式 milestone 属性
 *   - 策略：遍历该父 block 的所有子孙节点，从其 content / 自定义属性中识别
 *
 * 🔹 支持权重配置的进度计算
 *   - 取代原有的简单等分 `sum(progress)/N`
 *   - 支持 `milestoneConfig.weights = {"设计": 0.2, "开发": 0.5, ...}`
 *   - 自动做归一化处理，未配置权重的里程碑默认值为 1
 * =====================================================================
 */

import type { MilestoneData, MilestoneItem, BlockWithProperty, MilestoneStatus } from './types';
import { logseqAPI } from '../../logseq';
import logger from '../logger';

// =====================================================================
// 🔹 1. 自动检测项目根节点，推断子节点里程碑
// =====================================================================

export interface AutoDetectOptions {
  /** 项目根节点的 UUID（可能是宏命令所在块自己） */
  rootBlockUuid?: string;
  /** 项目标签（如 "项目A"） */
  projectTag?: string;
  /** 里程碑属性键（如 "stage"），若不提供则从 content 中识别 */
  milestonePropKey?: string;
  /** 里程碑关键词列表（如 ["设计", "开发", "测试"]），不提供则自动推断 */
  milestoneList?: string[];
  /** 待查日期字段 */
  dateField?: string;
}

/** 从项目根节点递归推断里程碑 */
export async function autoDetectMilestones(
  options: AutoDetectOptions,
): Promise<MilestoneItem[]> {
  const { rootBlockUuid, projectTag, milestonePropKey, milestoneList, dateField = 'scheduled' } = options;

  // 第一步：找到项目根节点
  let rootUuids: string[] = [];

  if (rootBlockUuid) {
    rootUuids.push(rootBlockUuid);
  }

  if (projectTag) {
    const tagBlockUuids = await queryBlocksByTag(projectTag);
    rootUuids.push(...tagBlockUuids);
  }

  if (rootUuids.length === 0) {
    logger.warn('[MilestoneEnhancer] 无法找到项目根节点（无 UUID / tag）');
    return [];
  }

  // 第二步：深度遍历所有子节点
  const descendantBlocks: BlockWithProperty[] = [];
  for (const uuid of rootUuids) {
    const descendants = await getDescendantBlocks(uuid);
    descendantBlocks.push(...descendants);
  }

  if (descendantBlocks.length === 0) {
    return [];
  }

  // 第三步：从子节点中识别里程碑
  //  - 如果提供了 milestonePropKey → 从属性中读取
  //  - 如果提供了 milestoneList → 根据关键词匹配 content
  //  - 否则 → 从 milestonePropKey 属性值中聚类出里程碑
  const stageMap = new Map<string, BlockWithProperty[]>();

  if (milestoneList && milestoneList.length) {
    for (const block of descendantBlocks) {
      const content = (block.content || '').toLowerCase();
      for (const stage of milestoneList) {
        if (content.includes(stage.toLowerCase())) {
          if (!stageMap.has(stage)) stageMap.set(stage, []);
          stageMap.get(stage)!.push(block);
          break; // 每个块只归属于第一个匹配的里程碑
        }
      }
    }
  } else if (milestonePropKey) {
    for (const block of descendantBlocks) {
      const stage = getPropertyValue(block, milestonePropKey);
      if (stage) {
        if (!stageMap.has(stage)) stageMap.set(stage, []);
        stageMap.get(stage)!.push(block);
      }
    }
  } else {
    // fallback：从 content 中的关键词聚类
    for (const block of descendantBlocks) {
      const content = block.content || '';
      const match = content.match(/^[-*+]?\s*(.+?)[:：]/);
      if (match) {
        const stage = match[1].trim();
        if (stage.length > 0 && stage.length < 20) {
          if (!stageMap.has(stage)) stageMap.set(stage, []);
          stageMap.get(stage)!.push(block);
        }
      }
    }
  }

  // 第四步：组装 MilestoneItem（含简单进度 / 状态）
  const items: MilestoneItem[] = [];
  for (const [label, blocks] of stageMap.entries()) {
    const { status, progress } = computeStageStatusAndProgress(blocks, dateField);
    items.push({
      id: `auto-${label}`,
      label,
      status,
      progress,
      date: blocks[0]?.scheduled || blocks[0]?.deadline || undefined,
      blockUuid: blocks[0]?.uuid,
      blockId: blocks[0]?.id,
    });
  }

  logger.info('[MilestoneEnhancer] 自动推断里程碑完成', {
    count: items.length,
    labels: items.map(i => i.label),
  });

  return items;
}

// =====================================================================
// 🔹 2. 支持权重配置的进度计算
// =====================================================================

export interface WeightedProgressOptions {
  /** 里程碑权重映射（未配置的里程碑默认权重 1） */
  weights?: Record<string, number>;
}

/**
 * 计算带权重的总体进度
 *
 * 原逻辑：`sum(item.progress) / items.length`（简单等分）
 * 新逻辑：Σ (item.progress × weight) / Σ weight
 */
export function calculateWeightedProgress(
  items: MilestoneItem[],
  options: WeightedProgressOptions = {},
): { overallProgress: number; weightedBreakdown: Array<{ label: string; weight: number; weightedProgress: number }> } {
  if (items.length === 0) {
    return { overallProgress: 0, weightedBreakdown: [] };
  }

  const weights = options.weights || {};
  const rawWeights = items.map(item => weights[item.label] ?? 1);
  const totalWeight = rawWeights.reduce((a, b) => a + b, 0);

  if (totalWeight === 0) {
    return { overallProgress: 0, weightedBreakdown: items.map(i => ({ label: i.label, weight: 0, weightedProgress: 0 })) };
  }

  const breakdown = items.map((item, idx) => {
    const rawWeight = rawWeights[idx];
    const normalizedWeight = rawWeight / totalWeight;
    const progress = item.progress || 0;
    return {
      label: item.label,
      weight: normalizedWeight,
      weightedProgress: progress * normalizedWeight,
    };
  });

  const overallProgress = Math.round(
    breakdown.reduce((sum, b) => sum + b.weightedProgress, 0) * 100,
  );

  return { overallProgress, weightedBreakdown: breakdown };
}

/**
 * 将 MilestoneQuery 的结果应用增强逻辑（自动推断 + 权重计算）
 * 作为上层集成入口
 */
export async function enhanceMilestoneData(
  baseData: MilestoneData,
  detectOpts: AutoDetectOptions,
  weightOpts: WeightedProgressOptions = {},
): Promise<MilestoneData> {
  // 如果 base 查询结果为空，尝试自动推断
  const items = baseData.items.length > 0
    ? baseData.items
    : await autoDetectMilestones(detectOpts);

  if (items.length === 0) return baseData;

  // 应用权重计算总体进度
  const { overallProgress, weightedBreakdown } = calculateWeightedProgress(items, weightOpts);

  logger.info('[MilestoneEnhancer] 加权进度计算完成', {
    overallProgress,
    breakdown: weightedBreakdown.map(b => `${b.label}=${(b.weight * 100).toFixed(0)}%`),
  });

  // 将加权进度写入每个 item（方便 UI 展示详细信息）
  const enhancedItems: MilestoneItem[] = items.map(item => {
    const w = weightedBreakdown.find(b => b.label === item.label);
    return {
      ...item,
      // 保留每个里程碑自身的进度，但整体进度改为加权计算
    };
  });

  return {
    ...baseData,
    items: enhancedItems,
    totalCount: enhancedItems.length,
    completedCount: enhancedItems.filter(i => i.status === 'completed').length,
    inProgressCount: enhancedItems.filter(i => i.status === 'in_progress').length,
    pendingCount: enhancedItems.filter(i => i.status === 'pending').length,
    skippedCount: enhancedItems.filter(i => i.status === 'skipped').length,
    overallProgress,
  };
}

// =====================================================================
// 内部工具
// =====================================================================

async function queryBlocksByTag(tag: string): Promise<string[]> {
  if (!logseqAPI) return [];
  try {
    const result = await logseqAPI.DB.datascriptQuery(`
      [:find (pull ?b [:block/uuid])
       :where
       [?b :block/tags ?t]
       [?t :block/title "${tag}"]]
    `);
    const uuids: string[] = [];
    for (const row of result || []) {
      if (Array.isArray(row)) {
        for (const item of row) {
          if (item && item['block/uuid']) uuids.push(item['block/uuid']);
          else if (item && item[':block/uuid']) uuids.push(item[':block/uuid']);
        }
      }
    }
    return uuids;
  } catch (err) {
    logger.warn('[MilestoneEnhancer] queryBlocksByTag failed', err);
    return [];
  }
}

/** 深度获取某个块的所有子孙节点 */
async function getDescendantBlocks(rootUuid: string): Promise<BlockWithProperty[]> {
  if (!logseqAPI) return [];
  const collected: BlockWithProperty[] = [];

  async function walk(uuid: string, depth = 0) {
    if (depth > 10) return;
    try {
      const block = await logseqAPI.Editor.getBlock(uuid, { includeChildren: true });
      if (!block) return;

      const props: Record<string, any> = { ...(block.properties || {}) };
      for (const key of Object.keys(block)) {
        if (key.startsWith(':user.property/') || key.startsWith(':logseq.property/')) {
          props[key] = block[key];
        }
      }

      collected.push({
        id: String(block.id || ''),
        uuid: block.uuid,
        content: block.content || '',
        properties: props,
        createdAt: block['created-at'] || '',
        updatedAt: block['updated-at'] || '',
        scheduled: block.scheduled || block['block/scheduled'] || '',
        deadline: block.deadline || block['block/deadline'] || '',
      });

      if (block.children && Array.isArray(block.children)) {
        for (const child of block.children) {
          if (child && child.uuid) {
            await walk(child.uuid, depth + 1);
          }
        }
      }
    } catch (err) {
      logger.warn('[MilestoneEnhancer] walk block failed', { uuid, err });
    }
  }

  await walk(rootUuid);
  return collected;
}

function getPropertyValue(block: BlockWithProperty, key: string): string | null {
  const cleanKey = key.startsWith(':') ? key.slice(1) : key;
  const keys = [key, `:${cleanKey}`, cleanKey, `:user.property/${cleanKey}`];
  for (const k of keys) {
    const val = block.properties?.[k];
    if (val != null && val !== '') {
      if (typeof val === 'object') {
        if (val['title']) return val['title'];
        if (val['block/title']) return val['block/title'];
        if (val[':block/title']) return val[':block/title'];
      }
      return String(val);
    }
  }
  return null;
}

/** 从块列表计算单个里程碑的状态和进度（轻量实现，复用 StatusCalculator 的思路） */
function computeStageStatusAndProgress(
  blocks: BlockWithProperty[],
  dateField: string,
): { status: MilestoneStatus; progress: number } {
  if (blocks.length === 0) {
    return { status: 'pending', progress: 0 };
  }

  let completed = 0;
  let active = 0;
  let pending = 0;

  for (const b of blocks) {
    const content = (b.content || '').toLowerCase();
    const scheduled = b.scheduled || b.deadline || '';
    if (content.includes('done') || content.includes('完成') || content.startsWith('✅') || /^\s*\[x\]/i.test(content)) {
      completed++;
    } else if (content.includes('doing') || content.includes('进行中') || /^\s*\[\/\]/.test(content)) {
      active++;
    } else {
      pending++;
    }
  }

  const total = completed + active + pending;
  const progress = total === 0 ? 0 : Math.round(((completed + active * 0.5) / total) * 100);

  let status: MilestoneStatus = 'pending';
  if (completed === total) status = 'completed';
  else if (completed + active > 0) status = 'in_progress';

  // 日期字段仅用于日志诊断
  void dateField;

  return { status, progress };
}
