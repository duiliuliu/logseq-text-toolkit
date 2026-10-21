import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, any>();

vi.mock('../../logseq', () => ({
  logseqAPI: {
    FileStorage: {
      getItem: vi.fn(async (key: string) => store.get(key)),
      setItem: vi.fn(async (key: string, value: any) => { store.set(key, value); }),
    },
  },
}));

import { loadAnnotations, saveAnnotations } from './storage';
import type { HtmlAnnotation } from './types';

const annotation: HtmlAnnotation = {
  id: 'a1', assetPath: 'assets/a.html', quote: 'q', comment: 'c',
  anchor: { quote: 'q', start: 0, end: 1, prefix: '', suffix: '' }, createdAt: 1,
};

beforeEach(() => store.clear());

describe('HTML annotation storage', () => {
  it('应该保存并读取标注', async () => {
    await saveAnnotations('assets/a.html', [annotation]);
    await expect(loadAnnotations('assets/a.html')).resolves.toEqual([annotation]);
  });

  it('不同附件应该隔离', async () => {
    await saveAnnotations('assets/a.html', [annotation]);
    await expect(loadAnnotations('assets/b.html')).resolves.toEqual([]);
  });
});
