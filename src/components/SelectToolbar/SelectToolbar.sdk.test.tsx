/**
 * SelectToolbar SDK 选区链路测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import SelectToolbar from './';
import { SettingsProvider } from '../../settings/useSettings';

const sdkMock = vi.hoisted(() => ({
  handler: undefined as ((event: any) => void) | undefined,
  unsubscribe: vi.fn(),
  getCurrentBlock: vi.fn(),
  getEditingCursorPosition: vi.fn(),
  executeAction: vi.fn(),
  emit: vi.fn(),
}));

vi.mock('../../logseq/utils', () => ({
  getSelection: vi.fn().mockReturnValue(null),
  getWindow: vi.fn().mockReturnValue(window),
  getDocument: vi.fn().mockReturnValue(document),
}));

vi.mock('../../logseq', () => ({
  logseqAPI: {
    Editor: {
      onInputSelectionEnd: vi.fn((handler: (event: any) => void) => {
        sdkMock.handler = handler;
        return sdkMock.unsubscribe;
      }),
      getCurrentBlock: sdkMock.getCurrentBlock,
      getEditingCursorPosition: sdkMock.getEditingCursorPosition,
    },
    UI: { showMsg: vi.fn() },
  },
}));

vi.mock('../../lib/toolbar', () => ({
  toolbarManager: {
    isReady: vi.fn().mockReturnValue(true),
    initialize: vi.fn(),
    setLanguage: vi.fn(),
    executeAction: sdkMock.executeAction,
  },
  eventBus: {
    on: vi.fn(),
    off: vi.fn(),
    emit: sdkMock.emit,
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

const sdkEvent = (overrides: Record<string, any> = {}) => ({
  text: 'world',
  start: 6,
  end: 11,
  caret: {
    left: 20,
    top: 10,
    height: 20,
    pos: 6,
    rect: new DOMRect(100, 200, 300, 20),
  },
  point: { x: 150, y: 220 },
  ...overrides,
});

const renderToolbar = (targetElement: HTMLElement | null) => {
  const Provider = SettingsProvider as any;
  return render(
    <Provider settings={settings}>
      <SelectToolbar targetElement={targetElement} items={items} theme="light" />
    </Provider>
  );
};

describe('SelectToolbar SDK 选区链路', () => {
  beforeEach(() => {
    sdkMock.handler = undefined;
    sdkMock.getCurrentBlock.mockReset();
    sdkMock.getCurrentBlock.mockResolvedValue({ uuid: 'block-1', content: 'hello world' });
    sdkMock.getEditingCursorPosition.mockReset();
    sdkMock.getEditingCursorPosition.mockResolvedValue(null);
    sdkMock.executeAction.mockReset();
    sdkMock.executeAction.mockResolvedValue(undefined);
    sdkMock.emit.mockReset();
    sdkMock.unsubscribe.mockReset();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('应该在 onInputSelectionEnd 回调后显示工具栏并带 start/end', async () => {
    const { container } = renderToolbar(null);

    await waitFor(() => expect(sdkMock.handler).toBeTypeOf('function'));
    await act(async () => {
      sdkMock.handler?.(sdkEvent());
    });

    await waitFor(() => {
      expect(container.querySelector('.ltt-floating-toolbar')).toBeTruthy();
    });

    expect(sdkMock.emit).toHaveBeenCalledWith(
      'ltt-selectionChange',
      expect.objectContaining({
        selectedData: expect.objectContaining({
          text: 'world',
          start: 6,
          end: 11,
          before: 'hello ',
          after: '',
          source: 'sdk',
        }),
      })
    );
  });

  it('应该用 point 作为锚点定位工具栏', async () => {
    const { container } = renderToolbar(null);
    await waitFor(() => expect(sdkMock.handler).toBeTypeOf('function'));

    await act(async () => {
      sdkMock.handler?.(sdkEvent({ point: { x: 300, y: 400 } }));
    });

    const toolbar = await waitFor(() => {
      const element = container.querySelector('.ltt-floating-toolbar') as HTMLElement;
      expect(element).toBeTruthy();
      return element;
    });

    expect(toolbar.style.top).toBe('365px');
    expect(toolbar.getAttribute('data-selection-source')).toBe('sdk');
  });

  it('空选区应该隐藏工具栏', async () => {
    const { container } = renderToolbar(null);
    await waitFor(() => expect(sdkMock.handler).toBeTypeOf('function'));

    await act(async () => {
      sdkMock.handler?.(sdkEvent());
    });
    await waitFor(() => expect(container.querySelector('.ltt-floating-toolbar')).toBeTruthy());

    await act(async () => {
      sdkMock.handler?.(sdkEvent({ text: '', start: 6, end: 6 }));
    });
    await waitFor(() => expect(container.querySelector('.ltt-floating-toolbar')).toBeNull());
  });

  it('点击工具栏项目应该把 start/end 传给执行器', async () => {
    const { container } = renderToolbar(null);
    await waitFor(() => expect(sdkMock.handler).toBeTypeOf('function'));

    await act(async () => {
      sdkMock.handler?.(sdkEvent());
    });
    const item = await waitFor(() => {
      const element = container.querySelector('.ltt-toolbar-main-item') as HTMLElement;
      expect(element).toBeTruthy();
      return element;
    });

    fireEvent.click(item);

    await waitFor(() => {
      expect(sdkMock.executeAction).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'bold' }),
        expect.objectContaining({ text: 'world', start: 6, end: 11 })
      );
    });
  });

  it('连续触发时应该丢弃过期的 getCurrentBlock 结果', async () => {
    let resolveFirst: ((value: any) => void) | undefined;
    const firstBlock = new Promise((resolve) => {
      resolveFirst = resolve;
    });

    sdkMock.getCurrentBlock
      .mockReturnValueOnce(firstBlock)
      .mockResolvedValueOnce({ uuid: 'block-1', content: 'hello world' });

    const { container } = renderToolbar(null);
    await waitFor(() => expect(sdkMock.handler).toBeTypeOf('function'));

    await act(async () => {
      sdkMock.handler?.(sdkEvent({ text: 'first', start: 6, end: 11 }));
      sdkMock.handler?.(sdkEvent({ text: 'world', start: 6, end: 11 }));
    });

    await waitFor(() => {
      expect(container.querySelector('.ltt-floating-toolbar')).toBeTruthy();
    });

    await act(async () => {
      resolveFirst?.({ uuid: 'block-1', content: 'hello first' });
    });

    const selectionEmits = sdkMock.emit.mock.calls.filter(([event]) => event === 'ltt-selectionChange');
    expect(selectionEmits.length).toBe(1);
    expect(selectionEmits[0][1].selectedData).toEqual(
      expect.objectContaining({ text: 'world', start: 6, end: 11 })
    );
  });

  it('卸载时应该取消 onInputSelectionEnd 订阅', async () => {
    const { unmount } = renderToolbar(null);
    await waitFor(() => expect(sdkMock.handler).toBeTypeOf('function'));

    unmount();

    expect(sdkMock.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('getCurrentBlock 失败时仍应显示工具栏（before/after 为空）', async () => {
    sdkMock.getCurrentBlock.mockRejectedValueOnce(new Error('db busy'));
    const { container } = renderToolbar(null);
    await waitFor(() => expect(sdkMock.handler).toBeTypeOf('function'));

    await act(async () => {
      sdkMock.handler?.(sdkEvent());
    });

    await waitFor(() => {
      expect(container.querySelector('.ltt-floating-toolbar')).toBeTruthy();
    });
    expect(sdkMock.emit).toHaveBeenCalledWith(
      'ltt-selectionChange',
      expect.objectContaining({
        selectedData: expect.objectContaining({ text: 'world', start: 6, end: 11 }),
      })
    );
  });
});
