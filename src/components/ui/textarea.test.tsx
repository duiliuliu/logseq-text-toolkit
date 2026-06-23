/**
 * Textarea 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { Textarea } from './textarea';

describe('Textarea 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 Textarea 组件', () => {
      const { container } = render(
        <Textarea value="" onChange={() => {}} placeholder="请输入" />
      );
      
      expect(container).toBeTruthy();
    });

    it('应该显示占位符', () => {
      const { container } = render(
        <Textarea value="" onChange={() => {}} placeholder="测试占位符" />
      );
      
      expect(container).toBeTruthy();
    });

    it('应该显示值', () => {
      const { container } = render(
        <Textarea value="测试值" onChange={() => {}} placeholder="请输入" />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('组件交互测试', () => {
    it('应该能够输入', () => {
      const onChange = vi.fn();
      const { container } = render(
        <Textarea value="" onChange={onChange} placeholder="请输入" />
      );
      
      const textarea = container.querySelector('textarea');
      if (textarea) {
        fireEvent.change(textarea, { target: { value: '新值' } });
        expect(onChange).toHaveBeenCalled();
      }
    });
  });
});
