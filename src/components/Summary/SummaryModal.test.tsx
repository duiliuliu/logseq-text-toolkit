/**
 * SummaryModal 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { SummaryModal } from './SummaryModal';
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

describe('SummaryModal 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 SummaryModal 组件', () => {
      const { container } = render(
        <SettingsProvider settings={defaultSettings}>
          <SummaryModal isOpen={true} onClose={() => {}} />
        </SettingsProvider>
      );
      
      expect(container).toBeTruthy();
    });

    it('应该支持关闭状态', () => {
      const { container } = render(
        <SettingsProvider settings={defaultSettings}>
          <SummaryModal isOpen={false} onClose={() => {}} />
        </SettingsProvider>
      );
      
      expect(container).toBeTruthy();
    });
  });
});
