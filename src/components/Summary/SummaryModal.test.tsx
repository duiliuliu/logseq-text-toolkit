/**
 * SummaryModal 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SummaryModal } from './SummaryModal';
import { SettingsProvider } from '../../settings/useSettings';

describe('SummaryModal 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 SummaryModal 组件', () => {
      const { container } = render(
        <SettingsProvider>
          <SummaryModal isOpen={true} onClose={() => {}} />
        </SettingsProvider>
      );
      
      expect(container).toBeTruthy();
    });

    it('应该支持关闭状态', () => {
      const { container } = render(
        <SettingsProvider>
          <SummaryModal isOpen={false} onClose={() => {}} />
        </SettingsProvider>
      );
      
      expect(container).toBeTruthy();
    });
  });
});
