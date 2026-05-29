/**
 * DotMatrixProgress 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import DotMatrixProgress from './DotMatrixProgress';

describe('DotMatrixProgress 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 DotMatrixProgress 组件', () => {
      const { container } = render(
        <DotMatrixProgress total={20} completed={10} inProgress={2} blocked={1} pending={7} />
      );
      
      expect(container.querySelector('.dot-matrix-progress')).toBeTruthy();
    });

    it('应该处理全完成状态', () => {
      const { container } = render(
        <DotMatrixProgress total={10} completed={10} inProgress={0} blocked={0} pending={0} />
      );
      
      expect(container.querySelector('.dot-matrix-progress')).toBeTruthy();
    });

    it('应该处理全未开始状态', () => {
      const { container } = render(
        <DotMatrixProgress total={10} completed={0} inProgress={0} blocked={0} pending={10} />
      );
      
      expect(container.querySelector('.dot-matrix-progress')).toBeTruthy();
    });
  });
});
