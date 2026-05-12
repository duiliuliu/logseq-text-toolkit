import { logseqAPI } from '../../logseq';
import { registerCSS } from '../cssRegistry';
import logger from '../logger';
import { PageGenerator } from './PageGenerator';
import { SummaryModal } from '../../components/Summary/SummaryModal';
import { renderComponent } from '../render';
import { getDocument } from '../../logseq/utils';

const ID = {
  SUMMARY_MODAL: 'text-toolkit-summary-modal',
};

let summaryModalOpen = false;

function renderSummaryModal(): void {
  const container = getDocument().getElementById(ID.SUMMARY_MODAL);
  if (!container) return;

  renderComponent(container, SummaryModal, {
    isOpen: summaryModalOpen,
    onClose: () => {
      summaryModalOpen = false;
      renderSummaryModal();
    },
  });
}

export async function initSummaryModal(): Promise<void> {
  logseqAPI.provideUI({
    key: ID.SUMMARY_MODAL,
    path: '#app-container',
    template: `<div id="${ID.SUMMARY_MODAL}"></div>`,
  });
  setTimeout(renderSummaryModal, 1);
}

export function toggleSummaryModal(): void {
  summaryModalOpen = !summaryModalOpen;
  logseqAPI.provideUI({
    key: ID.SUMMARY_MODAL,
    path: '#app-container',
    template: `<div id="${ID.SUMMARY_MODAL}"></div>`,
  });
  setTimeout(renderSummaryModal, 1);
}

export function registerSummaryCSS(): void {
  import('../../components/Summary/summary.css?raw').then(({ default: summaryCSSRaw }) => {
    registerCSS('summary', {
      type: 'both',
      inlineContent: summaryCSSRaw,
      externalPath: 'summary.css',
    });
    logger.info('✅ Summary: CSS registered');
  });
}

export function registerSummaryCommands(): void {
  logseqAPI.Editor.registerSlashCommand(
    '[Text Toolkit] Generate Summary',
    async () => {
      toggleSummaryModal();
    }
  );

  logger.info('✅ Summary: Commands registered');
}

export async function generateSummary(
  templateType: string,
  summaryType: string,
  customStart?: Date,
  customEnd?: Date
): Promise<string | null> {
  const generator = new PageGenerator();
  const pageName = await generator.generate(
    templateType as any,
    summaryType as any,
    customStart,
    customEnd
  );

  if (pageName) {
    await logseqAPI.Editor.scrollToBlockInPage(pageName);
    logger.info(`✅ Summary: Generated page "${pageName}"`);
  }

  return pageName;
}