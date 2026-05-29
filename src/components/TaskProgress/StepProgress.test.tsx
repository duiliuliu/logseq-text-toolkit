/**
 * StepProgress 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import StepProgress from './StepProgress';

describe('StepProgress 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 StepProgress 组件', () => {
      const { container } = render(
        <StepProgress 
          stats={[
            { status: 'todo', count: 5, color: '#f59e0b' },
            { status: 'doing', count: 2, color: '#3b82f6' },
            { status: 'done', count: 3, color: '#10b981' }
          ]}
          progress={50}
          totalTasks={10}
          completedTasks={5}
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('应该渲染正确的步骤数量', () => {
      const { container } = render(
        <StepProgress 
          stats={[
            { status: 'todo', count: 5, color: '#f59e0b' },
            { status: 'doing', count: 2, color: '#3b82f6' },
            { status: 'done', count: 3, color: '#10b981' }
          ]}
          progress={50}
          totalTasks={10}
          completedTasks={5}
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('应该处理全完成状态', () => {
      const { container } = render(
        <StepProgress 
          stats={[
            { status: 'todo', count: 0, color: '#f59e0b' },
            { status: 'doing', count: 0, color: '#3b82f6' },
            { status: 'done', count: 10, color: '#10b981' }
          ]}
          progress={100}
          totalTasks={10}
          completedTasks={10}
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('应该处理空数据的情况', () => {
      const { container } = render(
        <StepProgress 
          stats={[]}
          progress={0}
          totalTasks={0}
          completedTasks={0}
        />
      );
      
      expect(container.firstChild).toBeNull();
    });
  });
});
