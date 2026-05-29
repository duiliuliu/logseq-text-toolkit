/**
 * ToolbarSettings 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ToolbarSettings from './ToolbarSettings';
import { mockUseSettings } from '../../../../__tests__/utils/testHelpers';

// Mock the useSettings hook
vi.mock('../../../../settings/useSettings', () => ({
  useSettings: () => mockUseSettings()
}));

describe('ToolbarSettings 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 ToolbarSettings 组件', () => {
      const { container } = render(<ToolbarSettings />);
      expect(container).toBeTruthy();
    });
  });
});
