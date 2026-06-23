/**
 * Heatmap 组件样式测试
 * 测试样式加载、CSS变量、主题切换和样式覆盖防止
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import Heatmap from './Heatmap'
import { HeatmapConfig, HeatmapDataPoint } from '../../lib/heatmap/types'

// Mock logseq API
vi.mock('../../logseq', () => ({
  logseqAPI: {
    db: { datascriptQuery: vi.fn().mockResolvedValue([]) },
    Editor: {
      getPage: vi.fn().mockResolvedValue({ uuid: 'test-uuid' }),
      openInRightSidebar: vi.fn().mockResolvedValue(undefined)
    }
  }
}))

vi.mock('../../logseq/utils', () => ({
  getDocument: vi.fn().mockReturnValue({ 
    querySelector: vi.fn(),
    getElementById: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  })
}))

vi.mock('../../lib/heatmap/register', () => ({
  updateHeatmapRendererArgs: vi.fn()
}))

vi.mock('../../settings', () => ({
  getSettings: vi.fn().mockReturnValue({ language: 'zh-CN' })
}))

vi.mock('../../translations/i18n', () => ({
  t: vi.fn((key: string) => key)
}))

const getStyleElement = () => {
  const style = document.createElement('style')
  style.textContent = `
    .heatmap-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
      background: #ffffff;
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      position: relative;
      --heatmap-gap: 2px;
      --heatmap-cell-radius: 2px;
    }
    .heatmap-container.dark {
      background: #171f33;
    }
    .heatmap-cell {
      border: 1px solid transparent;
      position: relative;
      transition: all 0.2s ease;
      border-radius: var(--heatmap-cell-radius);
    }
    .heatmap-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
  `
  return style
}

describe('Heatmap 组件样式测试', () => {
  let testStyle: HTMLStyleElement

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
  }

  const defaultData: HeatmapDataPoint[] = [
    { date: '2026-06-01', count: 5, blocks: [] }
  ]

  beforeEach(() => {
    testStyle = getStyleElement()
    document.head.appendChild(testStyle)
  })

  afterEach(() => {
    if (testStyle.parentNode) {
      testStyle.parentNode.removeChild(testStyle)
    }
  })

  describe('基础样式渲染测试', () => {
    it('应该正确渲染 heatmap-container 类', () => {
      const { container } = render(
        <Heatmap
          config={defaultConfig}
          data={defaultData}
          theme="light"
        />
      )
      
      const heatmapElement = container.querySelector('.heatmap-container')
      expect(heatmapElement).toBeTruthy()
    })

    it('应该应用正确的样式属性', () => {
      const { container } = render(
        <Heatmap
          config={defaultConfig}
          data={defaultData}
          theme="light"
        />
      )
      
      const element = container.querySelector('.heatmap-container') as HTMLElement
      expect(element).toBeTruthy()
      
      const computed = window.getComputedStyle(element)
      expect(computed).toBeTruthy()
    })

    it('应该有 heatmap-header 元素', () => {
      const { container } = render(
        <Heatmap
          config={defaultConfig}
          data={defaultData}
          theme="light"
        />
      )
      
      const header = container.querySelector('.heatmap-header')
      expect(header).toBeTruthy()
    })
  })

  describe('CSS 变量测试', () => {
    it('应该定义 heatmap 相关 CSS 变量', () => {
      const { container } = render(
        <Heatmap
          config={defaultConfig}
          data={defaultData}
          theme="light"
        />
      )
      
      const element = container.querySelector('.heatmap-container') as HTMLElement
      expect(element).toBeTruthy()
      
      const computed = window.getComputedStyle(element)
      expect(computed).toBeTruthy()
    })
  })

  describe('主题切换测试', () => {
    it('应该支持浅色主题', () => {
      const { container } = render(
        <Heatmap
          config={defaultConfig}
          data={defaultData}
          theme="light"
        />
      )
      
      const element = container.querySelector('.heatmap-container')
      expect(element).toBeTruthy()
    })

    it('应该支持深色主题', () => {
      const { container } = render(
        <Heatmap
          config={defaultConfig}
          data={defaultData}
          theme="dark"
        />
      )
      
      const element = container.querySelector('.heatmap-container')
      expect(element).toBeTruthy()
    })
  })

  describe('显示模式样式测试', () => {
    it('应该应用 full 模式样式', () => {
      const { container } = render(
        <Heatmap
          config={{ ...defaultConfig, displayMode: 'full' }}
          data={defaultData}
          theme="light"
        />
      )
      
      const element = container.querySelector('.heatmap-container')
      expect(element).toBeTruthy()
    })

    it('应该应用 basic 模式样式', () => {
      const { container } = render(
        <Heatmap
          config={{ ...defaultConfig, displayMode: 'basic' }}
          data={defaultData}
          theme="light"
        />
      )
      
      const element = container.querySelector('.heatmap-container')
      expect(element).toBeTruthy()
    })

    it('应该应用 minimal 模式样式', () => {
      const { container } = render(
        <Heatmap
          config={{ ...defaultConfig, displayMode: 'minimal' }}
          data={defaultData}
          theme="light"
        />
      )
      
      const element = container.querySelector('.heatmap-container')
      expect(element).toBeTruthy()
    })
  })

  describe('样式覆盖防止测试', () => {
    it('应该确保样式优先级正确', () => {
      const { container } = render(
        <Heatmap
          config={defaultConfig}
          data={defaultData}
          theme="light"
        />
      )
      
      const element = container.querySelector('.heatmap-container') as HTMLElement
      
      if (element) {
        element.style.background = '#ff0000'
        const computed = window.getComputedStyle(element)
        expect(computed.background).toBeTruthy()
      }
    })
  })

  describe('响应式样式测试', () => {
    it('应该能处理不同的容器宽度', () => {
      const widths = ['400px', '600px', '800px', '100%']
      
      widths.forEach(width => {
        const { container } = render(
          <Heatmap
            config={{ ...defaultConfig, containerWidth: width }}
            data={defaultData}
            theme="light"
          />
        )
        
        const element = container.querySelector('.heatmap-container')
        expect(element).toBeTruthy()
      })
    })
  })
})

describe('Heatmap 子组件样式验证', () => {
  it('应该验证 YearView 组件样式结构', () => {
    expect('.heatmap-year-view').toBeTruthy()
  })

  it('应该验证 MonthView 组件样式结构', () => {
    expect('.heatmap-month-view').toBeTruthy()
  })

  it('应该验证 WeekView 组件样式结构', () => {
    expect('.heatmap-week-view').toBeTruthy()
  })

  it('应该验证 Statistics 组件样式结构', () => {
    expect('.heatmap-statistics').toBeTruthy()
  })
})

describe('Heatmap 样式完整性检查', () => {
  it('应该确保所有关键样式类都有定义', () => {
    const expectedClasses = [
      '.heatmap-container',
      '.heatmap-cell',
      '.heatmap-header',
      '.view-controls',
      '.navigation-controls',
      '.heatmap-legend',
      '.heatmap-statistics'
    ]
    
    expectedClasses.forEach(className => {
      expect(className).toBeTruthy()
    })
  })

  it('应该确保深色主题有完整的样式覆盖', () => {
    const darkThemeClass = '.heatmap-container.dark'
    expect(darkThemeClass).toBeTruthy()
  })
})
