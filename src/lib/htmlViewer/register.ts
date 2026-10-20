import React from 'react';
import { logseqAPI } from '../../logseq';
import { getDocument } from '../../logseq/utils';
import { renderComponent } from '../render';
import { waitForElementById } from '../render/slot';
import { getSettings } from '../../settings';
import { t } from '../../translations/i18n';
import { HtmlViewer } from '../../components/HtmlViewer/HtmlViewer';
import { assetPathFor, isHtmlAssetBlock } from './assetBlock';
import logger from '../logger';

const ID = 'text-toolkit-html-viewer';

let viewerOpen = false;
let initialPath = '';
let initialFullscreen = false;
let dashboardMode = false;
let htmlToolbarRegistered = false;

function renderViewer(): void {
  const container = getDocument().getElementById(ID);
  if (!container) return;

  renderComponent(container, HtmlViewer, {
    isOpen: viewerOpen,
    initialPath,
    initialFullscreen,
    dashboardMode,
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
  logseqAPI.Editor.registerSlashCommand(
    '[Text Toolkit] Open Dashboard',
    async () => {
      openDashboard();
    }
  );

  registerHtmlAssetBlockRenderer();
  registerHtmlViewerToolbarButton();
  logseqAPI.onSettingsChanged?.(() => {
    registerHtmlViewerToolbarButton();
  });
  logger.info('[HtmlViewer] Registered successfully');
}

export function openHtmlViewer(path: string = '', options: { fullscreen?: boolean; dashboard?: boolean } = {}): void {
  initialPath = path;
  initialFullscreen = options.fullscreen === true;
  dashboardMode = options.dashboard === true;
  viewerOpen = true;
  renderViewer();
}

export function openDashboard(): void {
  const settings = getSettings().htmlViewer;
  if (!settings?.dashboardAsset) {
    openHtmlViewer();
    return;
  }
  openHtmlViewer(settings.dashboardAsset, {
    fullscreen: settings.dashboardFullscreen !== false,
    dashboard: true,
  });
}

export function closeHtmlViewer(): void {
  viewerOpen = false;
  renderViewer();
}

function registerHtmlViewerToolbarButton(): void {
  const settings = getSettings().htmlViewer;
  if (settings?.showToolbarButton === false) return;
  if (!settings?.dashboardAsset || htmlToolbarRegistered) return;
  // HTML assets get a compact preview button on the block itself. The global
  // toolbar button is reserved for a configured dashboard.
  const language = getSettings().language || 'zh-CN';
  const hasDashboard = Boolean(settings?.dashboardAsset);
  const title = hasDashboard
    ? t('settings.htmlViewer.dashboardSection' as any, language)
    : t('settings.htmlViewer.toolbarLabel' as any, language);
  const icon = hasDashboard ? 'ti-layout-dashboard' : 'ti-file-type-html';

  try {
    htmlToolbarRegistered = true;
    logseqAPI.App.registerUIItem('toolbar', {
      key: 'ltt-html-viewer-button',
      template: `<a class="button" id="ltt-html-viewer-button" title="${title}"><i class="ti ${icon}"></i></a>`,
    });
    bindHtmlViewerButton();
  } catch (error) {
    logger.warn('[HtmlViewer] Failed to register toolbar button', error);
  }
}

function bindHtmlViewerButton(attempt = 0): void {
  const button = getDocument().getElementById('ltt-html-viewer-button') as HTMLElement | null;
  if (!button) {
    if (attempt < 60) setTimeout(() => bindHtmlViewerButton(attempt + 1), 50);
    return;
  }
  if ((button as any).__lttHtmlBound) return;
  (button as any).__lttHtmlBound = true;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    openDashboard();
  }, true);
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
        const HostReact = (logseqAPI as any).Experiments?.React || React;
        return HostReact.createElement(
          'button',
          {
            type: 'button',
            className: 'ltt-html-asset-launcher',
            title: path,
            'aria-label': filename,
            onClick: (event: MouseEvent) => {
              event.preventDefault();
              event.stopPropagation();
              openHtmlViewer(path);
            },
          },
          HostReact.createElement('span', { className: 'ltt-html-asset-launcher-icon' }, 'HTML'),
          HostReact.createElement('span', { className: 'ltt-html-asset-launcher-name' }, filename),
          HostReact.createElement('span', { className: 'ltt-html-asset-launcher-action' }, t('settings.htmlViewer.open' as any, getSettings().language || 'zh-CN'))
        );
      },
    });
  } catch (error) {
    logger.warn('[HtmlViewer] Failed to register asset block renderer', error);
  }
}
