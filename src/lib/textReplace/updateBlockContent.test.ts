/**
 * updateBlockContent 偏移替换测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { BlockEntity } from '@logseq/libs/dist/LSPlugin.user';
import { updateBlockContent } from './utils';

const mocks = vi.hoisted(() => ({
  updateBlock: vi.fn(),
  getEditingBlockContent: vi.fn(),
  getCurrentBlock: vi.fn(),
  showMsg: vi.fn(),
  getSelection: vi.fn(),
  getDocument: vi.fn(),
}));

vi.mock('../../logseq', () => ({
  logseqAPI: {
    Editor: {
      updateBlock: mocks.updateBlock,
      getEditingBlockContent: mocks.getEditingBlockContent,
      getCurrentBlock: mocks.getCurrentBlock,
    },
    UI: {
      showMsg: mocks.showMsg,
    },
  },
}));

vi.mock('../../logseq/utils', () => ({
  getSelection: mocks.getSelection,
  getDocument: mocks.getDocument,
}));

const block = (content: string): BlockEntity => ({
  uuid: 'block-1',
  content,
} as unknown as BlockEntity);

describe('updateBlockContent', () => {
  beforeEach(() => {
    mocks.updateBlock.mockReset();
    mocks.updateBlock.mockResolvedValue(undefined);
    mocks.getEditingBlockContent.mockReset();
    mocks.getEditingBlockContent.mockResolvedValue(undefined);
    mocks.getCurrentBlock.mockReset();
    mocks.getCurrentBlock.mockResolvedValue({ uuid: 'block-1' });
    mocks.showMsg.mockReset();
    mocks.getSelection.mockReset();
    mocks.getSelection.mockReturnValue(null);
    mocks.getDocument.mockReset();
    mocks.getDocument.mockReturnValue(document);
  });

  it('应该按 start/end 精确替换', async () => {
    const success = await updateBlockContent(
      { text: 'world', start: 6, end: 11, block: block('hello world') },
      'Logseq',
      'zh-CN'
    );

    expect(success).toBe(true);
    expect(mocks.updateBlock).toHaveBeenCalledWith('block-1', 'hello Logseq');
  });

  it('应该优先使用编辑中的实时内容', async () => {
    mocks.getEditingBlockContent.mockResolvedValue('hello world!');

    const success = await updateBlockContent(
      { text: 'world', start: 6, end: 11, block: block('hello world') },
      'Logseq',
      'zh-CN'
    );

    expect(success).toBe(true);
    expect(mocks.updateBlock).toHaveBeenCalledWith('block-1', 'hello Logseq!');
  });

  it('block.content 为空时应该允许使用实时编辑内容', async () => {
    mocks.getEditingBlockContent.mockResolvedValue('hello world');

    const success = await updateBlockContent(
      { text: 'world', start: 6, end: 11, block: block('') },
      'Logseq',
      'zh-CN'
    );

    expect(success).toBe(true);
    expect(mocks.updateBlock).toHaveBeenCalledWith('block-1', 'hello Logseq');
  });

  it('当前编辑块不是选区块时不应该使用其他块的内容', async () => {
    mocks.getCurrentBlock.mockResolvedValue({ uuid: 'other-block' });
    mocks.getEditingBlockContent.mockResolvedValue('other block world');

    const success = await updateBlockContent(
      { text: 'world', start: 6, end: 11, block: block('hello world') },
      'Logseq',
      'zh-CN'
    );

    expect(success).toBe(true);
    expect(mocks.updateBlock).toHaveBeenCalledWith('block-1', 'hello Logseq');
  });

  it('重复文本应该替换选中的第二处', async () => {
    const success = await updateBlockContent(
      { text: 'foo', start: 8, end: 11, block: block('foo bar foo') },
      'baz',
      'zh-CN'
    );

    expect(success).toBe(true);
    expect(mocks.updateBlock).toHaveBeenCalledWith('block-1', 'foo bar baz');
  });

  it('Host 内容未同步时应该回退到 text.indexOf', async () => {
    const success = await updateBlockContent(
      { text: 'world', start: 0, end: 5, block: block('hello world') },
      'there',
      'zh-CN'
    );

    expect(success).toBe(true);
    expect(mocks.updateBlock).toHaveBeenCalledWith('block-1', 'hello there');
  });

  it('找不到选区时应该返回 false 且不更新 block', async () => {
    const success = await updateBlockContent(
      { text: 'missing', start: 0, end: 7, block: block('hello world') },
      'x',
      'zh-CN'
    );

    expect(success).toBe(false);
    expect(mocks.updateBlock).not.toHaveBeenCalled();
  });

  it('block 为空时应该提示并返回 false', async () => {
    const success = await updateBlockContent(
      { text: 'world', block: undefined },
      'x',
      'zh-CN'
    );

    expect(success).toBe(false);
    expect(mocks.updateBlock).not.toHaveBeenCalled();
    expect(mocks.showMsg).toHaveBeenCalled();
  });

  it('updateBlock 抛异常时应该返回 false', async () => {
    mocks.updateBlock.mockRejectedValueOnce(new Error('db busy'));

    const success = await updateBlockContent(
      { text: 'world', start: 6, end: 11, block: block('hello world') },
      'x',
      'zh-CN'
    );

    expect(success).toBe(false);
  });
});
