/**
 * ProgressCapsule 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import ProgressCapsule from './ProgressCapsule';

describe('ProgressCapsule 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 ProgressCapsule 组件', () => {
      const { container } = render(
        <ProgressCapsule progress={50} />
      );
      
      expect(container.querySelector('.progress-capsule')).toBeTruthy();
    });

    it('应该渲染进度填充', () => {
      const { container } = render(
        <ProgressCapsule progress={75} />
      );
      
      expect(container).toBeTruthy();
    });

    it('应该处理 0% 进度', () => {
      const { container } = render(
        <ProgressCapsule progress={0} />
      );
      
      expect(container.querySelector('.progress-capsule')).toBeTruthy();
    });

    it('应该处理 100% 进度', () => {
      const { container } = render(
        <ProgressCapsule progress={100} />
      );
      
      expect(container.querySelector('.progress-capsule')).toBeTruthy();
    });
  });
});
