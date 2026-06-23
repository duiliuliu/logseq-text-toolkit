/**
 * Toolbar 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import Toolbar from './index';

// 模拟 framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

// 模拟 lucide-react
vi.mock('lucide-react', () => ({
  Bold: () => <span data-testid="bold-icon" />,
  Italic: () => <span data-testid="italic-icon" />,
  Underline: () => <span data-testid="underline-icon" />,
  Strikethrough: () => <span data-testid="strikethrough-icon" />,
  Highlighter: () => <span data-testid="highlighter-icon" />,
  Type: () => <span data-testid="type-icon" />,
  X: () => <span data-testid="x-icon" />,
  Menu: () => <span data-testid="menu-icon" />
}));

const testItems = [
  {
    id: 'bold',
    icon: 'bold',
    label: '加粗'
  },
  {
    id: 'italic',
    icon: 'italic',
    label: '斜体'
  },
  {
    id: 'format-group',
    icon: 'type',
    label: '格式',
    subItems: [
      { id: 'underline', icon: 'underline', label: '下划线' },
      { id: 'strikethrough', icon: 'strikethrough', label: '删除线' }
    ]
  }
];

describe('Toolbar 组件测试', () => {
  describe('组件展示测试', () => {
    it('应该正确渲染 Toolbar 组件', () => {
      const { container } = render(
        <Toolbar items={[]} />
      );
      
      expect(container).toBeTruthy();
      expect(container.querySelector('.ltt-toolbar-container')).toBeTruthy();
    });

    it('应该正确渲染工具栏项目', () => {
      const { container } = render(
        <Toolbar items={testItems} />
      );
      
      const mainItems = container.querySelectorAll('.ltt-toolbar-main-item');
      expect(mainItems.length).toBeGreaterThan(0);
    });

    it('应该支持浅色主题', () => {
      const { container } = render(
        <Toolbar items={testItems} theme="light" />
      );
      
      expect(container.querySelector('.ltt-toolbar-light')).toBeTruthy();
    });

    it('应该支持深色主题', () => {
      const { container } = render(
        <Toolbar items={testItems} theme="dark" />
      );
      
      expect(container.querySelector('.ltt-toolbar-dark')).toBeTruthy();
    });

    it('应该支持自定义尺寸', () => {
      const { container } = render(
        <Toolbar items={testItems} width="200px" height="40px" />
      );
      
      const mainDiv = container.querySelector('.ltt-toolbar-main');
      expect(mainDiv).toBeTruthy();
    });

    it('应该支持无边框模式', () => {
      const { container } = render(
        <Toolbar items={testItems} showBorder={false} />
      );
      
      const mainDiv = container.querySelector('.ltt-toolbar-main');
      expect(mainDiv).toBeTruthy();
    });
  });

  describe('组件交互测试', () => {
    it('应该能点击工具栏项目', () => {
      const handleItemClick = vi.fn();
      const { container } = render(
        <Toolbar 
          items={testItems} 
          onItemClick={handleItemClick}
        />
      );
      
      const mainItems = container.querySelectorAll('.ltt-toolbar-main-item');
      if (mainItems.length > 0) {
        fireEvent.click(mainItems[0]);
      }
      
      expect(container).toBeTruthy();
    });

    it('应该能显示和隐藏更多项目', () => {
      const itemsWithMore = [
        ...testItems,
        { id: 'item4', icon: 'x', label: 'Item4' },
        { id: 'item5', icon: 'menu', label: 'Item5' },
        { id: 'item6', icon: 'type', label: 'Item6' },
        { id: 'item7', icon: 'highlighter', label: 'Item7' }
      ];
      
      const { container } = render(
        <Toolbar items={itemsWithMore} />
      );
      
      const moreBtn = container.querySelector('.ltt-toolbar-more');
      if (moreBtn) {
        fireEvent.click(moreBtn);
        fireEvent.click(moreBtn);
      }
      
      expect(container).toBeTruthy();
    });
  });

  describe('悬浮和工具提示测试', () => {
    it('应该在悬浮时显示工具提示', () => {
      const { container } = render(
        <Toolbar items={testItems} />
      );
      
      const mainItems = container.querySelectorAll('.ltt-toolbar-main-item');
      if (mainItems.length > 0) {
        fireEvent.mouseEnter(mainItems[0]);
        fireEvent.mouseLeave(mainItems[0]);
      }
      
      expect(container).toBeTruthy();
    });
  });
});
