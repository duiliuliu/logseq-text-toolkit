/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * Logger 实现类
 * 完全对齐 Logseq 官方 PluginLogger 接口
 */

import { Logger, PluginLogLevel, LoggerOptions } from './types';

export class LogseqLogger implements Logger {
  private _tag: string;
  private _console: boolean;
  private _level: PluginLogLevel;
  
  // 日志级别优先级（用于判断是否输出）
  private levelPriority: Record<PluginLogLevel, number> = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  constructor(
    namespace: string = '',
    options: LoggerOptions = {}
  ) {
    this._tag = namespace;
    this._console = options.console ?? true; // 默认控制台输出
    this._level = options.level ?? 'INFO'; // 默认级别为 info
  }

  /**
   * 格式化日志消息
   */
  private formatMessage(level: string, message: string): string {
    const prefix = this._tag ? `[${this._tag}]` : '[Text Toolkit]';
    return `${prefix} [${level}] ${message}`;
  }

  /**
   * 检查日志级别是否允许输出
   */
  private isLevelAllowed(level: PluginLogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this._level];
  }

  /**
   * 通用日志输出方法
   */
  private output(
    level: PluginLogLevel,
    consoleMethod: 'log' | 'info' | 'warn' | 'error' | 'debug',
    message: string,
    ...args: any[]
  ): void {
    // 1. 检查控制台输出开关
    if (!this._console) return;
    // 2. 检查日志级别
    if (!this.isLevelAllowed(level)) return;
    // 3. 格式化并输出日志
    const formattedMsg = this.formatMessage(level.toUpperCase(), message);
    console[consoleMethod](formattedMsg, ...args);
  }

  // ========== 实现官方 Logger 接口 ==========
  log(message: string, ...args: any[]): void {
    this.output('INFO', 'log', message, ...args); // log 等同于 info 级别
  }

  info(message: string, ...args: any[]): void {
    this.output('INFO', 'info', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.output('WARN', 'warn', message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.output('ERROR', 'error', message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.output('DEBUG', 'debug', message, ...args);
  }

  // ========== 扩展方法（可选，非官方接口） ==========
  setTag(s: string): void { 
    this._tag = s;
  }
  
  getTag(): string { 
    return this._tag;
  }

  setLevel(l: PluginLogLevel): void {
    if (l in this.levelPriority) {
      this._level = l;
    }
  }
  
  getLevel(): PluginLogLevel { 
    return this._level;
  }

  setConsole(flag: boolean): void {
    this._console = flag;
  }
}

// 默认单例（使用默认配置）
export const defaultLogger = new LogseqLogger('', {
  console: true,
  level: 'INFO',
});

export default LogseqLogger;
