// 测试环境设置文件
import { vi } from 'vitest';

// Mock ResizeObserver
class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// 将 mock 挂载到全局
global.ResizeObserver = ResizeObserver;
globalThis.ResizeObserver = ResizeObserver;

// Mock requestAnimationFrame 和 cancelAnimationFrame
global.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id: number) => clearTimeout(id);
