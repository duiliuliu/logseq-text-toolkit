import React from 'react';
import { logseqAPI } from '../../logseq';
import { getDocument } from '../../logseq/utils';
import { renderComponent } from '../render';
import { waitForElementById } from '../render/slot';
import { getSettings } from '../../settings';
import { HtmlViewer } from '../../components/HtmlViewer/HtmlViewer';
import { HtmlAssetLauncher } from '../../components/HtmlViewer/HtmlAssetLauncher';
import { assetPathFor, isHtmlAssetBlock } from './assetBlock';
import logger from '../logger';

const ID = 'text-toolkit-html-viewer';

let viewerOpen = false;
let initialPath = '';

function renderViewer(): void {
  const container = getDocument().getElementById(ID);
  if (!container) return;

  renderComponent(container, HtmlViewer, {
    isOpen: viewerOpen,
    initialPath,
    onClose: () => {
      viewerOpen = false;
      renderViewer();
    },
  });
}

export async function initHtmlViewer(): Promise<void> {
  if (getSettings().htmlViewer?.enabled === false) {
    logger.info('[HtmlViewer] Disabled by settings');
    return;
  }

  logseqAPI.provideUI({
    key: ID,
    path: '#app-container',
    template: `<div id="${ID}"></div>`,
  });
  await waitForElementById(ID);
  renderViewer();

  logseqAPI.Editor.registerSlashCommand(
    '[Text Toolkit] Open HTML Viewer',
    async () => {
      openHtmlViewer();
    }
  );

  registerHtmlAssetBlockRenderer();
  logger.info('[HtmlViewer] Registered successfully');
}

export function openHtmlViewer(path: string = ''): void {
  initialPath = path;
  viewerOpen = true;
  renderViewer();
}

export function closeHtmlViewer(): void {
  viewerOpen = false;
  renderViewer();
}

function registerHtmlAssetBlockRenderer(): void {
  const experiments = (logseqAPI as any).Experiments;
  if (!experiments?.registerBlockRenderer) return;

  try {
    experiments.registerBlockRenderer('html-asset-viewer', {
      when: isHtmlAssetBlock,
      render: (props: any) => {
        const path = assetPathFor(props);
        if (!path) return null;
        const filename = String(props.content || path);
        return React.createElement(HtmlAssetLauncher, {
          path,
          filename,
          onOpen: () => openHtmlViewer(path),
        });
      },
    });
  } catch (error) {
    logger.warn('[HtmlViewer] Failed to register asset block renderer', error);
  }
}
