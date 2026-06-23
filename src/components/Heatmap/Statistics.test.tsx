/**
 * Statistics 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import Statistics from './Statistics';
import { HeatmapDataPoint } from '../../lib/heatmap/types';

describe('Statistics 组件测试', () => {
  const defaultData: HeatmapDataPoint[] = [
    { date: '2026-01-01', count: 5, level: 4 },
    { date: '2026-01-02', count: 3, level: 2 },
    { date: '2026-01-03', count: 7, level: 4 },
  ];

  describe('组件展示测试', () => {
    it('应该正确渲染 Statistics 组件', () => {
      const { container } = render(
        <Statistics data={defaultData} lang="zh-CN" />
      );
      
      expect(container.querySelector('.heatmap-statistics')).toBeTruthy();
    });

    it('应该处理空数据', () => {
      const { container } = render(
        <Statistics data={[]} lang="zh-CN" />
      );
      
      expect(container.querySelector('.heatmap-statistics')).toBeTruthy();
    });

    it('应该支持不同语言', () => {
      const { container: container1 } = render(
        <Statistics data={defaultData} lang="zh-CN" />
      );
      expect(container1).toBeTruthy();

      const { container: container2 } = render(
        <Statistics data={defaultData} lang="en-US" />
      );
      expect(container2).toBeTruthy();
    });
  });
});
