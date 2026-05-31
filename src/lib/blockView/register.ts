import { logseqAPI } from '../../logseq';
import { getDocument } from '../../logseq/utils';
import { getSettingsWithSystem } from '../../settings';
import { VIEW_REGISTRY, ViewType, ThemeType } from './types';
import { registerRendererArgModel, splitRendererArgs, parseRendererArgs } from '../render';
import { createRendererArgUpdater } from '../render/rendererArgs';
import logger from '../logger';

const MACRO_PREFIX = ':blockview';
const PLUGIN_ID = 'text-toolkit-blockview';

// 存储每个block注入的style元素，用于卸载
const INJECTED_STYLE_ELEMENTS = new Map<string, HTMLStyleElement>();

registerRendererArgModel(MACRO_PREFIX, { positional: ['view'] });

const { updateRendererArgs: updateBlockViewArgs } = createRendererArgUpdater([MACRO_PREFIX]);

const VIEW_CLASSES = [
  'ltt-list-root',
  'ltt-table-root',
  'ltt-gallery-root',
  'ltt-board-root',
  'ltt-mindmap-root'
];

const THEME_CLASSES = [
  'theme-default',
  'theme-notion',
  'theme-linear',
  'theme-dark',
  'theme-gradient',
  'theme-tana',
  'theme-indigo',
  'theme-custom'
];

const CUSTOM_CSS_VARS = [
  '--custom-border-color', '--custom-header-bg', '--custom-header-text',
  '--custom-cell-text', '--custom-header-border', '--custom-row-bg',
  '--custom-row-hover', '--custom-radius', '--custom-header-height',
  '--custom-cell-padding', '--custom-card-bg', '--custom-card-hover',
  '--custom-card-text', '--custom-card-radius', '--custom-card-shadow',
  '--custom-column-bg', '--custom-column-hover', '--custom-card-border'
];

function removeViewStyles(blockElement: HTMLElement): void {
  blockElement.classList.remove(...VIEW_CLASSES, ...THEME_CLASSES);
  
  // 卸载注入的样式
  const blockId = blockElement.getAttribute('data-block-id') || blockElement.id?.replace('ls-block-', '');
  if (blockId && INJECTED_STYLE_ELEMENTS.has(blockId)) {
    const styleEl = INJECTED_STYLE_ELEMENTS.get(blockId);
    if (styleEl) {
      styleEl.remove();
      INJECTED_STYLE_ELEMENTS.delete(blockId);
      logger.debug('[BlockView] Injected styles removed', { blockId });
    }
  }
}

// 注入特定blockId的表格列对齐CSS
function injectTableColumnAlignmentCSS(blockId: string, doc: Document): void {
  const styleId = `ltt-table-align-${blockId}`;
  
  // 先移除已存在的
  const existingStyle = doc.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // 创建新的style元素
  const styleEl = doc.createElement('style');
  styleEl.id = styleId;
  styleEl.textContent = `
    /* 针对特定block的列对齐样式 */
    #ls-block-${blockId}.ltt-table-root > .block-main-container > .block-content-wrapper,
    [data-block-id="${blockId}"].ltt-table-root > .block-main-container > .block-content-wrapper {
      display: flex !important;
      align-items: center !important;
      justify-content: flex-start !important;
    }
    
    /* 表格行使用flex布局，列同步宽度 */
    #ls-block-${blockId}.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block,
    [data-block-id="${blockId}"].ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
      display: flex !important;
      flex-direction: row !important;
      align-items: stretch !important;
      width: max-content !important;
      min-width: 100% !important;
    }
    
    /* 第一列（header）左对齐 */
    #ls-block-${blockId}.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container,
    [data-block-id="${blockId}"].ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container {
      display: flex !important;
      align-items: center !important;
      justify-content: flex-start !important;
      flex-shrink: 0 !important;
      min-width: 150px !important;
      max-width: 350px !important;
    }
    
    /* 其他子节点列左对齐 */
    #ls-block-${blockId}.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > *,
    [data-block-id="${blockId}"].ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > * {
      display: flex !important;
      align-items: center !important;
      justify-content: flex-start !important;
      flex-shrink: 0 !important;
      min-width: 150px !important;
      max-width: 400px !important;
    }
  `;
  
  doc.head.appendChild(styleEl);
  INJECTED_STYLE_ELEMENTS.set(blockId, styleEl);
  logger.debug('[BlockView] Table column alignment styles injected', { blockId });
}

function applyViewStyles(blockElement: HTMLElement, viewType: ViewType, themeType: ThemeType): void {
  const newViewClass = `ltt-${viewType}-root`;
  if (!blockElement.classList.contains(newViewClass)) {
    blockElement.classList.add(newViewClass);
  }

  const newThemeClass = `theme-${themeType}`;
  if (!blockElement.classList.contains(newThemeClass)) {
    blockElement.classList.add(newThemeClass);
  }
}

async function applyCustomTheme(blockElement: HTMLElement, viewType: ViewType): Promise<void> {
  const settings = await getSettingsWithSystem();
  const viewSettings = settings?.blockView?.[viewType as 'table' | 'gallery' | 'board'];
  const customTheme = viewSettings?.customTheme;

  if (customTheme) {
    blockElement.setAttribute('data-custom-theme', 'true');

    const cssVariables: string[] = [];

    if (viewType === 'table') {
      cssVariables.push(`--custom-border-color: ${customTheme.borderColor || '#e2e8f0'}`);
      cssVariables.push(`--custom-header-bg: ${customTheme.headerBgColor || '#f8fafc'}`);
      cssVariables.push(`--custom-header-text: ${customTheme.headerTextColor || '#374151'}`);
      cssVariables.push(`--custom-cell-text: ${customTheme.cellTextColor || '#475569'}`);
      cssVariables.push(`--custom-header-border: ${customTheme.headerBorderColor || '#cbd5e1'}`);
      cssVariables.push(`--custom-row-bg: ${customTheme.rowBgColor || '#ffffff'}`);
      cssVariables.push(`--custom-row-hover: ${customTheme.rowHoverBgColor || '#f1f5f9'}`);
      cssVariables.push(`--custom-radius: ${customTheme.tableBorderRadius || '8px'}`);
      cssVariables.push(`--custom-header-height: ${customTheme.headerHeight || '48px'}`);
      cssVariables.push(`--custom-cell-padding: ${customTheme.cellPadding || '12px 16px'}`);
    } else if (viewType === 'gallery') {
      cssVariables.push(`--custom-border-color: ${customTheme.borderColor || '#e2e8f0'}`);
      cssVariables.push(`--custom-card-bg: ${customTheme.cardBgColor || '#ffffff'}`);
      cssVariables.push(`--custom-card-hover: ${customTheme.cardHoverBgColor || '#f8fafc'}`);
      cssVariables.push(`--custom-header-bg: ${customTheme.headerBgColor || 'transparent'}`);
      cssVariables.push(`--custom-header-text: ${customTheme.headerTextColor || '#374151'}`);
      cssVariables.push(`--custom-card-text: ${customTheme.cardTextColor || '#475569'}`);
      cssVariables.push(`--custom-card-radius: ${customTheme.cardBorderRadius || '12px'}`);
      cssVariables.push(`--custom-card-shadow: ${customTheme.cardShadow || '0 2px 8px rgba(0, 0, 0, 0.06)'}`);
    } else if (viewType === 'board') {
      cssVariables.push(`--custom-border-color: ${customTheme.borderColor || '#e2e8f0'}`);
      cssVariables.push(`--custom-column-bg: ${customTheme.columnBgColor || '#ffffff'}`);
      cssVariables.push(`--custom-column-hover: ${customTheme.columnHoverBgColor || '#f8fafc'}`);
      cssVariables.push(`--custom-header-bg: ${customTheme.headerBgColor || 'transparent'}`);
      cssVariables.push(`--custom-header-text: ${customTheme.headerTextColor || '#374151'}`);
      cssVariables.push(`--custom-card-bg: ${customTheme.cardBgColor || '#ffffff'}`);
      cssVariables.push(`--custom-card-text: ${customTheme.cardTextColor || '#475569'}`);
      cssVariables.push(`--custom-card-border: ${customTheme.cardBorderColor || '#e2e8f0'}`);
      cssVariables.push(`--custom-card-radius: ${customTheme.cardBorderRadius || '8px'}`);
    }

    blockElement.style.cssText += cssVariables.join('; ') + ';';
  } else {
    blockElement.setAttribute('data-custom-theme', 'false');
    CUSTOM_CSS_VARS.forEach(v => blockElement.style.removeProperty(v));
  }
}

async function applyViewStyle(blockId: string, viewType: ViewType, themeType: ThemeType): Promise<void> {
  const doc = getDocument();

  const blockElement = doc.querySelector(`[data-block-id="${blockId}"]`) || doc.querySelector(`#ls-block-${blockId}`);
  if (!blockElement) {
    logger.warn('[BlockView] Block element not found', { blockId });
    return;
  }

  removeViewStyles(blockElement);
  applyViewStyles(blockElement, viewType, themeType);

  if (themeType === 'custom') {
    await applyCustomTheme(blockElement, viewType);
  } else {
    blockElement.setAttribute('data-custom-theme', 'false');
    CUSTOM_CSS_VARS.forEach(v => blockElement.style.removeProperty(v));
  }

  // 如果是tableView，注入列对齐CSS
  if (viewType === 'table') {
    injectTableColumnAlignmentCSS(blockId, doc);
  }

  logger.debug('[BlockView] View & theme applied', { blockId, viewType, themeType });
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

async function switchView(blockId: string, viewType: ViewType, themeType: ThemeType): Promise<void> {
  await applyViewStyle(blockId, viewType, themeType);

  try {
    const currentBlock = await logseqAPI.Editor.getBlock(blockId);
    if (currentBlock?.content) {
      const updatedContent = updateBlockViewArgs(currentBlock.content, { view: viewType });
      if (updatedContent !== currentBlock.content) {
        await logseqAPI.Editor.updateBlock(blockId, updatedContent);
        logger.debug('[BlockView] Macro parameter updated', { blockId, viewType });
      }
    }
  } catch (err) {
    logger.error('[BlockView] Failed to update macro parameter', err);
  }
}

function bindViewEvents(container: HTMLElement, blockId: string, themeType: ThemeType): void {
  const buttons = container.querySelectorAll('.ltt-view-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const viewType = btn.getAttribute('data-view') as ViewType;
      if (!viewType) return;

      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      await switchView(blockId, viewType, themeType);
    });
  });
}

async function renderViewBar(blockId: string, slot: string, tokens: string[]): Promise<void> {
  const doc = getDocument();
  const containerId = `${PLUGIN_ID}__${slot}`;

  const settings = await getSettingsWithSystem();
  const blockViewSettings = settings?.blockView || {
    defaultView: 'list' as ViewType,
    defaultTheme: 'default' as ThemeType,
    hideViewBar: false
  };

  const currentView = getCurrentViewFromParams(tokens, blockViewSettings.defaultView);
  const currentTheme = getCurrentThemeFromParams(tokens, blockViewSettings.defaultTheme);

  if (blockViewSettings.hideViewBar) {
    await applyViewStyle(blockId, currentView, currentTheme);
    return;
  }

  const viewBarHtml = `
    <div class="ltt-view-bar" data-block-id="${blockId}">
      ${Object.values(VIEW_REGISTRY).map(view => `
        <button
          class="ltt-view-btn ${view.id === currentView ? 'active' : ''}"
          data-view="${view.id}"
          title="${view.name}"
        >
          ${view.icon}
          <span>${view.name}</span>
        </button>
      `).join('')}
    </div>
  `;

  logseqAPI.provideUI({
    key: containerId,
    slot,
    reset: true,
    template: `<div id="${containerId}">${viewBarHtml}</div>`,
  });

  await applyViewStyle(blockId, currentView, currentTheme);

  setTimeout(() => {
    const container = doc.getElementById(containerId);
    if (container) {
      bindViewEvents(container, blockId, currentTheme);
    }
  }, 1);
}

export function registerBlockView(): void {
  logseqAPI.App.onMacroRendererSlotted(async ({ payload, slot }) => {
    const split = splitRendererArgs(payload.arguments);
    const type = split?.type || '';
    const tokens = split?.tokens || [];

    if (!type.startsWith(MACRO_PREFIX)) return;

    const blockId = payload.uuid;
    logger.debug('[BlockView] Macro triggered', { blockId, type, tokens });

    await renderViewBar(blockId, slot, tokens);
  });

  logseqAPI.Editor.registerSlashCommand(
    '[Text Toolkit] Insert Block View',
    async () => {
      await logseqAPI.Editor.insertAtEditingCursor(
        `{{renderer ${MACRO_PREFIX}}}`
      );
    }
  );

  logger.info('[BlockView] Registered successfully');
}