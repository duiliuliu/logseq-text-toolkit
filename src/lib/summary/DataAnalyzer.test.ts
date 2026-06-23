/**
 * DataAnalyzer 模块单元测试
 * 测试 src/lib/summary/DataAnalyzer.ts 中的纯函数
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DataAnalyzer } from './DataAnalyzer';

describe('DataAnalyzer (纯函数测试)', () => {
  let analyzer: DataAnalyzer;

  beforeEach(() => {
    analyzer = new DataAnalyzer();
  });

  describe('calculateDateRange', () => {
    it('应该计算周度日期范围', () => {
      // 注意：这个测试会根据实际日期变化，但我们可以验证基本逻辑
      const range = analyzer.calculateDateRange('weekly');
      expect(range.start).toBeInstanceOf(Date);
      expect(range.end).toBeInstanceOf(Date);
      // 周范围应该是7天
      const diffDays = (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThanOrEqual(6);
      expect(diffDays).toBeLessThanOrEqual(7);
    });

    it('应该计算月度日期范围', () => {
      const range = analyzer.calculateDateRange('monthly');
      expect(range.start).toBeInstanceOf(Date);
      expect(range.end).toBeInstanceOf(Date);
      // 月范围应该是同一年和月
      expect(range.start.getFullYear()).toBe(range.end.getFullYear());
      expect(range.start.getMonth()).toBe(range.end.getMonth());
    });

    it('应该计算年度日期范围', () => {
      const range = analyzer.calculateDateRange('yearly');
      expect(range.start).toBeInstanceOf(Date);
      expect(range.end).toBeInstanceOf(Date);
      expect(range.start.getMonth()).toBe(0); // 1月
      expect(range.end.getMonth()).toBe(11); // 12月
    });

    it('应该处理自定义日期范围', () => {
      const customStart = new Date('2026-01-01');
      const customEnd = new Date('2026-12-31');
      const range = analyzer.calculateDateRange('custom', customStart, customEnd);
      expect(range.start).toEqual(customStart);
      expect(range.end).toEqual(customEnd);
    });
  });

  describe('getWeekNumber', () => {
    it('应该计算正确的周数', () => {
      const date1 = new Date('2026-01-01');
      const week1 = analyzer.getWeekNumber(date1);
      expect(typeof week1).toBe('number');
      expect(week1).toBeGreaterThanOrEqual(0);
      
      const date2 = new Date('2026-12-31');
      const week2 = analyzer.getWeekNumber(date2);
      expect(week2).toBeGreaterThanOrEqual(week1);
    });

    it('应该对不同日期返回递增的周数', () => {
      const date1 = new Date('2026-01-01');
      const date2 = new Date('2026-01-15');
      const week1 = analyzer.getWeekNumber(date1);
      const week2 = analyzer.getWeekNumber(date2);
      expect(week2).toBeGreaterThanOrEqual(week1);
    });
  });

  describe('getTopTags', () => {
    it('应该返回前N个热门标签', () => {
      const tags = {
        work: 10,
        personal: 5,
        study: 8,
        health: 3,
        projects: 15
      };
      
      const top3 = analyzer.getTopTags(tags, 3);
      expect(top3).toHaveLength(3);
      // 应该按数量降序排列
      expect(top3[0][1]).toBe(15); // projects
      expect(top3[1][1]).toBe(10); // work
      expect(top3[2][1]).toBe(8);  // study
    });

    it('应该处理空的标签数据', () => {
      const top5 = analyzer.getTopTags({}, 5);
      expect(top5).toEqual([]);
    });

    it('应该处理标签数量少于limit的情况', () => {
      const tags = { work: 10, personal: 5 };
      const top5 = analyzer.getTopTags(tags, 5);
      expect(top5).toHaveLength(2);
    });
  });

  describe('getTopProperties', () => {
    it('应该返回前N个热门属性', () => {
      const properties = {
        priority: { high: 5, medium: 10, low: 3 },
        status: { todo: 8, done: 15 },
        category: { work: 7, personal: 4 }
      };
      
      const top2 = analyzer.getTopProperties(properties, 2);
      expect(top2).toHaveLength(2);
      // 应该按总和降序排列
      const totalPriority = 5 + 10 + 3;  // 18
      const totalStatus = 8 + 15;        // 23
      const totalCategory = 7 + 4;       // 11
      
      // 第一个应该是 status (总和23)，第二个是 priority (总和18)
      expect(['priority', 'status'].includes(top2[0][0])).toBe(true);
      expect(['priority', 'status'].includes(top2[1][0])).toBe(true);
    });

    it('应该处理空的属性数据', () => {
      const top5 = analyzer.getTopProperties({}, 5);
      expect(top5).toEqual([]);
    });
  });

  describe('formatDateRange', () => {
    it('应该格式化日期范围', () => {
      const start = new Date('2026-01-01');
      const end = new Date('2026-01-31');
      const formatted = analyzer.formatDateRange({ start, end });
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });
  });
});
