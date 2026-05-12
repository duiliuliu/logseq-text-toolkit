import { SummaryData, DateRange, SummaryType } from './types';
import { QueryService } from './QueryService';
import logger from '../logger';

export class DataAnalyzer {
  private queryService: QueryService;

  constructor() {
    this.queryService = new QueryService();
  }

  calculateDateRange(type: SummaryType, customStart?: Date, customEnd?: Date): DateRange {
    logger.debug('[DataAnalyzer] 计算时间范围', { type, customStart, customEnd });
    
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (type) {
      case 'weekly':
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        start = new Date(now);
        start.setDate(now.getDate() + diff);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;

      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;

      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        end.setHours(23, 59, 59, 999);
        break;

      case 'custom':
      default:
        start = customStart || now;
        end = customEnd || now;
        break;
    }

    logger.debug('[DataAnalyzer] 时间范围计算完成', { start, end });
    return { start, end };
  }

  async analyze(type: SummaryType, customStart?: Date, customEnd?: Date): Promise<SummaryData> {
    const dateRange = this.calculateDateRange(type, customStart, customEnd);
    logger.info('[DataAnalyzer] 开始分析数据', { type, dateRange });

    const [blocks, tasks, pages] = await Promise.all([
      this.queryService.queryBlocks(dateRange),
      this.queryService.queryTasks(dateRange),
      this.queryService.queryPages(dateRange),
    ]);

    logger.info('[DataAnalyzer] 数据分析完成', {
      blocks: blocks.total,
      tasks: tasks.total,
      pages: pages.total
    });

    return {
      dateRange,
      blocks,
      tasks,
      pages,
    };
  }

  formatDateRange(range: DateRange): string {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };
    return `${formatDate(range.start)} - ${formatDate(range.end)}`;
  }

  getWeekNumber(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - startOfYear.getTime();
    const oneWeek = 604800000;
    return Math.ceil(diff / oneWeek);
  }

  getTopTags(tags: Record<string, number>, limit: number = 5): Array<[string, number]> {
    return Object.entries(tags)
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
