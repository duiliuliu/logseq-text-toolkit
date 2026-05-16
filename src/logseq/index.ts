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
import logger, { createLoggerProxy } from './logger.ts';
import { createProxyLogseq } from './proxy.ts';


type APIMode = 'mock' | 'proxy';

let currentMode: APIMode = 'mock';
let apiServer: string | null = null;
let apiToken: string | null = null;

export function configureProxyMode(server: string, token: string) {
  apiServer = server;
  apiToken = token;
  logger.info(`[Logseq] Proxy mode configured with server: ${server}`);
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
 * 兼容旧的导出方式
 */
export const getLogseqAPI = (): ILSPluginUser => {
  logger.log('[Logseq] Initialized in Mock mode');

  // 检查是否在测试模式下
  const isTestMode = import.meta.env.MODE === 'test';

  if (isTestMode) {
    if (currentMode === 'proxy') {
      // proxy 模式：使用代理的 logseq（如果存在）
      logger.info('Using mock Logseq API (test proxy mode)');
      const newProxyLogseq = createProxyLogseq(mockLogseq as ILSPluginUser, {}, {
        apiServer: apiServer || '',
        apiToken: apiToken || '',
      });
      return newProxyLogseq;
    } else {
      // mock 模式：使用导入的 mockLogseq
      logger.info('Using mock Logseq API (test mode)');
      return createLoggerProxy(mockLogseq as ILSPluginUser);
    }
  }

  logger.info('Using official Logseq API (production mode)');
  // 直接返回官方的logseq对象,并使用日志代理包装它
  // return createLoggerProxy(logseq) as ILSPluginUser;
  return logseq
};

export const resetLogseqAPI = () => {
  logseqAPI = getLogseqAPI();
  logger.info('[Logseq] API reset to current mode:', currentMode);
}

// 导出统一的Logseq API实例
export let logseqAPI = getLogseqAPI();

export default logseqAPI;

