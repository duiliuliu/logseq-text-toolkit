/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * Mock Logger（已迁移到 lib/logger，此处保留兼容性）
 * DEPRECATED: 使用 /src/lib/logger 代替
 */

// 从新位置重新导出
export type { Logger, PluginLogLevel, LoggerOptions } from '../../lib/logger/types';
export { LogseqLogger as MockPluginLogger, defaultLogger } from '../../lib/logger/logger';

// 保留兼容性导出
import { getLogger } from '../../lib/logger/index';

export const logger = getLogger();

export default logger;
