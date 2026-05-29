/**
 * Fireworks 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import Fireworks from './Fireworks';

describe('Fireworks 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 Fireworks 组件', () => {
      const { container } = render(
        <Fireworks active={true} />
      );
      
      expect(container.querySelector('.fireworks')).toBeTruthy();
    });

    it('应该支持非激活状态', () => {
      const { container } = render(
        <Fireworks active={false} />
      );
      
      expect(container).toBeTruthy();
    });
  });
});
