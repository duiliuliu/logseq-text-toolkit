/**
 * SelectToolbar 原生 DOM Selection 回退测试
 *
 * 用于覆盖旧 Host / file 图没有 Editor.onInputSelectionEnd 的场景。
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import SelectToolbar from './';
import { SettingsProvider } from '../../settings/useSettings';
import { logseqAPI } from '../../logseq';

const nativeMock = vi.hoisted(() => ({
  getSelection: vi.fn(),
  getCurrentBlock: vi.fn(),
  getEditingCursorPosition: vi.fn(),
  executeAction: vi.fn(),
  emit: vi.fn(),
}));

vi.mock('../../logseq/utils', () => ({
  getSelection: nativeMock.getSelection,
  getWindow: vi.fn().mockReturnValue(window),
  getDocument: vi.fn().mockReturnValue(document),
}));

vi.mock('../../logseq', () => ({
  logseqAPI: {
    Editor: {
      getCurrentBlock: nativeMock.getCurrentBlock,
      getEditingCursorPosition: nativeMock.getEditingCursorPosition,
    },
    UI: { showMsg: vi.fn() },
  },
}));

vi.mock('../../lib/toolbar', () => ({
  toolbarManager: {
    isReady: vi.fn().mockReturnValue(true),
    initialize: vi.fn(),
    setLanguage: vi.fn(),
    executeAction: nativeMock.executeAction,
  },
  eventBus: {
    on: vi.fn(),
    off: vi.fn(),
    emit: nativeMock.emit,
  },
}));

vi.mock('../../lib/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

const settings = {
  theme: 'light' as const,
  showBorder: true,
  width: '110px',
  height: '24px',
  hoverDelay: 500,
  sponsorEnabled: false,
  language: 'zh-CN' as const,
};

const items = [
  { id: 'bold', label: '粗体', icon: 'B', invoke: 'add', invokeParams: '${selectedText}' },
];

const createSelection = (target: HTMLElement, text: string) => {
  const rect = new DOMRect(150, 300, 50, 20);
  return {
    toString: () => text,
    anchorNode: target,
    focusNode: target,
    rangeCount: 1,
    getRangeAt: () => ({
      startContainer: target,
      endContainer: target,
      startOffset: 0,
      endOffset: text.length,
      getBoundingClientRect: () => rect,
    }),
  };
};

const renderToolbar = (targetElement: HTMLElement | null) => {
  const Provider = SettingsProvider as any;
  return render(
    <Provider settings={settings}>
      <SelectToolbar targetElement={targetElement} items={items} theme="light" />
    </Provider>
  );
};

describe('SelectToolbar 原生选区回退', () => {
  let target: HTMLElement;

  beforeEach(() => {
    delete (logseqAPI.Editor as any).onInputSelectionEnd;
    target = document.createElement('div');
    target.className = 'ls-block';
    target.textContent = 'hello world';
    document.body.appendChild(target);

    nativeMock.getSelection.mockReset();
    nativeMock.getCurrentBlock.mockReset();
    nativeMock.getCurrentBlock.mockResolvedValue({ uuid: 'block-1', content: 'hello world' });
    nativeMock.getEditingCursorPosition.mockReset();
    nativeMock.getEditingCursorPosition.mockResolvedValue({
      left: 10,
      top: 20,
      height: 20,
      pos: 6,
      rect: new DOMRect(100, 200, 300, 20),
    });
    nativeMock.executeAction.mockReset();
    nativeMock.emit.mockReset();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('没有 SDK Hook 时应该通过 mouseup + DOM Selection 显示工具栏', async () => {
    nativeMock.getSelection.mockReturnValue(createSelection(target, 'world'));
    const { container } = renderToolbar(target);

    fireEvent.mouseUp(target);

    const toolbar = await waitFor(() => {
      const element = container.querySelector('.ltt-floating-toolbar') as HTMLElement;
      expect(element).toBeTruthy();
      return element;
    });

    expect(toolbar.getAttribute('data-selection-source')).toBe('native');
    expect(nativeMock.emit).toHaveBeenCalledWith(
      'ltt-selectionChange',
      expect.objectContaining({
        selectedData: expect.objectContaining({
          text: 'world',
          start: 6,
          end: 11,
          before: 'hello ',
          after: '',
          source: 'native',
        }),
      })
    );
  });

  it('getEditingCursorPosition 返回 null 时应该使用 Range rect 定位', async () => {
    nativeMock.getSelection.mockReturnValue(createSelection(target, 'world'));
    nativeMock.getEditingCursorPosition.mockResolvedValue(null);
    const { container } = renderToolbar(target);

    fireEvent.mouseUp(target);

    const toolbar = await waitFor(() => {
      const element = container.querySelector('.ltt-floating-toolbar') as HTMLElement;
      expect(element).toBeTruthy();
      return element;
    });

    // Range rect top=300 -> 300 - 32 - 3 = 265
    expect(toolbar.style.top).toBe('265px');
  });

  it('SDK Hook 存在但从不触发时应该回退到原生选区', async () => {
    // 模拟旧版 Host：API 存在，但实际不派发事件
    (logseqAPI.Editor as any).onInputSelectionEnd = vi.fn(() => vi.fn());
    nativeMock.getSelection.mockReturnValue(createSelection(target, 'world'));

    const { container } = renderToolbar(target);
    fireEvent.mouseUp(target);

    const toolbar = await waitFor(() => {
      const element = container.querySelector('.ltt-floating-toolbar') as HTMLElement;
      expect(element).toBeTruthy();
      return element;
    });

    expect(toolbar.getAttribute('data-selection-source')).toBe('native');
  });

  it('没有选中文字时不应该显示工具栏', async () => {
    nativeMock.getSelection.mockReturnValue(createSelection(target, ''));
    const { container } = renderToolbar(target);

    fireEvent.mouseUp(target);

    await new Promise((resolve) => setTimeout(resolve, 260));
    expect(container.querySelector('.ltt-floating-toolbar')).toBeNull();
  });

  it('选区不在 targetElement 内时不应该显示工具栏', async () => {
    const outside = document.createElement('div');
    document.body.appendChild(outside);
    nativeMock.getSelection.mockReturnValue(createSelection(outside, 'world'));
    const { container } = renderToolbar(target);

    fireEvent.mouseUp(target);

    await new Promise((resolve) => setTimeout(resolve, 260));
    expect(container.querySelector('.ltt-floating-toolbar')).toBeNull();
  });
});
