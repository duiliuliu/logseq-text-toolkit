/**
 * 🎯 GoalManager - 目标管理核心
 *
 * 功能：
 *   1. 从 Settings 加载预定义目标模板（id → Goal 映射）
 *   2. 自动检测项目根节点（当前 block 的子节点 / 同命名页面）
 *   3. 从 milestonePropKey 动态推断子里程碑
 *   4. 调用 ProgressEngine 汇总进度
 */

import type { Goal, GoalRendererConfig, GoalSummary, GoalMilestone } from './types';
import { ProgressEngine } from './ProgressEngine';
import { MilestoneQuery } from '../milestone/query';
import type { BlockWithProperty } from '../milestone/types';
import { getSettingsWithSystem } from '../../settings';
import logger from '../logger';

export interface DetectOptions {
  /** 当前 block 的 UUID（宏命令所在位置） */
  currentBlockUuid?: string;
  /** 里程碑属性键（如 :user.property/milestone-stage） */
  milestonePropKey?: string;
  /** 标签过滤（如 "项目A"） */
  filterTag?: string;
  /** 属性键过滤（如 :user.property/company） */
  filterPropKey?: string;
  /** 属性值过滤（如 "Web3"） */
  filterPropValue?: string;
  /** 里程碑权重（如 {"设计": 0.2, "开发": 0.5}） */
  weights?: Record<string, number>;
}

export class GoalManager {
  // ------------------------------------------------------------------
  // 1. 加载预定义目标
  // ------------------------------------------------------------------

  static async loadGoalTemplates(): Promise<Goal[]> {
    const settings = await getSettingsWithSystem();
    const goals = settings?.goal?.goals || [];
    return goals;
  }

  static async findGoalById(id: string): Promise<Goal | undefined> {
    const goals = await this.loadGoalTemplates();
    return goals.find(g => g.id === id);
  }

  // ------------------------------------------------------------------
  // 2. 自动检测项目根节点，推断子里程碑
  // ------------------------------------------------------------------

  /**
   * 从块属性动态推断里程碑列表：
   *   - 查询所有满足 filterTag / filterPropKey=filterPropValue 条件的块
   *   - 从这些块中读取 milestonePropKey 属性值
   *   - 去重得到里程碑集合（按出现顺序）
   */
  static async detectMilestones(opts: DetectOptions): Promise<GoalMilestone[]> {
    const { milestonePropKey, filterTag, filterPropKey, weights } = opts;
    if (!milestonePropKey && !filterTag) {
      return [];
    }

    try {
      const data = await MilestoneQuery.query({
        filterTag,
        filterPropKey,
        milestonePropKey,
      });

      // 收集块属性中出现的里程碑节点，去重
      const seen = new Set<string>();
      const items: GoalMilestone[] = [];

      for (const item of data.items) {
        const label = item.label;
        if (!label || seen.has(label)) continue;
        seen.add(label);
        items.push({
          id: label,
          label,
          weight: weights?.[label],
          status: item.status,
          progress: item.progress,
        });
      }

      logger.info('[GoalManager] 自动推断里程碑', {
        count: items.length,
        milestones: items.map(i => i.label),
      });

      return items;
    } catch (err) {
      logger.error('[GoalManager] detectMilestones failed', err);
      return [];
    }
  }

  // ------------------------------------------------------------------
  // 3. 构建目标（预定义模板 + 动态推断混合）
  // ------------------------------------------------------------------

  static async buildGoalFromRendererConfig(
    config: GoalRendererConfig,
    currentBlockUuid?: string,
  ): Promise<Goal> {
    // 优先：用户指定了 goalId，尝试从预定义模板加载
    if (config.goalId) {
      const template = await this.findGoalById(config.goalId);
      if (template) {
        logger.info('[GoalManager] 命中预定义目标模板', {
          id: template.id,
          milestones: template.milestones.length,
        });
        return template;
      }
    }

    // 次优先：用户指定了 milestoneList（静态列表模式）
    if (config.milestoneList && config.milestoneList.length) {
      const list = config.milestoneList;
      const milestones: GoalMilestone[] = list.map((label, idx) => ({
        id: `m_${idx}`,
        label,
        weight: config.weights?.[label],
      }));
      return {
        id: 'inline',
        title: list[0] || '目标',
        milestones,
      };
    }

    // 默认：从块属性动态推断里程碑
    const milestones = await this.detectMilestones({
      currentBlockUuid,
      milestonePropKey: config.milestonePropKey,
      filterTag: config.filterTag,
      filterPropKey: config.filterPropKey,
      weights: config.weights,
    });

    return {
      id: 'auto',
      title: config.filterTag || '自动检测目标',
      milestones,
    };
  }

  // ------------------------------------------------------------------
  // 4. 汇总目标进度（对外 API）
  // ------------------------------------------------------------------

  static async computeGoalSummary(
    goal: Goal,
    opts: DetectOptions = {},
  ): Promise<GoalSummary> {
    // 查询每个里程碑关联的块，以便精细进度计算
    const blocksMap = new Map<string, BlockWithProperty[]>();
    try {
      const data = await MilestoneQuery.query({
        filterTag: opts.filterTag,
        filterPropKey: opts.filterPropKey,
        milestonePropKey: opts.milestonePropKey,
      });

      // 按 label 分组
      for (const item of data.items) {
        const label = item.label;
        const arr = blocksMap.get(label) || [];
        if (item.blockUuid) {
          arr.push({
            id: item.id || item.blockUuid,
            uuid: item.blockUuid,
            content: item.label,
            properties: {},
            createdAt: '',
            updatedAt: '',
          });
        }
        blocksMap.set(label, arr);
      }
    } catch (err) {
      logger.warn('[GoalManager] 块查询失败，降级为纯状态进度', err);
    }

    return ProgressEngine.computeGoalSummary(goal, blocksMap);
  }
}
