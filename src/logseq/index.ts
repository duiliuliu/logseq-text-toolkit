/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * Logseq API 统一接口
 * 根据环境提供一致的Logseq API接口
 */

import { ILSPluginUser } from '@logseq/libs/dist/LSPlugin.user';
import mockLogseq from './mock/index.ts';
import '@logseq/libs'

/**
 * 获取Logseq API实例
 * @returns {any} Logseq API实例
 */
export const getLogseqAPI = (): ILSPluginUser => {
  // 检查是否在测试模式下
  const isTestMode = import.meta.env.MODE === 'test';
  
  if (isTestMode) {
    console.log('Using mock Logseq API (test mode)');
    // 使用导入的mockLogseq
    return mockLogseq;
  } else {
    console.log('Using official Logseq API (production mode)');
    // 直接返回官方的logseq对象
    return logseq;
  }
};

// 导出统一的Logseq API实例
export const logseqAPI = getLogseqAPI();

export default logseqAPI;
