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

  // 控制台颜色配置
  private colors: Record<PluginLogLevel, string> = {
    DEBUG: '#9CA3AF', // 灰色
    INFO: '#3B82F6', // 蓝色
    WARN: '#F59E0B', // 黄色/橙色
    ERROR: '#EF4444', // 红色
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
   * 检查日志级别是否允许输出
   */
  private isLevelAllowed(level: PluginLogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this._level];
  }

  /**
   * 通用日志输出方法（带颜色）
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
    
    const prefix = this._tag ? `[${this._tag}]` : '[Text Toolkit]';
    const color = this.colors[level];
    
    // 3. 使用 CSS 颜色格式化并输出日志（浏览器控制台）
    console[consoleMethod](
      `%c${prefix} [${level.toUpperCase()}]`, 
      `color: ${color}; font-weight: bold;`,
      message,
      ...args
    );
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
