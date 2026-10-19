import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildAISuggestions } from './ai';
import type { AIConfig, SummaryData } from './types';

const data: SummaryData = {
  dateRange: { start: new Date(2026, 0, 1), end: new Date(2026, 0, 7) },
  blocks: { total: 1, created: 1, modified: 1, avgContentLength: 2, tags: {} },
  tasks: {
    total: 1,
    completed: 1,
    inProgress: 0,
    todo: 0,
    overdue: 0,
    cancelled: 0,
    completionRate: 100,
    byPriority: {},
  },
  pages: { total: 1, newPages: 1, modifiedPages: 0, byTag: {}, byProperty: {} },
};

const config: AIConfig = {
  enabled: true,
  provider: 'openai',
  apiKey: 'sk-test',
  model: 'gpt-test',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('buildAISuggestions', () => {
  it('未启用或缺少 key 时不应该请求', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect(await buildAISuggestions(data, { ...config, enabled: false })).toEqual([]);
    expect(await buildAISuggestions(data, { ...config, apiKey: '' })).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('应该解析 OpenAI 响应', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '- 建议一\n2. 建议二\n# 标题' } }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await buildAISuggestions(data, config);
    expect(result).toEqual(['建议一', '建议二']);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('请求失败时应该回退为空数组', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, text: async () => 'unauthorized' }));
    await expect(buildAISuggestions(data, config)).resolves.toEqual([]);
  });
});
