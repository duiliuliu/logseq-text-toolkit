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
    totalTasks: 10,
    completedTasks: Math.floor(10 * progress / 100),
    progress,
    status,
    label: status,
    statusStats: [
      { status: 'todo', count: 10 - Math.floor(10 * progress / 100), color: '#f59e0b' },
      { status: 'doing', count: status === 'in_progress' ? 1 : 0, color: '#3b82f6' },
      { status: 'done', count: Math.floor(10 * progress / 100), color: '#10b981' }
    ]
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
          displayType="mini-circle"
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
          displayType="mini-circle"
          lang="zh-CN"
        />
      );
      
      expect(container.querySelector('.task-progress')).toBeTruthy();
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
      
      expect(container.querySelector('.task-progress')).toBeTruthy();
    });

    it('应该渲染胶囊进度显示', () => {
      const progressData = createMockProgressData(70);
      const { container } = render(
        <TaskProgress
          progressData={progressData}
          displayType="progress-capsule"
          lang="zh-CN"
        />
      );
      
      expect(container.querySelector('.task-progress')).toBeTruthy();
    });

    it('应该渲染步骤进度显示', () => {
      const progressData = createMockProgressData(80);
      const { container } = render(
        <TaskProgress
          progressData={progressData}
          displayType="step-progress"
          lang="zh-CN"
        />
      );
      
      expect(container.querySelector('.task-progress')).toBeTruthy();
    });

    it('应该处理空数据的情况', () => {
      const { container } = render(
        <TaskProgress
          progressData={null}
          displayType="mini-circle"
          lang="zh-CN"
        />
      );
      
      expect(container.firstChild).toBeNull();
    });
  });
});
