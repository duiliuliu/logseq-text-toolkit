/**
 * Heatmap DB 查询适配测试
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

import { fetchHeatmapData } from './query';

describe('Heatmap Query DB 适配', () => {
  beforeEach(() => {
    mocks.datascriptQuery.mockReset();
    mocks.datascriptQuery.mockResolvedValue([]);
  });

  it('type=all 不应该依赖已移除的 :block/content', async () => {
    await fetchHeatmapData({ type: 'all', year: 2026, month: 1 }, 'month', 'simple');

    const query = mocks.datascriptQuery.mock.calls[0][0] as string;
    expect(query).toContain(':block/created-at');
    expect(query).not.toContain(':block/content');
  });

  it('scheduled 日期字段应该查询 scheduled 属性', async () => {
    await fetchHeatmapData(
      {
        type: 'all',
        year: 2026,
        month: 1,
        dateField: { type: 'scheduled' },
      },
      'month',
      'simple'
    );

    const query = mocks.datascriptQuery.mock.calls[0][0] as string;
    expect(query).toContain(':logseq.property/scheduled');
    expect(query).not.toContain(':block/created-at ?date');
  });

  it('custom 日期字段应该查询对应属性', async () => {
    await fetchHeatmapData(
      {
        type: 'all',
        year: 2026,
        month: 1,
        dateField: { type: 'custom', customKey: 'user.property/review-date' },
      },
      'month',
      'simple'
    );

    const query = mocks.datascriptQuery.mock.calls[0][0] as string;
    expect(query).toContain(':user.property/review-date');
  });

  it('updated-at 日期字段应该查询 updated-at', async () => {
    await fetchHeatmapData(
      {
        type: 'all',
        year: 2026,
        month: 1,
        dateField: { type: 'updated-at' },
      },
      'month',
      'simple'
    );

    const query = mocks.datascriptQuery.mock.calls[0][0] as string;
    expect(query).toContain(':block/updated-at');
  });

  it('property 查询应该支持 :user.property/ 前缀', async () => {
    await fetchHeatmapData(
      {
        type: 'property',
        propertyKey: 'user.property/review-date',
        value: 'done',
        year: 2026,
        month: 1,
      },
      'month',
      'simple'
    );

    const query = mocks.datascriptQuery.mock.calls[0][0] as string;
    expect(query).toContain(':user.property/review-date');
    expect(query).not.toContain(':logseq.property/user.property/review-date');
  });

  it('property 查询应该支持不带前缀的 logseq 属性', async () => {
    await fetchHeatmapData(
      {
        type: 'property',
        propertyKey: 'review-date',
        year: 2026,
        month: 1,
      },
      'month',
      'simple'
    );

    const query = mocks.datascriptQuery.mock.calls[0][0] as string;
    expect(query).toContain(':logseq.property/review-date');
  });
});
