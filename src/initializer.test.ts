/**
 * SelectToolbar 容器解析测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { resolveToolbarTarget } from './initializer';

describe('resolveToolbarTarget', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('应该优先返回 #main-content-container', () => {
    const main = document.createElement('div');
    main.id = 'main-content-container';
    document.body.appendChild(main);

    const home = document.createElement('div');
    home.id = 'app-main-home';
    document.body.appendChild(home);

    expect(resolveToolbarTarget(document)).toBe(main);
  });

  it('应该在缺少 #main-content-container 时回退到 #app-main-home', () => {
    const home = document.createElement('div');
    home.id = 'app-main-home';
    document.body.appendChild(home);

    expect(resolveToolbarTarget(document)).toBe(home);
  });

  it('两个容器都不存在时应该返回 null', () => {
    expect(resolveToolbarTarget(document)).toBeNull();
  });
});
