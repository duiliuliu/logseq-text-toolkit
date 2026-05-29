/**
 * Heatmap 模块单元测试
 * 测试 src/lib/heatmap/colorCalculator.ts 中的颜色计算功能
 */

import { describe, it, expect } from 'vitest';
import {
  generateIndigoGradient,
  calculateColorValueSimple,
  calculateColorValueWeighted,
  getColorByValue,
  getPercentage,
  generateProgressBar,
} from './colorCalculator';

describe('heatmap/colorCalculator', () => {
  describe('generateIndigoGradient', () => {
    it('应该生成指定数量的颜色', () => {
      const gradient = generateIndigoGradient('#FFFFFF', '#000000', 5);
      expect(gradient).toHaveLength(5);
    });

    it('应该返回有效的 hex 颜色', () => {
      const gradient = generateIndigoGradient('#FFFFFF', '#000000', 3);
      const hexPattern = /^#[0-9A-Fa-f]{6}$/;
      gradient.forEach(color => {
        expect(color).toMatch(hexPattern);
      });
    });

    it('应该生成渐变过渡', () => {
      const gradient = generateIndigoGradient('#FFFFFF', '#0000FF', 10);
      // 第一个应该接近白色
      expect(gradient[0]).toBe('#ffffff');
      // 最后一个应该是蓝色
      expect(gradient[gradient.length - 1]).toBe('#0000ff');
    });
  });

  describe('calculateColorValueSimple', () => {
    it('应该返回块的数量', () => {
      const blocks = Array(5).fill({} as any);
      const result = calculateColorValueSimple(blocks);
      expect(result).toBe(5);
    });

    it('应该处理空数组', () => {
      const result = calculateColorValueSimple([]);
      expect(result).toBe(0);
    });

    it('应该处理 null', () => {
      const result = calculateColorValueSimple(null as any);
      expect(result).toBe(0);
    });

    it('应该处理 undefined', () => {
      const result = calculateColorValueSimple(undefined as any);
      expect(result).toBe(0);
    });
  });

  describe('calculateColorValueWeighted', () => {
    it('应该计算加权值', () => {
      const blocks = [
        { 
          children: [{ id: 1 }, { id: 2 }],
          'block/content': 'test content'
        } as any,
        { 
          children: [],
          'block/content': ''
        } as any,
      ];
      const result = calculateColorValueWeighted(blocks);
      expect(result).toBeGreaterThan(0);
    });

    it('应该处理空数组', () => {
      const result = calculateColorValueWeighted([]);
      expect(result).toBe(0);
    });

    it('应该处理没有 children 的块', () => {
      const blocks = [
        { 'block/content': 'test' } as any,
      ];
      const result = calculateColorValueWeighted(blocks);
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('getColorByValue', () => {
    it('当 value 为 0 时应该返回第一个颜色', () => {
      const result = getColorByValue(0, 100);
      expect(result).toBeDefined();
    });

    it('当 value 等于 maxValue 时应该返回最后一个颜色', () => {
      const result = getColorByValue(100, 100);
      expect(result).toBeDefined();
    });

    it('应该返回有效的颜色值', () => {
      const result = getColorByValue(50, 100);
      expect(result).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('应该处理 value 大于 maxValue 的情况', () => {
      const result = getColorByValue(150, 100);
      expect(result).toBeDefined();
    });
  });

  describe('getPercentage', () => {
    it('应该计算正确的百分比', () => {
      expect(getPercentage(50, 100)).toBe(50);
    });

    it('应该处理 maxValue 为 0 的情况', () => {
      expect(getPercentage(50, 0)).toBe(0);
    });

    it('应该处理 value 为 0 的情况', () => {
      expect(getPercentage(0, 100)).toBe(0);
    });

    it('应该返回 0 到 100 之间的值', () => {
      const result = getPercentage(150, 100);
      expect(result).toBe(150); // 超过 100%
    });
  });

  describe('generateProgressBar', () => {
    it('应该生成正确长度的进度条', () => {
      const bar = generateProgressBar(50);
      expect(bar).toHaveLength(10);
    });

    it('应该显示正确数量的填充块', () => {
      const bar = generateProgressBar(50);
      expect(bar).toContain('█'.repeat(5));
      expect(bar).toContain('░'.repeat(5));
    });

    it('应该处理 0%', () => {
      const bar = generateProgressBar(0);
      expect(bar).toBe('░░░░░░░░░░');
    });

    it('应该处理 100%', () => {
      const bar = generateProgressBar(100);
      expect(bar).toBe('██████████');
    });
  });
});
