import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getPage: vi.fn(),
  createPage: vi.fn(),
  getPageBlocksTree: vi.fn(),
  removeBlock: vi.fn(),
  insertBlock: vi.fn(),
  showMsg: vi.fn(),
  analyze: vi.fn(),
  getSettings: vi.fn(),
  buildAISuggestions: vi.fn(),
  render: vi.fn(),
}));

vi.mock('../../logseq', () => ({
  logseqAPI: {
    Editor: {
      getPage: mocks.getPage,
      createPage: mocks.createPage,
      getPageBlocksTree: mocks.getPageBlocksTree,
      removeBlock: mocks.removeBlock,
      insertBlock: mocks.insertBlock,
    },
    UI: { showMsg: mocks.showMsg },
  },
}));

vi.mock('../logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../settings', () => ({ getSettings: mocks.getSettings }));
vi.mock('./ai', () => ({ buildAISuggestions: mocks.buildAISuggestions }));
vi.mock('./insights', () => ({ buildLocalInsights: vi.fn().mockReturnValue(['insight']) }));
vi.mock('./DataAnalyzer', () => ({
  DataAnalyzer: class {
    analyze = mocks.analyze;
    getWeekNumber = () => 1;
  },
}));
vi.mock('./templates', () => ({
  getTemplate: () => ({
    supportedTypes: ['weekly', 'monthly', 'yearly', 'custom'],
    render: mocks.render,
  }),
}));

import { PageGenerator } from './PageGenerator';

const summaryData = {
  dateRange: { start: new Date(2026, 0, 1), end: new Date(2026, 0, 7) },
  blocks: { total: 0, created: 0, modified: 0, avgContentLength: 0, tags: {} },
  tasks: {
    total: 0, completed: 0, inProgress: 0, todo: 0,
    overdue: 0, cancelled: 0, completionRate: 0, byPriority: {},
  },
  pages: { total: 0, newPages: 0, modifiedPages: 0, byTag: {}, byProperty: {} },
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.analyze.mockImplementation(async (_type: any, start?: Date, end?: Date) => ({
    ...summaryData,
    insights: ['insight'],
    dateRange: {
      start: start || summaryData.dateRange.start,
      end: end || summaryData.dateRange.end,
    },
  }));
  mocks.getSettings.mockReturnValue({
    summary: {
      ai: { enabled: false },
      weeklyPageNameTemplate: '周度总结-{{year}}-W{{week}}',
      monthlyPageNameTemplate: '月度总结-{{year}}-{{month}}',
      customPageNameTemplate: '自定义总结-{{date}}',
    },
  });
  mocks.buildAISuggestions.mockResolvedValue([]);
  mocks.render.mockReturnValue([{ content: '[:div.ltt-summary-page "summary"]', children: [] }]);
  mocks.getPage.mockResolvedValue(null);
  mocks.createPage.mockResolvedValue({ uuid: 'page-1', name: 'new' });
  mocks.getPageBlocksTree.mockResolvedValue([]);
  mocks.removeBlock.mockResolvedValue(undefined);
  mocks.insertBlock.mockResolvedValue({ uuid: 'created-1' });
});

describe('PageGenerator', () => {
  it('新页面应该清理 createFirstBlock 产生的空首块', async () => {
    mocks.getPageBlocksTree.mockResolvedValue([{ uuid: 'empty', content: '' }]);

    const pageName = await new PageGenerator().generate('gtd-work-review', 'weekly');

    expect(pageName).toMatch(/^周度总结-\d{4}-W\d{1,2}$/);
    expect(mocks.removeBlock).toHaveBeenCalledWith('empty');
    expect(mocks.insertBlock).toHaveBeenCalledWith('page-1', '[:div.ltt-summary-page "summary"]');
  });

  it('已有页面中的旧总结块应该先删除再插入，避免重复', async () => {
    mocks.getPage.mockResolvedValue({ uuid: 'page-1' });
    mocks.getPageBlocksTree.mockResolvedValue([
      { uuid: 'old', content: '[:div.ltt-summary-page "old"]' },
      { uuid: 'note', content: 'user note' },
    ]);

    await new PageGenerator().generate('gtd-work-review', 'weekly');

    expect(mocks.removeBlock).toHaveBeenCalledWith('old');
    expect(mocks.removeBlock).not.toHaveBeenCalledWith('note');
  });

  it('已有页面但没有旧总结时不应该删除用户内容', async () => {
    mocks.getPage.mockResolvedValue({ uuid: 'page-1' });
    mocks.getPageBlocksTree.mockResolvedValue([{ uuid: 'note', content: 'user note' }]);

    await new PageGenerator().generate('gtd-work-review', 'weekly');

    expect(mocks.removeBlock).not.toHaveBeenCalled();
    expect(mocks.insertBlock).toHaveBeenCalled();
  });

  it('年度总结应该使用年度页面名模板', async () => {
    mocks.getSettings.mockReturnValue({
      summary: {
        ai: { enabled: false },
        yearlyPageNameTemplate: '年度总结-{{year}}',
      },
    });

    const pageName = await new PageGenerator().generate(
      'minimal-dashboard',
      'yearly',
      new Date(2026, 5, 1),
      new Date(2026, 11, 31)
    );

    expect(pageName).toBe('年度总结-2026');
  });

  it('AI 开启时应该把建议传入模板数据', async () => {
    mocks.buildAISuggestions.mockResolvedValue(['AI insight']);
    mocks.getSettings.mockReturnValue({
      summary: {
        ai: { enabled: true, apiKey: 'sk-test' },
        weeklyPageNameTemplate: '周度总结-{{year}}-W{{week}}',
      },
    });

    await new PageGenerator().generate('gtd-work-review', 'weekly');

    const data = mocks.render.mock.calls[0][0];
    expect(data.aiSuggestions).toEqual(['AI insight']);
    expect(mocks.buildAISuggestions).toHaveBeenCalledWith(
      expect.objectContaining({ insights: ['insight'] }),
      expect.objectContaining({ enabled: true })
    );
  });

  it('自定义日期页面名应该使用本地日期而不是 UTC', async () => {
    mocks.getSettings.mockReturnValue({
      summary: {
        ai: { enabled: false },
        customPageNameTemplate: '自定义-{{date}}-{{endDate}}',
      },
    });

    const pageName = await new PageGenerator().generate(
      'minimal-dashboard',
      'custom',
      new Date(2026, 0, 1),
      new Date(2026, 0, 31)
    );

    expect(pageName).toBe('自定义-2026-01-01-2026-01-31');
  });
});
