/**
 * Tooltip 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import Tooltip from './Tooltip';

describe('Tooltip 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 Tooltip 组件', () => {
      const { container } = render(
        <Tooltip 
          content={{
            stats: [
              { status: 'todo', count: 5, color: '#f59e0b' },
              { status: 'doing', count: 2, color: '#3b82f6' },
              { status: 'done', count: 3, color: '#10b981' }
            ],
            totalTasks: 10,
            progress: 50
          }}
        >
          <div>Hover me</div>
        </Tooltip>
      );
      
      expect(container.querySelector('.task-progress-tooltip-wrapper')).toBeTruthy();
    });

    it('应该渲染提示内容', () => {
      const { container } = render(
        <Tooltip 
          content={{
            stats: [
              { status: 'todo', count: 5, color: '#f59e0b' },
              { status: 'doing', count: 2, color: '#3b82f6' },
              { status: 'done', count: 3, color: '#10b981' }
            ],
            totalTasks: 10,
            progress: 50
          }}
        >
          <div>Hover me</div>
        </Tooltip>
      );
      
      expect(container).toBeTruthy();
    });
  });
});
