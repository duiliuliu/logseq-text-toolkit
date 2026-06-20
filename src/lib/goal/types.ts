/**
 * 🎯 Goal 目标追踪系统 - 核心类型
 *
 * 架构：
 *   Goal (目标) ─ 多个 Milestone (里程碑，可带权重)
 *     每个 Milestone ─ 关联多个 Task (通过 milestonePropKey 属性识别)
 *
 * 两种配置方式：
 *   A. 属性模式（推荐）：指定 milestonePropKey，自动从块属性推断里程碑
 *   B. 列表模式（传统）：显式给出 milestoneList = ["设计", "开发", "测试"]
 */

import type {
  MilestoneStatus,
  MilestoneDisplayStyle,
  MilestoneTooltipStyle,
} from '../milestone/types';

// =====================================================================
// Goal 核心类型
// =====================================================================

export interface Goal {
  /** 唯一 ID（可用 UUID 或 slug） */
  id: string;
  /** 目标标题 */
  title: string;
  /** 目标描述（可选） */
  description?: string;
  /** 截止日期（ISO string） */
  deadline?: string;
  /** 起始日期（ISO string） */
  startDate?: string;
  /** 组成此目标的里程碑 */
  milestones: GoalMilestone[];
  /** 关联的标签（用于查询过滤子任务） */
  tags?: string[];
  /** 创建时间 */
  createdAt?: string;
  /** 提醒配置 */
  reminders?: ReminderConfig[];
}

/** 目标中的一个里程碑 —— 带权重 */
export interface GoalMilestone {
  id: string;
  label: string;
  /** 权重（0~1），用于进度计算，默认为 1/N 均分 */
  weight?: number;
  /** 此里程碑关联的任务标识（用于匹配块属性值） */
  tagValue?: string;
  /** 期望日期 */
  dueDate?: string;
  /** 实际状态（运行时计算） */
  status?: MilestoneStatus;
  /** 0~1 的进度（运行时计算） */
  progress?: number;
}

export interface ReminderConfig {
  /** 距离 deadline 的天数，例如 7（提前 7 天提醒） */
  daysBefore: number;
  /** 是否已发送 */
  sent?: boolean;
}

// =====================================================================
// 目标汇总结果（运行时计算）
// =====================================================================

export interface GoalSummary {
  goal: Goal;
  /** 整体进度 0~1 */
  overallProgress: number;
  /** 已完成里程碑数 */
  completedMilestones: number;
  /** 总里程碑数 */
  totalMilestones: number;
  /** 各里程碑明细 */
  milestoneBreakdown: GoalMilestone[];
  /** 距离 deadline 的剩余天数（负数表示已逾期） */
  daysLeft: number | null;
  /** 状态 */
  status: 'on_track' | 'at_risk' | 'overdue' | 'completed';
}

// =====================================================================
// 宏命令配置类型（用于 renderer 参数解析
// =====================================================================

export interface GoalRendererConfig {
  /** 目标 ID（用于从 settings 中加载预定义目标） */
  goalId?: string;
  /** 显示样式 */
  displayStyle: MilestoneDisplayStyle;
  /** 提示样式 */
  tooltipStyle?: MilestoneTooltipStyle;
  /** 是否显示进度百分比 */
  showProgress?: boolean;
  /** 是否显示文字标签 */
  showLabel?: boolean;
  /** 里程碑标识属性键（从块属性读取） */
  milestonePropKey?: string;
  /** 手动静态里程碑列表 */
  milestoneList?: string[];
  /** 标签过滤 */
  filterTag?: string;
  /** 属性过滤（key=value） */
  filterPropKey?: string;
  /** 日期字段（scheduled / deadline 等） */
  dateField?: string;
  /** 权重配置，示例：{"设计": 0.2, "开发": 0.5, "测试": 0.3} */
  weights?: Record<string, number>;
}

export { MilestoneStatus };
