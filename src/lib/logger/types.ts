/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * Logger 类型定义
 * 完全对齐 Logseq 官方 PluginLogger 接口
 * 参考: https://github.com/logseq/logseq/blob/master/libs/src/LSPlugin.user.ts
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

// Logger 配置选项
export interface LoggerOptions {
  console?: boolean;  // 是否在控制台输出
  level?: PluginLogLevel;  // 日志级别
}
