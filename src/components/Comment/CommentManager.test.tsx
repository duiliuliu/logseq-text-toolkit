/**
 * CommentManager 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import CommentManager from './CommentManager';
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

describe('CommentManager 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 CommentManager 组件', () => {
      const { container } = render(
        <SettingsProvider settings={defaultSettings}>
          <CommentManager />
        </SettingsProvider>
      );
      
      expect(container).toBeTruthy();
    });
  });
});
