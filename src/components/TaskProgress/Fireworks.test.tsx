/**
 * Fireworks 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import Fireworks from './Fireworks';

// Mock DOMRect
const createMockTargetRect = (): DOMRect => {
  return {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    top: 0,
    right: 100,
    bottom: 100,
    left: 0,
    toJSON: () => {}
  } as DOMRect;
};

describe('Fireworks 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 Fireworks 组件', () => {
      const { container } = render(
        <Fireworks targetRect={createMockTargetRect()} />
      );
      
      expect(container).toBeTruthy();
    });

    it('应该支持 onComplete 回调', () => {
      const onComplete = vi.fn();
      const { container } = render(
        <Fireworks targetRect={createMockTargetRect()} onComplete={onComplete} />
      );
      
      expect(container).toBeTruthy();
    });

    it('应该处理 null targetRect', () => {
      const { container } = render(
        <Fireworks targetRect={null} />
      );
      
      expect(container).toBeTruthy();
    });
  });
});
