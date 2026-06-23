/**
 * SummarySettings 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import SummarySettings from './SummarySettings';
import defaultSettings from '../../../settings/defaultSettings';

describe('SummarySettings 组件测试', () => {
  const mockProps = {
    settings: { ...defaultSettings },
    setSettings: vi.fn(),
    onSave: vi.fn(),
    isSaving: false,
    language: 'zh-CN'
  };

  describe('组件展示测试', () => {
    it('应该正确渲染 SummarySettings 组件', () => {
      const { container } = render(<SummarySettings {...mockProps} />);
      expect(container).toBeTruthy();
    });
  });
});
