/**
 * ToolbarSettings 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import ToolbarSettings from './ToolbarSettings';
import { SettingsProvider } from '../../../settings/useSettings';

describe('ToolbarSettings 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 ToolbarSettings 组件', () => {
      const { container } = render(
        <SettingsProvider>
          <ToolbarSettings />
        </SettingsProvider>
      );
      
      expect(container).toBeTruthy();
    });
  });
});
