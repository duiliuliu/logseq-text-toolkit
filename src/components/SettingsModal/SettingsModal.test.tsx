/**
 * SettingsModal 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import SettingsModal from './index';
import { SettingsProvider } from '../../settings/useSettings';

describe('SettingsModal 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 SettingsModal 组件', () => {
      const { container } = render(
        <SettingsProvider>
          <SettingsModal isOpen={true} onClose={() => {}} />
        </SettingsProvider>
      );
      
      expect(container).toBeTruthy();
    });

    it('应该支持关闭状态', () => {
      const { container } = render(
        <SettingsProvider>
          <SettingsModal isOpen={false} onClose={() => {}} />
        </SettingsProvider>
      );
      
      expect(container).toBeTruthy();
    });
  });
});
