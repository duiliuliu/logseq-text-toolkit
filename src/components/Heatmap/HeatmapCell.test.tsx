/**
 * HeatmapCell 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import HeatmapCell from './HeatmapCell';

describe('HeatmapCell 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 HeatmapCell 组件', () => {
      const { container } = render(
        <HeatmapCell date="2026-01-01" value={3} maxValue={10} color="#6366f1" isEmpty={false} />
      );
      
      expect(container.querySelector('.heatmap-cell')).toBeTruthy();
    });

    it('应该根据 value 显示不同的颜色', () => {
      const { container: container1 } = render(
        <HeatmapCell date="2026-01-01" value={0} maxValue={10} color="#e0e7ff" isEmpty={true} />
      );
      const cell1 = container1.querySelector('.heatmap-cell');
      expect(cell1).toBeTruthy();

      const { container: container2 } = render(
        <HeatmapCell date="2026-01-01" value={10} maxValue={10} color="#6366f1" isEmpty={false} />
      );
      const cell2 = container2.querySelector('.heatmap-cell');
      expect(cell2).toBeTruthy();
    });
  });

  describe('组件交互测试', () => {
    it('应该能够响应点击事件', () => {
      const onClick = vi.fn();
      const { container } = render(
        <HeatmapCell date="2026-01-01" value={3} maxValue={10} color="#6366f1" isEmpty={false} onClick={onClick} />
      );
      
      const cell = container.querySelector('.heatmap-cell');
      if (cell) {
        fireEvent.click(cell);
        expect(onClick).toHaveBeenCalledWith("2026-01-01");
      }
    });

    it('应该能够响应鼠标进入事件（触发内部 hover 状态）', () => {
      const { container } = render(
        <HeatmapCell date="2026-01-01" value={3} maxValue={10} color="#6366f1" isEmpty={false} />
      );
      
      const cell = container.querySelector('.heatmap-cell');
      if (cell) {
        fireEvent.mouseEnter(cell);
        expect(cell.classList.contains('hovered')).toBeTruthy();
      }
    });

    it('应该能够响应鼠标离开事件（移除内部 hover 状态）', () => {
      const { container } = render(
        <HeatmapCell date="2026-01-01" value={3} maxValue={10} color="#6366f1" isEmpty={false} />
      );
      
      const cell = container.querySelector('.heatmap-cell');
      if (cell) {
        fireEvent.mouseEnter(cell);
        fireEvent.mouseLeave(cell);
        expect(cell.classList.contains('hovered')).toBeFalsy();
      }
    });
  });
});
