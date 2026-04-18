/**
 * Logseq API 统一接口
 * 根据环境提供一致的Logseq API接口
 */

import mockLogseq from './mock/index.ts';
import { LogseqAPI } from './logseq.ts';

/**
 * 获取Logseq API实例
 * @returns {LogseqAPI} Logseq API实例
 */
export const getLogseqAPI = (): LogseqAPI => {
  // 检查是否在测试模式下
  const isTestMode = import.meta.env.MODE === 'test';
  
  if (isTestMode) {
    console.log('Using mock Logseq API (test mode)');
    // 使用导入的mockLogseq
    return mockLogseq as LogseqAPI;
  } else {
    console.log('Using official Logseq API (production mode)');
    // 直接使用全局的logseq对象（Logseq会在插件iframe中注入）
    return (globalThis as any).logseq as LogseqAPI;
  }
};

// 导出统一的Logseq API实例
export const logseqAPI = getLogseqAPI();

export default logseqAPI;
