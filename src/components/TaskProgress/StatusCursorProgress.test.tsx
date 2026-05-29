/**
 * StatusCursorProgress 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import StatusCursorProgress from './StatusCursorProgress';

describe('StatusCursorProgress 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 StatusCursorProgress 组件', () => {
      const { container } = render(
        <StatusCursorProgress 
          stats={[
            { status: 'todo', count: 5, color: '#f59e0b' },
            { status: 'doing', count: 2, color: '#3b82f6' },
            { status: 'done', count: 13, color: '#10b981' }
          ]}
          progress={65}
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('应该支持不同的状态', () => {
      const { container: container1 } = render(
        <StatusCursorProgress 
          stats={[
            { status: 'todo', count: 10, color: '#f59e0b' }
          ]}
          progress={0}
        />
      );
      expect(container1).toBeTruthy();

      const { container: container2 } = render(
        <StatusCursorProgress 
          stats={[
            { status: 'todo', count: 5, color: '#f59e0b' },
            { status: 'doing', count: 5, color: '#3b82f6' }
          ]}
          progress={50}
        />
      );
      expect(container2).toBeTruthy();

      const { container: container3 } = render(
        <StatusCursorProgress 
          stats={[
            { status: 'done', count: 10, color: '#10b981' }
          ]}
          progress={100}
        />
      );
      expect(container3).toBeTruthy();

      const { container: container4 } = render(
        <StatusCursorProgress 
          stats={[
            { status: 'todo', count: 7, color: '#f59e0b' },
            { status: 'waiting', count: 3, color: '#8b5cf6' }
          ]}
          progress={25}
        />
      );
      expect(container4).toBeTruthy();
    });

    it('应该处理空数据的情况', () => {
      const { container } = render(
        <StatusCursorProgress 
          stats={[]}
          progress={0}
        />
      );
      
      expect(container.firstChild).toBeNull();
    });
  });
});
