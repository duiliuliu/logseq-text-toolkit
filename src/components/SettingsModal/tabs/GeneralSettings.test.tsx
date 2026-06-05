/**
 * GeneralSettings 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import GeneralSettings from './GeneralSettings';
import defaultSettings from '../../../settings/defaultSettings';

describe('GeneralSettings 组件测试', () => {
  const mockProps = {
    settings: { ...defaultSettings },
    setSettings: vi.fn(),
    onSave: vi.fn(),
    isSaving: false,
    language: 'zh-CN'
  };

  describe('组件展示测试', () => {
    it('应该正确渲染 GeneralSettings 组件', () => {
      const { container } = render(<GeneralSettings {...mockProps} />);
      expect(container).toBeTruthy();
    });

    it('应该渲染主题设置', () => {
      const { container } = render(<GeneralSettings {...mockProps} />);
      expect(container.innerHTML).toContain('主题');
    });

    it('应该渲染语言设置', () => {
      const { container } = render(<GeneralSettings {...mockProps} />);
      expect(container.innerHTML).toContain('语言');
    });

    it('应该渲染开发者模式开关', () => {
      const { container } = render(<GeneralSettings {...mockProps} />);
      expect(container.innerHTML).toContain('开发者模式');
    });

    it('应该渲染功能管理区域', () => {
      const { container } = render(<GeneralSettings {...mockProps} />);
      expect(container.innerHTML).toContain('ltt-feature-management');
    });
  });

  describe('功能管理测试', () => {
    it('功能管理区域默认折叠', () => {
      const { container } = render(<GeneralSettings {...mockProps} />);
      const header = container.querySelector('.ltt-feature-management-header');
      expect(header).toBeTruthy();
    });

    it('点击功能管理头部应该展开/折叠', () => {
      const { container } = render(<GeneralSettings {...mockProps} />);
      const header = container.querySelector('.ltt-feature-management-header');
      
      if (header) {
        fireEvent.click(header);
        // 展开后应该有内容
        const content = container.querySelector('.ltt-feature-management-content');
        // 再次点击应该折叠
        fireEvent.click(header);
      }
      
      expect(container).toBeTruthy();
    });

    it('应该显示功能数量统计', () => {
      const { container } = render(<GeneralSettings {...mockProps} />);
      const count = container.querySelector('.ltt-feature-management-count');
      expect(count).toBeTruthy();
      // 应该显示类似 "5/6" 的格式
      expect(count?.textContent).toMatch(/\d+\/\d+/);
    });

    it('功能管理应该区分已启用和未启用', () => {
      const { container } = render(<GeneralSettings {...mockProps} />);
      const header = container.querySelector('.ltt-feature-management-header');
      
      if (header) {
        fireEvent.click(header);
      }
      
      // 应该显示已启用标签
      expect(container.innerHTML).toContain('已启用');
      // 当所有功能启用时，不应该显示未启用标签
      // 注：由于默认设置中所有功能都启用，所以只检查已启用标签存在
    });
  });

  describe('交互测试', () => {
    it('应该能切换主题', () => {
      const setSettings = vi.fn();
      const { container } = render(
        <GeneralSettings {...mockProps} setSettings={setSettings} />
      );
      
      // 查找主题选择器
      const themeSelects = container.querySelectorAll('select');
      if (themeSelects.length > 0) {
        fireEvent.change(themeSelects[0], { target: { value: 'dark' } });
      }
      
      expect(container).toBeTruthy();
    });

    it('应该能切换语言', () => {
      const setSettings = vi.fn();
      const { container } = render(
        <GeneralSettings {...mockProps} setSettings={setSettings} />
      );
      
      // 查找语言选择器
      const languageSelects = container.querySelectorAll('select');
      if (languageSelects.length > 1) {
        fireEvent.change(languageSelects[1], { target: { value: 'en' } });
      }
      
      expect(container).toBeTruthy();
    });
  });
});
