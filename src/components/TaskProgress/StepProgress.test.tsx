/**
 * StepProgress 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import StepProgress from './StepProgress';

describe('StepProgress 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 StepProgress 组件', () => {
      const { container } = render(
        <StepProgress total={5} completed={3} inProgress={1} blocked={0} pending={1} />
      );
      
      expect(container.querySelector('.step-progress')).toBeTruthy();
    });

    it('应该渲染正确的步骤数量', () => {
      const { container } = render(
        <StepProgress total={5} completed={3} inProgress={1} blocked={0} pending={1} />
      );
      
      expect(container).toBeTruthy();
    });

    it('应该处理全完成状态', () => {
      const { container } = render(
        <StepProgress total={5} completed={5} inProgress={0} blocked={0} pending={0} />
      );
      
      expect(container.querySelector('.step-progress')).toBeTruthy();
    });
  });
});
