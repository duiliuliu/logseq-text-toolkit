/**
 * dateUtils 模块单元测试
 * 直接测试 src/lib/dateUtils/index.ts 中的导出函数
 */

import { describe, it, expect } from 'vitest';
import {
  parseDate,
  formatDate,
  isValidDate,
  getDateRange,
} from './index';

describe('dateUtils/index.ts', () => {
  describe('parseDate', () => {
    it('应该解析标准日期字符串', () => {
      const result = parseDate('2024-01-15');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(0); // 0-indexed
      expect(result?.getDate()).toBe(15);
    });

    it('应该解析带时间的日期字符串', () => {
      const result = parseDate('2024-01-15T10:30:00');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getHours()).toBe(10);
      expect(result?.getMinutes()).toBe(30);
    });

    it('应该处理无效日期', () => {
      expect(parseDate('invalid')).toBeNull();
      expect(parseDate('')).toBeNull();
    });

    it('应该处理不同的日期格式', () => {
      const result1 = parseDate('2024/01/15');
      const result2 = parseDate('15-01-2024');
      // 不同格式可能解析结果不同，这里测试基本可用性
      expect(result1 || result2).toBeTruthy();
    });
  });

  describe('formatDate', () => {
    it('应该格式化日期对象', () => {
      const date = new Date(2024, 0, 15);
      const result = formatDate(date, 'YYYY-MM-DD');
      expect(result).toContain('2024');
      expect(result).toContain('01');
      expect(result).toContain('15');
    });

    it('应该处理不同的格式模板', () => {
      const date = new Date(2024, 0, 15);
      expect(formatDate(date, 'YYYY/MM/DD')).toContain('/');
      expect(formatDate(date, 'DD-MM-YYYY')).toContain('15');
    });

    it('应该处理空日期', () => {
      expect(formatDate(null as any, 'YYYY-MM-DD')).toBe('');
      expect(formatDate(undefined as any, 'YYYY-MM-DD')).toBe('');
    });
  });

  describe('isValidDate', () => {
    it('应该识别有效日期', () => {
      expect(isValidDate('2024-01-15')).toBe(true);
      expect(isValidDate(new Date())).toBe(true);
    });

    it('应该拒绝无效日期', () => {
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate('')).toBe(false);
      expect(isValidDate('2024-13-45')).toBe(false);
    });
  });

  describe('getDateRange', () => {
    it('应该返回日期范围内的所有日期', () => {
      const start = '2024-01-01';
      const end = '2024-01-05';
      const result = getDateRange(start, end);
      expect(result.length).toBe(5);
    });

    it('应该处理开始日期晚于结束日期', () => {
      const start = '2024-01-10';
      const end = '2024-01-05';
      const result = getDateRange(start, end);
      expect(result.length).toBe(0);
    });

    it('应该处理单日范围', () => {
      const start = '2024-01-15';
      const end = '2024-01-15';
      const result = getDateRange(start, end);
      expect(result.length).toBe(1);
    });

    it('应该包含开始和结束日期', () => {
      const start = '2024-01-01';
      const end = '2024-01-03';
      const result = getDateRange(start, end);
      expect(result[0]).toContain('01-01');
      expect(result[result.length - 1]).toContain('01-03');
    });
  });
});
