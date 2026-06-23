/**
 * HeatmapSettings 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import HeatmapSettings from './HeatmapSettings';
import defaultSettings from '../../../settings/defaultSettings';

describe('HeatmapSettings 组件测试', () => {
  const mockProps = {
    settings: { ...defaultSettings },
    setSettings: vi.fn(),
    onSave: vi.fn(),
    isSaving: false,
    language: 'zh-CN'
  };

  describe('组件展示测试', () => {
    it('应该正确渲染 HeatmapSettings 组件', () => {
      const { container } = render(<HeatmapSettings {...mockProps} />);
      expect(container).toBeTruthy();
    });
  });
});
