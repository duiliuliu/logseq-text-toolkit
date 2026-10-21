import { logseqAPI } from '../../logseq';
import { getDocument } from '../../logseq/utils';
import { getSettings, getSettingsWithSystem } from '../../settings';
import { t } from '../../translations/i18n';
import {
  VIEW_REGISTRY,
  ViewType,
  ThemeType,
  type CustomTableTheme,
  type CustomGalleryTheme,
  type CustomBoardTheme,
} from './types';
import { registerRendererArgModel, splitRendererArgs, parseRendererArgs, renderComponent } from '../render';
import { waitForElementById } from '../render/slot';
import { QueryBlockView } from '../../components/BlockView/QueryBlockView';
import { parseQuerySource } from './query';
import { createRendererArgUpdater } from '../render/rendererArgs';
import {
  applyViewClasses,
  applyVisualOptions,
  blockHasChildren,
  clearBlockViewStates,
  THEME_CLASSES,
  ensureBlockViewObserver,
  findBlockElement,
  getRememberedViews,
  hasVirtualizedChildren,
  rememberBlockView,
  syncRememberedViews,
  updateViewBarEmptyState,
  type BlockViewVisualOptions,
} from './dom';
import logger from '../logger';

const MACRO_PREFIX = ':blockview';
const PLUGIN_ID = 'text-toolkit-blockview';
const DEFAULT_SLASH_COMMAND_TEMPLATE = ':blockview, view=list';

registerRendererArgModel(MACRO_PREFIX, {
  positional: ['view'],
  named: ['view', 'theme', 'inline'],
});

const { updateRendererArgs: updateBlockViewArgs } = createRendererArgUpdater([MACRO_PREFIX]);

const CUSTOM_CSS_VARS = [
  '--custom-border-color', '--custom-header-bg', '--custom-header-text',
  '--custom-cell-text', '--custom-header-border', '--custom-row-bg',
  '--custom-row-hover', '--custom-radius', '--custom-header-height',
  '--custom-cell-padding', '--custom-card-bg', '--custom-card-hover',
  '--custom-card-text', '--custom-card-radius', '--custom-card-shadow',
  '--custom-column-bg', '--custom-column-hover', '--custom-card-border'
];

const warnedVirtualizedBlocks = new Set<string>();
const viewOverrides = new Map<string, { view: ViewType; theme: ThemeType; until: number }>();
let viewBarClickBound = false;
let settingsRefreshBound = false;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setViewOverride(blockId: string, view: ViewType, theme: ThemeType): void {
  viewOverrides.set(blockId, { view, theme, until: Date.now() + 2000 });
}

function getViewOverride(blockId: string): { view: ViewType; theme: ThemeType } | null {
  const override = viewOverrides.get(blockId);
  if (!override) {
    return null;
  }
  if (Date.now() > override.until) {
    viewOverrides.delete(blockId);
    return null;
  }
  return { view: override.view, theme: override.theme };
}

function viewLabel(viewType: ViewType, language?: string): string {
  const key = `settings.blockView.view${viewType.charAt(0).toUpperCase()}${viewType.slice(1)}`;
  try {
    const label = t(key as any, language);
    if (label && label !== key) {
      return label;
    }
  } catch {
    // 翻译缺失时回退到英文名
  }
  return VIEW_REGISTRY[viewType].name;
}

function applyCustomTheme(
  blockElement: HTMLElement,
  viewType: ViewType,
  customTheme: any
): void {
  if (customTheme) {
    blockElement.setAttribute('data-custom-theme', 'true');

    const cssVariables: string[] = [];

    if (viewType === 'table') {
      const theme = customTheme as CustomTableTheme;
      cssVariables.push(`--custom-border-color: ${theme.borderColor || '#e2e8f0'}`);
      cssVariables.push(`--custom-header-bg: ${theme.headerBgColor || '#f8fafc'}`);
      cssVariables.push(`--custom-header-text: ${theme.headerTextColor || '#374151'}`);
      cssVariables.push(`--custom-cell-text: ${theme.cellTextColor || '#475569'}`);
      cssVariables.push(`--custom-header-border: ${theme.headerBorderColor || '#cbd5e1'}`);
      cssVariables.push(`--custom-row-bg: ${theme.rowBgColor || '#ffffff'}`);
      cssVariables.push(`--custom-row-hover: ${theme.rowHoverBgColor || '#f1f5f9'}`);
      cssVariables.push(`--custom-radius: ${theme.tableBorderRadius || '8px'}`);
      cssVariables.push(`--custom-header-height: ${theme.headerHeight || '48px'}`);
      cssVariables.push(`--custom-cell-padding: ${theme.cellPadding || '12px 16px'}`);
    } else if (viewType === 'gallery') {
      const theme = customTheme as CustomGalleryTheme;
      cssVariables.push(`--custom-border-color: ${theme.borderColor || '#e2e8f0'}`);
      cssVariables.push(`--custom-card-bg: ${theme.cardBgColor || '#ffffff'}`);
      cssVariables.push(`--custom-card-hover: ${theme.cardHoverBgColor || '#f8fafc'}`);
      cssVariables.push(`--custom-header-bg: ${theme.headerBgColor || 'transparent'}`);
      cssVariables.push(`--custom-header-text: ${theme.headerTextColor || '#374151'}`);
      cssVariables.push(`--custom-card-text: ${theme.cardTextColor || '#475569'}`);
      cssVariables.push(`--custom-card-radius: ${theme.cardBorderRadius || '12px'}`);
      cssVariables.push(`--custom-card-shadow: ${theme.cardShadow || '0 2px 8px rgba(0, 0, 0, 0.06)'}`);
    } else if (viewType === 'board') {
      const theme = customTheme as CustomBoardTheme;
      cssVariables.push(`--custom-border-color: ${theme.borderColor || '#e2e8f0'}`);
      cssVariables.push(`--custom-column-bg: ${theme.columnBgColor || '#ffffff'}`);
      cssVariables.push(`--custom-column-hover: ${theme.columnHoverBgColor || '#f8fafc'}`);
      cssVariables.push(`--custom-header-bg: ${theme.headerBgColor || 'transparent'}`);
      cssVariables.push(`--custom-header-text: ${theme.headerTextColor || '#374151'}`);
      cssVariables.push(`--custom-card-bg: ${theme.cardBgColor || '#ffffff'}`);
      cssVariables.push(`--custom-card-text: ${theme.cardTextColor || '#475569'}`);
      cssVariables.push(`--custom-card-border: ${theme.cardBorderColor || '#e2e8f0'}`);
      cssVariables.push(`--custom-card-radius: ${theme.cardBorderRadius || '8px'}`);
    }

    blockElement.style.cssText += cssVariables.join('; ') + ';';
  } else {
    blockElement.setAttribute('data-custom-theme', 'false');
    CUSTOM_CSS_VARS.forEach(v => blockElement.style.removeProperty(v));
  }
}

function updateTableColumnCount(blockElement: HTMLElement): number {
  const rows = blockElement.querySelectorAll(
    ':scope > .block-children-container > .block-children > .blocks-list-wrap > .ls-block'
  );
  let maxCells = 0;

  rows.forEach((row) => {
    const cells = row.querySelector(
      ':scope > .block-children-container > .block-children > .blocks-list-wrap'
    );
    maxCells = Math.max(maxCells, cells?.children.length ?? 0);
  });

  const columns = Math.max(1, maxCells);
  blockElement.style.setProperty('--ltt-table-columns', String(columns));
  return columns;
}

/**
 * 把 Settings 里已有的开关真正落到 DOM 上。
 * 之前 showStriped / showBorder / cardsPerRow / cardSpacing 等只存在于设置页，
 * 没有对应实现，用户改了也看不到变化。
 */
function applyViewOptions(
  blockElement: HTMLElement,
  viewType: ViewType,
  viewSettings: any
): BlockViewVisualOptions {
    const cardsPerRow = Number(viewSettings?.cardsPerRow);
  const cardsValue = Number.isFinite(cardsPerRow) && cardsPerRow > 0
    ? String(Math.min(Math.max(Math.round(cardsPerRow), 1), 6))
    : '3';
  const gap = typeof viewSettings?.cardSpacing === 'string' && viewSettings.cardSpacing.trim()
    ? viewSettings.cardSpacing.trim()
    : '12px';

  const attributes: Record<string, string> = {
    'data-ltt-striped': String(viewSettings?.showStriped ?? true),
    'data-ltt-table-border': String(viewSettings?.showBorder ?? true),
    'data-ltt-card-borders': String(viewSettings?.showCardBorders ?? true),
    'data-ltt-column-borders': String(viewSettings?.showColumnBorders ?? true),
  };
  const styleVars: Record<string, string> = {
    '--ltt-gap': gap,
    '--ltt-cards-per-row': cardsValue,
  };

  if (viewType === 'table') {
    attributes['data-ltt-columns'] = String(updateTableColumnCount(blockElement));
  }

  return { attributes, styleVars };
}

function syncViewBarState(
  doc: Document,
  blockId: string,
  viewType: ViewType,
  themeType: ThemeType,
  hideViewBar: boolean
): void {
  const bar = doc.querySelector(
    `.ltt-view-bar[data-block-id="${blockId.replace(/["\\]/g, '\\$&')}"]`
  );
  if (!bar) {
    return;
  }

  bar.setAttribute('data-theme', themeType);
  bar.setAttribute('data-ltt-hidden', hideViewBar ? 'true' : 'false');

  bar.querySelectorAll('.ltt-view-btn').forEach((button) => {
    const isActive = button.getAttribute('data-view') === viewType;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

/**
 * 应用视图 class。返回 false 表示块 DOM 尚未挂载，由调用方重试。
 */
async function applyViewStyle(
  blockId: string,
  viewType: ViewType,
  themeType: ThemeType
): Promise<boolean> {
  const doc = getDocument();
  const blockElement = findBlockElement(doc, blockId);
  if (!blockElement) {
    logger.debug('[BlockView] Block element not mounted yet', { blockId });
    return false;
  }

  // Apply the essential classes first. Optional visual settings must never
  // prevent the view from rendering if a host-specific metric throws.
  applyViewClasses(blockElement, viewType, themeType);
  blockElement.setAttribute('data-ltt-view', viewType);
  blockElement.setAttribute('data-ltt-theme', themeType);

  let settings: any = getSettings();
  try {
    settings = await Promise.race([
      getSettingsWithSystem(),
      new Promise((resolve) => setTimeout(() => resolve(getSettings()), 180)),
    ]);
  } catch {
    settings = getSettings();
  }
  let visuals: any = undefined;
  try {
    const viewSettings = (settings?.blockView as any)?.[viewType];
    visuals = applyViewOptions(blockElement, viewType, viewSettings);
    visuals.attributes['data-ltt-hide-view-bar'] = settings?.blockView?.hideViewBar ? 'true' : 'false';
    applyVisualOptions(blockElement, visuals);
  } catch (error) {
    logger.warn('[BlockView] Failed to apply visual options', error);
  }

  try {
    syncViewBarState(
      doc,
      blockId,
      viewType,
      themeType,
      !!settings?.blockView?.hideViewBar
    );
    rememberBlockView(blockId, viewType, themeType, visuals);
    ensureBlockViewObserver(doc);
  } catch (error) {
    logger.warn('[BlockView] Failed to sync view bar', error);
  }

  blockElement.setAttribute(
    'data-ltt-virtualized',
    hasVirtualizedChildren(blockElement) ? 'true' : 'false'
  );

  if (themeType === 'custom') {
    try {
      applyCustomTheme(blockElement, viewType, viewSettings?.customTheme);
    } catch (error) {
      logger.warn('[BlockView] Failed to apply custom theme', error);
    }
  } else {
    blockElement.setAttribute('data-custom-theme', 'false');
    CUSTOM_CSS_VARS.forEach(v => blockElement.style.removeProperty(v));
  }

  const virtualized = hasVirtualizedChildren(blockElement);
  if (virtualized && viewType !== 'list' && !warnedVirtualizedBlocks.has(blockId)) {
    warnedVirtualizedBlocks.add(blockId);
    logger.warn(
      '[BlockView] Virtualized child list detected; table/gallery/board will only style mounted rows. Use list view for very large lists.',
      { blockId }
    );
  }

  updateViewBarEmptyState(blockElement, blockId, doc);
  logger.debug('[BlockView] View & theme applied', { blockId, viewType, themeType, virtualized });
  return true;
}

async function applyViewStyleWithRetry(
  blockId: string,
  viewType: ViewType,
  themeType: ThemeType,
  attempts: number = 10,
  interval: number = 40
): Promise<boolean> {
  for (let i = 0; i < attempts; i += 1) {
    if (await applyViewStyle(blockId, viewType, themeType)) {
      return true;
    }
    await delay(interval);
  }
  logger.warn('[BlockView] Block element not found after retries', { blockId });
  return false;
}

function getCurrentViewFromParams(tokens: string[], defaultView: ViewType): ViewType {
  const argMap = parseRendererArgs(MACRO_PREFIX, tokens);

  if (argMap.view && VIEW_REGISTRY[argMap.view as ViewType]) {
    return argMap.view as ViewType;
  }

  for (const token of tokens) {
    const t = token.trim().toLowerCase();
    if (t && VIEW_REGISTRY[t as ViewType]) {
      return t as ViewType;
    }
  }

  return defaultView;
}

function getCurrentThemeFromParams(tokens: string[], defaultTheme: ThemeType): ThemeType {
  const argMap = parseRendererArgs(MACRO_PREFIX, tokens);

  if (argMap.theme && ['default', 'notion', 'linear', 'dark', 'gradient', 'tana', 'indigo', 'custom'].includes(argMap.theme)) {
    return argMap.theme as ThemeType;
  }

  return defaultTheme;
}

function getCurrentInlineFromParams(tokens: string[], defaultInline: boolean): boolean {
  const argMap = parseRendererArgs(MACRO_PREFIX, tokens);

  if (typeof argMap.inline !== 'undefined') {
    return argMap.inline === 'true';
  }

  return defaultInline;
}

function applyImmediateView(
  doc: Document,
  blockId: string,
  viewType: ViewType,
  themeType: ThemeType,
  settings: any
): boolean {
  const blockElement = findBlockElement(doc, blockId);
  if (!blockElement) return false;
  applyViewClasses(blockElement, viewType, themeType);
  blockElement.setAttribute('data-ltt-view', viewType);
  blockElement.setAttribute('data-ltt-theme', themeType);
  try {
    const viewSettings = (settings?.blockView as any)?.[viewType];
    const visuals = applyViewOptions(blockElement, viewType, viewSettings);
    visuals.attributes['data-ltt-hide-view-bar'] = settings?.blockView?.hideViewBar ? 'true' : 'false';
    applyVisualOptions(blockElement, visuals);
  } catch {
    // CSS classes are enough to render; optional visual settings can fail.
  }
  return true;
}

async function switchView(blockId: string, viewType: ViewType, themeType: ThemeType): Promise<void> {
  // 乐观更新：updateBlock 后宏 payload 可能短暂仍是旧值，
  // 不能让旧 payload 把用户刚点的视图覆盖回去。
  setViewOverride(blockId, viewType, themeType);
  await applyViewStyleWithRetry(blockId, viewType, themeType);

  try {
    const currentBlock = await logseqAPI.Editor.getBlock(blockId);
    if (currentBlock?.content) {
      const updatedContent = updateBlockViewArgs(currentBlock.content, { view: viewType });
      if (updatedContent !== currentBlock.content) {
        await logseqAPI.Editor.updateBlock(blockId, updatedContent);
        logger.debug('[BlockView] Macro parameter updated', { blockId, viewType });

        // updateBlock 会触发块 React 重渲染，稍后恢复视图 class。
        // 如果用户已经切换到别的视图，旧回调不能再把界面覆盖回去。
        const reapplyIfCurrent = () => {
          const override = getViewOverride(blockId);
          if (override && override.view !== viewType) {
            return;
          }
          void applyViewStyleWithRetry(blockId, viewType, themeType, 3, 60);
        };
        setTimeout(reapplyIfCurrent, 0);
        setTimeout(reapplyIfCurrent, 140);
      }
    }
  } catch (err) {
    viewOverrides.delete(blockId);
    logger.error('[BlockView] Failed to update macro parameter', err);
  }
}

/**
 * 事件委托：provideUI 的 slot 可能被重置/重新挂载，不能只给当前按钮绑事件。
 */
function ensureViewBarClickHandler(doc: Document = getDocument()): void {
  if (viewBarClickBound || !doc?.addEventListener) {
    return;
  }
  viewBarClickBound = true;

  doc.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest?.('.ltt-view-btn') as HTMLElement | null;
    if (!button) {
      return;
    }

    const bar = button.closest('.ltt-view-bar') as HTMLElement | null;
    const blockId = bar?.getAttribute('data-block-id') || '';
    const viewType = button.getAttribute('data-view') as ViewType | null;
    const themeType = (bar?.getAttribute('data-theme') as ThemeType | null) || 'default';

    if (!blockId || !viewType || !VIEW_REGISTRY[viewType]) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    bar?.querySelectorAll('.ltt-view-btn').forEach((el) => {
      el.classList.remove('active');
      el.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');

    void switchView(blockId, viewType, themeType);
  });

  // 工具栏键盘导航：左右方向键在视图按钮之间移动焦点。
  doc.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest?.('.ltt-view-btn') as HTMLElement | null;
    if (!button || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) {
      return;
    }

    const bar = button.closest('.ltt-view-bar');
    const buttons = Array.from(bar?.querySelectorAll<HTMLElement>('.ltt-view-btn') ?? []);
    if (buttons.length < 2) {
      return;
    }

    event.preventDefault();
    const index = buttons.indexOf(button);
    const offset = event.key === 'ArrowRight' ? 1 : -1;
    buttons[(index + offset + buttons.length) % buttons.length].focus();
  });
}

function buildViewBarHtml(
  blockId: string,
  currentView: ViewType,
  currentTheme: ThemeType,
  currentInline: boolean,
  hasChildren: boolean,
  hideViewBar: boolean,
  language?: string
): string {
  const inlineClass = currentInline ? 'ltt-view-bar-inline' : '';
  const buttons = Object.values(VIEW_REGISTRY).map((view) => {
    const label = viewLabel(view.id, language);
    const active = view.id === currentView;
    return `
      <button
        type="button"
        class="ltt-view-btn ${active ? 'active' : ''}"
        data-view="${view.id}"
        title="${escapeHtml(label)}"
        aria-pressed="${active ? 'true' : 'false'}"
      >
        ${view.icon}
        <span>${escapeHtml(label)}</span>
      </button>
    `;
  }).join('');

  const emptyHint = `<span class="ltt-view-empty-hint">${escapeHtml(t('settings.blockView.emptyHint', language))}</span>`;

  return `
    <div
      class="ltt-view-bar ${inlineClass}"
      role="toolbar"
      aria-label="${escapeHtml(t('settings.tabs.blockView', language))}"
      aria-orientation="horizontal"
      data-block-id="${escapeHtml(blockId)}"
      data-theme="${escapeHtml(currentTheme)}"
      data-ltt-empty="${hasChildren ? 'false' : 'true'}"
      data-ltt-hidden="${hideViewBar ? 'true' : 'false'}"
    >
      ${buttons}
      ${emptyHint}
    </div>
  `;
}

async function renderViewBar(blockId: string, slot: string, tokens: string[]): Promise<void> {
  const doc = getDocument();
  const containerId = `${PLUGIN_ID}__${slot}`;

  // Class application must not wait for host user-config IPC; on real DB
  // hosts that promise can lag behind and leave the view bar without classes.
  let settings: any = getSettings();
  const blockViewSettings = settings?.blockView || {
    defaultView: 'list' as ViewType,
    defaultTheme: 'default' as ThemeType,
    hideViewBar: false,
    inline: false
  };

  const defaultView: ViewType = VIEW_REGISTRY[blockViewSettings.defaultView as ViewType]
    ? blockViewSettings.defaultView as ViewType
    : 'list';
  const defaultTheme: ThemeType = THEME_CLASSES.includes(blockViewSettings.defaultTheme as ThemeType)
    ? blockViewSettings.defaultTheme as ThemeType
    : 'default';

  const override = getViewOverride(blockId);
  const currentView = override?.view ?? getCurrentViewFromParams(tokens, defaultView);
  const currentTheme = override?.theme ?? getCurrentThemeFromParams(tokens, defaultTheme);
  const currentInline = getCurrentInlineFromParams(tokens, blockViewSettings.inline);
  const querySource = parseQuerySource(tokens);

  ensureViewBarClickHandler(doc);
  ensureBlockViewObserver(doc);

  // hideViewBar 时仍然渲染视图栏，只通过块上的 data-ltt-hide-view-bar
  // 交给 CSS 隐藏，这样用户在设置里重新打开时可以立即恢复。
  const blockElement = findBlockElement(doc, blockId);
  // 块 DOM 还没挂载时不要误报空状态；折叠块通过 data-has-children 判断。
  const hasChildren = querySource ? true : (blockElement ? blockHasChildren(blockElement) : true);

  const viewBarHtml = buildViewBarHtml(
    blockId,
    currentView,
    currentTheme,
    currentInline,
    hasChildren,
    !!blockViewSettings.hideViewBar,
    settings?.language || 'zh-CN'
  );

  logseqAPI.provideUI({
    key: containerId,
    slot,
    reset: true,
    template: `<div id="${containerId}">${viewBarHtml}</div>`,
  });

  const applied = await applyViewStyleWithRetry(blockId, currentView, currentTheme);
  if (!applied) {
    // Real DB hosts can mount the macro slot before the block wrapper is
    // queryable. Apply the class directly on the next frames as a fallback.
    [0, 60, 220, 600].forEach((delay) => {
      setTimeout(() => {
        applyImmediateView(doc, blockId, currentView, currentTheme, settings);
      }, delay);
    });
  }

  // slot 可能比块 DOM 更晚挂载；再同步一次，保证按钮事件和 class 都在。
  setTimeout(() => syncRememberedViews(doc), 0);
  setTimeout(() => syncRememberedViews(doc), 120);
}

function ensureSettingsRefreshHandler(): void {
  if (settingsRefreshBound) {
    return;
  }
  const api = logseqAPI as any;
  if (typeof api.onSettingsChanged !== 'function') {
    return;
  }

  settingsRefreshBound = true;
  api.onSettingsChanged(() => {
    // 设置页修改后，已经打开的块视图立即按新配置重绘。
    for (const { blockId, state } of getRememberedViews()) {
      const override = getViewOverride(blockId);
      void applyViewStyleWithRetry(
        blockId,
        override?.view ?? state.view,
        override?.theme ?? state.theme
      );
    }
  });
}

export function registerBlockView(): void {
  logseqAPI.App.onMacroRendererSlotted(async ({ payload, slot }) => {
    const split = splitRendererArgs(payload.arguments);
    const type = split?.type || '';
    const tokens = split?.tokens || [];

    if (!type.startsWith(MACRO_PREFIX)) return;

    const blockId = payload.uuid;
    logger.debug('[BlockView] Macro triggered', { blockId, type, tokens });

    try {
      await renderViewBar(blockId, slot, tokens);
    } catch (error) {
      logger.error('[BlockView] Failed to render view bar', error);
    }
  });

  logseqAPI.Editor.registerSlashCommand(
    '[Text Toolkit] Insert Block View',
    async () => {
      const settings = await getSettingsWithSystem();
      const template = settings?.blockView?.defaultSlashCommandTemplate || DEFAULT_SLASH_COMMAND_TEMPLATE;
      await logseqAPI.Editor.insertAtEditingCursor(
        `{{renderer ${template}}}`
      );
    }
  );

  ensureViewBarClickHandler(getDocument());
  ensureBlockViewObserver(getDocument());
  ensureSettingsRefreshHandler();

  (logseqAPI.App as any).onCurrentGraphChanged?.(() => {
    clearBlockViewStates();
    viewOverrides.clear();
    warnedVirtualizedBlocks.clear();
  });

  logger.info('[BlockView] Registered successfully');
}

/** 清除临时的乐观视图覆盖与警告状态（不解除事件绑定）。 */
export function clearBlockViewRuntimeState(): void {
  viewOverrides.clear();
  warnedVirtualizedBlocks.clear();
}

/** 仅供测试重置模块级状态。 */
export function resetBlockViewTestingState(): void {
  viewBarClickBound = false;
  settingsRefreshBound = false;
  warnedVirtualizedBlocks.clear();
  viewOverrides.clear();
}
