/**
 * 测试工具包
 * 整合 Settings mock 和 Logseq API mock
 */

import { vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import defaultSettings from '../../settings/defaultSettings.ts';
import mockLogseq from '../../logseq/mock/index.ts';

// 保存原始的 logseq API
let originalLogseq: any;

// 重置 mock 的状态
export const resetMockState = () => {
  // 重置 localStorage 中的设置
  localStorage.removeItem('text-toolkit-settings');
  // 重置 mockLogseq 的状态
  if ((mockLogseq as any).App?.reset) {
    (mockLogseq as any).App.reset();
  }
  if ((mockLogseq as any).Editor?.reset) {
    (mockLogseq as any).Editor.reset();
  }
  if ((mockLogseq as any).UI?.reset) {
    (mockLogseq as any).UI.reset();
  }
  console.log('[Test] Mock state reset');
};

// Mock useSettings hook
export const mockUseSettings = (overrides?: Partial<typeof defaultSettings>) => {
  const settings = {
    ...defaultSettings,
    ...overrides
  };

  return {
    settings,
    isLoading: false,
    isSaving: false,
    error: null,
    theme: 'light' as const,
    saveSettings: vi.fn().mockResolvedValue(true),
    resetSettings: vi.fn().mockResolvedValue(true),
    setTheme: vi.fn()
  };
};

// 统一的测试包装器
export const renderWithMocks = (
  component: React.ReactElement,
  options?: {
    settingsOverrides?: Partial<typeof defaultSettings>;
  }
) => {
  // 确保全局的 logseq mock
  (globalThis as any).logseq = mockLogseq;

  return render(component);
};

// 测试前的 setup
export const setupTestEnvironment = () => {
  beforeEach(() => {
    // 保存原始状态
    originalLogseq = (globalThis as any).logseq;

    // 设置 mock logseq
    (globalThis as any).logseq = mockLogseq;

    // 重置 mock 状态
    resetMockState();

    // 清除所有 vi 的 mock
    vi.clearAllMocks();

    console.log('[Test] Environment setup complete');
  });

  afterEach(() => {
    // 恢复原始状态
    if (originalLogseq !== undefined) {
      (globalThis as any).logseq = originalLogseq;
    }

    // 重置 mock 状态
    resetMockState();

    console.log('[Test] Environment cleanup complete');
  });
};

// 导出常用的测试工具
export {
  render,
  screen,
  fireEvent,
  defaultSettings as mockDefaultSettings
};
