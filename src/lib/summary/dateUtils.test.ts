import { describe, expect, it } from 'vitest';
import {
  endOfDay,
  formatLocalDate,
  getISOWeekInfo,
  getISOWeekStart,
  getWeekRange,
  normalizeCustomRange,
  parseLocalDate,
  startOfDay,
} from './dateUtils';

describe('Summary dateUtils', () => {
  it('应该按本地日期解析 YYYY-MM-DD', () => {
    const date = parseLocalDate('2026-01-01')!;
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(1);
    expect(date.getHours()).toBe(0);
  });

  it('应该拒绝不存在的日期', () => {
    expect(parseLocalDate('2026-02-30')).toBeNull();
    expect(parseLocalDate('not-a-date')).toBeNull();
  });

  it('formatLocalDate 不应该因 UTC 偏移少一天', () => {
    expect(formatLocalDate(new Date(2026, 0, 1))).toBe('2026-01-01');
  });

  it('应该计算 ISO 周信息', () => {
    const info = getISOWeekInfo(new Date(2026, 0, 1));
    expect(info.year).toBe(2026);
    expect(info.week).toBe(1);
    expect(formatLocalDate(info.start)).toBe('2025-12-29');
  });

  it('应该根据 ISO 年/周取得周一', () => {
    expect(formatLocalDate(getISOWeekStart(2026, 1))).toBe('2025-12-29');
    expect(formatLocalDate(getISOWeekStart(2026, 2))).toBe('2026-01-05');
  });

  it('周范围应该覆盖周一到周日 23:59:59', () => {
    const range = getWeekRange(new Date(2026, 0, 1));
    expect(formatLocalDate(range.start)).toBe('2025-12-29');
    expect(formatLocalDate(range.end)).toBe('2026-01-04');
    expect(range.end.getHours()).toBe(23);
    expect(range.end.getMinutes()).toBe(59);
  });

  it('自定义范围应该补齐结束日边界', () => {
    const range = normalizeCustomRange(new Date(2026, 0, 1), new Date(2026, 0, 31));
    expect(range.start.getHours()).toBe(0);
    expect(range.end.getHours()).toBe(23);
    expect(range.end.getMinutes()).toBe(59);
  });

  it('自定义范围只有一端时应该补齐另一端', () => {
    const range = normalizeCustomRange(new Date(2026, 0, 1), undefined);
    expect(formatLocalDate(range.start)).toBe('2026-01-01');
    expect(formatLocalDate(range.end)).toBe('2026-01-01');
    expect(range.end.getHours()).toBe(23);
  });

  it('开始日期晚于结束日期应该报错', () => {
    expect(() => normalizeCustomRange(new Date(2026, 1, 1), new Date(2026, 0, 1)))
      .toThrow('INVALID_DATE_RANGE');
  });

  it('startOfDay/endOfDay 应该保持本地边界', () => {
    const date = new Date(2026, 0, 1, 12, 30);
    expect(startOfDay(date).getHours()).toBe(0);
    expect(endOfDay(date).getHours()).toBe(23);
  });
});
