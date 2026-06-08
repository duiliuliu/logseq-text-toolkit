import { logseqAPI } from '../../logseq';
import { getDocument } from '../../logseq/utils';
import { getSettingsWithSystem } from '../../settings';
import { VIEW_REGISTRY, ViewType, ThemeType } from './types';
import { registerRendererArgModel, splitRendererArgs, parseRendererArgs } from '../render';
import { createRendererArgUpdater } from '../render/rendererArgs';
import { renderComponent } from '../render';
import { createMindMapView } from '../../components/BlockView/views/MindMapView';
import logger from '../logger';
import type { BlockRendererProps, BlockRendererChild } from '@logseq/libs/dist/modules/LSPlugin.Experiments';

const MACRO_PREFIX = ':blockview';
const PLUGIN_ID = 'text-toolkit-blockview';

registerRendererArgModel(MACRO_PREFIX, { positional: ['view'], named: ['theme', 'inline'] });

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

function getCurrentInlineFromParams(tokens: string[], defaultInline: boolean): boolean {
  const argMap = parseRendererArgs(MACRO_PREFIX, tokens);

  if (typeof argMap.inline !== 'undefined') {
    return argMap.inline === true || argMap.inline === 'true';
  }

  return defaultInline;
}

/**
 * 视图切换时更新 block 属性
 */
async function updateBlockViewProperty(blockId: string, viewType: ViewType): Promise<void> {
  try {
    const viewPropertyValue = VIEW_REGISTRY[viewType]?.viewPropertyValue || viewType;
    
    // 更新 block 属性
    await logseqAPI.Editor.upsertBlockProperty(blockId, 'view', viewPropertyValue);
    
    logger.debug('[BlockView] Block view property updated', { blockId, viewPropertyValue });
  } catch (error) {
    logger.error('[BlockView] Failed to update block view property', error);
  }
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

  // 更新 block 的 view 属性
  await updateBlockViewProperty(blockId, viewType);
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
    hideViewBar: false,
    inline: false
  };

  const currentView = getCurrentViewFromParams(tokens, blockViewSettings.defaultView);
  const currentTheme = getCurrentThemeFromParams(tokens, blockViewSettings.defaultTheme);
  const currentInline = getCurrentInlineFromParams(tokens, blockViewSettings.inline);

  if (blockViewSettings.hideViewBar) {
    await applyViewStyle(blockId, currentView, currentTheme);
    return;
  }

  const inlineClass = currentInline ? 'ltt-view-bar-inline' : '';

  const viewBarHtml = `
    <div class="ltt-view-bar ${inlineClass}" data-block-id="${blockId}">
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

/**
 * 注册 MindMap 块渲染器
 * 使用 logseq.Experiments.registerBlockRenderer
 * 参考: https://github.com/VictorVow/logseq-plugin-advanced-markdown-table
 */
function registerMindMapRenderer(): void {
  try {
    const Experiments = logseqAPI.Experiments || {};
    const { React, registerBlockRenderer } = Experiments as any;
    
    if (!registerBlockRenderer || !React) {
      logger.warn('[MindMap] registerBlockRenderer or React not available, falling back to macro renderer');
      return;
    }

    registerBlockRenderer('ltt-mindmap', {
      when: ({ properties }: BlockRendererProps) => {
        // 兼容不同的属性格式
        const viewValue = properties.view?.title || properties.view;
        const customViewValue = properties['plugin.property.logseq-text-toolkitdev/view']?.title || properties['plugin.property.logseq-text-toolkitdev/view'];
        return viewValue === 'ltt-mindmap' || customViewValue === 'ltt-mindmap';
      },
      includeChildren: true,
      priority: 20,
      render: ({ content, children = [], uuid }: BlockRendererProps) => {
        logger.log('[MindMap] Rendering block', { uuid });

        // 创建容器并使用 ref 来挂载 DOM
        return React.createElement('div', {
          className: 'ltt-mindmap-container',
          'data-block-uuid': uuid,
          ref: (el: HTMLElement) => {
            if (el && !el.querySelector('.ltt-mindmap-view')) {
              // 只在第一次加载时创建 DOM
              const mindMapView = createMindMapView({
                rootUuid: uuid,
                content,
                children: children as BlockRendererChild[],
              });
              el.appendChild(mindMapView);
            }
          },
        });
      },
    });

    logger.info('[MindMap] Block renderer registered successfully');
  } catch (error) {
    logger.error('[MindMap] Failed to register block renderer:', error);
  }
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

  // 注册 MindMap 块渲染器
  registerMindMapRenderer();

  logseqAPI.Editor.registerSlashCommand(
    '[Text Toolkit] Insert Block View',
    async () => {
      const settings = await getSettingsWithSystem();
      const template = settings?.blockView?.defaultSlashCommandTemplate || MACRO_PREFIX;
      await logseqAPI.Editor.insertAtEditingCursor(
        `{{renderer ${template}}}`
      );
    }
  );

  logger.info('[BlockView] Registered successfully');
}
