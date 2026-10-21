import { describe, it, expect, beforeEach, vi } from 'vitest';
import { waitForElementById } from './slot';

describe('waitForElementById', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useRealTimers();
  });

  it('应该立即返回已存在的元素', async () => {
    const element = document.createElement('div');
    element.id = 'slot-1';
    document.body.appendChild(element);

    await expect(waitForElementById('slot-1', 100, 10)).resolves.toBe(element);
  });

  it('应该等待异步挂载的元素', async () => {
    setTimeout(() => {
      const element = document.createElement('div');
      element.id = 'slot-2';
      document.body.appendChild(element);
    }, 30);

    const result = await waitForElementById('slot-2', 500, 10);
    expect(result).toBeInstanceOf(HTMLElement);
    expect(result?.id).toBe('slot-2');
  });

  it('超时后应该返回 null', async () => {
    const result = await waitForElementById('missing', 60, 10);
    expect(result).toBeNull();
  });
});
