/**
 * Logger 模块单元测试
 * 测试 src/lib/logger/logger.ts 中的 LogseqLogger 类
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LogseqLogger } from './logger';

describe('logger/logger.ts', () => {
  let logger: LogseqLogger;
  let consoleSpy: any;

  beforeEach(() => {
    // 创建新的 logger 实例用于测试
    logger = new LogseqLogger('TestModule', {
      console: true,
      level: 'DEBUG',
    });
    
    // 捕获 console 方法的调用
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    // 清理 mock
    consoleSpy.log.mockRestore();
    consoleSpy.info.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
    consoleSpy.debug.mockRestore();
  });

  describe('LogseqLogger 构造函数', () => {
    it('应该使用默认配置创建实例', () => {
      const defaultLogger = new LogseqLogger();
      expect(defaultLogger.getTag()).toBe('');
      expect(defaultLogger.getLevel()).toBe('INFO');
    });

    it('应该使用自定义 namespace', () => {
      const customLogger = new LogseqLogger('CustomNamespace');
      expect(customLogger.getTag()).toBe('CustomNamespace');
    });

    it('应该使用自定义配置', () => {
      const customLogger = new LogseqLogger('Test', {
        console: false,
        level: 'DEBUG',
      });
      expect(customLogger.getLevel()).toBe('DEBUG');
    });
  });

  describe('日志方法', () => {
    it('应该输出 INFO 级别日志', () => {
      logger.info('Test info message');
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('应该输出 WARN 级别日志', () => {
      logger.warn('Test warning message');
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it('应该输出 ERROR 级别日志', () => {
      logger.error('Test error message');
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('应该输出 DEBUG 级别日志', () => {
      logger.debug('Test debug message');
      expect(consoleSpy.debug).toHaveBeenCalled();
    });

    it('应该输出 LOG 级别日志', () => {
      logger.log('Test log message');
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('应该传递额外参数', () => {
      logger.info('Message with args', { key: 'value' }, 123);
      // 检查调用参数
      const callArgs = consoleSpy.info.mock.calls[0];
      // 最后几个参数应该是用户传入的参数
      expect(callArgs).toContain('Message with args');
      expect(callArgs).toContainEqual({ key: 'value' });
      expect(callArgs).toContain(123);
    });
  });

  describe('日志级别过滤', () => {
    it('当级别为 INFO 时，应该输出 INFO 和更高级别', () => {
      logger.setLevel('INFO');
      
      logger.debug('debug'); // 应该被过滤
      logger.info('info'); // 应该输出
      logger.warn('warn'); // 应该输出
      logger.error('error'); // 应该输出
      
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('当级别为 ERROR 时，应该只输出 ERROR', () => {
      logger.setLevel('ERROR');
      
      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error');
      
      expect(consoleSpy.debug).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('当级别为 DEBUG 时，应该输出所有级别', () => {
      logger.setLevel('DEBUG');
      
      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error');
      
      expect(consoleSpy.debug).toHaveBeenCalled();
      expect(consoleSpy.info).toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('控制台开关', () => {
    it('当 console 为 false 时，应该不输出日志', () => {
      const silentLogger = new LogseqLogger('Silent', { console: false });
      silentLogger.info('This should not appear');
      
      expect(consoleSpy.info).not.toHaveBeenCalled();
    });

    it('应该能够动态关闭控制台输出', () => {
      logger.setConsole(false);
      logger.info('This should not appear');
      
      expect(consoleSpy.info).not.toHaveBeenCalled();
    });

    it('应该能够动态开启控制台输出', () => {
      logger.setConsole(false);
      logger.setConsole(true);
      logger.info('This should appear');
      
      expect(consoleSpy.info).toHaveBeenCalled();
    });
  });

  describe('标签管理', () => {
    it('应该能够设置标签', () => {
      logger.setTag('NewTag');
      expect(logger.getTag()).toBe('NewTag');
    });

    it('应该保留原有标签', () => {
      logger.setTag('OriginalTag');
      logger.setTag('NewTag');
      expect(logger.getTag()).toBe('NewTag');
    });
  });

  describe('日志内容格式', () => {
    it('应该包含标签前缀', () => {
      logger.info('test message');
      
      const firstCallArgs = consoleSpy.info.mock.calls[0];
      // 检查所有参数中是否包含标签
      const argsString = JSON.stringify(firstCallArgs);
      expect(argsString).toContain('TestModule');
    });

    it('应该包含日志级别', () => {
      logger.info('test message');
      
      const firstCallArgs = consoleSpy.info.mock.calls[0];
      const argsString = JSON.stringify(firstCallArgs);
      expect(argsString).toContain('INFO');
    });

    it('应该包含样式格式化的 CSS', () => {
      logger.error('error message');
      
      const firstCallArgs = consoleSpy.error.mock.calls[0];
      // 检查是否有样式参数
      const hasStyle = firstCallArgs.some(arg => 
        typeof arg === 'string' && arg.includes('color:')
      );
      expect(hasStyle).toBe(true);
    });
  });
});
