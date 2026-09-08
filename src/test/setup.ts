// 测试环境设置文件
import { vi } from 'vitest';

// Mock ResizeObserver
class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// 将 mock 挂载到全局
globalThis.ResizeObserver = ResizeObserver as unknown as typeof globalThis.ResizeObserver;

// Mock requestAnimationFrame 和 cancelAnimationFrame
globalThis.requestAnimationFrame = (cb: FrameRequestCallback) =>
  setTimeout(() => cb(performance.now()), 0) as unknown as number;
globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);

// jsdom 在部分执行上下文里不会暴露可用的 localStorage。
// Logseq mock settings 在模块初始化时就会读取它，因此这里提供一个稳定的内存实现。
const createMemoryStorage = (): Storage => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: vi.fn(() => {
      store.clear();
    }),
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, String(value));
    }),
  };
};

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: createMemoryStorage(),
});

// jsdom 默认不实现 Canvas 2D context。TaskProgress 烟花组件只需要基础绘图 API，
// 用最小 mock 避免测试日志被“Not implemented”噪音淹没。
if (globalThis.HTMLCanvasElement) {
  Object.defineProperty(globalThis.HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: vi.fn((contextId: string) => {
      if (contextId !== '2d') {
        return null;
      }

      return {
        arc: vi.fn(),
        beginPath: vi.fn(),
        clearRect: vi.fn(),
        closePath: vi.fn(),
        fill: vi.fn(),
        lineTo: vi.fn(),
        moveTo: vi.fn(),
        restore: vi.fn(),
        save: vi.fn(),
        scale: vi.fn(),
        stroke: vi.fn(),
        translate: vi.fn(),
        fillStyle: '',
        globalAlpha: 1,
      };
    }),
  });
}
