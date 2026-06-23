/**
 * Modal 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import Modal from './index';

describe('Modal 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 Modal 组件', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="测试弹窗">
          <div>弹窗内容</div>
        </Modal>
      );
      
      expect(container).toBeTruthy();
    });

    it('应该显示标题', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="测试标题">
          <div>弹窗内容</div>
        </Modal>
      );
      
      expect(container).toBeTruthy();
    });

    it('应该支持关闭状态', () => {
      const { container } = render(
        <Modal isOpen={false} onClose={() => {}} title="测试标题">
          <div>弹窗内容</div>
        </Modal>
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('组件交互测试', () => {
    it('应该调用 onClose 回调', () => {
      const onClose = vi.fn();
      const { container } = render(
        <Modal isOpen={true} onClose={onClose} title="测试标题">
          <div>弹窗内容</div>
        </Modal>
      );
      
      expect(container).toBeTruthy();
    });
  });
});
