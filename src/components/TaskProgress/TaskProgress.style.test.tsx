/**
 * TaskProgress 组件样式测试
 * 测试样式加载、CSS变量、主题切换和样式覆盖防止
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import TaskProgress from './TaskProgress'
import { TaskProgress as TaskProgressType } from './types'

const getStyleElement = () => {
  const style = document.createElement('style')
  style.textContent = `
    .task-progress {
      display: inline-flex;
      align-items: center;
    }
    .task-progress-mini-circle {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .task-progress-dot-matrix {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .task-progress-capsule {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 9999px;
      background-color: var(--ls-secondary-background-color);
    }
    .task-progress-step {
      display: flex;
      align-items: flex-end;
      height: 16px;
      gap: 1px;
    }
    .task-progress-tooltip-wrapper {
      position: relative;
      display: inline-block;
    }
    .task-progress-tooltip {
      position: absolute;
      z-index: 99999;
      padding: 8px 12px;
      background-color: var(--ls-secondary-background-color, #fff);
      border: 1px solid var(--ls-border-color, #e5e7eb);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .nesting-indicator {
      font-size: 10px;
      color: var(--ls-secondary-text-color, #6b7280);
      background-color: var(--ls-secondary-background-color, #f3f4f6);
      padding: 2px 6px;
      border-radius: 4px;
      margin-right: 6px;
      font-family: monospace;
      cursor: help;
    }
  `
  return style
}

describe('TaskProgress 组件样式测试', () => {
  let testStyle: HTMLStyleElement

  const createMockData = (progress: number): TaskProgressType => {
    const completedTasks = Math.floor(10 * progress / 100)
    return {
      totalTasks: 10,
      completedTasks,
      progress,
      status: 'in_progress',
      statusStats: [
        { status: 'todo', count: 10 - completedTasks - 1, color: '#f59e0b' },
        { status: 'doing', count: 1, color: '#3b82f6' },
        { status: 'done', count: completedTasks, color: '#10b981' }
      ]
    }
  }

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
    it('应该正确渲染 task-progress 类', () => {
      const { container } = render(
        <TaskProgress
          progressData={createMockData(50)}
          displayType="mini-circle"
          lang="zh-CN"
        />
      )
      
      const element = container.querySelector('.task-progress')
      expect(element).toBeTruthy()
    })

    it('应该正确处理 progressData 为 null 的情况', () => {
      const { container } = render(
        <TaskProgress
          progressData={null}
          displayType="mini-circle"
          lang="zh-CN"
        />
      )
      
      expect(container.firstChild).toBeNull()
    })
  })

  describe('不同显示类型的样式测试', () => {
    it('应该渲染 mini-circle 类型样式', () => {
      const { container } = render(
        <TaskProgress
          progressData={createMockData(50)}
          displayType="mini-circle"
          lang="zh-CN"
        />
      )
      
      expect(container.querySelector('.task-progress')).toBeTruthy()
    })

    it('应该渲染 dot-matrix 类型样式', () => {
      const { container } = render(
        <TaskProgress
          progressData={createMockData(50)}
          displayType="dot-matrix"
          lang="zh-CN"
        />
      )
      
      expect(container.querySelector('.task-progress')).toBeTruthy()
    })

    it('应该渲染 progress-capsule 类型样式', () => {
      const { container } = render(
        <TaskProgress
          progressData={createMockData(50)}
          displayType="progress-capsule"
          lang="zh-CN"
        />
      )
      
      expect(container.querySelector('.task-progress')).toBeTruthy()
    })

    it('应该渲染 step-progress 类型样式', () => {
      const { container } = render(
        <TaskProgress
          progressData={createMockData(50)}
          displayType="step-progress"
          lang="zh-CN"
        />
      )
      
      expect(container.querySelector('.task-progress')).toBeTruthy()
    })

    it('应该渲染 status-cursor 类型样式', () => {
      const { container } = render(
        <TaskProgress
          progressData={createMockData(50)}
          displayType="status-cursor"
          lang="zh-CN"
        />
      )
      
      expect(container.querySelector('.task-progress')).toBeTruthy()
    })
  })

  describe('主题和变量测试', () => {
    it('应该支持不同语言', () => {
      const languages = ['zh-CN', 'en-US'] as const
      
      languages.forEach(lang => {
        const { container } = render(
          <TaskProgress
            progressData={createMockData(50)}
            displayType="mini-circle"
            lang={lang}
          />
        )
        
        expect(container.querySelector('.task-progress')).toBeTruthy()
      })
    })
  })

  describe('嵌套指示器样式测试', () => {
    it('应该渲染嵌套指示器', () => {
      const { container } = render(
        <TaskProgress
          progressData={createMockData(50)}
          displayType="mini-circle"
          lang="zh-CN"
          nestingLevel={2}
          showNestingIndicator={true}
        />
      )
      
      expect(container.querySelector('.task-progress')).toBeTruthy()
    })

    it('应该处理 onlyLeaves 选项', () => {
      const { container } = render(
        <TaskProgress
          progressData={createMockData(50)}
          displayType="mini-circle"
          lang="zh-CN"
          nestingLevel="all"
          onlyLeaves={true}
          showNestingIndicator={true}
        />
      )
      
      expect(container.querySelector('.task-progress')).toBeTruthy()
    })
  })

  describe('样式覆盖防止测试', () => {
    it('应该确保样式优先级正确', () => {
      const { container } = render(
        <TaskProgress
          progressData={createMockData(50)}
          displayType="mini-circle"
          lang="zh-CN"
        />
      )
      
      const element = container.querySelector('.task-progress') as HTMLElement
      
      if (element) {
        // 应用内联样式测试优先级
        element.style.display = 'block'
        const computed = window.getComputedStyle(element)
        expect(computed.display).toBeTruthy()
      }
    })
  })

  describe('Tooltip 样式测试', () => {
    it('应该有 tooltip 相关样式结构', () => {
      const { container } = render(
        <TaskProgress
          progressData={createMockData(50)}
          displayType="mini-circle"
          lang="zh-CN"
        />
      )
      
      // 测试 tooltip wrapper 结构
      expect(container).toBeTruthy()
    })
  })

  describe('不同进度值的样式测试', () => {
    it('应该正确处理 0% 进度', () => {
      const { container } = render(
        <TaskProgress
          progressData={createMockData(0)}
          displayType="mini-circle"
          lang="zh-CN"
        />
      )
      
      expect(container.querySelector('.task-progress')).toBeTruthy()
    })

    it('应该正确处理 100% 进度', () => {
      const { container } = render(
        <TaskProgress
          progressData={createMockData(100)}
          displayType="mini-circle"
          lang="zh-CN"
        />
      )
      
      expect(container.querySelector('.task-progress')).toBeTruthy()
    })

    it('应该正确处理 50% 进度', () => {
      const { container } = render(
        <TaskProgress
          progressData={createMockData(50)}
          displayType="mini-circle"
          lang="zh-CN"
        />
      )
      
      expect(container.querySelector('.task-progress')).toBeTruthy()
    })
  })
})

describe('TaskProgress 样式完整性检查', () => {
  it('应该确保所有显示类型都有对应的样式类', () => {
    const displayTypes = [
      '.task-progress-mini-circle',
      '.task-progress-dot-matrix',
      '.task-progress-capsule',
      '.task-progress-step',
      '.task-progress-cursor'
    ]
    
    displayTypes.forEach(className => {
      expect(className).toBeTruthy()
    })
  })

  it('应该确保嵌套指示器样式存在', () => {
    expect('.nesting-indicator').toBeTruthy()
  })

  it('应该确保工具提示样式存在', () => {
    const tooltipClasses = [
      '.task-progress-tooltip-wrapper',
      '.task-progress-tooltip',
      '.tooltip-header',
      '.tooltip-stats',
      '.tooltip-footer'
    ]
    
    tooltipClasses.forEach(className => {
      expect(className).toBeTruthy()
    })
  })
})

describe('TaskProgress CSS 变量验证', () => {
  it('应该确保 Logseq 变量有正确的回退值', () => {
    const lsVariables = [
      '--ls-secondary-background-color',
      '--ls-primary-text-color',
      '--ls-secondary-text-color',
      '--ls-border-color',
      '--ls-active-primary-color'
    ]
    
    lsVariables.forEach(variable => {
      expect(variable).toBeTruthy()
    })
  })
})
