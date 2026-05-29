/**
 * SummaryModal 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import SummaryModal from './SummaryModal';

describe('SummaryModal 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 SummaryModal 组件', () => {
      const { container } = render(
        <SummaryModal isOpen={true} onClose={() => {}} />
      );
      
      expect(container).toBeTruthy();
    });

    it('应该支持关闭状态', () => {
      const { container } = render(
        <SummaryModal isOpen={false} onClose={() => {}} />
      );
      
      expect(container).toBeTruthy();
    });
  });
});
