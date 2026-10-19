import { SummaryData, DateRange, SummaryType } from './types';
import { Query } from './query';
import logger from '../logger';
import { getSettings } from '../../settings';
import { buildLocalInsights } from './insights';
import {
  addDays,
  endOfDay,
  formatLocalDate,
  getISOWeekInfo,
  getWeekRange,
  isValidDate,
  normalizeCustomRange,
  startOfDay,
} from './dateUtils';

export class DataAnalyzer {
  private query: Query;

  constructor() {
    this.query = new Query();
  }

  calculateDateRange(type: SummaryType, customStart?: Date, customEnd?: Date): DateRange {
    const now = new Date();

    // 显式传入日期时优先使用（例如 generateWeeklyPage(year, week)）。
    if (customStart || customEnd) {
      if (customStart && !isValidDate(customStart)) {
        throw new Error('INVALID_START_DATE');
      }
      if (customEnd && !isValidDate(customEnd)) {
        throw new Error('INVALID_END_DATE');
      }
      if (customStart && customEnd) {
        return normalizeCustomRange(customStart, customEnd, now);
      }

      if (customStart) {
        const start = startOfDay(customStart);
        if (type === 'weekly') {
          return { start, end: endOfDay(addDays(start, 6)) };
        }
        if (type === 'monthly') {
          return {
            start: startOfDay(new Date(start.getFullYear(), start.getMonth(), 1)),
            end: endOfDay(new Date(start.getFullYear(), start.getMonth() + 1, 0)),
          };
        }
        if (type === 'yearly') {
          return {
            start: startOfDay(new Date(start.getFullYear(), 0, 1)),
            end: endOfDay(new Date(start.getFullYear(), 11, 31)),
          };
        }
        return { start, end: endOfDay(start) };
      }

      const end = endOfDay(customEnd as Date);
      if (type === 'weekly') {
        return { start: startOfDay(addDays(end, -6)), end };
      }
      if (type === 'monthly') {
        return {
          start: startOfDay(new Date(end.getFullYear(), end.getMonth(), 1)),
          end,
        };
      }
      if (type === 'yearly') {
        return {
          start: startOfDay(new Date(end.getFullYear(), 0, 1)),
          end,
        };
      }
      return { start: startOfDay(end), end };
    }

    switch (type) {
      case 'weekly': {
        const { start, end } = getWeekRange(now);
        return { start, end };
      }

      case 'monthly':
        return {
          start: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
          end: endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
        };

      case 'yearly':
        return {
          start: startOfDay(new Date(now.getFullYear(), 0, 1)),
          end: endOfDay(new Date(now.getFullYear(), 11, 31)),
        };

      case 'custom':
      default:
        return normalizeCustomRange(customStart, customEnd, now);
    }
  }

  async analyze(type: SummaryType, customStart?: Date, customEnd?: Date): Promise<SummaryData> {
    const dateRange = this.calculateDateRange(type, customStart, customEnd);
    logger.info('[DataAnalyzer] 开始分析数据', { type });

    const [blocks, tasks, pages] = await Promise.all([
      this.query.queryBlocks(dateRange),
      this.query.queryTasks(dateRange),
      this.query.queryPages(dateRange),
    ]);

    logger.info('[DataAnalyzer] 数据分析完成', {
      blocks: blocks.total,
      tasks: tasks.total,
      pages: pages.total
    });

    const data: SummaryData = {
      dateRange,
      blocks,
      tasks,
      pages,
    };
    data.insights = buildLocalInsights(data);
    return data;
  }

  formatDateRange(range: DateRange): string {
    const settings = getSettings();
    const language = settings?.language || 'zh-CN';
    const pattern = settings?.summary?.dateFormat;

    const formatDate = (date: Date): string => {
      if (pattern) {
        return this.formatDateWithPattern(date, pattern, language);
      }
      return date.toLocaleDateString(language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    if (formatLocalDate(range.start) === formatLocalDate(range.end)) {
      return formatDate(range.start);
    }
    return `${formatDate(range.start)} - ${formatDate(range.end)}`;
  }

  private formatDateWithPattern(date: Date, pattern: string, language: string): string {
    const weekday = date.toLocaleDateString(language, { weekday: 'short' });
    const values: Record<string, string> = {
      yyyy: String(date.getFullYear()),
      MM: String(date.getMonth() + 1).padStart(2, '0'),
      M: String(date.getMonth() + 1),
      dd: String(date.getDate()).padStart(2, '0'),
      d: String(date.getDate()),
      EEE: weekday,
      E: weekday,
    };
    return pattern.replace(/yyyy|MM|M|dd|d|EEE|E/g, (token) => values[token] ?? token);
  }

  getWeekNumber(date: Date): number {
    return getISOWeekInfo(date).week;
  }

  getTopTags(tags: Record<string, number>, limit: number = 5): Array<[string, number]> {
    const systemTags = new Set(['task', 'journal', 'page', 'property', 'class', 'tag']);
    return Object.entries(tags)
      .filter(([tag]) => !systemTags.has(tag.toLowerCase()))
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }

  getTopProperties(
    properties: Record<string, Record<string, number>>,
    limit: number = 3
  ): Array<[string, Record<string, number>]> {
    return Object.entries(properties)
      .sort((a, b) => {
        const countA = Object.values(a[1]).reduce((sum, val) => sum + val, 0);
        const countB = Object.values(b[1]).reduce((sum, val) => sum + val, 0);
        return countB - countA;
      })
      .slice(0, limit);
  }
}
