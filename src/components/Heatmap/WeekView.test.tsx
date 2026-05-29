/**
 * WeekView 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import WeekView from './WeekView';
import { HeatmapDataPoint } from '../../lib/heatmap/types';

describe('WeekView 组件测试', () => {
  const defaultData: HeatmapDataPoint[] = [
    { date: '2026-01-01', count: 5, level: 4 },
    { date: '2026-01-02', count: 3, level: 2 },
    { date: '2026-01-03', count: 7, level: 4 },
  ];

  describe('组件展示测试', () => {
    it('应该正确渲染 WeekView 组件', () => {
      const { container } = render(
        <WeekView data={defaultData} year={2026} weekNumber={1} theme="light" />
      );
      
      expect(container.querySelector('.week-view')).toBeTruthy();
    });

    it('应该处理空数据', () => {
      const { container } = render(
        <WeekView data={[]} year={2026} weekNumber={1} theme="light" />
      );
      
      expect(container.querySelector('.week-view')).toBeTruthy();
    });
  });
});
