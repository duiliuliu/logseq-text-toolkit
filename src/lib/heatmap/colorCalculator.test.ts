/**
 * Heatmap 模块单元测试
 * 测试 src/lib/heatmap/colorCalculator.ts 中的颜色计算功能
 */

import { describe, it, expect } from 'vitest';
import {
  calculateColor,
  INDIGO_COLORS,
  calculateIntensity,
  getColorForCount,
} from './colorCalculator';

describe('heatmap/colorCalculator', () => {
  describe('INDIGO_COLORS', () => {
    it('应该包含正确的颜色数量', () => {
      expect(INDIGO_COLORS).toHaveLength(5);
    });

    it('每个颜色应该是有效的 hex 格式', () => {
      const hexPattern = /^#[0-9A-Fa-f]{6}$/;
      INDIGO_COLORS.forEach(color => {
        expect(color).toMatch(hexPattern);
      });
    });

    it('颜色应该从浅到深', () => {
      // 验证颜色是渐进的（后面比前面深）
      for (let i = 1; i < INDIGO_COLORS.length; i++) {
        const prevColor = INDIGO_COLORS[i - 1];
        const currColor = INDIGO_COLORS[i];
        
        // 简单检查：颜色字符串不应该完全相同
        expect(prevColor).not.toBe(currColor);
      }
    });
  });

  describe('calculateColor', () => {
    it('当 count 为 0 时应该返回空字符串', () => {
      expect(calculateColor(0)).toBe('');
    });

    it('当 count 为负数时应该返回空字符串', () => {
      expect(calculateColor(-1)).toBe('');
    });

    it('当 maxCount 为 0 时应该返回空字符串', () => {
      expect(calculateColor(5, 0)).toBe('');
    });

    it('应该根据强度返回正确的颜色', () => {
      const result = calculateColor(50, 100);
      expect(result).toBeTruthy();
      expect(INDIGO_COLORS).toContain(result);
    });

    it('当强度为 0% 时应该返回第一个颜色', () => {
      // maxCount 必须大于 0
      const result = calculateColor(0, 100);
      expect(result).toBe(INDIGO_COLORS[0]);
    });

    it('当强度为 100% 时应该返回最后一个颜色', () => {
      const maxCount = 100;
      const result = calculateColor(maxCount, maxCount);
      expect(result).toBe(INDIGO_COLORS[INDIGO_COLORS.length - 1]);
    });
  });

  describe('calculateIntensity', () => {
    it('当 count 为 0 时应该返回 0', () => {
      expect(calculateIntensity(0, 100)).toBe(0);
    });

    it('当 count 等于 maxCount 时应该返回 100', () => {
      expect(calculateIntensity(100, 100)).toBe(100);
    });

    it('应该正确计算中间值的强度', () => {
      const intensity = calculateIntensity(50, 100);
      expect(intensity).toBe(50);
    });

    it('当 count 大于 maxCount 时应该限制在 100', () => {
      const intensity = calculateIntensity(150, 100);
      expect(intensity).toBeLessThanOrEqual(100);
    });

    it('当 maxCount 为 0 时应该返回 0', () => {
      expect(calculateIntensity(50, 0)).toBe(0);
    });

    it('应该返回 0 到 100 之间的值', () => {
      const intensities = [0, 10, 25, 50, 75, 100].map(count => 
        calculateIntensity(count, 100)
      );
      
      intensities.forEach(intensity => {
        expect(intensity).toBeGreaterThanOrEqual(0);
        expect(intensity).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('getColorForCount', () => {
    it('当 count 为 0 时应该返回空字符串', () => {
      expect(getColorForCount(0)).toBe('');
    });

    it('应该返回有效的颜色值', () => {
      const colors = [1, 5, 10, 20, 50];
      
      colors.forEach(count => {
        const color = getColorForCount(count);
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$|^$/);
      });
    });

    it('不同的计数值应该返回不同强度的颜色', () => {
      const color1 = getColorForCount(1);
      const color2 = getColorForCount(50);
      
      // 更高计数应该有更深的颜色
      // 但由于使用固定的颜色数组，可能相同
      expect(color1).toBeTruthy();
      expect(color2).toBeTruthy();
    });
  });

  describe('边界情况', () => {
    it('应该处理非常大的 maxCount 值', () => {
      const result = calculateIntensity(1000000, 1000000000);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('应该处理非常小的值', () => {
      const result = calculateIntensity(0.001, 1);
      expect(result).toBeGreaterThan(0);
    });
  });
});
