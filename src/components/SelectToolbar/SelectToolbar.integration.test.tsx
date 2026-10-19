/**
 * SelectToolbar 真实 Mock Host 集成测试
 *
 * 不 mock logseqAPI：使用 src/logseq/mock/editor.ts 的 textarea 选区实现，
 * 走完整链路：textarea select -> onInputSelectionEnd -> 工具栏 -> 点击 -> updateBlock。
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import SelectToolbar from './';
import { SettingsProvider } from '../../settings/useSettings';
import defaultSettings from '../../settings/defaultSettings';
import { toolbarManager, eventBus } from '../../lib/toolbar';

const settings = {
  ...defaultSettings,
  toolbar: true,
  ToolbarItems: [
    {
      id: 'bold',
      label: '粗体',
      icon: 'B',
      invoke: 'replace',
      invokeParams: '**${selectedText}**',
    },
  ],
} as any;

describe('SelectToolbar 真实 Mock Host 集成', () => {
  let textarea: HTMLTextAreaElement;
  let main: HTMLElement;

  beforeEach(() => {
    toolbarManager.reset();
    document.body.innerHTML = `
      <div id="app-container">
        <div id="main-content-container">
          <div class="ls-block">
            <div class="editor-inner">
              <textarea id="edit-block-1" class="block-editor">hello world</textarea>
              <div class="mock-text"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    textarea = document.getElementById('edit-block-1') as HTMLTextAreaElement;
    main = document.getElementById('main-content-container') as HTMLElement;
    textarea.focus();
    textarea.setSelectionRange(6, 11);
  });

  afterEach(() => {
    toolbarManager.reset();
    document.body.innerHTML = '';
  });

  it('应该从 textarea 选区生成工具栏并完成格式化替换', async () => {
    const onSelection = vi.fn();
    eventBus.on('ltt-selectionChange', onSelection);

    const Provider = SettingsProvider as any;
    const { container } = render(
      <Provider settings={settings}>
        <SelectToolbar targetElement={main} items={settings.ToolbarItems} theme="light" />
      </Provider>
    );

    fireEvent.mouseDown(document, { clientX: 150, clientY: 220 });
    fireEvent.mouseUp(document, { clientX: 150, clientY: 220 });

    const toolbar = await waitFor(() => {
      const element = container.querySelector('.ltt-floating-toolbar') as HTMLElement;
      expect(element).toBeTruthy();
      return element;
    });

    expect(toolbar.getAttribute('data-selection-source')).toBe('sdk');
    expect(onSelection).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedData: expect.objectContaining({
          text: 'world',
          start: 6,
          end: 11,
          before: 'hello ',
          after: '',
        }),
      })
    );

    const item = container.querySelector('.ltt-toolbar-main-item') as HTMLElement;
    expect(item).toBeTruthy();
    fireEvent.click(item);

    await waitFor(() => {
      expect(textarea.value).toBe('hello **world**');
    });
  });

  it('重复文本应该替换 textarea 中实际选中的那一处', async () => {
    textarea.value = 'foo bar foo';
    textarea.setSelectionRange(8, 11);

    const Provider = SettingsProvider as any;
    const { container } = render(
      <Provider settings={settings}>
        <SelectToolbar targetElement={main} items={settings.ToolbarItems} theme="light" />
      </Provider>
    );

    fireEvent.mouseDown(document, { clientX: 150, clientY: 220 });
    fireEvent.mouseUp(document, { clientX: 150, clientY: 220 });

    await waitFor(() => {
      expect(container.querySelector('.ltt-floating-toolbar')).toBeTruthy();
    });

    const item = container.querySelector('.ltt-toolbar-main-item') as HTMLElement;
    fireEvent.click(item);

    await waitFor(() => {
      expect(textarea.value).toBe('foo bar **foo**');
    });
  });
});
