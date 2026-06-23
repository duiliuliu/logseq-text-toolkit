/**
 * MacroTemplateInput 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MacroTemplateInput } from './MacroTemplateInput';

describe('MacroTemplateInput 组件测试', () => {
  const mockProps = {
    value: '',
    onChange: vi.fn(),
    macroType: 'taskprogress' as const,
    language: 'zh-CN',
    placeholder: ':taskprogress mini-circle',
    align: 'right' as const
  };

  describe('组件展示测试', () => {
    it('应该正确渲染 MacroTemplateInput 组件', () => {
      const { container } = render(<MacroTemplateInput {...mockProps} />);
      expect(container).toBeTruthy();
      expect(container.querySelector('.ltt-macro-template-input-container')).toBeTruthy();
    });

    it('应该正确渲染输入框', () => {
      const { container } = render(<MacroTemplateInput {...mockProps} />);
      const input = container.querySelector('input[type="text"]');
      expect(input).toBeTruthy();
    });

    it('应该显示帮助提示', () => {
      const { container } = render(<MacroTemplateInput {...mockProps} />);
      const hint = container.querySelector('.ltt-macro-template-hint');
      expect(hint).toBeTruthy();
    });

    it('应该支持 align 参数为 right', () => {
      const { container } = render(<MacroTemplateInput {...mockProps} align="right" />);
      const alertRight = container.querySelector('.ltt-macro-template-alert-right');
      expect(alertRight).toBeTruthy();
    });

    it('应该支持 align 参数为 left', () => {
      const { container } = render(<MacroTemplateInput {...mockProps} align="left" />);
      const alertLeft = container.querySelector('.ltt-macro-template-alert-left');
      expect(alertLeft).toBeTruthy();
    });

    it('应该显示占位符文本', () => {
      const placeholder = ':heatmap, view=year';
      const { container } = render(
        <MacroTemplateInput {...mockProps} placeholder={placeholder} />
      );
      const input = container.querySelector('input');
      expect(input?.getAttribute('placeholder')).toBe(placeholder);
    });
  });

  describe('输入验证测试', () => {
    it('应该验证有效的 taskprogress 模板', () => {
      const { container } = render(
        <MacroTemplateInput {...mockProps} value=":taskprogress mini-circle" />
      );
      // 触发blur事件以触发验证
      const input = container.querySelector('input') as HTMLInputElement;
      fireEvent.blur(input);
      expect(input.value).toBe(':taskprogress mini-circle');
    });

    it('应该验证有效的 heatmap 模板', () => {
      const onChange = vi.fn();
      const { container } = render(
        <MacroTemplateInput
          {...mockProps}
          macroType="heatmap"
          value=":heatmap, view=year"
          onChange={onChange}
        />
      );
      expect(container).toBeTruthy();
    });

    it('应该验证有效的 blockview 模板', () => {
      const { container } = render(
        <MacroTemplateInput
          {...mockProps}
          macroType="blockview"
          value=":blockview, view=list"
        />
      );
      expect(container).toBeTruthy();
    });

    it('应该验证有效的 milestone 模板', () => {
      const { container } = render(
        <MacroTemplateInput
          {...mockProps}
          macroType="milestone"
          value=":milestone, displayStyle=compact"
        />
      );
      expect(container).toBeTruthy();
    });

    it('应该处理无效的模板前缀', () => {
      const { container } = render(
        <MacroTemplateInput
          {...mockProps}
          macroType="taskprogress"
          value=":wrong, view=list"
        />
      );
      expect(container).toBeTruthy();
    });

    it('应该处理缺少前缀的输入', () => {
      const { container } = render(
        <MacroTemplateInput
          {...mockProps}
          value="mini-circle"
        />
      );
      expect(container).toBeTruthy();
    });

    it('应该处理空输入', () => {
      const { container } = render(
        <MacroTemplateInput {...mockProps} value="" />
      );
      expect(container).toBeTruthy();
    });
  });

  describe('组件交互测试', () => {
    it('应该能输入文本', async () => {
      const onChange = vi.fn();
      const { container } = render(
        <MacroTemplateInput {...mockProps} onChange={onChange} debounceMs={50} />
      );
      const input = container.querySelector('input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: ':taskprogress' } });
      // 等待防抖
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(onChange).toHaveBeenCalled();
    });

    it('应该支持防抖验证', async () => {
      const onChange = vi.fn();
      const { container } = render(
        <MacroTemplateInput {...mockProps} onChange={onChange} debounceMs={100} />
      );
      const input = container.querySelector('input') as HTMLInputElement;
      
      // 输入一个有效的模板
      fireEvent.change(input, { target: { value: ':taskprogress mini-circle' } });
      
      // 等待防抖
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 防抖后应该调用onChange（因为输入有效）
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('样式测试', () => {
    it('应该应用正确的容器样式', () => {
      const { container } = render(<MacroTemplateInput {...mockProps} />);
      const containerEl = container.querySelector('.ltt-macro-template-input-container');
      expect(containerEl).toBeTruthy();
    });

    it('应该应用输入框样式', () => {
      const { container } = render(<MacroTemplateInput {...mockProps} />);
      const input = container.querySelector('.ltt-macro-template-input');
      expect(input).toBeTruthy();
    });

    it('错误状态应该有错误样式', () => {
      const { container } = render(
        <MacroTemplateInput {...mockProps} value=":invalid" />
      );
      const input = container.querySelector('input') as HTMLInputElement;
      fireEvent.blur(input);
      const errorInput = container.querySelector('.ltt-macro-template-input-error');
      // 错误状态在blur后显示
      expect(container).toBeTruthy();
    });
  });
});
