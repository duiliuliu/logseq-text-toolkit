/**
 * Summary 数据聚合 & AI 摘要生成
 *
 * analyze() 会：
 *   1. 从 Logseq 查询 blocks / tasks / pages 统计
 *   2. 若 AI 已配置，异步调用 AIService 生成结构化 insights
 */

import { SummaryData, DateRange, SummaryType } from './types';
import { Query } from './query';
import { AIService } from '../ai';
import logger from '../logger';

export class DataAnalyzer {
  private query: Query;

  constructor() {
    this.query = new Query();
  }

  calculateDateRange(
    type: SummaryType,
    customStart?: Date,
    customEnd?: Date,
  ): DateRange {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (type) {
      case 'weekly': {
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        start = new Date(now);
        start.setDate(now.getDate() + diff);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      }
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

    return { start, end };
  }

  async analyze(
    type: SummaryType,
    customStart?: Date,
    customEnd?: Date,
  ): Promise<SummaryData> {
    const dateRange = this.calculateDateRange(type, customStart, customEnd);
    logger.info('[DataAnalyzer] 开始分析数据', { type });

    const [blocks, tasks, pages] = await Promise.all([
      this.query.queryBlocks(dateRange),
      this.query.queryTasks(dateRange),
      this.query.queryPages(dateRange),
    ]);

    const data: SummaryData = {
      dateRange,
      blocks,
      tasks,
      pages,
    };

    logger.info('[DataAnalyzer] 数据分析完成', {
      blocks: blocks.total,
      tasks: tasks.total,
      pages: pages.total,
    });

    return data;
  }

  /**
   * 🤖 附加 AI 摘要
   * - 若未启用 AI，直接返回原 data
   * - 失败时降级不抛异常
   */
  async enhanceWithAI(data: SummaryData): Promise<SummaryData> {
    const service = await AIService.fromSettings();
    if (!service.isEnabled()) {
      return data;
    }

    try {
      const text = this.formatSummaryForAI(data);
      const insights = await service.generateSummaryInsights(text);
      logger.info('[DataAnalyzer] AI 摘要完成', {
        hasOverview: !!insights.overview,
        highlightsCount: insights.highlights.length,
      });
      return {
        ...data,
        aiInsights: insights,
        // 向下兼容：把 highlights 填充到 aiSuggestions
        aiSuggestions: insights.highlights.length
          ? insights.highlights
          : data.aiSuggestions,
      };
    } catch (err) {
      logger.warn('[DataAnalyzer] AI 摘要失败 - 已降级', err);
      return data;
    }
  }

  /** 将 SummaryData 格式化为适合输入给 LLM 的文本 */
  formatSummaryForAI(data: SummaryData): string {
    const lines: string[] = [];
    lines.push(
      `周期: ${this.formatDateRange(data.dateRange)}`,
    );
    lines.push(
      `任务统计: 共 ${data.tasks.total}, 完成 ${data.tasks.completed}, 进行中 ${data.tasks.inProgress}, 逾期 ${data.tasks.overdue}, 完成率 ${(data.tasks.completionRate * 100).toFixed(1)}%`,
    );

    const topTags = this.getTopTags(data.blocks.tags, 5);
    if (topTags.length) {
      lines.push(
        `高频标签: ${topTags.map(([k, v]) => `${k}(${v})`).join(', ')}`,
      );
    }

    const priorityEntries = Object.entries(data.tasks.byPriority);
    if (priorityEntries.length) {
      lines.push(
        `优先级分布: ${priorityEntries
          .map(([k, v]) => `${k}=${v}`)
          .join(', ')}`,
      );
    }

    return lines.join('\n');
  }

  formatDateRange(range: DateRange): string {
    const formatDate = (date: Date) =>
      date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    return `${formatDate(range.start)} - ${formatDate(range.end)}`;
  }

  getWeekNumber(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - startOfYear.getTime();
    const oneWeek = 604800000;
    return Math.ceil(diff / oneWeek);
  }

  getTopTags(
    tags: Record<string, number>,
    limit: number = 5,
  ): Array<[string, number]> {
    return Object.entries(tags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }

  getTopProperties(
    properties: Record<string, Record<string, number>>,
    limit: number = 3,
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
