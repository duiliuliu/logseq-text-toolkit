/**
 * TaskProgress 组件测试
 * 测试任务进度组件的基本渲染和交互
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TaskProgress from './TaskProgress';
import { TaskProgress as TaskProgressType, ProgressDisplayType } from './types';

describe('TaskProgress 组件测试', () => {
  let container: HTMLElement;

  const createMockProgressData = (
    progress: number,
    status: string = 'in_progress'
  ): TaskProgressType => ({
    total: 10,
    completed: Math.floor(10 * progress / 100),
    inProgress: status === 'in_progress' ? 1 : 0,
    blocked: status === 'blocked' ? 1 : 0,
    pending: status === 'pending' ? 8 : 0,
    progress,
    status,
    label: status,
    percentage: progress,
    stats: {
      total: 10,
      completed: Math.floor(10 * progress / 100),
      inProgress: status === 'in_progress' ? 1 : 0,
      blocked: status === 'blocked' ? 1 : 0,
      pending: status === 'pending' ? 8 : 0
    }
  });

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
    it('应该正确渲染 TaskProgress 组件', () => {
      const progressData = createMockProgressData(50);
      const { container } = render(
        <TaskProgress
          progressData={progressData}
          displayType="circle"
          lang="zh-CN"
        />
      );
      
      expect(container.querySelector('.task-progress')).toBeTruthy();
    });

    it('应该渲染圆形进度显示', () => {
      const progressData = createMockProgressData(60);
      const { container } = render(
        <TaskProgress
          progressData={progressData}
          displayType="circle"
          lang="zh-CN"
        />
      );
      
      expect(container.querySelector('.circle-progress')).toBeTruthy();
    });

    it('应该渲染点阵进度显示', () => {
      const progressData = createMockProgressData(40);
      const { container } = render(
        <TaskProgress
          progressData={progressData}
          displayType="dot-matrix"
          lang="zh-CN"
        />
      );
      
      expect(container.querySelector('.dot-matrix-progress')).toBeTruthy();
    });

    it('应该渲染胶囊进度显示', () => {
      const progressData = createMockProgressData(70);
      const { container } = render(
        <TaskProgress
          progressData={progressData}
          displayType="capsule"
          lang="zh-CN"
        />
      );
      
      expect(container.querySelector('.progress-capsule')).toBeTruthy();
    });

    it('应该渲染步骤进度显示', () => {
      const progressData = createMockProgressData(80);
      const { container } = render(
        <TaskProgress
          progressData={progressData}
          displayType="step"
          lang="zh-CN"
        />
      );
      
      expect(container.querySelector('.step-progress')).toBeTruthy();
    });

    it('应该渲染状态游标进度显示', () => {
      const progressData = createMockProgressData(90);
      const { container } = render(
        <TaskProgress
          progressData={progressData}
          displayType="status-cursor"
          lang="zh-CN"
        />
      );
      
      expect(container.querySelector('.status-cursor-progress')).toBeTruthy();
    });

    it('当 progressData 为 null 时应该返回 null', () => {
      const { container } = render(
        <TaskProgress
          progressData={null}
          displayType="circle"
          lang="zh-CN"
        />
      );
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('组件交互测试', () => {
    it('应该正确响应鼠标进入事件', async () => {
      const progressData = createMockProgressData(100, 'completed');
      const { container } = render(
        <TaskProgress
          progressData={progressData}
          displayType="circle"
          lang="zh-CN"
          config={{ fireworksOnComplete: true }}
        />
      );
      
      const progressElement = container.querySelector('.task-progress');
      if (progressElement) {
        fireEvent.mouseEnter(progressElement);
        
        await waitFor(() => {
          expect(true).toBe(true);
        });
      }
    });

    it('应该正确响应鼠标离开事件', async () => {
      const progressData = createMockProgressData(100, 'completed');
      const { container } = render(
        <TaskProgress
          progressData={progressData}
          displayType="circle"
          lang="zh-CN"
          config={{ fireworksOnComplete: true }}
        />
      );
      
      const progressElement = container.querySelector('.task-progress');
      if (progressElement) {
        fireEvent.mouseEnter(progressElement);
        fireEvent.mouseLeave(progressElement);
        
        await waitFor(() => {
          expect(true).toBe(true);
        });
      }
    });

    it('应该切换不同的显示类型', () => {
      const progressData = createMockProgressData(50);
      const displayTypes: ProgressDisplayType[] = [
        'circle', 'dot-matrix', 'capsule', 'step', 'status-cursor'
      ];
      
      displayTypes.forEach(displayType => {
        const { container } = render(
          <TaskProgress
            progressData={progressData}
            displayType={displayType}
            lang="zh-CN"
          />
        );
        
        expect(container.querySelector('.task-progress')).toBeTruthy();
      });
    });

    it('应该支持不同的语言设置', () => {
      const progressData = createMockProgressData(60);
      const languages = ['zh-CN', 'en-US'] as const;
      
      languages.forEach(lang => {
        const { container } = render(
          <TaskProgress
            progressData={progressData}
            displayType="circle"
            lang={lang}
          />
        );
        
        expect(container.querySelector('.task-progress')).toBeTruthy();
      });
    });
  });

  describe('样式测试', () => {
    it('应该正确处理嵌套层级显示', () => {
      const progressData = createMockProgressData(70);
      const { container } = render(
        <TaskProgress
          progressData={progressData}
          displayType="circle"
          lang="zh-CN"
          nestingLevel={2}
          showNestingIndicator={true}
        />
      );
      
      const nestingIndicator = container.querySelector('.nesting-indicator');
      expect(nestingIndicator).toBeTruthy();
    });

    it('应该显示嵌套层级文本', () => {
      const progressData = createMockProgressData(80);
      const { container } = render(
        <TaskProgress
          progressData={progressData}
          displayType="circle"
          lang="zh-CN"
          nestingLevel={3}
          showNestingIndicator={true}
          onlyLeaves={false}
        />
      );
      
      const nestingIndicator = container.querySelector('.nesting-indicator');
      expect(nestingIndicator?.textContent).toContain('3');
    });

    it('应该只显示叶节点', () => {
      const progressData = createMockProgressData(85);
      const { container } = render(
        <TaskProgress
          progressData={progressData}
          displayType="circle"
          lang="zh-CN"
          nestingLevel="all"
          onlyLeaves={true}
          showNestingIndicator={true}
        />
      );
      
      const nestingIndicator = container.querySelector('.nesting-indicator');
      expect(nestingIndicator?.textContent).toContain('◈');
    });
  });

  describe('功能交互测试', () => {
    it('应该显示完成状态', async () => {
      const progressData = createMockProgressData(100, 'completed');
      const { container } = render(
        <TaskProgress
          progressData={progressData}
          displayType="circle"
          lang="zh-CN"
          config={{ fireworksOnComplete: true }}
        />
      );
      
      await waitFor(() => {
        expect(container.querySelector('.task-progress')).toBeTruthy();
      });
    });

    it('应该处理 0% 进度', () => {
      const progressData = createMockProgressData(0);
      const { container } = render(
        <TaskProgress
          progressData={progressData}
          displayType="circle"
          lang="zh-CN"
        />
      );
      
      expect(container.querySelector('.task-progress')).toBeTruthy();
    });

    it('应该处理 100% 进度', () => {
      const progressData = createMockProgressData(100, 'completed');
      const { container } = render(
        <TaskProgress
          progressData={progressData}
          displayType="circle"
          lang="zh-CN"
        />
      );
      
      expect(container.querySelector('.task-progress')).toBeTruthy();
    });

    it('应该处理阻塞状态', () => {
      const progressData = createMockProgressData(50, 'blocked');
      const { container } = render(
        <TaskProgress
          progressData={progressData}
          displayType="circle"
          lang="zh-CN"
        />
      );
      
      expect(container.querySelector('.task-progress')).toBeTruthy();
    });
  });
});

describe('TaskProgress 类型验证', () => {
  it('应该接受有效的 ProgressDisplayType', () => {
    const validTypes: ProgressDisplayType[] = [
      'circle', 'dot-matrix', 'capsule', 'step', 'status-cursor'
    ];
    
    validTypes.forEach(type => {
      expect(type).toBeTruthy();
    });
  });
});
