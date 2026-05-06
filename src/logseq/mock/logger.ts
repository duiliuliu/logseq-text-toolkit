/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 模拟 Logseq 官方 PluginLogger
 * 参考: https://github.com/logseq/logseq/blob/master/libs/src/LSPlugin.user.ts
 */

import { getSettings } from '../../settings/index.ts';

export interface Logger {
  log: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
  isDevMode: () => boolean;
}

/**
 * 模拟 Logseq 官方 PluginLogger
 */
class PluginLogger implements Logger {
  private namespace: string;
  private options: { console: boolean };

  constructor(namespace: string = '', options: { console: boolean } = { console: true }) {
    this.namespace = namespace;
    this.options = options;
  }

  private getDevMode(): boolean {
    const settings = getSettings();
    return settings?.developerMode || false;
  }

  private formatMessage(level: string, message: string): string {
    const prefix = this.namespace ? `[${this.namespace}]` : '[Text Toolkit]';
    return `${prefix} [${level}] ${message}`;
  }

  log(message: string, ...args: any[]): void {
    if (this.options.console) {
      console.log(this.formatMessage('LOG', message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.options.console) {
      console.info(this.formatMessage('INFO', message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.options.console) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.options.console) {
      console.error(this.formatMessage('ERROR', message), ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    // 仅在开发者模式下输出 debug 日志
    if (this.options.console && this.getDevMode()) {
      console.debug(this.formatMessage('DEBUG', message), ...args);
    }
  }

  isDevMode(): boolean {
    return this.getDevMode();
  }
}

// 导出单例实例
export const logger = new PluginLogger('', { console: true });

export default logger;
