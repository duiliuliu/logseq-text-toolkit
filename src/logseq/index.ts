/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * Logseq API 统一接口
 * 支持 Mock 和 Proxy 模式切换
 */

import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin.user';
import mockLogseq from './mock/index.ts';
import '@logseq/libs';
import logger from './logger.ts';

type APIMode = 'mock' | 'proxy';

let currentMode: APIMode = 'mock';

/**
 * 初始化 Logseq
 */
export function initLogseq() {
  logger.log('[Logseq] Initialized in Mock mode');
}

/**
 * 切换模式
 */
export function setMode(mode: APIMode) {
  currentMode = mode;
  logger.log(`[Logseq] Switched to ${mode} mode`);
}

/**
 * 获取当前模式
 */
export function getMode(): APIMode {
  return currentMode;
}

/**
 * 获取当前 API
 */
function getLogseq(): ILSPluginUser {
  if (currentMode === 'mock') {
    return mockLogseq;
  }
  
  // Proxy 模式：直接返回全局 logseq
  return (window as any).logseq || mockLogseq;
}

/**
 * Proxy 连接管理
 */
export async function connectProxy(url: string = 'http://localhost:12314') {
  try {
    logger.log(`[Proxy] Connecting to ${url}...`);
    
    // 简单检查连接
    const response = await fetch(`${url}/health`);
    if (response.ok) {
      logger.log('[Proxy] Connected successfully');
      return true;
    } else {
      logger.error('[Proxy] Connection failed');
      return false;
    }
  } catch (error) {
    logger.error('[Proxy] Connection error:', error);
    return false;
  }
}

export function disconnectProxy() {
  logger.log('[Proxy] Disconnected');
}

/**
 * 为了兼容现有代码，保持原有的属性访问方式
 */
export const logseqAPI = new Proxy(mockLogseq, {
  get(target, prop) {
    return getLogseq()[prop as keyof ILSPluginUser];
  }
}) as unknown as ILSPluginUser;

/**
 * 兼容旧的导出方式
 */
export const getLogseqAPI = (): ILSPluginUser => logseqAPI;

export default logseqAPI;
