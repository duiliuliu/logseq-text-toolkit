/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 页面操作工具函数
 */

import { logseqAPI } from '../../logseq';
import logger from '../logger';

/**
 * 检查页面是否存在
 */
export async function checkPageExists(pageName: string): Promise<boolean> {
  try {
    const page = await logseqAPI.Editor.getPage(pageName);
    return page !== null;
  } catch (err) {
    logger.warn('[PageUtils] Failed to check page existence:', err);
    return false;
  }
}

/**
 * 创建页面（可选：应用模板）
 */
export async function createPage(
  pageName: string, 
  properties?: Record<string, any>
): Promise<boolean> {
  try {
    await logseqAPI.Editor.createPage(pageName, '', {
      createFirstBlock: true,
      properties: properties,
    });
    logger.info(`[PageUtils] Created page: ${pageName}`);
    
    // 显示 Toast 提示
    if (typeof window !== 'undefined' && (window as any).addToast) {
      (window as any).addToast(`Created page: ${pageName}`, 'success', 3000);
    }
    
    return true;
  } catch (err) {
    logger.error('[PageUtils] Failed to create page:', err);
    return false;
  }
}

/**
 * 跳转到页面
 */
export async function navigateToPage(pageName: string): Promise<boolean> {
  try {
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

/**
 * 确保页面存在，如果不存在则创建
 * 然后跳转到该页面
 */
export async function ensurePageAndNavigate(
  pageName: string,
  template?: string
): Promise<boolean> {
  try {
    // 检查页面是否存在
    const exists = await checkPageExists(pageName);
    
    if (!exists) {
      // 页面不存在，创建它
      const properties = template ? { template } : undefined;
      const created = await createPage(pageName, properties);
      
      if (!created) {
        logger.error(`[PageUtils] Failed to create page: ${pageName}`);
        return false;
      }
    }
    
    // 跳转到页面
    await navigateToPage(pageName);
    return true;
    
  } catch (err) {
    logger.error('[PageUtils] Error in ensurePageAndNavigate:', err);
    return false;
  }
}

/**
 * 格式化日期为页面名称
 */
export function formatDateForPage(
  date: Date, 
  format?: string
): string {
  if (format) {
    // 支持简单格式化
    return format
      .replace('{year}', String(date.getFullYear()))
      .replace('{month}', String(date.getMonth() + 1).padStart(2, '0'))
      .replace('{day}', String(date.getDate()).padStart(2, '0'));
  }
  
  // 默认格式：YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
