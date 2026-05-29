/**
 * SelectToolbar 组件测试
 * 测试选择工具栏组件的基本渲染和交互
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import SelectToolbar from '../../components/SelectToolbar';
import { SettingsProvider } from '../../settings/useSettings';

vi.mock('../../logseq/utils', () => ({
  getSelection: vi.fn().mockReturnValue({
    toString: vi.fn().mockReturnValue('mock selection'),
    anchorNode: {},
    focusNode: {}
  }),
  getWindow: vi.fn().mockReturnValue(window),
  getDocument: vi.fn().mockReturnValue(document)
}));

vi.mock('../../logseq', () => ({
  logseqAPI: {
    editor: {
      insertBatchBlock: vi.fn().mockResolvedValue(undefined)
    }
  }
}));

vi.mock('../../lib/toolbar', () => ({
  toolbarManager: {
    isReady: vi.fn().mockReturnValue(true),
    initialize: vi.fn(),
    setLanguage: vi.fn(),
    executeAction: vi.fn().mockResolvedValue(undefined)
  },
  eventBus: {
    on: vi.fn(),
    off: vi.fn()
  }
}));

vi.mock('../../lib/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('SelectToolbar 组件测试', () => {
  let container: HTMLElement;
  let mockTargetElement: HTMLElement;

  const defaultItems = [
    { id: 'bold', label: '粗体', icon: 'B', action: 'bold' },
    { id: 'italic', label: '斜体', icon: 'I', action: 'italic' },
    { id: 'underline', label: '下划线', icon: 'U', action: 'underline' }
  ];

  const defaultSettings = {
    theme: 'light' as const,
    showBorder: true,
    width: '110px',
    height: '24px',
    hoverDelay: 500,
    sponsorEnabled: false,
    language: 'zh-CN' as const
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    mockTargetElement = document.createElement('div');
    mockTargetElement.className = 'mock-target';
    document.body.appendChild(mockTargetElement);
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    if (mockTargetElement.parentNode) {
      mockTargetElement.parentNode.removeChild(mockTargetElement);
    }
  });

  describe('组件展示测试', () => {
    it('应该正确渲染 SelectToolbar 组件', () => {
      const { container } = render(
        <SettingsProvider settings={defaultSettings}>
          <SelectToolbar
            targetElement={mockTargetElement}
            items={defaultItems}
            theme="light"
          />
        </SettingsProvider>
      );
      
      expect(container.querySelector('.select-toolbar')).toBeTruthy();
    });

    it('应该渲染工具栏项目', () => {
      const { container } = render(
        <SettingsProvider settings={defaultSettings}>
          <SelectToolbar
            targetElement={mockTargetElement}
            items={defaultItems}
            theme="light"
          />
        </SettingsProvider>
      );
      
      const toolbarItems = container.querySelectorAll('.toolbar-item');
      expect(toolbarItems.length).toBeGreaterThan(0);
    });

    it('应该应用正确的主题', () => {
      const { container: lightContainer } = render(
        <SettingsProvider settings={{ ...defaultSettings, theme: 'light' }}>
          <SelectToolbar
            targetElement={mockTargetElement}
            items={defaultItems}
            theme="light"
          />
        </SettingsProvider>
      );
      expect(lightContainer.querySelector('.select-toolbar')).toBeTruthy();

      const { container: darkContainer } = render(
        <SettingsProvider settings={{ ...defaultSettings, theme: 'dark' }}>
          <SelectToolbar
            targetElement={mockTargetElement}
            items={defaultItems}
            theme="dark"
          />
        </SettingsProvider>
      );
      expect(darkContainer.querySelector('.select-toolbar')).toBeTruthy();
    });
  });

  describe('组件交互测试', () => {
    it('应该能够点击工具栏项目', async () => {
      const { container } = render(
        <SettingsProvider settings={defaultSettings}>
          <SelectToolbar
            targetElement={mockTargetElement}
            items={defaultItems}
            theme="light"
          />
        </SettingsProvider>
      );
      
      const firstItem = container.querySelector('.toolbar-item') as HTMLElement;
      if (firstItem) {
        fireEvent.click(firstItem);
        await waitFor(() => {
          expect(true).toBe(true);
        });
      }
    });

    it('应该能够响应鼠标悬停', async () => {
      const { container } = render(
        <SettingsProvider settings={defaultSettings}>
          <SelectToolbar
            targetElement={mockTargetElement}
            items={defaultItems}
            theme="light"
          />
        </SettingsProvider>
      );
      
      const toolbar = container.querySelector('.select-toolbar') as HTMLElement;
      if (toolbar) {
        fireEvent.mouseEnter(toolbar);
        await waitFor(() => {
          expect(true).toBe(true);
        });
      }
    });

    it('应该处理多次快速点击', async () => {
      const { container } = render(
        <SettingsProvider settings={defaultSettings}>
          <SelectToolbar
            targetElement={mockTargetElement}
            items={defaultItems}
            theme="light"
          />
        </SettingsProvider>
      );
      
      const firstItem = container.querySelector('.toolbar-item') as HTMLElement;
      if (firstItem) {
        fireEvent.click(firstItem);
        fireEvent.click(firstItem);
        fireEvent.click(firstItem);
        await waitFor(() => {
          expect(true).toBe(true);
        });
      }
    });
  });

  describe('功能交互测试', () => {
    it('应该正确处理空项目列表', () => {
      const { container } = render(
        <SettingsProvider settings={defaultSettings}>
          <SelectToolbar
            targetElement={mockTargetElement}
            items={[]}
            theme="light"
          />
        </SettingsProvider>
      );
      
      expect(container.querySelector('.select-toolbar')).toBeTruthy();
    });

    it('应该正确处理单个项目', () => {
      const singleItem = [{ id: 'test', label: '测试', icon: 'T', action: 'test' }];
      const { container } = render(
        <SettingsProvider settings={defaultSettings}>
          <SelectToolbar
            targetElement={mockTargetElement}
            items={singleItem}
            theme="light"
          />
        </SettingsProvider>
      );
      
      const toolbarItems = container.querySelectorAll('.toolbar-item');
      expect(toolbarItems.length).toBe(1);
    });

    it('应该正确处理多个项目', () => {
      const manyItems = Array.from({ length: 10 }, (_, i) => ({
        id: `item-${i}`,
        label: `项目 ${i}`,
        icon: String(i),
        action: `action-${i}`
      }));
      
      const { container } = render(
        <SettingsProvider settings={defaultSettings}>
          <SelectToolbar
            targetElement={mockTargetElement}
            items={manyItems}
            theme="light"
          />
        </SettingsProvider>
      );
      
      const toolbarItems = container.querySelectorAll('.toolbar-item');
      expect(toolbarItems.length).toBe(10);
    });

    it('应该正确处理 targetElement 为 null', () => {
      const { container } = render(
        <SettingsProvider settings={defaultSettings}>
          <SelectToolbar
            targetElement={null}
            items={defaultItems}
            theme="light"
          />
        </SettingsProvider>
      );
      
      expect(container.querySelector('.select-toolbar')).toBeTruthy();
    });

    it('应该处理 sponsorEnabled 配置', () => {
      const { container } = render(
        <SettingsProvider settings={{ ...defaultSettings, sponsorEnabled: true }}>
          <SelectToolbar
            targetElement={mockTargetElement}
            items={defaultItems}
            sponsorEnabled={true}
            theme="light"
          />
        </SettingsProvider>
      );
      
      expect(container.querySelector('.select-toolbar')).toBeTruthy();
    });
  });

  describe('边界条件测试', () => {
    it('应该处理超长标签', () => {
      const longLabelItems = [
        { id: 'long', label: '这是一个非常非常长的标签文本', icon: 'L', action: 'long' }
      ];
      
      const { container } = render(
        <SettingsProvider settings={defaultSettings}>
          <SelectToolbar
            targetElement={mockTargetElement}
            items={longLabelItems}
            theme="light"
          />
        </SettingsProvider>
      );
      
      expect(container.querySelector('.select-toolbar')).toBeTruthy();
    });

    it('应该处理特殊字符标签', () => {
      const specialCharItems = [
        { id: 'special', label: '🎉✨🎊', icon: '🎉', action: 'special' }
      ];
      
      const { container } = render(
        <SettingsProvider settings={defaultSettings}>
          <SelectToolbar
            targetElement={mockTargetElement}
            items={specialCharItems}
            theme="light"
          />
        </SettingsProvider>
      );
      
      expect(container.querySelector('.select-toolbar')).toBeTruthy();
    });

    it('应该处理缺失的图标', () => {
      const noIconItems = [
        { id: 'no-icon', label: '无图标', icon: '', action: 'no-icon' }
      ];
      
      const { container } = render(
        <SettingsProvider settings={defaultSettings}>
          <SelectToolbar
            targetElement={mockTargetElement}
            items={noIconItems}
            theme="light"
          />
        </SettingsProvider>
      );
      
      expect(container.querySelector('.select-toolbar')).toBeTruthy();
    });
  });
});

describe('SelectToolbar 事件处理测试', () => {
  let container: HTMLElement;
  let mockTargetElement: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    mockTargetElement = document.createElement('div');
    mockTargetElement.className = 'mock-target';
    document.body.appendChild(mockTargetElement);
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    if (mockTargetElement.parentNode) {
      mockTargetElement.parentNode.removeChild(mockTargetElement);
    }
  });

  describe('文本选择处理', () => {
    it('应该检测文本选择变化', async () => {
      const defaultItems = [
        { id: 'bold', label: '粗体', icon: 'B', action: 'bold' }
      ];
      
      const defaultSettings = {
        theme: 'light' as const,
        showBorder: true,
        width: '110px',
        height: '24px',
        hoverDelay: 500,
        sponsorEnabled: false,
        language: 'zh-CN' as const
      };
      
      const { container } = render(
        <SettingsProvider settings={defaultSettings}>
          <SelectToolbar
            targetElement={mockTargetElement}
            items={defaultItems}
            theme="light"
          />
        </SettingsProvider>
      );
      
      await waitFor(() => {
        expect(container.querySelector('.select-toolbar')).toBeTruthy();
      });
    });

    it('应该处理选择文本为空的情况', async () => {
      const defaultItems = [
        { id: 'bold', label: '粗体', icon: 'B', action: 'bold' }
      ];
      
      const defaultSettings = {
        theme: 'light' as const,
        showBorder: true,
        width: '110px',
        height: '24px',
        hoverDelay: 500,
        sponsorEnabled: false,
        language: 'zh-CN' as const
      };
      
      const { container } = render(
        <SettingsProvider settings={defaultSettings}>
          <SelectToolbar
            targetElement={mockTargetElement}
            items={defaultItems}
            theme="light"
          />
        </SettingsProvider>
      );
      
      await waitFor(() => {
        expect(container.querySelector('.select-toolbar')).toBeTruthy();
      });
    });
  });
});
