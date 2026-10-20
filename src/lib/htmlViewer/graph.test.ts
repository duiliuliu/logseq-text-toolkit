import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getPage: vi.fn(),
  createPage: vi.fn(),
  insertBlock: vi.fn(),
  removeBlock: vi.fn(),
  pushState: vi.fn(),
}));

vi.mock('../../logseq', () => ({
  logseqAPI: {
    Editor: {
      getPage: mocks.getPage,
      createPage: mocks.createPage,
      insertBlock: mocks.insertBlock,
      removeBlock: mocks.removeBlock,
    },
    App: { pushState: mocks.pushState },
  },
}));

import { removeAnnotationBlock, writeAnnotationToGraph } from './graph';
import type { HtmlAnnotation } from './types';

const annotation: HtmlAnnotation = {
  id: 'a1',
  assetPath: 'assets/report.html',
  quote: 'hello\nworld',
  comment: 'note',
  anchor: { quote: 'hello\nworld', start: 0, end: 11, prefix: '', suffix: '' },
  createdAt: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getPage.mockResolvedValue(null);
  mocks.createPage.mockResolvedValue({ uuid: 'page-1' });
  mocks.insertBlock.mockResolvedValue({ uuid: 'block-1' });
  mocks.removeBlock.mockResolvedValue(undefined);
});

describe('HTML annotation graph writer', () => {
  it('应该创建标注页面并写入 quote/comment/source', async () => {
    const result = await writeAnnotationToGraph(annotation, 'HTML 标注 - ');
    expect(result).toEqual({ blockUuid: 'block-1', pageName: 'HTML 标注 - report.html' });
    expect(mocks.createPage).toHaveBeenCalledWith('HTML 标注 - report.html', {}, { createFirstBlock: false });
    const content = mocks.insertBlock.mock.calls[0][1] as string;
    expect(content).toContain('> hello\n> world');
    expect(content).toContain('note');
    expect(content).toContain('assets/report.html');
  });

  it('应该复用已存在的标注页面', async () => {
    mocks.getPage.mockResolvedValue({ uuid: 'existing-page' });
    await writeAnnotationToGraph(annotation, 'HTML 标注 - ');
    expect(mocks.createPage).not.toHaveBeenCalled();
    expect(mocks.insertBlock.mock.calls[0][0]).toBe('existing-page');
  });

  it('删除标注块应该调用 removeBlock', async () => {
    await removeAnnotationBlock('block-1');
    expect(mocks.removeBlock).toHaveBeenCalledWith('block-1');
  });
});
