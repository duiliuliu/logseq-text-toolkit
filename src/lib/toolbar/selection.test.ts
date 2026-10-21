/**
 * 选区适配工具测试
 */

import { describe, it, expect } from 'vitest';
import type { BlockEntity } from '@logseq/libs/dist/LSPlugin.user';
import {
  calculateToolbarPositionFromPoint,
  createSelectionFromSDKEvent,
  getBlockContent,
  getSelectionAnchor,
  replaceSelectionInContent,
  resolveSelectionRange,
  toDOMRect,
  type SDKSelectionEvent,
} from './selection';

const block = (content: string): BlockEntity => ({
  uuid: 'block-1',
  content,
} as unknown as BlockEntity);

const createEvent = (overrides: Partial<SDKSelectionEvent> = {}): SDKSelectionEvent => ({
  text: 'world',
  start: 6,
  end: 11,
  caret: {
    left: 12,
    top: 16,
    height: 20,
    pos: 6,
    rect: new DOMRect(100, 200, 300, 20),
  },
  point: { x: 150, y: 220 },
  ...overrides,
});

describe('toDOMRect', () => {
  it('应该把普通 rect 对象转换成 DOMRect', () => {
    const rect = toDOMRect({ left: 10, top: 20, width: 30, height: 40 });

    expect(rect.left).toBe(10);
    expect(rect.top).toBe(20);
    expect(rect.width).toBe(30);
    expect(rect.height).toBe(40);
    expect(rect.right).toBe(40);
    expect(rect.bottom).toBe(60);
  });

  it('应该在没有 rect 时使用 point 作为左上角', () => {
    const rect = toDOMRect(null, { x: 12, y: 34 });

    expect(rect.left).toBe(12);
    expect(rect.top).toBe(34);
    expect(rect.width).toBe(0);
    expect(rect.height).toBe(0);
  });

  it('应该兼容只有 x/y/right/bottom 的 rect', () => {
    const rect = toDOMRect({ x: 5, y: 6, right: 25, bottom: 36 });

    expect(rect.left).toBe(5);
    expect(rect.top).toBe(6);
    expect(rect.width).toBe(20);
    expect(rect.height).toBe(30);
  });
});

describe('getBlockContent', () => {
  it('content 为空时应该回退到非空 title', () => {
    expect(getBlockContent({
      uuid: 'b1',
      content: '',
      title: 'hello world',
    } as unknown as BlockEntity)).toBe('hello world');
  });

  it('content 有值时优先使用 content', () => {
    expect(getBlockContent({
      uuid: 'b1',
      content: 'content text',
      title: 'title text',
    } as unknown as BlockEntity)).toBe('content text');
  });
});

describe('createSelectionFromSDKEvent', () => {
  it('应该使用 start/end 精确切片 before/after', () => {
    const selection = createSelectionFromSDKEvent(createEvent(), block('hello world'));

    expect(selection.text).toBe('world');
    expect(selection.start).toBe(6);
    expect(selection.end).toBe(11);
    expect(selection.before).toBe('hello ');
    expect(selection.after).toBe('');
    expect(selection.source).toBe('sdk');
    expect(selection.point).toEqual({ x: 150, y: 220 });
    expect(selection.block?.uuid).toBe('block-1');
  });

  it('应该保留选区中间的 after 内容', () => {
    const selection = createSelectionFromSDKEvent(
      createEvent({ text: 'world', start: 6, end: 11 }),
      block('hello world again')
    );

    expect(selection.before).toBe('hello ');
    expect(selection.after).toBe(' again');
  });

  it('Host 内容未同步时应该回退到 text.indexOf', () => {
    const selection = createSelectionFromSDKEvent(
      createEvent({ text: 'world', start: 0, end: 5 }),
      block('hello world')
    );

    expect(selection.start).toBe(6);
    expect(selection.end).toBe(11);
    expect(selection.before).toBe('hello ');
    expect(selection.after).toBe('');
  });

  it('文本找不到时应该保留 Host 的原始偏移且不抛异常', () => {
    const selection = createSelectionFromSDKEvent(
      createEvent({ text: 'missing', start: 2, end: 9 }),
      block('hello world')
    );

    expect(selection.start).toBe(2);
    expect(selection.end).toBe(9);
    expect(selection.before).toBe('he');
  });

  it('应该处理空 block 和缺失 point/caret', () => {
    const selection = createSelectionFromSDKEvent({
      text: 'abc',
      start: 0,
      end: 3,
    });

    expect(selection.text).toBe('abc');
    expect(selection.start).toBe(0);
    expect(selection.end).toBe(3);
    expect(selection.before).toBe('');
    expect(selection.after).toBe('');
    expect(selection.point).toEqual({ x: 0, y: 0 });
  });

  it('应该把越界的 start/end 限制在 content 范围内', () => {
    const selection = createSelectionFromSDKEvent(
      createEvent({ text: 'hello world', start: -5, end: 100 }),
      block('hello world')
    );

    expect(selection.start).toBe(0);
    expect(selection.end).toBe(11);
  });
});

describe('resolveSelectionRange', () => {
  it('精确偏移匹配时应该优先使用偏移（重复文本不会替换第一处）', () => {
    const range = resolveSelectionRange('foo bar foo', {
      text: 'foo',
      start: 8,
      end: 11,
    });

    expect(range).toEqual({ start: 8, end: 11 });
  });

  it('偏移与文本不匹配时应该回退到第一处 indexOf', () => {
    const range = resolveSelectionRange('foo bar foo', {
      text: 'foo',
      start: 4,
      end: 7,
    });

    expect(range).toEqual({ start: 0, end: 3 });
  });

  it('文本不存在时应该返回 null', () => {
    expect(resolveSelectionRange('hello', { text: 'missing' })).toBeNull();
  });

  it('空文本应该返回 null', () => {
    expect(resolveSelectionRange('hello', { text: '' })).toBeNull();
  });
});

describe('replaceSelectionInContent', () => {
  it('应该按 start/end 精确替换', () => {
    const result = replaceSelectionInContent(
      'hello world',
      { text: 'world', start: 6, end: 11 },
      'Logseq'
    );

    expect(result).toBe('hello Logseq');
  });

  it('重复文本应该替换选中的那一处', () => {
    const result = replaceSelectionInContent(
      'foo bar foo',
      { text: 'foo', start: 8, end: 11 },
      'baz'
    );

    expect(result).toBe('foo bar baz');
  });

  it('找不到选区时应该返回 null', () => {
    const result = replaceSelectionInContent(
      'hello world',
      { text: 'missing', start: 0, end: 7 },
      'x'
    );

    expect(result).toBeNull();
  });
});

describe('getSelectionAnchor', () => {
  it('应该优先使用鼠标释放点', () => {
    const anchor = getSelectionAnchor(createEvent());
    expect(anchor).toEqual({ x: 150, y: 220 });
  });

  it('没有 point 时应该使用 caret 相对 textarea 的偏移', () => {
    const anchor = getSelectionAnchor({
      text: 'world',
      start: 6,
      end: 11,
      caret: {
        left: 12,
        top: 16,
        rect: new DOMRect(100, 200, 300, 20),
      },
      point: null,
    });

    expect(anchor).toEqual({ x: 112, y: 216 });
  });

  it('point 为 0,0 时应该回退到 caret（键盘选区常见）', () => {
    const anchor = getSelectionAnchor({
      text: 'world',
      start: 6,
      end: 11,
      caret: {
        left: 12,
        top: 16,
        rect: new DOMRect(100, 200, 300, 20),
      },
      point: { x: 0, y: 0 },
    });

    expect(anchor).toEqual({ x: 112, y: 216 });
  });
});

describe('calculateToolbarPositionFromPoint', () => {
  it('空间足够时应该放在锚点上方', () => {
    const position = calculateToolbarPositionFromPoint({ x: 500, y: 400 }, 200);
    expect(position).toEqual({ x: 500, y: 365 });
  });

  it('上方空间不足时应该放在锚点下方', () => {
    const position = calculateToolbarPositionFromPoint({ x: 500, y: 10 }, 200);
    expect(position).toEqual({ x: 500, y: 13 });
  });

  it('左侧越界时应该限制到半个工具栏宽度', () => {
    const position = calculateToolbarPositionFromPoint({ x: 0, y: 400 }, 200);
    expect(position.x).toBe(100);
  });

  it('右侧越界时应该限制在视口内', () => {
    const viewportWidth = window.innerWidth;
    const position = calculateToolbarPositionFromPoint({ x: viewportWidth, y: 400 }, 200);
    expect(position.x).toBe(viewportWidth - 100);
  });
});
