/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 页面操作工具函数
 */

import { logseqAPI } from '../../logseq';
import logger from '../logger';

/**
 * 获取 Logseq 用户配置的日期格式
 */
export async function getPreferredDateFormat(): Promise<string> {
  try {
    const configs = await (logseqAPI as any).App.getUserConfigs?.();
    if (configs?.preferredDateFormat) {
      return configs.preferredDateFormat;
    }
    return 'yyyy-MM-dd';
  } catch (err) {
    logger.warn('[PageUtils] Failed to get preferred date format:', err);
    return 'yyyy-MM-dd';
  }
}

/**
 * 解析 Logseq 日期格式模板
 * 支持格式：
 * - E, EE, EEE, EEEE (星期)
 * - MM (月份 01-12)
 * - M (月份 1-12)
 * - dd (日期 01-31)
 * - d (日期 1-31)
 * - yyyy (4位年份)
 * - yy (2位年份)
 */
export function parseDateFormat(format: string): (date: Date) => string {
  return (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = date.getDay();
    const weekdaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekdaysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = weekdaysShort[dayOfWeek] || '';
    const dayNameFull = weekdaysFull[dayOfWeek] || '';

    return format
      .replace(/EEEE/g, dayNameFull)
      .replace(/E{1,3}/g, dayName)
      .replace(/yyyy/g, String(year))
      .replace(/yy/g, String(year).slice(-2))
      .replace(/MM/g, String(month).padStart(2, '0'))
      .replace(/M(?!a|i|n)/g, String(month))
      .replace(/dd/g, String(day).padStart(2, '0'))
      .replace(/d/g, String(day));
  };
}

/**
 * 格式化日期为页面名称
 */
export function formatDateForPage(
  date: Date, 
  format?: string
): string {
  if (format) {
    try {
      const formatter = parseDateFormat(format);
      return formatter(date);
    } catch (err) {
      logger.warn('[PageUtils] Failed to parse date format:', err);
    }
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
