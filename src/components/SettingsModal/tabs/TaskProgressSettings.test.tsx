/**
 * TaskProgressSettings 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import TaskProgressSettings from './TaskProgressSettings';
import defaultSettings from '../../../settings/defaultSettings';

describe('TaskProgressSettings 组件测试', () => {
  const mockProps = {
    settings: { ...defaultSettings },
    setSettings: vi.fn(),
    onSave: vi.fn(),
    isSaving: false,
    language: 'zh-CN'
  };

  describe('组件展示测试', () => {
    it('应该正确渲染 TaskProgressSettings 组件', () => {
      const { container } = render(<TaskProgressSettings {...mockProps} />);
      expect(container).toBeTruthy();
    });
  });
});
