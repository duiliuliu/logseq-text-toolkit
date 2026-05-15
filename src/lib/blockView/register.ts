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

async function applyViewStyle(blockId: string, viewType: ViewType, themeType: ThemeType): Promise<void> {
  const doc = getDocument();

  const blockElement = doc.querySelector(`[data-block-id="${blockId}"]`) || doc.querySelector(`#ls-block-${blockId}`);
  if (!blockElement) {
    logger.warn('[BlockView] Block element not found', { blockId });
    return;
  }

  const VIEW_CLASSES = [
    'ltt-list-root',
    'ltt-table-root',
    'ltt-gallery-root',
    'ltt-board-root'
  ];

  const THEME_CLASSES = [
    'theme-default',
    'theme-notion',
    'theme-linear',
    'theme-dark',
    'theme-gradient',
    'theme-tana',
    'theme-custom'
  ];

  blockElement.classList.remove(...VIEW_CLASSES, ...THEME_CLASSES);

  const newViewClass = `ltt-${viewType}-root`;
  if (!blockElement.classList.contains(newViewClass)) {
    blockElement.classList.add(newViewClass);
  }

  const newThemeClass = `theme-${themeType}`;
  if (!blockElement.classList.contains(newThemeClass)) {
    blockElement.classList.add(newThemeClass);
  }

  // Apply custom theme CSS variables
  if (themeType === 'custom') {
    const settings = await getSettingsWithSystem();
    const viewSettings = settings?.blockView?.[viewType as 'table' | 'gallery' | 'board'];
    const customTheme = viewSettings?.customTheme;

    if (customTheme) {
      // Set data attribute to enable custom theme
      blockElement.setAttribute('data-custom-theme', 'true');

      // Apply custom theme colors as CSS variables
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
    }
  } else {
    blockElement.setAttribute('data-custom-theme', 'false');
    // Clear custom CSS variables
    const cssVars = [
      '--custom-border-color', '--custom-header-bg', '--custom-header-text',
      '--custom-cell-text', '--custom-header-border', '--custom-row-bg',
      '--custom-row-hover', '--custom-radius', '--custom-header-height',
      '--custom-cell-padding', '--custom-card-bg', '--custom-card-hover',
      '--custom-card-text', '--custom-card-radius', '--custom-card-shadow',
      '--custom-column-bg', '--custom-column-hover', '--custom-card-border'
    ];
    cssVars.forEach(v => blockElement.style.removeProperty(v));
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

  if (argMap.theme && ['default', 'notion', 'linear', 'dark', 'gradient', 'tana', 'custom'].includes(argMap.theme)) {
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
