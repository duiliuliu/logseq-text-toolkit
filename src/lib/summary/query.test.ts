/**
 * Summary DB 查询适配测试
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

import { Query } from './query';

describe('Summary Query DB 适配', () => {
  beforeEach(() => {
    mocks.datascriptQuery.mockReset();
  });

  it('queryBlocks 应该使用 :block/title 而不是 :block/content', async () => {
    mocks.datascriptQuery.mockResolvedValue([
      [
        {
          'block/title': 'hello',
          'block/created-at': 1,
          page: { 'block/title': 'Page A' },
          tags: [{ 'block/title': 'Tag A' }],
        },
      ],
    ]);

    const stats = await new Query().queryBlocks({
      start: new Date(0),
      end: new Date(10),
    });

    const query = mocks.datascriptQuery.mock.calls[0][0] as string;
    expect(query).toContain(':block/title');
    expect(query).toContain('or-join');
    expect(query).toContain(':block/updated-at');
    expect(query).not.toContain(':block/content');
    expect(stats.total).toBe(1);
    expect(stats.created).toBe(1);
    expect(stats.modified).toBe(0);
    expect(stats.avgContentLength).toBe(5);
    expect(stats.pages).toEqual({ 'Page A': 1 });
    expect(stats.tags).toEqual({ 'Tag A': 1 });
  });

  it('queryTasks 应该支持 status 任务并按 title 解析状态', async () => {
    mocks.datascriptQuery.mockResolvedValue([
      [
        {
          'block/title': 'Task A',
          'block/created-at': 1,
          'logseq.property/status': { 'block/title': 'Done' },
          'logseq.property/priority': { 'block/title': 'High' },
        },
      ],
    ]);

    const stats = await new Query().queryTasks({
      start: new Date(0),
      end: new Date(10),
    });

    const query = mocks.datascriptQuery.mock.calls[0][0] as string;
    expect(query).toContain('or-join');
    expect(query).toContain('logseq.property/status');
    expect(query).not.toContain(':block/content');
    expect(stats.total).toBe(1);
    expect(stats.completed).toBe(1);
    expect(stats.byPriority).toEqual({ high: 1 });
  });

  it('Canceled 任务不应该计入 overdue', async () => {
    mocks.datascriptQuery.mockResolvedValue([
      [{
        'block/title': 'Canceled Task',
        'block/created-at': 1,
        'logseq.property/status': { 'block/title': 'Canceled' },
        'logseq.property/scheduled': Date.now() - 86400000,
      }],
    ]);

    const stats = await new Query().queryTasks({
      start: new Date(0),
      end: new Date(10),
    });

    expect(stats.cancelled).toBe(1);
    expect(stats.overdue).toBe(0);
  });

  it('queryPages 应该统计本周期修改的旧页面', async () => {
    mocks.datascriptQuery.mockResolvedValue([
      [{
        'block/title': 'Old Page',
        'block/name': 'old page',
        'block/created-at': 100,
        'block/updated-at': 5,
      }],
    ]);

    const stats = await new Query().queryPages({
      start: new Date(0),
      end: new Date(10),
    });

    expect(stats.total).toBe(1);
    expect(stats.newPages).toBe(0);
    expect(stats.modifiedPages).toBe(1);
  });

  it('completionRate 应该排除取消任务的分母', async () => {
    mocks.datascriptQuery.mockResolvedValue([
      [{ 'block/title': 'Done', 'block/created-at': 1, 'logseq.property/status': { 'block/title': 'Done' } }],
      [{ 'block/title': 'Canceled', 'block/created-at': 1, 'logseq.property/status': { 'block/title': 'Canceled' } }],
    ]);

    const stats = await new Query().queryTasks({
      start: new Date(0),
      end: new Date(10),
    });

    expect(stats.total).toBe(2);
    expect(stats.completed).toBe(1);
    expect(stats.cancelled).toBe(1);
    expect(stats.completionRate).toBe(100);
  });

  it('queryPages 应该用 :block/name 识别页面', async () => {
    mocks.datascriptQuery.mockResolvedValue([
      [
        {
          'block/title': 'Page A',
          'block/name': 'page a',
          'block/created-at': 1,
          'block/updated-at': 2,
          tags: [{ 'block/title': 'Project' }],
        },
      ],
    ]);

    const stats = await new Query().queryPages({
      start: new Date(0),
      end: new Date(10),
    });

    const query = mocks.datascriptQuery.mock.calls[0][0] as string;
    expect(query).toContain(':block/name');
    expect(query).not.toContain(':block/content');
    expect(stats.total).toBe(1);
    expect(stats.newPages).toBe(1);
    expect(stats.modifiedPages).toBe(1);
    expect(stats.byTag).toEqual({ Project: 1 });
  });
});
