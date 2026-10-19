import { describe, it, expect } from 'vitest';
import { Comment } from './index';

describe('Comment inline hiccup', () => {
  it('应该用 EDN 反斜杠转义引号而不是 HTML 实体', () => {
    const result = Comment.wrapText('say "hi"', 'a "quote"');

    expect(result).toContain('\\"quote\\"');
    expect(result).toContain('say \\"hi\\"');
    expect(result).not.toContain('&quot;');
  });

  it('应该能还原带引号的注释', () => {
    const wrapped = Comment.wrapText('say "hi"', 'a "quote"');
    const parsed = Comment.unwrapText(wrapped);

    expect(parsed.selectedText).toBe('say "hi"');
    expect(parsed.comment).toBe('a "quote"');
  });

  it('应该保留换行和反斜杠', () => {
    const wrapped = Comment.wrapText('line1\nline2', 'path\\to');
    const parsed = Comment.unwrapText(wrapped);

    expect(parsed.selectedText).toBe('line1\nline2');
    expect(parsed.comment).toBe('path\\to');
  });
});
