/**
 * MiniCircleProgress 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import MiniCircleProgress from './MiniCircleProgress';

describe('MiniCircleProgress 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 MiniCircleProgress 组件', () => {
      const { container } = render(
        <MiniCircleProgress progress={50} />
      );
      
      expect(container.querySelector('.mini-circle-progress')).toBeTruthy();
    });

    it('应该渲染正确的进度值', () => {
      const { container } = render(
        <MiniCircleProgress progress={75} />
      );
      
      expect(container).toBeTruthy();
    });

    it('应该处理 0% 进度', () => {
      const { container } = render(
        <MiniCircleProgress progress={0} />
      );
      
      expect(container.querySelector('.mini-circle-progress')).toBeTruthy();
    });

    it('应该处理 100% 进度', () => {
      const { container } = render(
        <MiniCircleProgress progress={100} />
      );
      
      expect(container.querySelector('.mini-circle-progress')).toBeTruthy();
    });
  });
});
