import { logseqAPI } from '../../logseq';
import logger from '../logger';
import { PageGenerator } from './PageGenerator';
import { SummaryModal } from '../../components/Summary/SummaryModal';
import { renderComponent } from '../render';
import { getDocument } from '../../logseq/utils';
import { waitForElementById } from '../render/slot';

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
  await waitForElementById(ID.SUMMARY_MODAL);
  renderSummaryModal();
}

export async function toggleSummaryModal(): Promise<void> {
  summaryModalOpen = !summaryModalOpen;
  logseqAPI.provideUI({
    key: ID.SUMMARY_MODAL,
    path: '#app-container',
    template: `<div id="${ID.SUMMARY_MODAL}"></div>`,
  });
  await waitForElementById(ID.SUMMARY_MODAL);
  renderSummaryModal();
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
    try {
      await logseqAPI.App.pushState('page', { name: pageName });
    } catch (error) {
      // 页面已经生成成功；导航失败不应该让 UI 误报“生成失败”。
      logger.warn('[Summary] Page generated but navigation failed', error);
    }
    logger.info(`✅ Summary: Generated page "${pageName}"`);
  }

  return pageName;
}