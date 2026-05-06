/**
* Copyright (c) 2026 duiliuliu
* License: MIT
* 
* 完全对齐 Logseq 官方 PluginLogger 接口的增强日志实现
* 参考: https://github.com/logseq/logseq/blob/master/libs/src/LSPlugin.user.ts
* 核心调整：
* 1. 接口与官方完全一致
* 2. 参数命名：inConsole → console、_level → level
* 3. 移除 isDevMode 方法
* 4. 日志级别默认值改为 info
*/

export type PluginLogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

// 完全对齐 Logseq 官方 PluginLogger 接口
export interface Logger {
  log: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

/**
 * 对齐官方接口的增强版 PluginLogger
 */
export class MockPluginLogger implements Logger {
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
    options: {
      console?: boolean;  // 是否在控制台输出（对齐原命名）
      level?: PluginLogLevel;   // 日志级别（替换原 _level）
    } = {}
  ) {
    this._tag = namespace;
    this._console = options.console ?? true; // 默认控制台输出
    this._level = options.level ?? 'INFO'; // 默认级别改为 info
  }

  /**
   * 格式化日志消息（保留命名空间逻辑）
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
  setTag(s: string) { this._tag = s }
  getTag() { return this._tag }

  setLevel(l: PluginLogLevel) {
    if (l in this.levelPriority) this._level = l
  }
  getLevel(): PluginLogLevel { return this._level }

  /**
   * 动态修改控制台输出开关
   */
  setConsole(flag: boolean): void {
    this._console = flag;
  }
}

// 默认单例（对齐原有导出逻辑）
export const logger = new MockPluginLogger('', {
  console: true,
  level: 'INFO', // 默认级别改为 info
});

// 示例：不同配置的实例
// 1. 仅输出 info 及以上级别（默认）
export const defaultLogger = new MockPluginLogger('', {
  console: true,
  level: 'INFO', // debug 日志会被过滤
});

// 2. 输出所有级别（包括 debug）
export const debugLogger = new MockPluginLogger('', {
  console: true,
  level: 'DEBUG',
});

export default logger;

