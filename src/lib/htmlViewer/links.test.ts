import { describe, expect, it } from 'vitest';
import { isSafeDashboardCall, parseLogseqHref } from './links';

describe('dashboard links', () => {
  it('解析页面链接并解码', () => {
    expect(parseLogseqHref('logseq://page/2026-W42')).toEqual({ type: 'page', name: '2026-W42' });
    expect(parseLogseqHref('logseq://page/My%20Page')).toEqual({ type: 'page', name: 'My Page' });
  });

  it('解析块链接', () => {
    expect(parseLogseqHref('logseq://block/abc-123')).toEqual({ type: 'block', uuid: 'abc-123' });
  });

  it('拒绝非 Logseq 链接', () => {
    expect(parseLogseqHref('https://example.com')).toBeNull();
    expect(parseLogseqHref('logseq://search/x')).toBeNull();
  });

  it('只允许导航类 data-ls-call', () => {
    expect(isSafeDashboardCall('App.pushState')).toBe(true);
    expect(isSafeDashboardCall('Editor.deletePage')).toBe(false);
  });
});
