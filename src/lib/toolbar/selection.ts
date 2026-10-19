/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * 选区适配工具
 *
 * Logseq DB 版本的块编辑器是 textarea + .mock-text 镜像层，原生 DOM Range
 * 无法可靠描述 textarea 内部的选区。Host 会通过 Editor.onInputSelectionEnd
 * 下发 { text, start, end, caret, point }，这里负责把它转换成插件内部统一的
 * SelectedData，并提供基于字符偏移的精确替换能力。
 */

import type { BlockEntity } from '@logseq/libs/dist/LSPlugin.user';
import type { SelectedData } from '../../components/Toolbar/types';
import { getWindow } from '../../logseq/utils';

export interface SelectionPoint {
  x?: number;
  y?: number;
}

export interface SelectionCaret {
  left?: number;
  top?: number;
  height?: number;
  pos?: number;
  rect?: RectLike | DOMRect | null;
}

export interface SDKSelectionEvent {
  text: string;
  start: number;
  end: number;
  caret?: SelectionCaret | null;
  point?: SelectionPoint | null;
}

export interface RectLike {
  x?: number;
  y?: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  width?: number;
  height?: number;
}

const DEFAULT_RECT_SIZE = 0;

function firstFinite(...values: Array<number | undefined | null>): number {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }
  return 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function normalizePoint(point?: SelectionPoint | null): { x: number; y: number } | null {
  if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
    return null;
  }
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
    return null;
  }
  return { x: point.x, y: point.y };
}

/**
 * 把 Host 下发的 rect（可能是 DOMRect，也可能是 toJSON 后的普通对象）
 * 统一成 DOMRect。jsdom/老环境没有 DOMRect 时返回同形状对象。
 */
export function toDOMRect(
  rect?: RectLike | DOMRect | null,
  fallbackPoint?: SelectionPoint | null
): DOMRect {
  const fallback = normalizePoint(fallbackPoint) ?? { x: 0, y: 0 };
  const source = (rect ?? {}) as RectLike;

  const left = firstFinite(source.left, source.x, fallback.x);
  const top = firstFinite(source.top, source.y, fallback.y);
  const width = firstFinite(source.width, DEFAULT_RECT_SIZE);
  const height = firstFinite(source.height, DEFAULT_RECT_SIZE);
  const right = firstFinite(source.right, left + width);
  const bottom = firstFinite(source.bottom, top + height);
  const x = firstFinite(source.x, left);
  const y = firstFinite(source.y, top);

  if (typeof DOMRect !== 'undefined') {
    try {
      return new DOMRect(x, y, right - x, bottom - y);
    } catch {
      // 继续走普通对象兜底
    }
  }

  const result = { x, y, left, top, right, bottom, width: right - x, height: bottom - y };
  return {
    ...result,
    toJSON: () => result,
  } as DOMRect;
}

export function getBlockContent(block?: BlockEntity | null): string {
  if (!block) {
    return '';
  }
  // DB 图 Host 会给 block 补 content 别名；某些情况下 content 为空但 title 有值，
  // 此时优先使用非空 title，避免选区/替换误判为空块。
  if (typeof block.content === 'string' && block.content.length > 0) {
    return block.content;
  }
  if (typeof block.title === 'string' && block.title.length > 0) {
    return block.title;
  }
  return typeof block.content === 'string' ? block.content : '';
}

/**
 * 把 SDK 选区事件转换为 SelectedData。
 *
 * 优先使用 start/end 和 block.content 做精确切片；如果 Host 的 block 内容
 * 尚未同步（例如刚输入就选中），再用 text.indexOf 做一次兜底定位。
 */
export function createSelectionFromSDKEvent(
  event: SDKSelectionEvent,
  block?: BlockEntity | null
): SelectedData {
  const content = getBlockContent(block);
  // block 内容为空时（例如 Host 尚未返回 block），保留事件里的偏移，
  // 不要把它们全部压成 0，否则上层无法判断选区范围。
  const maxIndex = content.length > 0 ? content.length : Number.MAX_SAFE_INTEGER;
  const rawStart = clamp(Math.trunc(firstFinite(event.start, 0)), 0, maxIndex);
  const rawEnd = clamp(Math.trunc(firstFinite(event.end, rawStart)), rawStart, maxIndex);
  const text = typeof event.text === 'string' && event.text.length > 0
    ? event.text
    : content.slice(rawStart, rawEnd);

  const exactMatch = content.slice(rawStart, rawEnd) === text;
  const fallbackIndex = !exactMatch && text ? content.indexOf(text) : -1;

  const start = exactMatch ? rawStart : fallbackIndex >= 0 ? fallbackIndex : rawStart;
  const end = exactMatch ? rawEnd : fallbackIndex >= 0 ? fallbackIndex + text.length : rawEnd;
  const rawPoint = normalizePoint(event.point);
  // Host 在没有 mouseup 坐标时可能下发 {x:0,y:0}，此时用 caret 位置更可靠。
  const point = rawPoint && (rawPoint.x !== 0 || rawPoint.y !== 0) ? rawPoint : null;
  const rect = toDOMRect(event.caret?.rect ?? null, rawPoint);

  return {
    text,
    start,
    end,
    before: content.slice(0, start),
    after: content.slice(end),
    rect,
    point: point ?? { x: rect.left, y: rect.top },
    block: block ?? undefined,
    source: 'sdk',
    timestamp: new Date().toISOString(),
  };
}

/**
 * 解析文本在 block.content 中的真实偏移。
 *
 * 只有 start/end 与 text 完全匹配时才信任偏移；否则回退到第一次 indexOf。
 * 这样既支持 DB 图的精确偏移，也能兼容 file 图和内容尚未同步的情况。
 */
export function resolveSelectionRange(
  content: string,
  selection: Pick<SelectedData, 'text' | 'start' | 'end'>
): { start: number; end: number } | null {
  const { text } = selection;
  if (!text) {
    return null;
  }

  const { start, end } = selection;
  if (
    typeof start === 'number' &&
    typeof end === 'number' &&
    Number.isInteger(start) &&
    Number.isInteger(end) &&
    start >= 0 &&
    end >= start &&
    end <= content.length &&
    content.slice(start, end) === text
  ) {
    return { start, end };
  }

  const index = content.indexOf(text);
  if (index === -1) {
    return null;
  }
  return { start: index, end: index + text.length };
}

/**
 * 用字符偏移替换选区文本，返回替换后的完整 block.content。
 * 找不到选区时返回 null，由调用方决定是否走 DOM 回退。
 */
export function replaceSelectionInContent(
  content: string,
  selection: Pick<SelectedData, 'text' | 'start' | 'end'>,
  replacement: string
): string | null {
  const range = resolveSelectionRange(content, selection);
  if (!range) {
    return null;
  }
  return content.slice(0, range.start) + replacement + content.slice(range.end);
}

/**
 * 计算浮动工具栏锚点：优先用鼠标释放点，其次用 caret 相对 textarea 的偏移。
 */
export function getSelectionAnchor(event: SDKSelectionEvent): { x: number; y: number } {
  const point = normalizePoint(event.point);
  if (point && (point.x !== 0 || point.y !== 0)) {
    return point;
  }

  const caret = event.caret;
  const rect = toDOMRect(caret?.rect ?? null);
  return {
    x: rect.left + firstFinite(caret?.left, 0),
    y: rect.top + firstFinite(caret?.top, 0),
  };
}

/**
 * 以锚点为中心计算 fixed 定位工具栏位置，并限制在视口内。
 */
export function calculateToolbarPositionFromPoint(
  point: { x: number; y: number },
  containerWidth: number = 200,
  toolbarHeight: number = 32,
  padding: number = 3
): { x: number; y: number } {
  const viewport = getWindow();
  const viewportWidth = viewport?.innerWidth || 0;
  const viewportHeight = viewport?.innerHeight || 0;
  const width = Math.max(containerWidth, 0);

  let x = point.x;
  if (viewportWidth > 0) {
    const half = width / 2;
    if (width >= viewportWidth) {
      x = viewportWidth / 2;
    } else {
      x = clamp(x, half, viewportWidth - half);
    }
  }

  let y = point.y - toolbarHeight - padding;
  if (y < 0) {
    y = point.y + padding;
  }
  if (viewportHeight > 0) {
    y = clamp(y, 0, Math.max(0, viewportHeight - toolbarHeight));
  }

  return { x, y };
}
