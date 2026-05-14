import { logseqAPI } from '../../logseq';
import { getDocument } from '../../logseq/utils';
import { getSettingsWithSystem } from '../../settings';
import { VIEW_REGISTRY, ViewType } from './types';
import { registerRendererArgModel, splitRendererArgs, parseRendererArgs } from '../render';
import { createRendererArgUpdater } from '../render/rendererArgs';
import logger from '../logger';

const MACRO_PREFIX = ':blockview';
const PLUGIN_ID = 'text-toolkit-blockview';

registerRendererArgModel(MACRO_PREFIX, { positional: ['view'] });

const { updateRendererArgs: updateBlockViewArgs } = createRendererArgUpdater([MACRO_PREFIX]);

async function applyViewStyle(blockId: string, viewType: ViewType): Promise<void> {
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

  blockElement.classList.remove(...VIEW_CLASSES);

  const newClass = `ltt-${viewType}-root`;
  if (!blockElement.classList.contains(newClass)) {
    blockElement.classList.add(newClass);
  }

  logger.debug('[BlockView] View style applied', { blockId, viewType });
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

async function switchView(blockId: string, viewType: ViewType): Promise<void> {
  await applyViewStyle(blockId, viewType);

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

function bindViewEvents(container: HTMLElement, blockId: string): void {
  const buttons = container.querySelectorAll('.ltt-view-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const viewType = btn.getAttribute('data-view') as ViewType;
      if (!viewType) return;

      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      await switchView(blockId, viewType);
    });
  });
}

async function renderViewBar(blockId: string, slot: string, tokens: string[]): Promise<void> {
  const doc = getDocument();
  const containerId = `${PLUGIN_ID}__${slot}`;

  const settings = await getSettingsWithSystem();
  const blockViewSettings = settings?.blockView || { defaultView: 'list' as ViewType, hideViewBar: false };

  if (blockViewSettings.hideViewBar) {
    const currentView = getCurrentViewFromParams(tokens, blockViewSettings.defaultView);
    await applyViewStyle(blockId, currentView);
    return;
  }

  const currentView = getCurrentViewFromParams(tokens, blockViewSettings.defaultView);

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

  await applyViewStyle(blockId, currentView);

  setTimeout(() => {
    const container = doc.getElementById(containerId);
    if (container) {
      bindViewEvents(container, blockId);
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
