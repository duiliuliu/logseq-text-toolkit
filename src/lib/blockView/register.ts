import { logseqAPI } from '../../logseq';
import { getDocument } from '../../logseq/utils';
import { getSettingsWithSystem } from '../../settings';
import { VIEW_REGISTRY, ViewType, ThemeType } from './types';
import { registerRendererArgModel, splitRendererArgs, parseRendererArgs } from '../render';
import { createRendererArgUpdater } from '../render/rendererArgs';
import logger from '../logger';

const MACRO_PREFIX = ':blockview';
const PLUGIN_ID = 'text-toolkit-blockview';

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

function removeViewStyles(blockElement: HTMLElement, blockId?: string): void {
  blockElement.classList.remove(...VIEW_CLASSES, ...THEME_CLASSES);
  
  // 如果有 blockId，清理表格样式
  if (blockId) {
    cleanupTableStyles(blockId);
  }
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

// 跟踪已注入的样式，用于卸载
const INJECTED_STYLES = new Map<string, HTMLStyleElement>();

// 表格列配置：最小宽度、最大宽度、对齐方式
const TABLE_COLUMN_CONFIG = {
  minWidth: 150,
  maxWidth: 400,
  firstColMinWidth: 150,
  firstColMaxWidth: 350,
  alignments: ['left', 'left', 'left', 'left', 'left'] // 可根据需要调整
};

/**
 * 计算并注入表格样式
 */
function injectTableStyles(blockElement: HTMLElement, blockId: string): void {
  // 清理旧样式
  cleanupTableStyles(blockId);

  const rows = blockElement.querySelectorAll<HTMLElement>(
    ':scope > .block-children-container > .block-children > .blocks-list-wrap > .ls-block'
  );
  
  if (rows.length === 0) return;

  // 获取所有行的单元格，计算最大宽度
  const columnMaxWidths: number[] = [];
  
  rows.forEach(row => {
    // 处理第一列（表头单元格）
    const headerCell = row.querySelector<HTMLElement>(':scope > .block-main-container');
    if (headerCell) {
      const contentWidth = headerCell.scrollWidth;
      const finalWidth = Math.max(TABLE_COLUMN_CONFIG.firstColMinWidth, 
                                 Math.min(contentWidth, TABLE_COLUMN_CONFIG.firstColMaxWidth));
      if (!columnMaxWidths[0] || finalWidth > columnMaxWidths[0]) {
        columnMaxWidths[0] = finalWidth;
      }
    }
    
    // 处理其他列
    const childCells = row.querySelectorAll<HTMLElement>(
      ':scope > .block-children-container > .block-children > .blocks-list-wrap > *'
    );
    
    childCells.forEach((cell, index) => {
      const cellIndex = index + 1; // 第一列是 index 0
      const contentWidth = cell.scrollWidth;
      const finalWidth = Math.max(TABLE_COLUMN_CONFIG.minWidth, 
                                 Math.min(contentWidth, TABLE_COLUMN_CONFIG.maxWidth));
      
      if (!columnMaxWidths[cellIndex] || finalWidth > columnMaxWidths[cellIndex]) {
        columnMaxWidths[cellIndex] = finalWidth;
      }
    });
  });

  // 生成 CSS 样式
  const styleEl = document.createElement('style');
  styleEl.id = `ltt-table-style-${blockId}`;
  
  let cssRules = '';
  
  columnMaxWidths.forEach((width, index) => {
    const alignment = TABLE_COLUMN_CONFIG.alignments[index] || 'left';
    const justifyContent = alignment === 'center' ? 'center' : 
                          alignment === 'right' ? 'flex-end' : 'flex-start';
    
    if (index === 0) {
      // 第一列（表头）
      cssRules += `
        .ltt-table-root[data-block-id="${blockId}"] > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container {
          min-width: ${width}px !important;
          width: ${width}px !important;
          max-width: ${width}px !important;
          flex-shrink: 0 !important;
        }
        .ltt-table-root[data-block-id="${blockId}"] > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container > .block-content-wrapper {
          justify-content: ${justifyContent} !important;
        }
      `;
    } else {
      // 其他列
      cssRules += `
        .ltt-table-root[data-block-id="${blockId}"] > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > *:nth-child(${index - 1}) {
          min-width: ${width}px !important;
          width: ${width}px !important;
          max-width: ${width}px !important;
          flex-shrink: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: ${justifyContent} !important;
        }
      `;
    }
  });
  
  styleEl.textContent = cssRules;
  document.head.appendChild(styleEl);
  INJECTED_STYLES.set(blockId, styleEl);
  
  logger.debug('[BlockView] Table styles injected', { blockId, columnMaxWidths });
}

/**
 * 清理表格样式
 */
function cleanupTableStyles(blockId: string): void {
  const existingStyle = INJECTED_STYLES.get(blockId);
  if (existingStyle && existingStyle.parentNode) {
    existingStyle.parentNode.removeChild(existingStyle);
    INJECTED_STYLES.delete(blockId);
    logger.debug('[BlockView] Table styles cleaned up', { blockId });
  }
}

async function applyViewStyle(blockId: string, viewType: ViewType, themeType: ThemeType): Promise<void> {
  const doc = getDocument();

  const blockElement = doc.querySelector(`[data-block-id="${blockId}"]`) || doc.querySelector(`#ls-block-${blockId}`);
  if (!blockElement) {
    logger.warn('[BlockView] Block element not found', { blockId });
    return;
  }

  // 先清理所有旧样式
  removeViewStyles(blockElement, blockId);
  applyViewStyles(blockElement, viewType, themeType);

  if (themeType === 'custom') {
    await applyCustomTheme(blockElement, viewType);
  } else {
    blockElement.setAttribute('data-custom-theme', 'false');
    CUSTOM_CSS_VARS.forEach(v => blockElement.style.removeProperty(v));
  }

  // 如果是表格视图，注入表格样式
  if (viewType === 'table') {
    // 设置 data-block-id 用于样式选择器
    if (!blockElement.hasAttribute('data-block-id')) {
      blockElement.setAttribute('data-block-id', blockId);
    }
    
    // 延迟执行，确保 DOM 渲染完成
    requestAnimationFrame(() => {
      injectTableStyles(blockElement, blockId);
    });
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