import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from './sanitize';

const base = { allowScripts: false, allowRemote: false, baseUrl: 'https://example.test/assets/a.html' };

describe('sanitizeHtml', () => {
  it('默认移除脚本、iframe、事件属性和 javascript URL', () => {
    const result = sanitizeHtml(
      '<html><head></head><body><script>alert(1)</script><iframe src="x"></iframe><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">x</a><p>hello</p></body></html>',
      base
    );
    expect(result).not.toContain('<script');
    expect(result).not.toContain('<iframe');
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('javascript:');
    expect(result).toContain('hello');
  });

  it('默认移除远程资源和 @import', () => {
    const result = sanitizeHtml(
      '<html><head><style>@import url(https://cdn.test/a.css); body{color:red}</style></head><body><img src="https://cdn.test/a.png"><a href="https://example.com">link</a><img src="data:image/png;base64,abc"></body></html>',
      base
    );
    expect(result).not.toContain('https://cdn.test');
    expect(result).not.toContain('https://example.com');
    expect(result).toContain('data:image/png');
    expect(result).toContain('color:red');
  });

  it('显式允许时可以保留脚本和远程资源', () => {
    const result = sanitizeHtml(
      '<html><body><script>window.x=1</script><img src="https://cdn.test/a.png"></body></html>',
      { ...base, allowScripts: true, allowRemote: true }
    );
    expect(result).toContain('<script');
    expect(result).toContain('https://cdn.test/a.png');
  });

  it('应该注入 base 和 viewport', () => {
    const result = sanitizeHtml('<html><body>x</body></html>', base);
    expect(result).toContain('<base');
    expect(result).toContain('https://example.test/assets/a.html');
    expect(result).toContain('viewport');
  });
});
