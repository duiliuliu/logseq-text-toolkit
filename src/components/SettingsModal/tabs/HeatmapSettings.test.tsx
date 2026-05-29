/**
 * HeatmapSettings 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import HeatmapSettings from './HeatmapSettings';
import { SettingsProvider } from '../../../settings/useSettings';

describe('HeatmapSettings 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 HeatmapSettings 组件', () => {
      const { container } = render(
        <SettingsProvider>
          <HeatmapSettings />
        </SettingsProvider>
      );
      
      expect(container).toBeTruthy();
    });
  });
});
