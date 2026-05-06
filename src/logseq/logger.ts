/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * Logger 统一接口
 * 在测试模式使用 Mock PluginLogger，在生产模式使用 Logseq 官方 PluginLogger
 */
import { getSettings } from '../settings/index.ts';
import { PluginLogger } from '@logseq/libs/dist/helpers';
import { MockPluginLogger } from './mock/logger.ts';


// 获取当前环境的 Logger 实例
const getLogger = (): PluginLogger => {
  const isTestMode = import.meta.env.MODE === 'test';
  const settings = getSettings();
  const debug = settings?.developerMode || false;

  if (isTestMode) {
    // 测试模式使用 Mock Logger
    return new MockPluginLogger('', { console: debug }) as unknown as PluginLogger;
  } else {
    // 生产模式使用 Logseq 官方 PluginLogger
    return new PluginLogger("Plugin-Text-Toolkit", {
      console: debug
    })
  }
};

// 导出 logger 实例
export const logger = getLogger();

export default logger;
