import { describe, expect, it } from 'vitest';
import { buildLocalInsights } from './insights';
import type { SummaryData } from './types';

function makeData(overrides: Partial<SummaryData> = {}): SummaryData {
  return {
    dateRange: {
      start: new Date(2026, 0, 1),
      end: new Date(2026, 0, 7),
    },
    blocks: {
      total: 10,
      created: 6,
      modified: 8,
      avgContentLength: 20,
      tags: { work: 5, Task: 3 },
      pages: { 'Page A': 2 },
    },
    tasks: {
      total: 4,
      completed: 2,
      inProgress: 1,
      todo: 1,
      overdue: 1,
      cancelled: 0,
      completionRate: 50,
      byPriority: { high: 2 },
    },
    pages: {
      total: 5,
      newPages: 2,
      modifiedPages: 3,
      byTag: {},
      byProperty: {},
    },
    ...overrides,
  };
}

describe('buildLocalInsights', () => {
  it('应该生成逾期、完成率、高优先级等洞察', () => {
    const insights = buildLocalInsights(makeData());
    const text = insights.join('\n');
    expect(text).toContain('逾期');
    expect(text).toContain('50%');
    expect(text).toContain('高优先级');
    expect(text).toContain('work');
  });

  it('没有任务时应该给出记录建议', () => {
    const data = makeData({
      tasks: {
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0,
        overdue: 0,
        cancelled: 0,
        completionRate: 0,
        byPriority: {},
      },
    });
    expect(buildLocalInsights(data).join('\n')).toContain('没有记录到任务');
  });

  it('没有块时应该提示检查日期范围', () => {
    const data = makeData({
      blocks: {
        total: 0,
        created: 0,
        modified: 0,
        avgContentLength: 0,
        tags: {},
      },
    });
    expect(buildLocalInsights(data).join('\n')).toContain('日期范围');
  });
});
