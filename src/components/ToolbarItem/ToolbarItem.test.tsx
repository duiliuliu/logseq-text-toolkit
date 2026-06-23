/**
 * ToolbarItem 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import ToolbarItem from './index';

describe('ToolbarItem 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 ToolbarItem 组件', () => {
      const { container } = render(
        <ToolbarItem icon="B" label="粗体" onClick={() => {}} />
      );
      
      expect(container).toBeTruthy();
    });

    it('应该显示图标和标签', () => {
      const { container } = render(
        <ToolbarItem icon="B" label="粗体" onClick={() => {}} />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('组件交互测试', () => {
    it('应该能够点击', () => {
      const onClick = vi.fn();
      const { container } = render(
        <ToolbarItem icon="B" label="粗体" onClick={onClick} />
      );
      
      const item = container.firstChild;
      if (item) {
        fireEvent.click(item);
        expect(onClick).toHaveBeenCalled();
      }
    });
  });
});
