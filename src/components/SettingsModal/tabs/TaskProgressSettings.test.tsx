/**
 * TaskProgressSettings 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import TaskProgressSettings from './TaskProgressSettings';
import { SettingsProvider } from '../../../settings/useSettings';

describe('TaskProgressSettings 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 TaskProgressSettings 组件', () => {
      const { container } = render(
        <SettingsProvider>
          <TaskProgressSettings />
        </SettingsProvider>
      );
      
      expect(container).toBeTruthy();
    });
  });
});
