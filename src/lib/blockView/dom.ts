/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * BlockView DOM 适配与状态同步
 *
 * Logseq DB 2.0.2 使用 `.ls-block[blockid="<uuid>"]` 标记块，
 * 不再提供 `[data-block-id]` / `#ls-block-<uuid>`。这里统一封装查找逻辑。
 */

import { getDocument } from '../../logseq/utils.ts';
import type { ThemeType, ViewType } from './types';

export const VIEW_CLASSES: ViewType[] = ['list', 'table', 'gallery', 'board'];

export const THEME_CLASSES: ThemeType[] = [
  'default',
  'notion',
  'linear',
  'dark',
  'gradient',
  'tana',
  'indigo',
  'custom',
];

export interface BlockViewVisualOptions {
  attributes: Record<string, string>;
  styleVars: Record<string, string>;
}

export interface BlockViewState {
  view: ViewType;
  theme: ThemeType;
  visuals?: BlockViewVisualOptions;
}

const activeViews = new Map<string, BlockViewState>();
let observer: MutationObserver | null = null;
let pendingSync: ReturnType<typeof setTimeout> | null = null;
let applying = false;

function escapeSelectorValue(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/["\\]/g, '\\$&');
}

export function getBlockIdSelectors(blockId: string): string[] {
  const id = escapeSelectorValue(blockId);
  return [
    `.ls-block[blockid="${id}"]`,
    `[blockid="${id}"]`,
    `.ls-block[data-block-id="${id}"]`,
    `[data-block-id="${id}"]`,
    `#ls-block-${id}`,
  ];
}

/**
 * 查找宏所在块的真实 DOM。
 *
 * 优先使用 DB 2.0.2 的 blockid 属性，再兼容旧版的 data-block-id / id。
 */
export function findBlockElement(doc: Document, blockId: string): HTMLElement | null {
  if (!doc || !blockId) {
    return null;
  }

  for (const selector of getBlockIdSelectors(blockId)) {
    try {
      const element = doc.querySelector(selector);
      if (element instanceof HTMLElement) {
        return element;
      }
    } catch {
      // 忽略非法选择器，继续尝试下一个
    }
  }

  return null;
}

export function removeViewClasses(element: HTMLElement): void {
  for (const view of VIEW_CLASSES) {
    element.classList.remove(`ltt-${view}-root`);
  }
  // 兼容旧版本可能残留的 mindmap class（当前视图注册表已停用 mindmap）
  element.classList.remove('ltt-mindmap-root');
  for (const theme of THEME_CLASSES) {
    element.classList.remove(`theme-${theme}`);
  }
}

export function applyViewClasses(
  element: HTMLElement,
  view: ViewType,
  theme: ThemeType
): void {
  removeViewClasses(element);
  element.classList.add(`ltt-${view}-root`);
  element.classList.add(`theme-${theme}`);
}

export function applyVisualOptions(
  element: HTMLElement,
  visuals?: BlockViewVisualOptions
): void {
  if (!visuals) {
    return;
  }
  for (const [key, value] of Object.entries(visuals.attributes)) {
    element.setAttribute(key, value);
  }
  for (const [key, value] of Object.entries(visuals.styleVars)) {
    element.style.setProperty(key, value);
  }
}

export function blockHasChildren(blockElement: HTMLElement | null): boolean {
  if (!blockElement) {
    return false;
  }
  // Logseq DB 2.0.2 在 block-control-wrap 上提供 data-has-children，
  // 折叠块 / 懒加载块即使没有 .block-children-container 也能正确判断。
  const control = blockElement.querySelector('.block-control-wrap');
  const dataHasChildren = control?.getAttribute('data-has-children');
  if (dataHasChildren === 'true') {
    return true;
  }
  if (dataHasChildren === 'false') {
    return false;
  }
  return !!blockElement.querySelector(':scope > .block-children-container');
}

export function hasVirtualizedChildren(element: HTMLElement | null): boolean {
  return !!element?.querySelector(
    '.blocks-list-wrap[data-virtuoso-scroller="true"], [data-virtuoso-scroller="true"]'
  );
}

/**
 * 记录每个块期望的视图，用于 React 重新渲染 / 虚拟列表重新挂载后恢复 class。
 */
export function rememberBlockView(
  blockId: string,
  view: ViewType,
  theme: ThemeType,
  visuals?: BlockViewVisualOptions
): void {
  activeViews.set(blockId, { view, theme, visuals });
}

export function forgetBlockView(blockId: string): void {
  activeViews.delete(blockId);
}

export function getRememberedViews(): Array<{ blockId: string; state: BlockViewState }> {
  return Array.from(activeViews.entries()).map(([blockId, state]) => ({ blockId, state }));
}

/** 同步视图栏的空状态提示（子块是异步挂载的，不能只在宏渲染时判断一次）。 */
export function updateViewBarEmptyState(
  blockElement: HTMLElement | null,
  blockId: string,
  doc: Document = getDocument()
): void {
  const bar = doc.querySelector(
    `.ltt-view-bar[data-block-id="${escapeSelectorValue(blockId)}"]`
  );
  if (!bar) {
    return;
  }
  const hasChildren = blockElement ? blockHasChildren(blockElement) : true;
  bar.setAttribute('data-ltt-empty', hasChildren ? 'false' : 'true');
}

export function clearBlockViewStates(): void {
  activeViews.clear();
  if (pendingSync) {
    clearTimeout(pendingSync);
    pendingSync = null;
  }
}

function applyRememberedViews(doc: Document): void {
  if (!doc || activeViews.size === 0) {
    return;
  }

  applying = true;
  try {
    for (const [blockId, state] of activeViews) {
      const element = findBlockElement(doc, blockId);
      if (!element) {
        continue;
      }
      applyViewClasses(element, state.view, state.theme);
      element.setAttribute('data-ltt-view', state.view);
      element.setAttribute('data-ltt-theme', state.theme);
      applyVisualOptions(element, state.visuals);
      element.setAttribute(
        'data-ltt-virtualized',
        hasVirtualizedChildren(element) ? 'true' : 'false'
      );
      updateViewBarEmptyState(element, blockId, doc);
      updateViewBarHiddenState(blockId, state, doc);
    }
  } finally {
    applying = false;
  }
}

function scheduleApplyRememberedViews(doc: Document): void {
  if (pendingSync) {
    clearTimeout(pendingSync);
  }
  pendingSync = setTimeout(() => {
    pendingSync = null;
    applyRememberedViews(doc);
  }, 80);
}

/**
 * 只监听 childList：块被 React 重新创建、虚拟列表挂载新行时恢复视图 class。
 * 不监听 attributes，避免 applyViewClasses 自身触发循环。
 */
export function ensureBlockViewObserver(doc: Document = getDocument()): void {
  if (observer || !doc?.body || typeof MutationObserver === 'undefined') {
    return;
  }

  observer = new MutationObserver(() => {
    if (!applying && activeViews.size > 0) {
      scheduleApplyRememberedViews(doc);
    }
  });
  observer.observe(doc.body, { childList: true, subtree: true });
}

export function applyRememberedView(blockId: string, doc: Document = getDocument()): boolean {
  const state = activeViews.get(blockId);
  if (!state) {
    return false;
  }

  const element = findBlockElement(doc, blockId);
  if (!element) {
    return false;
  }

  applyViewClasses(element, state.view, state.theme);
  element.setAttribute('data-ltt-view', state.view);
  element.setAttribute('data-ltt-theme', state.theme);
  applyVisualOptions(element, state.visuals);
  element.setAttribute(
    'data-ltt-virtualized',
    hasVirtualizedChildren(element) ? 'true' : 'false'
  );
  updateViewBarHiddenState(blockId, state, doc);
  return true;
}

function updateViewBarHiddenState(
  blockId: string,
  state: BlockViewState,
  doc: Document
): void {
  const bar = doc.querySelector(
    `.ltt-view-bar[data-block-id="${escapeSelectorValue(blockId)}"]`
  );
  if (!bar) {
    return;
  }
  const hidden = state.visuals?.attributes['data-ltt-hide-view-bar'] === 'true';
  bar.setAttribute('data-ltt-hidden', hidden ? 'true' : 'false');
}

export function syncRememberedViews(doc: Document = getDocument()): void {
  ensureBlockViewObserver(doc);
  applyRememberedViews(doc);
}
