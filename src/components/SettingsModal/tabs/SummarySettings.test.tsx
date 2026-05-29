/**
 * SummarySettings 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import SummarySettings from './SummarySettings';
import { SettingsProvider } from '../../../settings/useSettings';

describe('SummarySettings 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 SummarySettings 组件', () => {
      const { container } = render(
        <SettingsProvider>
          <SummarySettings />
        </SettingsProvider>
      );
      
      expect(container).toBeTruthy();
    });
  });
});
