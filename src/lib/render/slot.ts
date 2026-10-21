/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * Macro slot / provideUI 挂载工具
 *
 * Logseq 2.0.2 的 slot UI 是异步挂载的，固定 setTimeout(1ms) 不可靠。
 * 这里用轮询等待容器真正进入 DOM。
 */

import { getDocument } from '../../logseq/utils';

export function waitForElementById(
  id: string,
  timeoutMs: number = 1500,
  intervalMs: number = 30
): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const find = (): HTMLElement | null => {
      try {
        return getDocument()?.getElementById(id) ?? null;
      } catch {
        return null;
      }
    };

    const immediate = find();
    if (immediate) {
      resolve(immediate);
      return;
    }

    const startedAt = Date.now();
    const timer = setInterval(() => {
      const element = find();
      if (element) {
        clearInterval(timer);
        resolve(element);
        return;
      }
      if (Date.now() - startedAt >= timeoutMs) {
        clearInterval(timer);
        resolve(null);
      }
    }, intervalMs);
  });
}
