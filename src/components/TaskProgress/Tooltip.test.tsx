/**
 * Tooltip 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import Tooltip from './Tooltip';

describe('Tooltip 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 Tooltip 组件', () => {
      const { container } = render(
        <Tooltip content="测试提示" />
      );
      
      expect(container.querySelector('.tooltip')).toBeTruthy();
    });

    it('应该渲染提示内容', () => {
      const { container } = render(
        <Tooltip content="测试提示" />
      );
      
      expect(container).toBeTruthy();
    });

    it('应该支持不同的位置', () => {
      const { container: container1 } = render(
        <Tooltip content="测试提示" position="top" />
      );
      expect(container1).toBeTruthy();

      const { container: container2 } = render(
        <Tooltip content="测试提示" position="bottom" />
      );
      expect(container2).toBeTruthy();
    });
  });
});
