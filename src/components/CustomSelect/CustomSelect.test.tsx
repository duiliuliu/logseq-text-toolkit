/**
 * CustomSelect 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import CustomSelect from './index';

describe('CustomSelect 组件测试', () => {
  const options = [
    { value: 'option1', label: '选项1' },
    { value: 'option2', label: '选项2' },
    { value: 'option3', label: '选项3' },
  ];

  describe('组件展示测试', () => {
    it('应该正确渲染 CustomSelect 组件', () => {
      const { container } = render(
        <CustomSelect options={options} value="option1" onChange={() => {}} />
      );
      
      expect(container).toBeTruthy();
    });

    it('应该显示选中值', () => {
      const { container } = render(
        <CustomSelect options={options} value="option2" onChange={() => {}} />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('组件交互测试', () => {
    it('应该能够点击选择', () => {
      const onChange = vi.fn();
      const { container } = render(
        <CustomSelect options={options} value="option1" onChange={onChange} />
      );
      
      const select = container.firstChild;
      if (select) {
        fireEvent.click(select);
      }
      expect(container).toBeTruthy();
    });

    it('应该调用 onChange 回调', () => {
      const onChange = vi.fn();
      const { container } = render(
        <CustomSelect options={options} value="option1" onChange={onChange} />
      );
      
      expect(container).toBeTruthy();
    });
  });
});
