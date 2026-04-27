import type { EventBus as IEventBus, EventType, EventData } from './types.ts';

/**
 * 事件总线实现
 */
export class EventBus implements IEventBus {
  private handlers: Map<EventType, Set<Function>> = new Map();

  /**
   * 订阅事件
   */
  on<T extends EventData>(event: EventType, handler: (data: T) => void): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler as Function);
  }

  /**
   * 发布事件
   */
  emit<T extends EventData>(event: EventType, data: T): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error handling event ${event}:`, error);
        }
      });
    }
  }

  /**
   * 取消订阅
   */
  off<T extends EventData>(event: EventType, handler: (data: T) => void): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler as Function);
    }
  }

  /**
   * 清除所有事件监听器
   */
  clear(): void {
    this.handlers.clear();
  }
}

// 导出单例实例
export const eventBus = new EventBus();
