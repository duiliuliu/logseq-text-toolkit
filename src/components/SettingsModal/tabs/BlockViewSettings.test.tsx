/**
 * BlockViewSettings 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import BlockViewSettings from './BlockViewSettings';
import { SettingsProvider } from '../../../settings/useSettings';

describe('BlockViewSettings 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 BlockViewSettings 组件', () => {
      const { container } = render(
        <SettingsProvider>
          <BlockViewSettings />
        </SettingsProvider>
      );
      
      expect(container).toBeTruthy();
    });
  });
});
