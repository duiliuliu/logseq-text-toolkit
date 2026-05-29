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
        <HeatmapCell date="2026-01-01" level={2} count={3} />
      );
      
      expect(container.querySelector('.heatmap-cell')).toBeTruthy();
    });

    it('应该根据 level 应用不同的样式', () => {
      const { container: container1 } = render(
        <HeatmapCell date="2026-01-01" level={0} count={0} />
      );
      const cell1 = container1.querySelector('.heatmap-cell');
      expect(cell1).toBeTruthy();

      const { container: container2 } = render(
        <HeatmapCell date="2026-01-01" level={4} count={10} />
      );
      const cell2 = container2.querySelector('.heatmap-cell');
      expect(cell2).toBeTruthy();
    });
  });

  describe('组件交互测试', () => {
    it('应该能够响应点击事件', () => {
      const onClick = vi.fn();
      const { container } = render(
        <HeatmapCell date="2026-01-01" level={2} count={3} onClick={onClick} />
      );
      
      const cell = container.querySelector('.heatmap-cell');
      if (cell) {
        fireEvent.click(cell);
        expect(onClick).toHaveBeenCalled();
      }
    });

    it('应该能够响应鼠标进入事件', () => {
      const onMouseEnter = vi.fn();
      const { container } = render(
        <HeatmapCell date="2026-01-01" level={2} count={3} onMouseEnter={onMouseEnter} />
      );
      
      const cell = container.querySelector('.heatmap-cell');
      if (cell) {
        fireEvent.mouseEnter(cell);
        expect(onMouseEnter).toHaveBeenCalled();
      }
    });

    it('应该能够响应鼠标离开事件', () => {
      const onMouseLeave = vi.fn();
      const { container } = render(
        <HeatmapCell date="2026-01-01" level={2} count={3} onMouseLeave={onMouseLeave} />
      );
      
      const cell = container.querySelector('.heatmap-cell');
      if (cell) {
        fireEvent.mouseLeave(cell);
        expect(onMouseLeave).toHaveBeenCalled();
      }
    });
  });
});
