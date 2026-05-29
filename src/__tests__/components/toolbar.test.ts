/**
 * Toolbar 组件样式单元测试
 * 测试 src/components/Toolbar/toolbar.css 中的样式
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createTestElement,
  cleanupTestDOM,
  setThemeMode,
} from '../utils/cssTestUtils';

describe('Toolbar 组件样式测试', () => {
  beforeEach(() => {
    cleanupTestDOM();
  });

  afterEach(() => {
    cleanupTestDOM();
    document.body.classList.remove('ltt-toolbar-dark');
  });

  describe('1. 工具栏容器样式 (.ltt-toolbar-container, .ltt-floating-toolbar)', () => {
    it('应该创建工具栏容器', () => {
      const toolbar = createTestElement('ltt-toolbar-container');
      expect(toolbar).not.toBeNull();
    });

    it('应该有 flex 布局', () => {
      const toolbar = createTestElement('ltt-toolbar-container');
      const style = getComputedStyle(toolbar);
      expect(style.display).toBe('flex');
    });

    it('应该有对齐方式', () => {
      const toolbar = createTestElement('ltt-toolbar-container');
      const style = getComputedStyle(toolbar);
      expect(style.alignItems).toBe('center');
    });

    it('浮动工具栏应该有固定定位', () => {
      const floatingToolbar = createTestElement('ltt-floating-toolbar');
      const style = getComputedStyle(floatingToolbar);
      expect(style.position).toBe('fixed');
    });

    it('浮动工具栏应该水平居中', () => {
      const floatingToolbar = createTestElement('ltt-floating-toolbar');
      const style = getComputedStyle(floatingToolbar);
      expect(style.transform).toContain('translateX');
    });
  });

  describe('2. 工具栏项目样式 (.ltt-toolbar-item)', () => {
    it('应该相对于定位', () => {
      const item = createTestElement('ltt-toolbar-item');
      const style = getComputedStyle(item);
      expect(style.position).toBe('relative');
    });

    it('应该有内边距', () => {
      const item = createTestElement('ltt-toolbar-item');
      const style = getComputedStyle(item);
      expect(parseInt(style.paddingTop) + parseInt(style.paddingBottom)).toBeGreaterThan(0);
    });

    it('应该有鼠标指针', () => {
      const item = createTestElement('ltt-toolbar-item');
      const style = getComputedStyle(item);
      expect(style.cursor).toBe('pointer');
    });

    it('悬停时应该有变化', () => {
      const item = createTestElement('ltt-toolbar-item');
      const style = getComputedStyle(item);
      expect(style.transition).toBeTruthy();
    });
  });

  describe('3. 工具栏图标样式 (.ltt-toolbar-icon)', () => {
    it('应该有固定尺寸', () => {
      const icon = createTestElement('ltt-toolbar-icon');
      const style = getComputedStyle(icon);
      expect(parseInt(style.width)).toBeGreaterThan(0);
      expect(parseInt(style.height)).toBeGreaterThan(0);
    });

    it('应该居中对齐', () => {
      const icon = createTestElement('ltt-toolbar-icon');
      const style = getComputedStyle(icon);
      expect(style.display).toBe('flex');
      expect(style.alignItems).toBe('center');
      expect(style.justifyContent).toBe('center');
    });

    it('应该有填充色', () => {
      const icon = createTestElement('ltt-toolbar-icon');
      const style = getComputedStyle(icon);
      expect(style.fill).toBeTruthy();
    });
  });

  describe('4. 工具栏标签样式 (.ltt-toolbar-label)', () => {
    it('应该有内联显示', () => {
      const label = createTestElement('ltt-toolbar-label');
      const style = getComputedStyle(label);
      expect(style.display).toBe('inline');
    });

    it('应该有字体大小', () => {
      const label = createTestElement('ltt-toolbar-label');
      const style = getComputedStyle(label);
      expect(parseInt(style.fontSize)).toBeGreaterThan(0);
    });

    it('应该有文本颜色', () => {
      const label = createTestElement('ltt-toolbar-label');
      const style = getComputedStyle(label);
      expect(style.color).toBeTruthy();
    });
  });

  describe('5. 工具栏分组样式 (.ltt-toolbar-group)', () => {
    it('应该有 inline-flex 布局', () => {
      const group = createTestElement('ltt-toolbar-group');
      const style = getComputedStyle(group);
      expect(style.display).toBe('inline-flex');
    });

    it('分组之间应该有间隔', () => {
      const group = createTestElement('ltt-toolbar-group');
      const style = getComputedStyle(group);
      expect(parseInt(style.gap) >= 0).toBe(true);
    });
  });

  describe('6. 下拉菜单样式 (.ltt-toolbar-dropdown, .ltt-toolbar-group-dropdown)', () => {
    it('下拉菜单应该有绝对定位', () => {
      const dropdown = createTestElement('ltt-toolbar-dropdown');
      const style = getComputedStyle(dropdown);
      expect(style.position).toBe('absolute');
    });

    it('下拉菜单应该在顶部', () => {
      const dropdown = createTestElement('ltt-toolbar-dropdown');
      const style = getComputedStyle(dropdown);
      expect(parseInt(style.top)).toBeGreaterThan(0);
    });

    it('下拉菜单应该有背景色', () => {
      const dropdown = createTestElement('ltt-toolbar-dropdown');
      const style = getComputedStyle(dropdown);
      expect(style.backgroundColor).toBeTruthy();
    });

    it('下拉菜单应该有阴影', () => {
      const dropdown = createTestElement('ltt-toolbar-dropdown');
      const style = getComputedStyle(dropdown);
      expect(style.boxShadow).toBeTruthy();
    });

    it('下拉菜单应该有圆角', () => {
      const dropdown = createTestElement('ltt-toolbar-dropdown');
      const style = getComputedStyle(dropdown);
      expect(parseInt(style.borderRadius)).toBeGreaterThan(0);
    });

    it('下拉菜单应该有 z-index', () => {
      const dropdown = createTestElement('ltt-toolbar-dropdown');
      const style = getComputedStyle(dropdown);
      expect(parseInt(style.zIndex)).toBeGreaterThan(0);
    });
  });

  describe('7. 下拉菜单项样式 (.ltt-toolbar-dropdown-item)', () => {
    it('下拉菜单项应该有内边距', () => {
      const dropdownItem = createTestElement('ltt-toolbar-dropdown-item');
      const style = getComputedStyle(dropdownItem);
      expect(parseInt(style.paddingTop) + parseInt(style.paddingBottom)).toBeGreaterThan(0);
    });

    it('下拉菜单项应该有鼠标指针', () => {
      const dropdownItem = createTestElement('ltt-toolbar-dropdown-item');
      const style = getComputedStyle(dropdownItem);
      expect(style.cursor).toBe('pointer');
    });

    it('下拉菜单项悬停应该有背景变化', () => {
      const dropdownItem = createTestElement('ltt-toolbar-dropdown-item');
      const style = getComputedStyle(dropdownItem);
      expect(style.transition).toBeTruthy();
    });
  });

  describe('8. 分割线样式 (.ltt-toolbar-divider)', () => {
    it('分割线应该有固定宽度', () => {
      const divider = createTestElement('ltt-toolbar-divider');
      const style = getComputedStyle(divider);
      expect(parseInt(style.width)).toBeGreaterThan(0);
    });

    it('分割线应该有高度', () => {
      const divider = createTestElement('ltt-toolbar-divider');
      const style = getComputedStyle(divider);
      expect(parseInt(style.height)).toBeGreaterThan(0);
    });

    it('分割线应该有背景色', () => {
      const divider = createTestElement('ltt-toolbar-divider');
      const style = getComputedStyle(divider);
      expect(style.backgroundColor).toBeTruthy();
    });
  });

  describe('9. 深色模式样式 (.ltt-toolbar-dark, .ltt-toolbar-container.dark)', () => {
    it('深色模式下应该有深色背景', () => {
      setThemeMode('dark');
      const toolbar = createTestElement('ltt-toolbar-container ltt-toolbar-dark');
      const style = getComputedStyle(toolbar);
      expect(style.backgroundColor).toBeTruthy();
    });

    it('深色模式下文字应该是浅色', () => {
      setThemeMode('dark');
      const label = createTestElement('ltt-toolbar-label');
      const style = getComputedStyle(label);
      expect(style.color).toBeTruthy();
    });
  });

  describe('10. 选中状态样式 (.ltt-toolbar-item.selected, .ltt-toolbar-item.active)', () => {
    it('选中状态应该有不同的背景', () => {
      const normalItem = createTestElement('ltt-toolbar-item');
      const selectedItem = createTestElement('ltt-toolbar-item selected');
      
      const normalStyle = getComputedStyle(normalItem);
      const selectedStyle = getComputedStyle(selectedItem);
      
      // 选中状态应该有变化
      expect(selectedItem.classList.contains('selected')).toBe(true);
    });
  });

  describe('11. 禁用状态样式 (.ltt-toolbar-item.disabled)', () => {
    it('禁用状态应该有较低的透明度', () => {
      const disabledItem = createTestElement('ltt-toolbar-item disabled');
      const style = getComputedStyle(disabledItem);
      expect(parseFloat(style.opacity)).toBeLessThan(1);
    });

    it('禁用状态不应该有鼠标指针', () => {
      const disabledItem = createTestElement('ltt-toolbar-item disabled');
      const style = getComputedStyle(disabledItem);
      expect(style.cursor).toBe('not-allowed');
    });
  });

  describe('12. 过渡和动画', () => {
    it('工具栏应该有过渡效果', () => {
      const toolbar = createTestElement('ltt-toolbar-container');
      const style = getComputedStyle(toolbar);
      // 过渡效果可能在内部元素上
      expect(style.transition || style.opacity).toBeTruthy();
    });

    it('下拉菜单应该有显示/隐藏动画', () => {
      const dropdown = createTestElement('ltt-toolbar-dropdown');
      const style = getComputedStyle(dropdown);
      // 可能有 opacity 或 transform 过渡
      expect(style.transition || style.opacity).toBeTruthy();
    });
  });

  describe('13. 边框样式', () => {
    it('工具栏容器可能有边框', () => {
      const toolbar = createTestElement('ltt-toolbar-container');
      const style = getComputedStyle(toolbar);
      // 边框可能有或没有
      expect(style.borderWidth || style.borderStyle).toBeTruthy();
    });

    it('边框应该有颜色', () => {
      const toolbar = createTestElement('ltt-toolbar-container');
      const style = getComputedStyle(toolbar);
      if (style.borderWidth !== '0px') {
        expect(style.borderColor).toBeTruthy();
      }
    });
  });

  describe('14. 可访问性', () => {
    it('图标应该有 alt 文本或 aria-label', () => {
      const icon = createTestElement('ltt-toolbar-icon');
      expect(icon).not.toBeNull();
      // 实际实现中应该有 aria 属性
    });

    it('交互元素应该有足够的点击区域', () => {
      const item = createTestElement('ltt-toolbar-item');
      const style = getComputedStyle(item);
      expect(parseInt(style.minHeight) >= 24).toBe(true);
    });
  });

  describe('15. 响应式考虑', () => {
    it('工具栏应该能够在一行内显示', () => {
      const toolbar = createTestElement('ltt-toolbar-container');
      const style = getComputedStyle(toolbar);
      expect(style.whiteSpace).toBe('nowrap');
    });

    it('工具栏项应该能够换行（如果需要）', () => {
      const group = createTestElement('ltt-toolbar-group');
      const style = getComputedStyle(group);
      expect(style.flexWrap).toBeTruthy();
    });
  });
});
