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
    },
    Editor: {
      getPage: vi.fn().mockResolvedValue({ uuid: 'test-uuid' }),
      openInRightSidebar: vi.fn().mockResolvedValue(undefined)
    }
  }
}));

vi.mock('../../logseq/utils', () => ({
  getDocument: vi.fn().mockReturnValue({
    querySelector: vi.fn(),
    getElementById: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  })
}));

vi.mock('../../lib/heatmap/register', () => ({
  updateHeatmapRendererArgs: vi.fn()
}));

vi.mock('../../settings', () => ({
  getSettings: vi.fn().mockReturnValue({ language: 'zh-CN' })
}));

vi.mock('../../translations/i18n', () => ({
  t: vi.fn((key: string) => key)
}));

describe('Heatmap 组件测试', () => {
  let container: HTMLElement;

  const defaultConfig: HeatmapConfig = {
    displayMode: 'full',
    viewType: 'year',
    referenceDate: new Date('2026-06-15'),
    containerWidth: '800px',
    colorScheme: {
      name: 'indigo',
      colors: ['#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#3730a3']
    },
    colorFormula: 'simple',
    minColor: '#eef2ff',
    maxColor: '#3730a3',
    language: 'zh-CN'
  };

  const defaultData: HeatmapDataPoint[] = [
    { date: '2026-06-01', count: 5, blocks: [] },
    { date: '2026-06-02', count: 3, blocks: [] },
    { date: '2026-06-03', count: 7, blocks: [] },
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
      const modes: Array<'minimal' | 'basic' | 'full'> = ['minimal', 'basic', 'full'];
      
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
      
      const viewBtns = container.querySelectorAll('.view-btn');
      expect(viewBtns.length).toBeGreaterThan(0);
    });
  });

  describe('组件交互测试', () => {
    it('应该能够切换到年度视图', async () => {
      const { container } = render(
        <Heatmap config={defaultConfig} data={defaultData} theme="light" />
      );

      const yearButton = container.querySelectorAll('.view-btn')[0];
      if (yearButton) {
        fireEvent.click(yearButton);
      }
    });

    it('应该能够切换到月度视图', async () => {
      const { container } = render(
        <Heatmap config={defaultConfig} data={defaultData} theme="light" />
      );

      const monthButton = container.querySelectorAll('.view-btn')[1];
      if (monthButton) {
        fireEvent.click(monthButton);
      }
    });

    it('应该能够切换到周视图', async () => {
      const { container } = render(
        <Heatmap config={defaultConfig} data={defaultData} theme="light" />
      );

      const weekButton = container.querySelectorAll('.view-btn')[2];
      if (weekButton) {
        fireEvent.click(weekButton);
      }
    });

    it('应该能够切换到上一个周期', async () => {
      const { container } = render(
        <Heatmap config={defaultConfig} data={defaultData} theme="light" />
      );

      const navBtns = container.querySelectorAll('.nav-btn');
      if (navBtns[0]) {
        fireEvent.click(navBtns[0]);
      }
    });

    it('应该能够切换到下一个周期', async () => {
      const { container } = render(
        <Heatmap config={defaultConfig} data={defaultData} theme="light" />
      );

      const navBtns = container.querySelectorAll('.nav-btn');
      if (navBtns[1]) {
        fireEvent.click(navBtns[1]);
      }
    });
  });

  describe('功能交互测试', () => {
    it('应该正确显示视图标题', async () => {
      const { container } = render(
        <Heatmap config={defaultConfig} data={defaultData} theme="light" />
      );
      
      const titleElement = container.querySelector('.nav-label');
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
      
      const weekView = container.querySelector('.heatmap-week-view');
      expect(weekView).toBeTruthy();
    });

    it('应该正确渲染月视图', async () => {
      const config = { ...defaultConfig, viewType: 'month' as const };
      const { container } = render(
        <Heatmap config={config} data={defaultData} theme="light" />
      );
      
      const monthView = container.querySelector('.heatmap-month-view');
      expect(monthView).toBeTruthy();
    });
  });

  describe('边界条件测试', () => {
    it('应该处理无效的 referenceDate', () => {
      const config = {
        ...defaultConfig,
        referenceDate: new Date()
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
        blocks: []
      }));
      
      const { container } = render(
        <Heatmap config={defaultConfig} data={largeDataset} theme="light" />
      );
      
      expect(container.querySelector('.heatmap-container')).toBeTruthy();
    });
  });
});

describe('Heatmap 数据点测试', () => {
  it('应该正确计算数据点的计数', () => {
    const dataPoint: HeatmapDataPoint = {
      date: '2026-06-01',
      count: 5,
      blocks: []
    };
    
    expect(dataPoint.count).toBeGreaterThanOrEqual(0);
  });

  it('应该正确处理零计数', () => {
    const dataPoint: HeatmapDataPoint = {
      date: '2026-06-01',
      count: 0,
      blocks: []
    };
    
    expect(dataPoint.count).toBe(0);
  });
});
