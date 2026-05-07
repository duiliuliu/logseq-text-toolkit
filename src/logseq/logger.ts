/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * Logger 统一接口
 * 已迁移到 /src/lib/logger，此处保留兼容性
 * DEPRECATED: 使用 /src/lib/logger 代替
 */

// 从新位置重新导出，保持兼容性
export { default as logger, default } from '../lib/logger/index';
export { getLogger, updateLoggerConfig, resetLogger } from '../lib/logger/index';
export type { Logger, PluginLogLevel, LoggerOptions } from '../lib/logger/types';
