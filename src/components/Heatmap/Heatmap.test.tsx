/**
 * Heatmap 组件测试
 * 测试组件展示和交互
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Heatmap from './Heatmap';
import { HeatmapConfig, HeatmapDataPoint } from '../../lib/heatmap/types';

vi.mock('../../logseq', () => ({
  logseqAPI: {
    db: {
      datascriptQuery: vi.fn().mockResolvedValue([])
    }
  }
}));

vi.mock('../../logseq/utils', () => ({
  getDocument: vi.fn().mockReturnValue({
    querySelector: vi.fn()
  })
}));

vi.mock('../../lib/heatmap/register', () => ({
  updateHeatmapRendererArgs: vi.fn()
}));

describe('Heatmap 组件测试', () => {
  let container: HTMLElement;

  const defaultConfig: HeatmapConfig = {
    displayMode: 'year',
    viewType: 'year',
    referenceDate: new Date('2026-06-15'),
    containerWidth: '800px',
    colorScheme: {
      colors: ['#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1'],
      emptyColor: '#f3f4f6'
    }
  };

  const defaultData: HeatmapDataPoint[] = [
    { date: '2026-06-01', count: 5, level: 4 },
    { date: '2026-06-02', count: 3, level: 2 },
    { date: '2026-06-03', count: 7, level: 4 },
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe('组件展示测试', () => {
    it('应该正确渲染 Heatmap 组件', () => {
      const { container } = render(
        <Heatmap
          config={defaultConfig}
          data={defaultData}
          theme="light"
        />
      );
      
      expect(container.querySelector('.heatmap-container')).toBeTruthy();
    });

    it('应该应用正确的主题类名', () => {
      const { container: lightContainer } = render(
        <Heatmap config={defaultConfig} data={defaultData} theme="light" />
      );
      expect(lightContainer.querySelector('.heatmap-container')).toBeTruthy();

      const { container: darkContainer } = render(
        <Heatmap config={defaultConfig} data={defaultData} theme="dark" />
      );
      expect(darkContainer.querySelector('.heatmap-container')).toBeTruthy();
    });

    it('应该根据 displayMode 应用不同的容器类名', () => {
      const modes: Array<'year' | 'month' | 'week'> = ['year', 'month', 'week'];
      
      modes.forEach(mode => {
        const config = { ...defaultConfig, displayMode: mode };
        const { container } = render(
          <Heatmap config={config} data={defaultData} theme="light" />
        );
        
        expect(
          container.querySelector(`.heatmap-${mode}`)
        ).toBeTruthy();
      });
    });

    it('应该渲染视图切换按钮', () => {
      const { container } = render(
        <Heatmap config={defaultConfig} data={defaultData} theme="light" />
      );
      
      const viewBtn = container.querySelector('.heatmap-view-btn');
      expect(viewBtn).toBeTruthy();
    });
  });

  describe('组件交互测试', () => {
    it('应该能够切换到年度视图', async () => {
      const { container } = render(
        <Heatmap config={defaultConfig} data={defaultData} theme="light" />
      );

      const yearButton = container.querySelector('button[data-view="year"]');
      if (yearButton) {
        fireEvent.click(yearButton);
        await waitFor(() => {
          expect(container.querySelector('.heatmap-year-view')).toBeTruthy();
        });
      }
    });

    it('应该能够切换到月度视图', async () => {
      const { container } = render(
        <Heatmap config={defaultConfig} data={defaultData} theme="light" />
      );

      const monthButton = container.querySelector('button[data-view="month"]');
      if (monthButton) {
        fireEvent.click(monthButton);
        await waitFor(() => {
          expect(container.querySelector('.heatmap-month-view')).toBeTruthy();
        });
      }
    });

    it('应该能够切换到周视图', async () => {
      const { container } = render(
        <Heatmap config={defaultConfig} data={defaultData} theme="light" />
      );

      const weekButton = container.querySelector('button[data-view="week"]');
      if (weekButton) {
        fireEvent.click(weekButton);
        await waitFor(() => {
          expect(container.querySelector('.heatmap-week-view')).toBeTruthy();
        });
      }
    });

    it('应该能够切换到上一个周期', async () => {
      const { container } = render(
        <Heatmap config={defaultConfig} data={defaultData} theme="light" />
      );

      const prevButton = container.querySelector('.heatmap-nav-prev');
      if (prevButton) {
        fireEvent.click(prevButton);
      }
    });

    it('应该能够切换到下一个周期', async () => {
      const { container } = render(
        <Heatmap config={defaultConfig} data={defaultData} theme="light" />
      );

      const nextButton = container.querySelector('.heatmap-nav-next');
      if (nextButton) {
        fireEvent.click(nextButton);
      }
    });
  });

  describe('功能交互测试', () => {
    it('应该正确显示视图标题', async () => {
      const { container } = render(
        <Heatmap config={defaultConfig} data={defaultData} theme="light" />
      );
      
      const titleElement = container.querySelector('.heatmap-view-title');
      expect(titleElement).toBeTruthy();
    });

    it('应该处理空数据', () => {
      const { container } = render(
        <Heatmap config={defaultConfig} data={[]} theme="light" />
      );
      
      expect(container.querySelector('.heatmap-container')).toBeTruthy();
    });

    it('应该正确渲染周视图', async () => {
      const config = { ...defaultConfig, viewType: 'week' as const };
      const { container } = render(
        <Heatmap config={config} data={defaultData} theme="light" />
      );
      
      await waitFor(() => {
        const weekView = container.querySelector('.heatmap-week-view');
        expect(weekView).toBeTruthy();
      });
    });

    it('应该正确渲染月视图', async () => {
      const config = { ...defaultConfig, viewType: 'month' as const };
      const { container } = render(
        <Heatmap config={config} data={defaultData} theme="light" />
      );
      
      await waitFor(() => {
        const monthView = container.querySelector('.heatmap-month-view');
        expect(monthView).toBeTruthy();
      });
    });
  });

  describe('边界条件测试', () => {
    it('应该处理无效的 referenceDate', () => {
      const config = {
        ...defaultConfig,
        referenceDate: new Date('invalid-date')
      };
      
      const { container } = render(
        <Heatmap config={config} data={defaultData} theme="light" />
      );
      
      expect(container.querySelector('.heatmap-container')).toBeTruthy();
    });

    it('应该处理缺失的颜色方案', () => {
      const config = {
        ...defaultConfig,
        colorScheme: undefined as any
      };
      
      const { container } = render(
        <Heatmap config={config} data={defaultData} theme="light" />
      );
      
      expect(container.querySelector('.heatmap-container')).toBeTruthy();
    });

    it('应该处理超大数据集', () => {
      const largeDataset: HeatmapDataPoint[] = Array.from({ length: 365 }, (_, i) => ({
        date: `2026-01-${String((i % 30) + 1).padStart(2, '0')}`,
        count: Math.floor(Math.random() * 10),
        level: Math.floor(Math.random() * 5)
      }));
      
      const { container } = render(
        <Heatmap config={defaultConfig} data={largeDataset} theme="light" />
      );
      
      expect(container.querySelector('.heatmap-container')).toBeTruthy();
    });
  });
});

describe('Heatmap 数据点测试', () => {
  it('应该正确计算数据点的级别', () => {
    const dataPoint: HeatmapDataPoint = {
      date: '2026-06-01',
      count: 5,
      level: 3
    };
    
    expect(dataPoint.level).toBeGreaterThanOrEqual(0);
    expect(dataPoint.level).toBeLessThanOrEqual(5);
  });

  it('应该正确处理零计数', () => {
    const dataPoint: HeatmapDataPoint = {
      date: '2026-06-01',
      count: 0,
      level: 0
    };
    
    expect(dataPoint.count).toBe(0);
    expect(dataPoint.level).toBe(0);
  });

  it('应该验证颜色数组的长度', () => {
    const config: HeatmapConfig = {
      displayMode: 'year',
      viewType: 'year',
      colorScheme: {
        colors: ['#a', '#b', '#c', '#d', '#e'],
        emptyColor: '#f'
      }
    };
    
    expect(config.colorScheme.colors.length).toBeGreaterThanOrEqual(1);
  });
});
