/**
 * CommentApp 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import CommentApp from './CommentApp';

describe('CommentApp 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 CommentApp 组件', () => {
      const { container } = render(
        <CommentApp />
      );
      
      expect(container).toBeTruthy();
    });
  });
});
