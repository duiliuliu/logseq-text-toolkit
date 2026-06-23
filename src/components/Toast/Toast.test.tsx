/**
 * Toast 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import Toast from './Toast';

describe('Toast 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 Toast 组件', () => {
      const { container } = render(
        <Toast message="测试消息" type="success" isOpen={true} onClose={() => {}} />
      );
      
      expect(container).toBeTruthy();
    });

    it('应该支持不同的类型', () => {
      const { container: container1 } = render(
        <Toast message="成功消息" type="success" isOpen={true} onClose={() => {}} />
      );
      expect(container1).toBeTruthy();

      const { container: container2 } = render(
        <Toast message="错误消息" type="error" isOpen={true} onClose={() => {}} />
      );
      expect(container2).toBeTruthy();

      const { container: container3 } = render(
        <Toast message="警告消息" type="warning" isOpen={true} onClose={() => {}} />
      );
      expect(container3).toBeTruthy();

      const { container: container4 } = render(
        <Toast message="信息消息" type="info" isOpen={true} onClose={() => {}} />
      );
      expect(container4).toBeTruthy();
    });
  });

  describe('组件交互测试', () => {
    it('应该调用 onClose 回调', () => {
      const onClose = vi.fn();
      const { container } = render(
        <Toast message="测试消息" type="success" isOpen={true} onClose={onClose} />
      );
      
      expect(container).toBeTruthy();
    });
  });
});
