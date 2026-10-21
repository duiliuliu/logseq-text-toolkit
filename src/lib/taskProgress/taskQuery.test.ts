/**
 * TaskProgress DB 查询适配测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  datascriptQuery: vi.fn(),
}));

vi.mock('../../logseq', () => ({
  logseqAPI: {
    DB: {
      datascriptQuery: mocks.datascriptQuery,
    },
  },
}));

vi.mock('../logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { calculateTaskProgress } from './taskQuery';

describe('TaskProgress DB 查询适配', () => {
  beforeEach(() => {
    mocks.datascriptQuery.mockReset();
  });

  it('应该使用 DB schema 的 title/status 字段', async () => {
    mocks.datascriptQuery.mockResolvedValue([
      [{
        uuid: 'b1',
        title: 'Task A',
        'logseq.property/status': { 'block/title': 'Done' },
      }],
      [{
        uuid: 'b2',
        title: 'Task B (tag only, no status)',
      }],
    ]);

    const progress = await calculateTaskProgress('parent-uuid', {
      nestingLevel: 1,
      onlyLeaves: false,
    });

    const query = mocks.datascriptQuery.mock.calls[0][0] as string;
    expect(query).toContain(':block/title');
    expect(query).toContain(':logseq.property/status');
    expect(query).not.toContain(':block/content');
    expect(query).not.toContain(':block/properties');
    expect(progress?.totalTasks).toBe(2);
    expect(progress?.completedTasks).toBe(1);
    expect(progress?.progress).toBe(50);
    expect(progress?.statusStats.find(item => item.status === 'todo')?.count).toBe(1);
  });

  it('没有任务时应该返回 null', async () => {
    mocks.datascriptQuery.mockResolvedValue([]);
    const progress = await calculateTaskProgress('parent-uuid');
    expect(progress).toBeNull();
  });

  it('查询失败时应该返回 null', async () => {
    mocks.datascriptQuery.mockRejectedValue(new Error('db busy'));
    const progress = await calculateTaskProgress('parent-uuid');
    expect(progress).toBeNull();
  });
});
