/**
 * 🎯 Goal 目标追踪系统 - 对外 API
 *
 * 基础用法：
 *   const goal = await GoalManager.buildGoalFromRendererConfig(config, blockUuid);
 *   const summary = await GoalManager.computeGoalSummary(goal, opts);
 */

export * from './types';
export { ProgressEngine } from './ProgressEngine';
export { GoalManager } from './GoalManager';
