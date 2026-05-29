/**
 * AdvancedSettings 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import AdvancedSettings from './AdvancedSettings';
import { SettingsProvider } from '../../../settings/useSettings';

describe('AdvancedSettings 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 AdvancedSettings 组件', () => {
      const { container } = render(
        <SettingsProvider>
          <AdvancedSettings />
        </SettingsProvider>
      );
      
      expect(container).toBeTruthy();
    });
  });
});
