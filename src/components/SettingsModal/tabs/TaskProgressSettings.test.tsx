/**
 * TaskProgressSettings 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import TaskProgressSettings from './TaskProgressSettings';
import { mockUseSettings } from '../../../../__tests__/utils/testHelpers';

// Mock the useSettings hook
vi.mock('../../../../settings/useSettings', () => ({
  useSettings: () => mockUseSettings()
}));

describe('TaskProgressSettings 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 TaskProgressSettings 组件', () => {
      const { container } = render(<TaskProgressSettings />);
      expect(container).toBeTruthy();
    });
  });
});
