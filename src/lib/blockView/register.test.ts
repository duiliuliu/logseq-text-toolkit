/**
 * BlockView 宏渲染与事件委托测试
 *
 * 重点覆盖 Logseq DB 2.0.2 的 `.ls-block[blockid]` DOM：
 * - 宏渲染后能找到块并应用视图 class
 * - slot 重新挂载后按钮仍然可点击（事件委托）
 * - 点击视图按钮会更新宏参数
 */

import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
  macroHandler: undefined as ((args: any) => Promise<void> | void) | undefined,
  provideUI: vi.fn(),
  getBlock: vi.fn(),
  updateBlock: vi.fn(),
  registerSlashCommand: vi.fn(),
  insertAtEditingCursor: vi.fn(),
  getSettingsWithSystem: vi.fn(),
  settingsHandler: undefined as (() => void) | undefined,
  onSettingsChanged: vi.fn(),
}));

vi.mock('../../logseq', () => ({
  logseqAPI: {
    provideUI: mocks.provideUI,
    App: {
      onMacroRendererSlotted: vi.fn((handler: (args: any) => Promise<void> | void) => {
        mocks.macroHandler = handler;
      }),
    },
    Editor: {
      getBlock: mocks.getBlock,
      updateBlock: mocks.updateBlock,
      registerSlashCommand: mocks.registerSlashCommand,
      insertAtEditingCursor: mocks.insertAtEditingCursor,
    },
    onSettingsChanged: mocks.onSettingsChanged,
  },
}));

vi.mock('../../settings', () => ({
  getSettingsWithSystem: mocks.getSettingsWithSystem,
  getSettings: vi.fn().mockReturnValue({ language: 'zh-CN' }),
}));

vi.mock('../logger', () => ({
  default: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { registerBlockView, clearBlockViewRuntimeState } from './register';
import { clearBlockViewStates } from './dom';

const blockId = 'block-1';

function renderPayload(view = 'list') {
  return {
    payload: {
      uuid: blockId,
      arguments: [':blockview', `view=${view}`],
    },
    slot: 'slot-1',
  };
}

describe('BlockView 宏渲染', () => {
  beforeAll(() => {
    mocks.onSettingsChanged.mockImplementation((handler: () => void) => {
      mocks.settingsHandler = handler;
      return vi.fn();
    });
    registerBlockView();
  });

  beforeEach(() => {
    clearBlockViewStates();
    clearBlockViewRuntimeState();
    document.body.innerHTML = `
      <div id="app-container"></div>
      <div class="ls-block" blockid="${blockId}">
        <div class="block-main-container">Parent</div>
        <div class="block-children-container">
          <div class="block-children">
            <div class="blocks-list-wrap">
              <div class="ls-block" blockid="child-1">
                <div class="block-main-container">Child</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    mocks.provideUI.mockReset();
    mocks.provideUI.mockImplementation(({ template }: { template: string }) => {
      const container = document.getElementById('app-container') as HTMLElement;
      container.insertAdjacentHTML('beforeend', template);
    });
    mocks.getBlock.mockReset();
    mocks.getBlock.mockResolvedValue({
      uuid: blockId,
      content: '{{renderer :blockview, view=list}}',
    });
    mocks.updateBlock.mockReset();
    mocks.updateBlock.mockResolvedValue(undefined);
    mocks.getSettingsWithSystem.mockReset();
    mocks.getSettingsWithSystem.mockResolvedValue({
      language: 'zh-CN',
      blockView: {
        defaultView: 'list',
        defaultTheme: 'default',
        hideViewBar: false,
        inline: false,
        enabled: true,
      },
    });
  });

  it('应该通过 blockid 找到 DB 2.0.2 的块并应用视图 class', async () => {
    await mocks.macroHandler?.(renderPayload('table'));

    const block = document.querySelector(`.ls-block[blockid="${blockId}"]`) as HTMLElement;
    await waitFor(() => {
      expect(block.classList.contains('ltt-table-root')).toBe(true);
    });
    expect(block.classList.contains('theme-default')).toBe(true);

    const bar = document.querySelector('.ltt-view-bar') as HTMLElement;
    expect(bar).toBeTruthy();
    expect(bar.getAttribute('data-block-id')).toBe(blockId);
    expect(bar.getAttribute('data-theme')).toBe('default');
    expect(bar.getAttribute('data-ltt-empty')).toBe('false');
    expect(bar.querySelectorAll('.ltt-view-btn').length).toBe(4);
  });

  it('设置读取失败时应该使用默认视图继续渲染', async () => {
    mocks.getSettingsWithSystem.mockRejectedValueOnce(new Error('settings unavailable'));

    await mocks.macroHandler?.(renderPayload('list'));

    const block = document.querySelector(`.ls-block[blockid="${blockId}"]`) as HTMLElement;
    await waitFor(() => {
      expect(block.classList.contains('ltt-list-root')).toBe(true);
    });
    expect(block.classList.contains('theme-default')).toBe(true);
    expect(document.querySelector('.ltt-view-bar')).toBeTruthy();
  });

  it('点击视图按钮应该更新宏参数并切换 class', async () => {
    await mocks.macroHandler?.(renderPayload('list'));

    const block = document.querySelector(`.ls-block[blockid="${blockId}"]`) as HTMLElement;
    await waitFor(() => expect(block.classList.contains('ltt-list-root')).toBe(true));

    const tableButton = document.querySelector('.ltt-view-btn[data-view="table"]') as HTMLElement;
    fireEvent.click(tableButton);

    await waitFor(() => {
      expect(block.classList.contains('ltt-table-root')).toBe(true);
    });
    await waitFor(() => {
      expect(mocks.updateBlock).toHaveBeenCalledWith(
        blockId,
        expect.stringMatching(/:blockview.*table/)
      );
    });
    expect(tableButton.classList.contains('active')).toBe(true);
    expect(tableButton.getAttribute('aria-pressed')).toBe('true');
  });

  it('应该把设置页里的视图选项真正应用到 DOM', async () => {
    mocks.getSettingsWithSystem.mockResolvedValue({
      language: 'zh-CN',
      blockView: {
        defaultView: 'table',
        defaultTheme: 'default',
        hideViewBar: false,
        inline: false,
        enabled: true,
        table: { showStriped: false, showBorder: false },
        gallery: { cardsPerRow: 2, showCardBorders: false, cardSpacing: '8px' },
        board: { showColumnBorders: false, cardSpacing: '14px' },
      },
    });

    await mocks.macroHandler?.(renderPayload('table'));
    const block = document.querySelector(`.ls-block[blockid="${blockId}"]`) as HTMLElement;

    await waitFor(() => {
      expect(block.getAttribute('data-ltt-view')).toBe('table');
    });
    expect(block.getAttribute('data-ltt-striped')).toBe('false');
    expect(block.getAttribute('data-ltt-table-border')).toBe('false');
    expect(block.getAttribute('data-ltt-columns')).toBe('1');

    const galleryButton = document.querySelector('.ltt-view-btn[data-view="gallery"]') as HTMLElement;
    fireEvent.click(galleryButton);

    await waitFor(() => {
      expect(block.getAttribute('data-ltt-view')).toBe('gallery');
    });
    expect(block.style.getPropertyValue('--ltt-cards-per-row')).toBe('2');
    expect(block.style.getPropertyValue('--ltt-gap')).toBe('8px');
    expect(block.getAttribute('data-ltt-card-borders')).toBe('false');

    const boardButton = document.querySelector('.ltt-view-btn[data-view="board"]') as HTMLElement;
    fireEvent.click(boardButton);

    await waitFor(() => {
      expect(block.getAttribute('data-ltt-view')).toBe('board');
    });
    expect(block.style.getPropertyValue('--ltt-gap')).toBe('14px');
    expect(block.getAttribute('data-ltt-column-borders')).toBe('false');
  });

  it('hideViewBar 时应该渲染但隐藏视图栏', async () => {
    mocks.getSettingsWithSystem.mockResolvedValue({
      language: 'zh-CN',
      blockView: {
        defaultView: 'list',
        defaultTheme: 'default',
        hideViewBar: true,
        inline: false,
      },
    });

    await mocks.macroHandler?.(renderPayload('table'));

    const block = document.querySelector(`.ls-block[blockid="${blockId}"]`) as HTMLElement;
    await waitFor(() => expect(block.classList.contains('ltt-table-root')).toBe(true));
    expect(block.getAttribute('data-ltt-hide-view-bar')).toBe('true');
    const bar = document.querySelector('.ltt-view-bar') as HTMLElement;
    expect(bar).toBeTruthy();
    expect(bar.getAttribute('data-ltt-hidden')).toBe('true');
  });

  it('设置变更后应该立即刷新已打开的块视图', async () => {
    await mocks.macroHandler?.(renderPayload('table'));
    const block = document.querySelector(`.ls-block[blockid="${blockId}"]`) as HTMLElement;
    await waitFor(() => expect(block.getAttribute('data-ltt-table-border')).toBe('true'));

    mocks.getSettingsWithSystem.mockResolvedValue({
      language: 'zh-CN',
      blockView: {
        defaultView: 'table',
        defaultTheme: 'default',
        hideViewBar: false,
        inline: false,
        enabled: true,
        table: { showStriped: false, showBorder: false },
      },
    });

    mocks.settingsHandler?.();

    await waitFor(() => {
      expect(block.getAttribute('data-ltt-table-border')).toBe('false');
    });
  });

  it('表格列数应该按实际嵌套单元格数量计算', async () => {
    const child = document.querySelector('.ls-block[blockid="child-1"]') as HTMLElement;
    child.insertAdjacentHTML(
      'beforeend',
      '<div class="block-children-container"><div class="block-children"><div class="blocks-list-wrap">' +
        '<div class="ls-block" blockid="cell-1"><div class="block-main-container">Cell 1</div></div>' +
        '<div class="ls-block" blockid="cell-2"><div class="block-main-container">Cell 2</div></div>' +
      '</div></div></div>'
    );

    await mocks.macroHandler?.(renderPayload('table'));

    const block = document.querySelector(`.ls-block[blockid="${blockId}"]`) as HTMLElement;
    await waitFor(() => expect(block.getAttribute('data-ltt-view')).toBe('table'));
    expect(block.getAttribute('data-ltt-columns')).toBe('2');
    expect(block.style.getPropertyValue('--ltt-table-columns')).toBe('2');
  });

  it('没有子块时应该显示空状态提示', async () => {
    const parent = document.querySelector(`.ls-block[blockid="${blockId}"]`) as HTMLElement;
    parent.querySelector('.block-children-container')?.remove();

    await mocks.macroHandler?.(renderPayload('table'));

    const bar = await waitFor(() => {
      const element = document.querySelector('.ltt-view-bar') as HTMLElement;
      expect(element).toBeTruthy();
      return element;
    });

    expect(bar.getAttribute('data-ltt-empty')).toBe('true');
    expect(bar.querySelector('.ltt-view-empty-hint')?.textContent).toContain('添加子块');
  });

  it('折叠块即使没有 children DOM 也不应该显示空状态', async () => {
    const parent = document.querySelector(`.ls-block[blockid="${blockId}"]`) as HTMLElement;
    parent.querySelector('.block-children-container')?.remove();
    parent.insertAdjacentHTML(
      'afterbegin',
      '<div class="block-control-wrap" data-has-children="true"></div>'
    );

    await mocks.macroHandler?.(renderPayload('list'));

    const bar = await waitFor(() => {
      const element = document.querySelector('.ltt-view-bar') as HTMLElement;
      expect(element).toBeTruthy();
      return element;
    });
    expect(bar.getAttribute('data-ltt-empty')).toBe('false');
  });

  it('视图栏支持左右方向键移动焦点', async () => {
    await mocks.macroHandler?.(renderPayload('list'));

    const listButton = document.querySelector('.ltt-view-btn[data-view="list"]') as HTMLElement;
    const tableButton = document.querySelector('.ltt-view-btn[data-view="table"]') as HTMLElement;
    await waitFor(() => expect(listButton).toBeTruthy());

    listButton.focus();
    fireEvent.keyDown(listButton, { key: 'ArrowRight' });

    expect(document.activeElement).toBe(tableButton);

    fireEvent.keyDown(tableButton, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(listButton);
  });

  it('slot 被重置后按钮仍然可点击（事件委托）', async () => {
    await mocks.macroHandler?.(renderPayload('list'));
    const appContainer = document.getElementById('app-container') as HTMLElement;

    // 模拟 provideUI reset：移除旧 slot 并重新插入
    appContainer.innerHTML = '';
    await mocks.macroHandler?.(renderPayload('list'));

    const galleryButton = document.querySelector('.ltt-view-btn[data-view="gallery"]') as HTMLElement;
    fireEvent.click(galleryButton);

    await waitFor(() => {
      expect(mocks.updateBlock).toHaveBeenCalledWith(
        blockId,
        expect.stringMatching(/:blockview.*gallery/)
      );
    });
  });
});
