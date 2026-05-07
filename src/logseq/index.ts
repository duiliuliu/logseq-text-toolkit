/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * Logseq API 统一接口
 * 根据环境提供一致的Logseq API接口
 */

import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin.user';
import mockLogseq from './mock/index.ts';
import '@logseq/libs';
import logger from '../lib/logger/index';

export const getLogseqAPI = (): ILSPluginUser => {
  const isTestMode = import.meta.env.MODE === 'test';
  
  if (isTestMode) {
    logger.info('Using mock Logseq API (test mode)');
    return mockLogseq;
  } else {
    logger.info('Using official Logseq API (production mode)');
    return logseq;
  }
};

// 导出统一的Logseq API实例
export const logseqAPI = getLogseqAPI();

export default logseqAPI;
