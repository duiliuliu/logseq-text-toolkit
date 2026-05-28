/**
 * dateUtils 模块单元测试
 * 测试 src/lib/dateUtils/index.ts 中的日期工具函数
 */

import { describe, it, expect } from 'vitest';
import {
  parseDate,
  formatDate,
  formatISODate,
  addDays,
  isSameDay,
  isToday,
  dayjs,
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
      expect(result1 || result2).toBeTruthy();
    });
  });

  describe('formatDate', () => {
    it('应该格式化日期对象', () => {
      const date = new Date(2024, 0, 15);
      const result = formatDate(date, 'yyyy-MM-dd');
      expect(result).toContain('2024');
      expect(result).toContain('01');
      expect(result).toContain('15');
    });

    it('应该处理不同的格式模板', () => {
      const date = new Date(2024, 0, 15);
      expect(formatDate(date, 'yyyy/MM/dd')).toContain('/');
      expect(formatDate(date, 'dd-MM-yyyy')).toContain('15');
    });

    it('应该处理空日期', () => {
      expect(formatDate(null as any, 'yyyy-MM-dd')).toBe('');
      expect(formatDate(undefined as any, 'yyyy-MM-dd')).toBe('');
    });
  });

  describe('formatISODate', () => {
    it('应该返回 ISO 格式日期', () => {
      const date = new Date(2024, 0, 15);
      const result = formatISODate(date);
      expect(result).toBe('2024-01-15');
    });

    it('应该处理无效日期', () => {
      expect(formatISODate('invalid')).toBe('');
    });
  });

  describe('addDays', () => {
    it('应该正确添加天数', () => {
      const date = new Date(2024, 0, 15);
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(20);
    });

    it('应该处理负数天数', () => {
      const date = new Date(2024, 0, 15);
      const result = addDays(date, -5);
      expect(result.getDate()).toBe(10);
    });
  });

  describe('isSameDay', () => {
    it('应该识别同一天', () => {
      const date1 = new Date(2024, 0, 15);
      const date2 = new Date(2024, 0, 15);
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('应该识别不同的天', () => {
      const date1 = new Date(2024, 0, 15);
      const date2 = new Date(2024, 0, 16);
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('应该识别不同的年份', () => {
      const date1 = new Date(2023, 0, 15);
      const date2 = new Date(2024, 0, 15);
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('isToday', () => {
    it('应该识别今天', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('应该识别不是今天', () => {
      const yesterday = dayjs().subtract(1, 'day').toDate();
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('dayjs 集成', () => {
    it('应该正确导入 dayjs', () => {
      expect(dayjs).toBeDefined();
      expect(typeof dayjs).toBe('function');
    });

    it('应该能够格式化日期', () => {
      const result = dayjs('2024-01-15').format('YYYY-MM-DD');
      expect(result).toBe('2024-01-15');
    });
  });
});
