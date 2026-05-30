/**
 * ToolbarSettings 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ToolbarSettings from './ToolbarSettings';
import defaultSettings from '../../../settings/defaultSettings';

describe('ToolbarSettings 组件测试', () => {
  const mockProps = {
    settings: { ...defaultSettings },
    setSettings: vi.fn(),
    onSave: vi.fn(),
    isSaving: false,
    language: 'zh-CN'
  };

  describe('组件展示测试', () => {
    it('应该正确渲染 ToolbarSettings 组件', () => {
      const { container } = render(<ToolbarSettings {...mockProps} />);
      expect(container).toBeTruthy();
    });

    it('应该渲染基本设置项', () => {
      render(<ToolbarSettings {...mockProps} />);
      
      // 检查是否有开关组件
      const switches = screen.getAllByRole('checkbox');
      expect(switches.length).toBeGreaterThan(0);
    });
  });

  describe('组件交互测试', () => {
    it('应该能够切换Switch开关', () => {
      render(<ToolbarSettings {...mockProps} />);
      
      const switches = screen.getAllByRole('checkbox');
      expect(switches.length).toBeGreaterThan(0);
      
      fireEvent.click(switches[0]);
      expect(mockProps.setSettings).toHaveBeenCalled();
    });
  });
});
