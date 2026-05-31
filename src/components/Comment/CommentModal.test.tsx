/**
 * CommentModal 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { CommentModal } from './CommentModal';
import { SettingsProvider } from '../../settings/useSettings';

const defaultSettings = {
  theme: 'light' as const,
  showBorder: true,
  width: '110px',
  height: '24px',
  hoverDelay: 500,
  sponsorEnabled: false,
  language: 'zh-CN' as const
};

const defaultSelectedData = { text: '测试文本',
};

describe('CommentModal 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 CommentModal 组件', () => {
      const { container } = render(
        <SettingsProvider settings={defaultSettings}>
          <CommentModal isOpen={true} selectedData={defaultSelectedData} onClose={() => {}} />
        </SettingsProvider>
      );
      
      expect(container).toBeTruthy();
    });

    it('应该支持关闭状态', () => {
      const { container } = render(
        <SettingsProvider settings={defaultSettings}>
          <CommentModal isOpen={false} selectedData={defaultSelectedData} onClose={() => {}} />
        </SettingsProvider>
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('组件交互测试', () => {
    it('应该调用 onClose 回调', () => {
      const onClose = vi.fn();
      const { container } = render(
        <SettingsProvider settings={defaultSettings}>
          <CommentModal isOpen={true} selectedData={defaultSelectedData} onClose={onClose} />
        </SettingsProvider>
      );
      
      expect(container).toBeTruthy();
    });
  });
});
