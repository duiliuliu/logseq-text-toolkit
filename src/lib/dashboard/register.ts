/**
 * Live dashboard macro. Reads Logseq DB directly; report attachments stay as
 * native HTML asset blocks under 业务看板 / 金融报告 pages.
 */
import Dashboard from '../../components/Dashboard'
import { logseqAPI } from '../../logseq';
import { renderComponent } from '../render';
import { waitForElementById } from '../render/slot';
import logger from '../logger';

const MACRO_PREFIX = ':dashboard';
const PLUGIN_ID = 'text-toolkit-dashboard';

export function registerDashboard(): void {
  (logseqAPI.App as any).onMacroRendererSlotted?.(async ({ payload, slot }: any) => {
    try {
      const raw = String(payload?.arguments || '');
      if (!raw.includes(MACRO_PREFIX)) return;
      const id = `${PLUGIN_ID}-${slot}`;
      logseqAPI.provideUI({
        key: id,
        slot,
        reset: true,
        template: `<div id="${id}"></div>`,
      });
      const container = await waitForElementById(id);
      if (!container) return;
      renderComponent(container, Dashboard, {});
    } catch (error) {
      logger.error('[Dashboard] Macro render failed', error);
    }
  });

  logseqAPI.Editor.registerSlashCommand(
    '[Text Toolkit] Insert Dashboard',
    async () => {
      await logseqAPI.Editor.insertAtEditingCursor('{{renderer :dashboard}}');
    }
  );

  logger.info('[Dashboard] Registered successfully');
}

export function initDashboard(): void {
  registerDashboard();
}
