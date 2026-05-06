/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * Logger 统一接口
 * 在测试模式使用 Mock PluginLogger，在生产模式使用 Logseq 官方 PluginLogger
 */

import { logseqAPI } from './index.ts';

// 定义 Logger 接口
export interface Logger {
  log: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
  isDevMode: () => boolean;
}

// 获取当前环境的 Logger 实例
const getLogger = (): Logger => {
  const isTestMode = import.meta.env.MODE === 'test';
  
  if (isTestMode) {
    // 测试模式使用 Mock Logger
    return (logseqAPI as any).logger || {
      log: (message: string, ...args: any[]) => console.log(`[Text Toolkit] ${message}`, ...args),
      info: (message: string, ...args: any[]) => console.info(`[Text Toolkit] ${message}`, ...args),
      warn: (message: string, ...args: any[]) => console.warn(`[Text Toolkit] ${message}`, ...args),
      error: (message: string, ...args: any[]) => console.error(`[Text Toolkit] ${message}`, ...args),
      debug: (message: string, ...args: any[]) => console.debug(`[Text Toolkit] ${message}`, ...args),
      isDevMode: () => false
    };
  } else {
    // 生产模式使用 Logseq 官方 PluginLogger
    if ((logseqAPI as any).logger) {
      return (logseqAPI as any).logger;
    } else {
      // 降级：如果没有官方 logger，创建一个简单的实现
      return {
        log: (message: string, ...args: any[]) => console.log(`[Text Toolkit] ${message}`, ...args),
        info: (message: string, ...args: any[]) => console.info(`[Text Toolkit] ${message}`, ...args),
        warn: (message: string, ...args: any[]) => console.warn(`[Text Toolkit] ${message}`, ...args),
        error: (message: string, ...args: any[]) => console.error(`[Text Toolkit] ${message}`, ...args),
        debug: (message: string, ...args: any[]) => console.debug(`[Text Toolkit] ${message}`, ...args),
        isDevMode: () => false
      };
    }
  }
};

// 导出 logger 实例
export const logger = getLogger();

export default logger;
