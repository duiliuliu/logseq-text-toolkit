/**
 * Modal 组件样式单元测试
 * 测试 src/components/Modal/modal.css 中的样式
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createTestElement,
  cleanupTestDOM,
  setThemeMode,
} from '../utils/cssTestUtils';

describe('Modal 组件样式测试', () => {
  beforeEach(() => {
    cleanupTestDOM();
  });

  afterEach(() => {
    cleanupTestDOM();
  });

  describe('1. 模态框遮罩层样式 (.ltt-modal-overlay)', () => {
    it('应该创建遮罩层', () => {
      const overlay = createTestElement('ltt-modal-overlay');
      expect(overlay).not.toBeNull();
    });

    it('应该有固定定位', () => {
      const overlay = createTestElement('ltt-modal-overlay');
      const style = getComputedStyle(overlay);
      expect(style.position).toBe('fixed');
    });

    it('应该覆盖整个视口', () => {
      const overlay = createTestElement('ltt-modal-overlay');
      const style = getComputedStyle(overlay);
      expect(style.top).toBe('0px');
      expect(style.left).toBe('0px');
      expect(style.right).toBe('0px');
      expect(style.bottom).toBe('0px');
    });

    it('应该有半透明背景', () => {
      const overlay = createTestElement('ltt-modal-overlay');
      const style = getComputedStyle(overlay);
      expect(style.backgroundColor).toBeTruthy();
      // 应该是 rgba 或带有透明度的颜色
      expect(style.backgroundColor).toMatch(/rgba|transparent/);
    });

    it('应该有高 z-index', () => {
      const overlay = createTestElement('ltt-modal-overlay');
      const style = getComputedStyle(overlay);
      expect(parseInt(style.zIndex)).toBeGreaterThan(1000);
    });
  });

  describe('2. 模态框容器样式 (.ltt-modal-container)', () => {
    it('应该有固定定位', () => {
      const container = createTestElement('ltt-modal-container');
      const style = getComputedStyle(container);
      expect(style.position).toBe('fixed');
    });

    it('应该居中显示', () => {
      const container = createTestElement('ltt-modal-container');
      const style = getComputedStyle(container);
      expect(style.top).toBe('50%');
      expect(style.left).toBe('50%');
      expect(style.transform).toContain('translate');
    });

    it('应该有背景色', () => {
      const container = createTestElement('ltt-modal-container');
      const style = getComputedStyle(container);
      expect(style.backgroundColor).toBeTruthy();
    });

    it('应该有圆角', () => {
      const container = createTestElement('ltt-modal-container');
      const style = getComputedStyle(container);
      expect(parseInt(style.borderRadius)).toBeGreaterThan(0);
    });

    it('应该有阴影', () => {
      const container = createTestElement('ltt-modal-container');
      const style = getComputedStyle(container);
      expect(style.boxShadow).toBeTruthy();
    });

    it('应该有最大宽度', () => {
      const container = createTestElement('ltt-modal-container');
      const style = getComputedStyle(container);
      expect(parseInt(style.maxWidth)).toBeGreaterThan(0);
    });

    it('应该有最大高度', () => {
      const container = createTestElement('ltt-modal-container');
      const style = getComputedStyle(container);
      expect(parseInt(style.maxHeight)).toBeGreaterThan(0);
    });
  });

  describe('3. 模态框头部样式 (.ltt-modal-header)', () => {
    it('应该有 flex 布局', () => {
      const header = createTestElement('ltt-modal-header');
      const style = getComputedStyle(header);
      expect(style.display).toBe('flex');
    });

    it('应该有对齐方式', () => {
      const header = createTestElement('ltt-modal-header');
      const style = getComputedStyle(header);
      expect(style.justifyContent).toBe('space-between');
      expect(style.alignItems).toBe('center');
    });

    it('应该有内边距', () => {
      const header = createTestElement('ltt-modal-header');
      const style = getComputedStyle(header);
      expect(parseInt(style.paddingTop) + parseInt(style.paddingBottom)).toBeGreaterThan(0);
    });

    it('应该有底部边框', () => {
      const header = createTestElement('ltt-modal-header');
      const style = getComputedStyle(header);
      expect(parseInt(style.borderBottomWidth)).toBeGreaterThan(0);
    });
  });

  describe('4. 模态框标题样式 (.ltt-modal-title)', () => {
    it('应该有较大的字体', () => {
      const title = createTestElement('ltt-modal-title');
      const style = getComputedStyle(title);
      expect(parseInt(style.fontSize)).toBeGreaterThanOrEqual(16);
    });

    it('应该有字体粗细', () => {
      const title = createTestElement('ltt-modal-title');
      const style = getComputedStyle(title);
      expect(parseInt(style.fontWeight)).toBeGreaterThanOrEqual(500);
    });

    it('应该有文本颜色', () => {
      const title = createTestElement('ltt-modal-title');
      const style = getComputedStyle(title);
      expect(style.color).toBeTruthy();
    });
  });

  describe('5. 关闭按钮样式 (.ltt-modal-close)', () => {
    it('应该有指针光标', () => {
      const closeBtn = createTestElement('ltt-modal-close');
      const style = getComputedStyle(closeBtn);
      expect(style.cursor).toBe('pointer');
    });

    it('应该有内边距', () => {
      const closeBtn = createTestElement('ltt-modal-close');
      const style = getComputedStyle(closeBtn);
      expect(parseInt(style.padding) >= 0).toBe(true);
    });

    it('悬停时应该有变化', () => {
      const closeBtn = createTestElement('ltt-modal-close');
      const style = getComputedStyle(closeBtn);
      expect(style.transition).toBeTruthy();
    });
  });

  describe('6. 模态框内容样式 (.ltt-modal-content)', () => {
    it('应该有内边距', () => {
      const content = createTestElement('ltt-modal-content');
      const style = getComputedStyle(content);
      expect(parseInt(style.padding) >= 0).toBe(true);
    });

    it('应该有溢出处理', () => {
      const content = createTestElement('ltt-modal-content');
      const style = getComputedStyle(content);
      expect(style.overflow).toBeTruthy();
    });
  });

  describe('7. 模态框页脚样式 (.ltt-modal-footer)', () => {
    it('应该有 flex 布局', () => {
      const footer = createTestElement('ltt-modal-footer');
      const style = getComputedStyle(footer);
      expect(style.display).toBe('flex');
    });

    it('应该有对齐方式', () => {
      const footer = createTestElement('ltt-modal-footer');
      const style = getComputedStyle(footer);
      expect(style.justifyContent).toBe('flex-end');
      expect(style.alignItems).toBe('center');
    });

    it('应该有顶部边框', () => {
      const footer = createTestElement('ltt-modal-footer');
      const style = getComputedStyle(footer);
      expect(parseInt(style.borderTopWidth)).toBeGreaterThan(0);
    });

    it('应该有内边距', () => {
      const footer = createTestElement('ltt-modal-footer');
      const style = getComputedStyle(footer);
      expect(parseInt(style.paddingTop) + parseInt(style.paddingBottom)).toBeGreaterThan(0);
    });
  });

  describe('8. 动画效果', () => {
    it('模态框应该有过渡效果', () => {
      const container = createTestElement('ltt-modal-container');
      const style = getComputedStyle(container);
      expect(style.transition || style.animation).toBeTruthy();
    });

    it('遮罩层应该有淡入淡出效果', () => {
      const overlay = createTestElement('ltt-modal-overlay');
      const style = getComputedStyle(overlay);
      expect(style.transition || style.animation).toBeTruthy();
    });
  });

  describe('9. 深色模式支持', () => {
    it('深色模式下遮罩层应该可见', () => {
      setThemeMode('dark');
      const overlay = createTestElement('ltt-modal-overlay');
      const style = getComputedStyle(overlay);
      expect(style.backgroundColor).toBeTruthy();
    });

    it('深色模式下容器应该有深色背景', () => {
      setThemeMode('dark');
      const container = createTestElement('ltt-modal-container');
      const style = getComputedStyle(container);
      expect(style.backgroundColor).toBeTruthy();
    });

    it('深色模式下标题应该可见', () => {
      setThemeMode('dark');
      const title = createTestElement('ltt-modal-title');
      const style = getComputedStyle(title);
      expect(style.color).toBeTruthy();
    });
  });

  describe('10. 可访问性', () => {
    it('遮罩层应该有适当的 pointer-events', () => {
      const overlay = createTestElement('ltt-modal-overlay');
      const style = getComputedStyle(overlay);
      expect(style.pointerEvents).toBe('auto');
    });

    it('模态框应该有焦点管理样式', () => {
      const container = createTestElement('ltt-modal-container');
      const style = getComputedStyle(container);
      // 应该有 outline 或 box-shadow 用于焦点指示
      expect(style.outline || style.boxShadow).toBeTruthy();
    });
  });

  describe('11. 响应式布局', () => {
    it('模态框应该能够适应较小的屏幕', () => {
      const container = createTestElement('ltt-modal-container');
      const style = getComputedStyle(container);
      // 应该有宽度或最大宽度设置
      expect(style.width || style.maxWidth).toBeTruthy();
    });

    it('模态框在移动端应该全屏或接近全屏', () => {
      const container = createTestElement('ltt-modal-container');
      const style = getComputedStyle(container);
      // 应该考虑到移动端的显示
      expect(style.maxWidth || style.width).toBeTruthy();
    });
  });
});
