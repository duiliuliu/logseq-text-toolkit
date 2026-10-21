import type { SummaryData } from './types';

/**
 * 不依赖外部服务的本地洞察。
 * AI 未启用或调用失败时，Summary 仍然能给出可执行建议。
 */
export function buildLocalInsights(data: SummaryData): string[] {
  const insights: string[] = [];
  const { blocks, tasks, pages } = data;

  if (tasks.total === 0) {
    insights.push('本周期没有记录到任务；可以给需要跟踪的块添加 Task 标签或状态。');
  } else {
    if (tasks.overdue > 0) {
      insights.push(`有 ${tasks.overdue} 个任务已逾期，建议优先处理或重新安排日期。`);
    }
    if (tasks.completionRate >= 80) {
      insights.push(`任务完成率 ${tasks.completionRate}%，节奏良好，可以继续保持。`);
    } else if (tasks.completionRate < 60) {
      insights.push(`任务完成率 ${tasks.completionRate}%，建议减少并行任务，聚焦 1-2 个关键目标。`);
    }
    if (tasks.inProgress > tasks.completed && tasks.inProgress >= 3) {
      insights.push(`进行中任务有 ${tasks.inProgress} 个，存在并行过多风险，建议收敛在制品。`);
    }
    const highPriority = tasks.byPriority.high || tasks.byPriority.urgent || 0;
    if (highPriority > 0) {
      insights.push(`高优先级任务 ${highPriority} 个，建议先确认其中哪些必须在本周期完成。`);
    }
  }

  const topTags = Object.entries(blocks.tags)
    .sort((a, b) => b[1] - a[1])
    .filter(([tag]) => !['Task', 'Journal', 'Page'].includes(tag))
    .slice(0, 1);
  if (topTags.length > 0) {
    const [tag, count] = topTags[0];
    insights.push(`最活跃标签是「${tag}」（${count} 次），可以围绕它整理下一周期的重点。`);
  }

  if (blocks.total === 0) {
    insights.push('本周期没有新增或修改的块，可能处于休整期，或需要检查日期范围是否正确。');
  } else if (blocks.created > 0 && blocks.modified > blocks.created * 2) {
    insights.push('修改块数明显高于新建块数，说明本周期以整理和迭代为主。');
  }

  if (pages.newPages > 0) {
    insights.push(`本周期新增 ${pages.newPages} 个页面，建议检查是否有可以合并或归档的页面。`);
  }

  return insights.slice(0, 5);
}
