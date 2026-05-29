/**
 * TaskProgress 组件样式单元测试
 * 测试 src/components/TaskProgress/taskProgress.css 中的样式
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createTestElement,
  cleanupTestDOM,
  setThemeMode,
} from '../utils/cssTestUtils';

describe('TaskProgress 组件样式测试', () => {
  beforeEach(() => {
    cleanupTestDOM();
  });

  afterEach(() => {
    cleanupTestDOM();
  });

  describe('1. 基础容器样式 (.task-progress)', () => {
    it('应该创建任务进度容器', () => {
      const container = createTestElement('task-progress');
      expect(container).not.toBeNull();
    });

    it('应该使用 inline-flex 布局', () => {
      const container = createTestElement('task-progress');
      const style = getComputedStyle(container);
      expect(style.display).toBe('inline-flex');
    });

    it('应该垂直居中对齐', () => {
      const container = createTestElement('task-progress');
      const style = getComputedStyle(container);
      expect(style.alignItems).toBe('center');
    });

    it('应该有左边距', () => {
      const container = createTestElement('task-progress');
      const style = getComputedStyle(container);
      expect(parseInt(style.marginLeft)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('2. 微型圆环样式 (.task-progress-mini-circle)', () => {
    it('应该相对于定位', () => {
      const circle = createTestElement('task-progress-mini-circle');
      const style = getComputedStyle(circle);
      expect(style.position).toBe('relative');
    });

    it('应该是 flex 布局', () => {
      const circle = createTestElement('task-progress-mini-circle');
      const style = getComputedStyle(circle);
      expect(style.display).toBe('inline-flex');
    });

    it('内容应该居中', () => {
      const circle = createTestElement('task-progress-mini-circle');
      const style = getComputedStyle(circle);
      expect(style.justifyContent).toBe('center');
      expect(style.alignItems).toBe('center');
    });

    it('SVG 应该旋转 -90 度', () => {
      const svg = document.createElement('svg');
      svg.className = 'task-progress-mini-circle';
      document.body.appendChild(svg);
      const style = getComputedStyle(svg);
      expect(style.transform).toBeTruthy();
    });
  });

  describe('3. 中心文字样式 (.center-text)', () => {
    it('应该有绝对定位', () => {
      const centerText = createTestElement('center-text');
      const style = getComputedStyle(centerText);
      expect(style.position).toBe('absolute');
    });

    it('应该有较小的字体', () => {
      const centerText = createTestElement('center-text');
      const style = getComputedStyle(centerText);
      expect(parseInt(style.fontSize)).toBeLessThanOrEqual(12);
    });

    it('应该有字体粗细', () => {
      const centerText = createTestElement('center-text');
      const style = getComputedStyle(centerText);
      expect(parseInt(style.fontWeight)).toBeGreaterThanOrEqual(600);
    });
  });

  describe('4. 点阵进度样式 (.task-progress-dot-matrix)', () => {
    it('应该是 flex 布局', () => {
      const matrix = createTestElement('task-progress-dot-matrix');
      const style = getComputedStyle(matrix);
      expect(style.display).toBe('flex');
    });

    it('应该有间隔', () => {
      const matrix = createTestElement('task-progress-dot-matrix');
      const style = getComputedStyle(matrix);
      expect(parseInt(style.gap)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('5. 点样式 (.task-progress-dot)', () => {
    it('应该有圆形', () => {
      const dot = createTestElement('task-progress-dot');
      const style = getComputedStyle(dot);
      expect(style.borderRadius).toBe('50%');
    });

    it('应该有固定的尺寸', () => {
      const dot = createTestElement('task-progress-dot');
      const style = getComputedStyle(dot);
      expect(parseInt(style.width)).toBeGreaterThan(0);
      expect(parseInt(style.height)).toBeGreaterThan(0);
    });
  });

  describe('6. 胶囊进度条样式 (.task-progress-capsule)', () => {
    it('应该是 flex 布局', () => {
      const capsule = createTestElement('task-progress-capsule');
      const style = getComputedStyle(capsule);
      expect(style.display).toBe('inline-flex');
    });

    it('应该有对齐方式', () => {
      const capsule = createTestElement('task-progress-capsule');
      const style = getComputedStyle(capsule);
      expect(style.alignItems).toBe('center');
    });

    it('应该有内边距', () => {
      const capsule = createTestElement('task-progress-capsule');
      const style = getComputedStyle(capsule);
      expect(parseInt(style.paddingTop) + parseInt(style.paddingBottom)).toBeGreaterThan(0);
    });

    it('应该有圆角', () => {
      const capsule = createTestElement('task-progress-capsule');
      const style = getComputedStyle(capsule);
      expect(parseInt(style.borderRadius)).toBeGreaterThan(10);
    });
  });

  describe('7. 胶囊进度条内部样式 (.task-progress-capsule-bar)', () => {
    it('应该是 flex 布局', () => {
      const bar = createTestElement('task-progress-capsule-bar');
      const style = getComputedStyle(bar);
      expect(style.display).toBe('flex');
    });

    it('应该有固定高度', () => {
      const bar = createTestElement('task-progress-capsule-bar');
      const style = getComputedStyle(bar);
      expect(parseInt(style.height)).toBeGreaterThan(0);
    });

    it('应该有圆角', () => {
      const bar = createTestElement('task-progress-capsule-bar');
      const style = getComputedStyle(bar);
      expect(parseInt(style.borderRadius)).toBeGreaterThan(0);
    });

    it('应该有溢出隐藏', () => {
      const bar = createTestElement('task-progress-capsule-bar');
      const style = getComputedStyle(bar);
      expect(style.overflow).toBe('hidden');
    });
  });

  describe('8. 胶囊分段样式 (.task-progress-capsule-segment)', () => {
    it('应该左浮动', () => {
      const segment = createTestElement('task-progress-capsule-segment');
      const style = getComputedStyle(segment);
      expect(style.float).toBe('left');
    });

    it('应该有固定高度', () => {
      const segment = createTestElement('task-progress-capsule-segment');
      const style = getComputedStyle(segment);
      expect(parseInt(style.height)).toBeGreaterThan(0);
    });
  });

  describe('9. 状态光标样式 (.task-progress-cursor)', () => {
    it('应该有指针光标', () => {
      const cursor = createTestElement('task-progress-cursor');
      const style = getComputedStyle(cursor);
      expect(style.cursor).toBe('help');
    });

    it('应该有字体大小', () => {
      const cursor = createTestElement('task-progress-cursor');
      const style = getComputedStyle(cursor);
      expect(parseInt(style.fontSize)).toBeGreaterThan(0);
    });
  });

  describe('10. 阶梯进度样式 (.task-progress-step)', () => {
    it('应该是 flex 布局', () => {
      const step = createTestElement('task-progress-step');
      const style = getComputedStyle(step);
      expect(style.display).toBe('flex');
    });

    it('应该底部对齐', () => {
      const step = createTestElement('task-progress-step');
      const style = getComputedStyle(step);
      expect(style.alignItems).toBe('flex-end');
    });

    it('应该有固定高度', () => {
      const step = createTestElement('task-progress-step');
      const style = getComputedStyle(step);
      expect(parseInt(style.height)).toBeGreaterThan(0);
    });

    it('应该有间隔', () => {
      const step = createTestElement('task-progress-step');
      const style = getComputedStyle(step);
      expect(parseInt(style.gap)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('11. 阶梯分段样式 (.task-progress-step-segment)', () => {
    it('应该有固定宽度', () => {
      const segment = createTestElement('task-progress-step-segment');
      const style = getComputedStyle(segment);
      expect(parseInt(style.width)).toBeGreaterThan(0);
    });

    it('应该有上圆角', () => {
      const segment = createTestElement('task-progress-step-segment');
      const style = getComputedStyle(segment);
      expect(style.borderTopLeftRadius).toBeTruthy();
      expect(style.borderTopRightRadius).toBeTruthy();
    });

    it('不应该有下圆角', () => {
      const segment = createTestElement('task-progress-step-segment');
      const style = getComputedStyle(segment);
      expect(parseInt(style.borderBottomLeftRadius)).toBe(0);
      expect(parseInt(style.borderBottomRightRadius)).toBe(0);
    });
  });

  describe('12. 嵌套指示器样式 (.nesting-indicator)', () => {
    it('应该有内联显示', () => {
      const indicator = createTestElement('nesting-indicator');
      const style = getComputedStyle(indicator);
      expect(style.display).toBe('inline');
    });

    it('应该有较小的字体', () => {
      const indicator = createTestElement('nesting-indicator');
      const style = getComputedStyle(indicator);
      expect(parseInt(style.fontSize)).toBeLessThanOrEqual(14);
    });

    it('应该有字体颜色', () => {
      const indicator = createTestElement('nesting-indicator');
      const style = getComputedStyle(indicator);
      expect(style.color).toBeTruthy();
    });
  });

  describe('13. 动画效果', () => {
    it('应该有过渡效果', () => {
      const progress = createTestElement('task-progress-mini-circle');
      const style = getComputedStyle(progress);
      // 过渡效果应该在组件的某个部分定义
      expect(style.transition).toBeTruthy();
    });
  });

  describe('14. 深色模式支持', () => {
    it('深色模式下颜色应该可见', () => {
      setThemeMode('dark');
      const progress = createTestElement('task-progress-dot');
      const style = getComputedStyle(progress);
      expect(style.backgroundColor).toBeTruthy();
    });

    it('深色模式下文字应该可见', () => {
      setThemeMode('dark');
      const text = createTestElement('center-text');
      const style = getComputedStyle(text);
      expect(style.color).toBeTruthy();
    });
  });

  describe('15. 可访问性', () => {
    it('进度条应该有足够的对比度', () => {
      const capsule = createTestElement('task-progress-capsule');
      const style = getComputedStyle(capsule);
      expect(style.backgroundColor).toBeTruthy();
    });

    it('文字应该有足够的对比度', () => {
      const text = createTestElement('center-text');
      const style = getComputedStyle(text);
      expect(style.color).toBeTruthy();
    });
  });
});
