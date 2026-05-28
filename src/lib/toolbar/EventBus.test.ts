/**
 * EventBus 模块单元测试
 * 测试 src/lib/toolbar/EventBus.ts 中的事件总线功能
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from './EventBus';

describe('toolbar/EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('基本功能', () => {
    it('应该能够订阅事件', () => {
      const handler = vi.fn();
      eventBus.on('test-event', handler);
      eventBus.emit('test-event', { data: 'test' });
      
      expect(handler).toHaveBeenCalledWith({ data: 'test' });
    });

    it('应该能够发布事件', () => {
      const handler = vi.fn();
      eventBus.on('custom-event', handler);
      
      const eventData = { message: 'hello' };
      eventBus.emit('custom-event', eventData);
      
      expect(handler).toHaveBeenCalledWith(eventData);
    });

    it('应该能够取消订阅', () => {
      const handler = vi.fn();
      eventBus.on('removable-event', handler);
      
      eventBus.off('removable-event', handler);
      eventBus.emit('removable-event', {});
      
      expect(handler).not.toHaveBeenCalled();
    });

    it('应该能够清除所有事件监听器', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      eventBus.on('event1', handler1);
      eventBus.on('event2', handler2);
      
      eventBus.clear();
      
      eventBus.emit('event1', {});
      eventBus.emit('event2', {});
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });

  describe('事件隔离', () => {
    it('不同事件应该互不影响', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      eventBus.on('event-a', handler1);
      eventBus.on('event-b', handler2);
      
      eventBus.emit('event-a', { value: 'a' });
      
      expect(handler1).toHaveBeenCalledWith({ value: 'a' });
      expect(handler2).not.toHaveBeenCalled();
    });

    it('同一个事件可以有多个监听器', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      eventBus.on('multi-handler-event', handler1);
      eventBus.on('multi-handler-event', handler2);
      
      eventBus.emit('multi-handler-event', { data: 'test' });
      
      expect(handler1).toHaveBeenCalledWith({ data: 'test' });
      expect(handler2).toHaveBeenCalledWith({ data: 'test' });
    });
  });

  describe('错误处理', () => {
    it('单个监听器抛出错误不应该影响其他监听器', () => {
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error');
      });
      const normalHandler = vi.fn();
      
      eventBus.on('error-event', errorHandler);
      eventBus.on('error-event', normalHandler);
      
      // 不应该抛出错误
      expect(() => {
        eventBus.emit('error-event', {});
      }).not.toThrow();
      
      // 正常的处理器应该被调用
      expect(normalHandler).toHaveBeenCalled();
    });

    it('发布不存在的事件不应该抛出错误', () => {
      expect(() => {
        eventBus.emit('non-existent-event', {});
      }).not.toThrow();
    });

    it('取消不存在的监听器不应该抛出错误', () => {
      const nonExistentHandler = vi.fn();
      
      expect(() => {
        eventBus.off('non-existent-event', nonExistentHandler);
      }).not.toThrow();
    });
  });

  describe('多次订阅', () => {
    it('同一个监听器应该只被调用一次（当订阅多次时）', () => {
      const handler = vi.fn();
      
      eventBus.on('duplicate-event', handler);
      eventBus.on('duplicate-event', handler);
      
      eventBus.emit('duplicate-event', {});
      
      // 事件总线使用 Set 存储处理器，所以同一个函数只会调用一次
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('应该能够多次订阅和取消订阅', () => {
      const handler = vi.fn();
      
      eventBus.on('toggle-event', handler);
      eventBus.emit('toggle-event', { count: 1 });
      
      eventBus.off('toggle-event', handler);
      eventBus.emit('toggle-event', { count: 2 });
      
      eventBus.on('toggle-event', handler);
      eventBus.emit('toggle-event', { count: 3 });
      
      expect(handler).toHaveBeenCalledTimes(2);
    });
  });

  describe('数据类型', () => {
    it('应该能够传递复杂数据', () => {
      const handler = vi.fn();
      eventBus.on('complex-event', handler);
      
      const complexData = {
        string: 'test',
        number: 123,
        boolean: true,
        array: [1, 2, 3],
        object: { nested: { value: 'deep' } },
        null: null,
        undefined: undefined,
      };
      
      eventBus.emit('complex-event', complexData);
      
      expect(handler).toHaveBeenCalledWith(complexData);
    });

    it('应该能够传递空对象', () => {
      const handler = vi.fn();
      eventBus.on('empty-event', handler);
      
      eventBus.emit('empty-event', {});
      
      expect(handler).toHaveBeenCalledWith({});
    });

    it('应该能够传递 null', () => {
      const handler = vi.fn();
      eventBus.on('null-event', handler);
      
      eventBus.emit('null-event', null);
      
      expect(handler).toHaveBeenCalledWith(null);
    });
  });
});
