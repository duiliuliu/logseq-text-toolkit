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
  
  if (isTestMode) {
    console.log('Using mock Logseq API (test mode)');
    // 使用导入的mockLogseq
    return mockLogseq;
  } else {
    console.log('Using official Logseq API (production mode)');
    // 直接返回官方的logseq对象
    return (globalThis as any).logseq;
  }
};

// 导出统一的Logseq API实例
export const logseqAPI = getLogseqAPI();

export default logseqAPI;
