/**
 * 🎯 进度计算引擎 - 基于里程碑权重 & 任务状态
 *
 * 进度计算公式（加权平均）：
 *   overallProgress = Σ( milestone_i_progress × milestone_i_weight )
 *   其中 milestone_i_progress 根据其下任务状态计算：
 *     progress = completed_tasks / (completed + in_progress + todo)
 *     若无任务，则根据 milestone.status 给 0 / 0.5 / 1.0 的估算
 */

import type { Goal, GoalSummary, GoalMilestone } from './types';
import type { MilestoneStatus, BlockWithProperty } from '../milestone/types';

export class ProgressEngine {
  /** 根据 milestone 状态估算进度（无任务时 fallback） */
  static statusToProgress(status: MilestoneStatus | undefined): number {
    switch (status) {
      case 'completed':
        return 1;
      case 'in_progress':
        return 0.5;
      case 'pending':
      case undefined:
        return 0;
      case 'failed':
      case 'skipped':
        return 0;
      default:
        return 0;
    }
  }

  /** 从 milestone 关联的块列表计算进度 */
  static computeMilestoneProgressFromBlocks(
    _milestone: GoalMilestone,
    blocks: BlockWithProperty[],
  ): { progress: number; status: MilestoneStatus; completedCount: number; totalCount: number } {
    let completed = 0;
    let active = 0;
    let pending = 0;

    for (const b of blocks) {
      const content = (b.content || '').toLowerCase();
      const props = b.properties || {};
      const status = (props.status as string) || '';

      if (
        /done|完成|done已完成|✅/.test(content) ||
        status === 'done' ||
        status === 'completed'
      ) {
        completed++;
      } else if (
        /doing|进行中|in.progress|🟡|🔶/.test(content) ||
        status === 'doing' ||
        status === 'in_progress'
      ) {
        active++;
      } else {
        pending++;
      }
    }

    const total = completed + active + pending;
    const progress = total === 0 ? 0 : (completed + active * 0.5) / total;

    let status: MilestoneStatus = 'pending';
    if (total === 0) status = 'pending';
    else if (completed === total) status = 'completed';
    else if (completed + active > 0) status = 'in_progress';

    return { progress, status, completedCount: completed, totalCount: total };
  }

  /** 计算目标整体进度（支持权重） */
  static computeGoalSummary(
    goal: Goal,
    milestoneBlocksMap: Map<string, BlockWithProperty[]> = new Map(),
  ): GoalSummary {
    const breakdown: GoalMilestone[] = [];
    let totalWeight = 0;
    let weightedSum = 0;
    let completedMilestones = 0;

    for (const m of goal.milestones) {
      const blocks = milestoneBlocksMap.get(m.id) || [];
      const { progress, status } = blocks.length
        ? this.computeMilestoneProgressFromBlocks(m, blocks)
        : {
            progress: this.statusToProgress(m.status),
            status: (m.status || 'pending') as MilestoneStatus,
          };

      const weight = m.weight ?? 1 / goal.milestones.length;
      totalWeight += weight;
      weightedSum += progress * weight;

      if (progress >= 1) completedMilestones++;

      breakdown.push({
        ...m,
        status,
        progress,
      });
    }

    // 归一化（防止权重和不等于 1）
    const overall = totalWeight > 0 ? weightedSum / totalWeight : 0;

    // 日期相关
    let daysLeft: number | null = null;
    let status: GoalSummary['status'] = 'on_track';

    if (goal.deadline) {
      const now = new Date();
      const deadline = new Date(goal.deadline);
      const diffMs = deadline.getTime() - now.getTime();
      daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (overall >= 1) status = 'completed';
      else if (daysLeft < 0) status = 'overdue';
      else if (overall < 0.5 && daysLeft < 7) status = 'at_risk';
      else status = 'on_track';
    } else if (overall >= 1) {
      status = 'completed';
    }

    return {
      goal,
      overallProgress: overall,
      completedMilestones,
      totalMilestones: goal.milestones.length,
      milestoneBreakdown: breakdown,
      daysLeft,
      status,
    };
  }
}
