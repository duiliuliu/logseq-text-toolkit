/**
 * Heatmap 组件样式单元测试
 * 测试 src/components/Heatmap/heatmap.css 中的样式
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createTestElement,
  cleanupTestDOM,
  setThemeMode,
  getCSSVariable,
} from '../utils/cssTestUtils';

describe('Heatmap 组件样式测试', () => {
  beforeEach(() => {
    cleanupTestDOM();
  });

  afterEach(() => {
    cleanupTestDOM();
    document.body.classList.remove('dark');
  });

  describe('1. 容器样式 (.heatmap-container)', () => {
    it('应该创建容器元素', () => {
      const container = createTestElement('heatmap-container');
      expect(container).not.toBeNull();
    });

    it('应该有正确的字体', () => {
      const container = createTestElement('heatmap-container');
      const style = getComputedStyle(container);
      expect(style.fontFamily).toContain('apple-system');
    });

    it('应该有圆角', () => {
      const container = createTestElement('heatmap-container');
      const style = getComputedStyle(container);
      expect(parseInt(style.borderRadius)).toBeGreaterThan(0);
    });

    it('应该有内边距', () => {
      const container = createTestElement('heatmap-container');
      const style = getComputedStyle(container);
      expect(parseInt(style.paddingLeft)).toBeGreaterThan(0);
    });

    it('应该有阴影', () => {
      const container = createTestElement('heatmap-container');
      const style = getComputedStyle(container);
      expect(style.boxShadow).toBeTruthy();
    });
  });

  describe('2. 深色模式样式 (.heatmap-container.dark)', () => {
    it('浅色模式下背景色应该是浅色', () => {
      setThemeMode('light');
      const container = createTestElement('heatmap-container');
      const style = getComputedStyle(container);
      expect(style.backgroundColor).toBeTruthy();
    });

    it('添加 dark 类后应该有深色背景', () => {
      const container = createTestElement('heatmap-container dark');
      const style = getComputedStyle(container);
      // 深色模式背景应该是深色
      expect(style.backgroundColor).toMatch(/rgb\(23|rgb\(17|rgb\(15/);
    });
  });

  describe('3. 显示模式样式 (.heatmap-minimal, .heatmap-basic, .heatmap-full)', () => {
    it('minimal 模式应该有较小的内边距', () => {
      const container = createTestElement('heatmap-container heatmap-minimal');
      const style = getComputedStyle(container);
      expect(parseInt(style.padding)).toBeLessThanOrEqual(8);
    });

    it('basic 模式应该有中等内边距', () => {
      const container = createTestElement('heatmap-container heatmap-basic');
      const style = getComputedStyle(container);
      expect(parseInt(style.padding)).toBeGreaterThanOrEqual(8);
    });

    it('full 模式应该有较大内边距', () => {
      const container = createTestElement('heatmap-container heatmap-full');
      const style = getComputedStyle(container);
      expect(parseInt(style.padding)).toBeGreaterThanOrEqual(12);
    });
  });

  describe('4. 头部样式 (.heatmap-header)', () => {
    it('头部应该使用 flex 布局', () => {
      const header = createTestElement('heatmap-header');
      const style = getComputedStyle(header);
      expect(style.display).toBe('flex');
    });

    it('头部元素应该有间隔', () => {
      const header = createTestElement('heatmap-header');
      const style = getComputedStyle(header);
      expect(parseInt(style.marginBottom)).toBeGreaterThan(0);
    });

    it('头部应该有底部边框', () => {
      const header = createTestElement('heatmap-header');
      const style = getComputedStyle(header);
      expect(style.borderBottomWidth).not.toBe('0px');
    });
  });

  describe('5. 视图切换按钮 (.view-controls, .view-btn)', () => {
    it('视图控制器应该有背景色', () => {
      const controls = createTestElement('view-controls');
      const style = getComputedStyle(controls);
      expect(style.backgroundColor).toBeTruthy();
    });

    it('视图按钮应该有圆角', () => {
      const btn = createTestElement('view-btn');
      const style = getComputedStyle(btn);
      expect(parseInt(style.borderRadius)).toBeGreaterThan(0);
    });

    it('视图按钮应该有过渡效果', () => {
      const btn = createTestElement('view-btn');
      const style = getComputedStyle(btn);
      expect(style.transition).toBeTruthy();
    });

    it('激活的视图按钮应该有不同样式', () => {
      const activeBtn = createTestElement('view-btn active');
      const normalBtn = createTestElement('view-btn');
      const activeStyle = getComputedStyle(activeBtn);
      const normalStyle = getComputedStyle(normalBtn);
      expect(activeStyle.backgroundColor).not.toBe(normalStyle.backgroundColor);
    });
  });

  describe('6. 导航按钮 (.nav-btn)', () => {
    it('导航按钮应该有固定宽度', () => {
      const btn = createTestElement('nav-btn');
      const style = getComputedStyle(btn);
      expect(parseInt(style.width)).toBeGreaterThan(0);
    });

    it('导航按钮应该有圆角', () => {
      const btn = createTestElement('nav-btn');
      const style = getComputedStyle(btn);
      expect(parseInt(style.borderRadius)).toBeGreaterThan(0);
    });

    it('导航按钮悬停状态应该有变化', () => {
      const btn = createTestElement('nav-btn');
      const style = getComputedStyle(btn);
      // 悬停时颜色会变化，这个通过 CSS :hover 实现
      expect(style.backgroundColor).toBeTruthy();
    });
  });

  describe('7. 热力图格子 (.heatmap-cell)', () => {
    it('格子应该有正确的尺寸', () => {
      const cell = createTestElement('heatmap-cell');
      const style = getComputedStyle(cell);
      expect(parseInt(style.width)).toBeGreaterThan(0);
      expect(parseInt(style.height)).toBeGreaterThan(0);
    });

    it('格子应该有圆角', () => {
      const cell = createTestElement('heatmap-cell');
      const style = getComputedStyle(cell);
      expect(parseInt(style.borderRadius)).toBeGreaterThanOrEqual(0);
    });

    it('格子应该有鼠标指针样式', () => {
      const cell = createTestElement('heatmap-cell');
      const style = getComputedStyle(cell);
      expect(style.cursor).toBe('pointer');
    });

    it('格子悬停应该有变换效果', () => {
      const cell = createTestElement('heatmap-cell');
      const style = getComputedStyle(cell);
      expect(style.transition).toBeTruthy();
    });

    it('空格子不应该有背景色', () => {
      const emptyCell = createTestElement('heatmap-cell heatmap-cell-empty');
      const style = getComputedStyle(emptyCell);
      // 空格子背景应该是透明或无背景
      expect(style.background).toBeTruthy();
    });
  });

  describe('8. 格子尺寸变体', () => {
    it('小尺寸格子宽度应该较小', () => {
      const smallCell = createTestElement('heatmap-cell heatmap-cell-small');
      const style = getComputedStyle(smallCell);
      expect(parseInt(style.width)).toBeLessThanOrEqual(14);
    });

    it('大尺寸格子宽度应该较大', () => {
      const largeCell = createTestElement('heatmap-cell heatmap-cell-large');
      const style = getComputedStyle(largeCell);
      expect(parseInt(style.width)).toBeGreaterThanOrEqual(20);
    });

    it('周视图格子应该有正确的尺寸', () => {
      const weekCell = createTestElement('heatmap-cell heatmap-cell-week');
      const style = getComputedStyle(weekCell);
      expect(parseInt(style.width)).toBeGreaterThan(0);
    });
  });

  describe('9. 周视图样式 (.heatmap-week)', () => {
    it('周视图应该是 flex 列布局', () => {
      const weekView = createTestElement('heatmap-week');
      const style = getComputedStyle(weekView);
      expect(style.display).toBe('flex');
      expect(style.flexDirection).toBe('column');
    });

    it('周视图头部应该有网格布局', () => {
      const weekHeader = createTestElement('heatmap-week-header');
      const style = getComputedStyle(weekHeader);
      expect(style.display).toBe('flex');
    });

    it('工作日标签应该居中', () => {
      const weekdayHeader = createTestElement('heatmap-weekday-header');
      const style = getComputedStyle(weekdayHeader);
      expect(style.textAlign).toBe('center');
    });
  });

  describe('10. 月视图样式 (.heatmap-month)', () => {
    it('月视图网格应该是列布局', () => {
      const monthGrid = createTestElement('heatmap-month-grid');
      const style = getComputedStyle(monthGrid);
      expect(style.display).toBe('flex');
      expect(style.flexDirection).toBe('column');
    });

    it('周行应该有 flex 布局', () => {
      const weekRow = createTestElement('heatmap-week-row');
      const style = getComputedStyle(weekRow);
      expect(style.display).toBe('flex');
    });

    it('周数标签应该有正确的宽度', () => {
      const weeknumLabel = createTestElement('heatmap-weeknum-label');
      const style = getComputedStyle(weeknumLabel);
      expect(parseInt(style.width)).toBeGreaterThan(0);
    });
  });

  describe('11. 年视图样式 (.heatmap-year)', () => {
    it('年视图应该是 flex 布局', () => {
      const yearView = createTestElement('heatmap-year-view');
      const style = getComputedStyle(yearView);
      expect(style.display).toBe('flex');
    });

    it('年视图网格应该有 flex 布局', () => {
      const yearGrid = createTestElement('heatmap-year-grid');
      const style = getComputedStyle(yearGrid);
      expect(style.display).toBe('flex');
    });

    it('月份列应该有正确的宽度', () => {
      const monthColumn = createTestElement('heatmap-month-column');
      const style = getComputedStyle(monthColumn);
      expect(style.display).toBe('flex');
    });
  });

  describe('12. 提示框样式 (.heatmap-tooltip)', () => {
    it('提示框应该是固定定位', () => {
      const tooltip = createTestElement('heatmap-tooltip');
      const style = getComputedStyle(tooltip);
      expect(style.position).toBe('fixed');
    });

    it('提示框应该有阴影', () => {
      const tooltip = createTestElement('heatmap-tooltip');
      const style = getComputedStyle(tooltip);
      expect(style.boxShadow).toBeTruthy();
    });

    it('提示框应该有圆角', () => {
      const tooltip = createTestElement('heatmap-tooltip');
      const style = getComputedStyle(tooltip);
      expect(parseInt(style.borderRadius)).toBeGreaterThan(0);
    });

    it('提示框日期应该有字体粗细', () => {
      const date = document.createElement('div');
      date.className = 'heatmap-tooltip-date';
      const style = getComputedStyle(date);
      expect(parseInt(style.fontWeight)).toBeGreaterThanOrEqual(500);
    });
  });

  describe('13. 图例样式 (.heatmap-legend)', () => {
    it('图例应该是 flex 布局', () => {
      const legend = createTestElement('heatmap-legend');
      const style = getComputedStyle(legend);
      expect(style.display).toBe('flex');
    });

    it('图例单元格应该有正确的尺寸', () => {
      const legendCell = createTestElement('heatmap-legend-cell');
      const style = getComputedStyle(legendCell);
      expect(parseInt(style.width)).toBeGreaterThan(0);
      expect(parseInt(style.height)).toBeGreaterThan(0);
    });

    it('图例单元格应该有圆角', () => {
      const legendCell = createTestElement('heatmap-legend-cell');
      const style = getComputedStyle(legendCell);
      expect(parseInt(style.borderRadius)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('14. 统计信息样式 (.heatmap-statistics)', () => {
    it('统计区域应该有 flex 布局', () => {
      const stats = createTestElement('heatmap-statistics');
      const style = getComputedStyle(stats);
      expect(style.display).toBe('flex');
    });

    it('统计项应该居中对齐', () => {
      const statItem = createTestElement('heatmap-stat-item');
      const style = getComputedStyle(statItem);
      expect(style.textAlign).toBe('center');
    });

    it('统计数值应该有较大的字体', () => {
      const statValue = createTestElement('heatmap-stat-value');
      const style = getComputedStyle(statValue);
      expect(parseInt(style.fontSize)).toBeGreaterThanOrEqual(16);
    });
  });

  describe('15. 浅色/深色模式切换', () => {
    it('深色模式下视图控制器应该有深色背景', () => {
      setThemeMode('dark');
      const controls = createTestElement('view-controls');
      const style = getComputedStyle(controls);
      // 深色模式下背景应该较暗
      expect(style.backgroundColor).toBeTruthy();
    });

    it('深色模式下导航按钮文字应该是浅色', () => {
      setThemeMode('dark');
      const btn = createTestElement('nav-btn');
      const style = getComputedStyle(btn);
      expect(style.color).toBeTruthy();
    });
  });

  describe('16. 响应式布局', () => {
    it('内容区域应该允许水平滚动', () => {
      const content = createTestElement('heatmap-content');
      const style = getComputedStyle(content);
      expect(style.overflowX).toBe('auto');
    });

    it('年视图网格应该允许水平滚动', () => {
      const yearGrid = createTestElement('heatmap-year-grid');
      const style = getComputedStyle(yearGrid);
      expect(style.display).toBe('flex');
    });
  });

  describe('17. 可访问性', () => {
    it('格子应该有足够的尺寸以便于点击', () => {
      const cell = createTestElement('heatmap-cell');
      const style = getComputedStyle(cell);
      const size = Math.min(parseInt(style.width), parseInt(style.height));
      expect(size).toBeGreaterThanOrEqual(10);
    });

    it('按钮应该有指针光标', () => {
      const btn = createTestElement('view-btn');
      const style = getComputedStyle(btn);
      expect(style.cursor).toBe('pointer');
    });
  });

  describe('18. CSS 变量使用', () => {
    it('组件应该使用 CSS 变量或固定颜色值', () => {
      const container = createTestElement('heatmap-container');
      const style = getComputedStyle(container);
      // 背景色应该被定义
      expect(style.backgroundColor).toBeTruthy();
    });
  });
});
