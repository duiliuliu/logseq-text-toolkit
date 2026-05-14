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
