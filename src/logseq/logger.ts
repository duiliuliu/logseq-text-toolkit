/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * Logger 统一接口
 * 已迁移到 /src/lib/logger，此处保留兼容性
 * DEPRECATED: 使用 /src/lib/logger 代替
 */

import { getLogger } from '../lib/logger/index';
import type { Logger } from '../lib/logger/types';

// 导出 logger 实例
export const logger = getLogger();

export type { Logger };

export default logger;
