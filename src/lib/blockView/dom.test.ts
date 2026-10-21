/**
 * BlockView DOM 适配测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  applyViewClasses,
  blockHasChildren,
  clearBlockViewStates,
  findBlockElement,
  getBlockIdSelectors,
  hasVirtualizedChildren,
} from './dom';

describe('BlockView DOM 适配', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    clearBlockViewStates();
  });

  it('应该优先通过 DB 2.0.2 的 blockid 属性查找块', () => {
    const block = document.createElement('div');
    block.className = 'ls-block';
    block.setAttribute('blockid', 'block-1');
    document.body.appendChild(block);

    expect(findBlockElement(document, 'block-1')).toBe(block);
  });

  it('应该兼容 data-block-id', () => {
    const block = document.createElement('div');
    block.className = 'ls-block';
    block.setAttribute('data-block-id', 'block-2');
    document.body.appendChild(block);

    expect(findBlockElement(document, 'block-2')).toBe(block);
  });

  it('应该兼容 #ls-block-<uuid>', () => {
    const block = document.createElement('div');
    block.id = 'ls-block-block-3';
    document.body.appendChild(block);

    expect(findBlockElement(document, 'block-3')).toBe(block);
  });

  it('块不存在时应该返回 null', () => {
    expect(findBlockElement(document, 'missing')).toBeNull();
  });

  it('选择器顺序应该以 blockid 优先', () => {
    const selectors = getBlockIdSelectors('block-1');
    expect(selectors[0]).toContain('blockid="block-1"');
    expect(selectors.some(s => s.includes('data-block-id'))).toBe(true);
  });

  it('应该切换视图和主题 class 并移除旧 class', () => {
    const block = document.createElement('div');
    applyViewClasses(block, 'list', 'default');
    expect(block.classList.contains('ltt-list-root')).toBe(true);
    expect(block.classList.contains('theme-default')).toBe(true);

    applyViewClasses(block, 'table', 'notion');
    expect(block.classList.contains('ltt-list-root')).toBe(false);
    expect(block.classList.contains('ltt-table-root')).toBe(true);
    expect(block.classList.contains('theme-notion')).toBe(true);
  });

  it('折叠块应该通过 data-has-children 判断有子块', () => {
    const block = document.createElement('div');
    block.innerHTML = '<div class="block-control-wrap" data-has-children="true"></div>';
    expect(blockHasChildren(block)).toBe(true);

    const empty = document.createElement('div');
    empty.innerHTML = '<div class="block-control-wrap" data-has-children="false"></div>';
    expect(blockHasChildren(empty)).toBe(false);
  });

  it('应该识别虚拟滚动的子块列表', () => {
    const block = document.createElement('div');
    const children = document.createElement('div');
    children.className = 'blocks-list-wrap';
    children.setAttribute('data-virtuoso-scroller', 'true');
    block.appendChild(children);

    expect(hasVirtualizedChildren(block)).toBe(true);
    expect(hasVirtualizedChildren(document.createElement('div'))).toBe(false);
  });
});
