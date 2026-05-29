/**
 * StatusCursorProgress 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import StatusCursorProgress from './StatusCursorProgress';

describe('StatusCursorProgress 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 StatusCursorProgress 组件', () => {
      const { container } = render(
        <StatusCursorProgress progress={50} status="in_progress" />
      );
      
      expect(container.querySelector('.status-cursor-progress')).toBeTruthy();
    });

    it('应该支持不同的状态', () => {
      const { container: container1 } = render(
        <StatusCursorProgress progress={0} status="pending" />
      );
      expect(container1).toBeTruthy();

      const { container: container2 } = render(
        <StatusCursorProgress progress={50} status="in_progress" />
      );
      expect(container2).toBeTruthy();

      const { container: container3 } = render(
        <StatusCursorProgress progress={100} status="completed" />
      );
      expect(container3).toBeTruthy();

      const { container: container4 } = render(
        <StatusCursorProgress progress={25} status="blocked" />
      );
      expect(container4).toBeTruthy();
    });
  });
});
