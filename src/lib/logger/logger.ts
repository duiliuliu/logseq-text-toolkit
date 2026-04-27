/**
 * 日志系统
 * 支持 debug 模式，通过设置中的开发者模式控制
 */

import { getSettings } from '../../settings/index.ts';

export interface Logger {
  /**
   * 日志级别
   */
  log: (message: string, ...args: any[]) => void;
  /**
   * 信息级别
   */
  info: (message: string, ...args: any[]) => void;
  /**
   * 警告级别
   */
  warn: (message: string, ...args: any[]) => void;
  /**
   * 错误级别
   */
  error: (message: string, ...args: any[]) => void;
  /**
   * 调试级别（仅在开发者模式下输出）
   */
  debug: (message: string, ...args: any[]) => void;
  /**
   * 检查是否开启了开发者模式
   */
  isDevMode: () => boolean;
}

/**
 * 创建日志实例
 */
class LoggerImpl implements Logger {
  private getDevMode(): boolean {
    const settings = getSettings();
    return settings?.developerMode || false;
  }

  log(message: string, ...args: any[]): void {
    console.log(`[Text Toolkit] ${message}`, ...args);
  }

  info(message: string, ...args: any[]): void {
    console.info(`[Text Toolkit] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[Text Toolkit] ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(`[Text Toolkit] ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (this.getDevMode()) {
      console.debug(`[Text Toolkit] [DEBUG] ${message}`, ...args);
    }
  }

  isDevMode(): boolean {
    return this.getDevMode();
  }
}

// 导出单例实例
export const logger = new LoggerImpl();

export default logger;
