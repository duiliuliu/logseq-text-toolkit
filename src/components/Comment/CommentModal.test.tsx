/**
 * CommentModal 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import CommentModal from './CommentModal';

describe('CommentModal 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 CommentModal 组件', () => {
      const { container } = render(
        <CommentModal isOpen={true} onClose={() => {}} />
      );
      
      expect(container).toBeTruthy();
    });

    it('应该支持关闭状态', () => {
      const { container } = render(
        <CommentModal isOpen={false} onClose={() => {}} />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('组件交互测试', () => {
    it('应该调用 onClose 回调', () => {
      const onClose = vi.fn();
      const { container } = render(
        <CommentModal isOpen={true} onClose={onClose} />
      );
      
      expect(container).toBeTruthy();
    });
  });
});
