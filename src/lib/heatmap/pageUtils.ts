/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 页面操作工具函数
 */

import {
  LOGSEQ_DATE_FORMAT_MAP,
  SUPPORTED_LOGSEQ_FORMATS,
  logseqFormatToDayjsFormat,
  formatDate,
  formatDateForPage,
  parseDate,
  toUTC,
  utcToLocal,
  getCurrentDateStr
} from '../dateUtils';

import { logseqAPI } from '../../logseq';
import logger from '../logger';

export {
  LOGSEQ_DATE_FORMAT_MAP,
  SUPPORTED_LOGSEQ_FORMATS,
  logseqFormatToDayjsFormat,
  formatDate,
  formatDateForPage,
  parseDate,
  toUTC,
  utcToLocal,
  getCurrentDateStr
};

export async function checkPageExists(pageName: string): Promise<boolean> {
  try {
    logger.debug('📄 PageUtils: Checking page existence', { pageName });
    const page = await logseqAPI.Editor.getPage(pageName);
    const exists = page !== null;
    logger.debug('📄 PageUtils: Page check result', { pageName, exists });
    return exists;
  } catch (err) {
    logger.warn('[PageUtils] Failed to check page existence:', err);
    return false;
  }
}

export async function createPage(
  pageName: string,
  template?: string
): Promise<boolean> {
  try {
    logger.info('📄 PageUtils: Creating page', { pageName, template });
    const pageID = await logseqAPI.Editor.createPage(pageName, '', { createFirstBlock: true });
    logger.debug('📄 PageUtils: Page created with ID', { pageName, pageID });
    const block = pageID && await logseqAPI.Editor.insertBlock(pageID, "");
    logger.debug('📄 PageUtils: First block created', { pageName, block });
    block && await logseqAPI.App.insertTemplate(block.uuid, template || '');
    logger.debug('📄 PageUtils: Template inserted', { pageName, template });
    logger.info(`[PageUtils] Created page: ${pageName}`);

    if (typeof window !== 'undefined' && (window as any).addToast) {
      (window as any).addToast(`Created page: ${pageName}`, 'success', 3000);
    }

    return true;
  } catch (err) {
    logger.error('[PageUtils] Failed to create page:', err);
    return false;
  }
}

export async function navigateToPage(pageName: string): Promise<boolean> {
  try {
    logger.info('📄 PageUtils: Navigating to page', { pageName });
    await logseqAPI.App.pushState('page', {
      name: pageName,
    });
    logger.info(`[PageUtils] Navigated to page: ${pageName}`);
    return true;
  } catch (err) {
    logger.error('[PageUtils] Failed to navigate to page:', err);
    return false;
  }
}

export async function ensurePageAndNavigate(
  pageName: string,
  template?: string
): Promise<boolean> {
  try {
    const exists = await checkPageExists(pageName);

    if (!exists) {
      const created = await createPage(pageName, template);

      if (!created) {
        logger.error(`[PageUtils] Failed to create page: ${pageName}`);
        return false;
      }
    }

    await navigateToPage(pageName);
    return true;

  } catch (err) {
    logger.error('[PageUtils] Error in ensurePageAndNavigate:', err);
    return false;
  }
}
