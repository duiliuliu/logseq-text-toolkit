/**
 * Logseq API 统一接口
 * 根据环境提供一致的Logseq API接口
 */

import mockLogseq from './mock/index.ts';

/**
 * 获取Logseq API实例
 * @returns {any} Logseq API实例
 */
export const getLogseqAPI = (): any => {
  // 检查是否在测试模式下
  const isTestMode = import.meta.env.MODE === 'test';
  
  let api: any;
  if (isTestMode) {
    console.log('Using mock Logseq API (test mode)');
    // 使用导入的mockLogseq
    api = mockLogseq;
  } else {
    console.log('Using official Logseq API (production mode)');
    // 直接返回官方的logseq对象
    api = (window as any).logseq;
  }
  
  // 将API暴露到全局的logseq对象，与官方用法保持一致
  if (typeof window !== 'undefined') {
    (window as any).logseq = api;
  }
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).logseq = api;
  }
  
  return api;
};

// 导出统一的Logseq API实例
export const logseqAPI = getLogseqAPI();

// 同时也直接导出logseq，支持官方用法
export const logseq = logseqAPI;

export default logseqAPI;
