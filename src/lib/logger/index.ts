/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * Logger 管理器
 * 负责延迟初始化 logger，避免循环依赖问题
 */

import { Logger, PluginLogLevel } from './types';
import { LogseqLogger } from './logger';

// 存储 logger 实例
let loggerInstance: Logger | null = null;

// 存储当前的配置
let currentConfig: {
  enabled: boolean;
  level: PluginLogLevel;
} = {
  enabled: true,
  level: 'INFO'
};

/**
 * 获取 logger 实例（惰性初始化）
 */
export const getLogger = (): Logger => {
  if (!loggerInstance) {
    loggerInstance = new LogseqLogger('Plugin-Text-Toolkit', {
      console: currentConfig.enabled,
      level: currentConfig.level
    });
  }
  return loggerInstance;
};

/**
 * 更新 logger 配置（可在 settings 加载后调用）
 */
export const updateLoggerConfig = (config: {
  enabled?: boolean;
  level?: PluginLogLevel;
}): void => {
  if (config.enabled !== undefined) {
    currentConfig.enabled = config.enabled;
  }
  if (config.level !== undefined) {
    currentConfig.level = config.level;
  }
  
  // 更新现有 logger 实例
  if (loggerInstance) {
    (loggerInstance as any).setConsole(currentConfig.enabled);
    (loggerInstance as any).setLevel(currentConfig.level);
  }
};

/**
 * 重置 logger（用于测试或重新初始化）
 */
export const resetLogger = (): void => {
  loggerInstance = null;
  currentConfig = {
    enabled: true,
    level: 'INFO'
  };
};

// 默认导出 logger 获取函数
export default getLogger;
