/**
 * ProgressCapsule 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import ProgressCapsule from './ProgressCapsule';

describe('ProgressCapsule 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 ProgressCapsule 组件', () => {
      const { container } = render(
        <ProgressCapsule 
          stats={[
            { status: 'todo', count: 5, color: '#f59e0b' },
            { status: 'doing', count: 2, color: '#3b82f6' },
            { status: 'done', count: 13, color: '#10b981' }
          ]}
          progress={65}
          totalTasks={20}
          completedTasks={13}
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('应该渲染进度填充', () => {
      const { container } = render(
        <ProgressCapsule 
          stats={[
            { status: 'todo', count: 5, color: '#f59e0b' },
            { status: 'doing', count: 2, color: '#3b82f6' },
            { status: 'done', count: 13, color: '#10b981' }
          ]}
          progress={75}
          totalTasks={20}
          completedTasks={15}
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('应该处理 0% 进度', () => {
      const { container } = render(
        <ProgressCapsule 
          stats={[
            { status: 'todo', count: 10, color: '#f59e0b' },
            { status: 'doing', count: 0, color: '#3b82f6' },
            { status: 'done', count: 0, color: '#10b981' }
          ]}
          progress={0}
          totalTasks={10}
          completedTasks={0}
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('应该处理 100% 进度', () => {
      const { container } = render(
        <ProgressCapsule 
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
        <ProgressCapsule 
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
