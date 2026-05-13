import { logseqAPI } from '../../logseq';
import { BlockNode, TemplateType, SummaryType } from './types';
import { getTemplate } from './templates';
import { DataAnalyzer } from './DataAnalyzer';
import logger from '../logger';

export class PageGenerator {
  private analyzer: DataAnalyzer;

  constructor() {
    this.analyzer = new DataAnalyzer();
  }

  async generate(
    templateType: TemplateType,
    summaryType: SummaryType,
    customStart?: Date,
    customEnd?: Date,
    params: Record<string, any> = {}
  ): Promise<string | null> {
    logger.info('[PageGenerator] 开始生成总结', { templateType, summaryType });

    try {
      const template = getTemplate(templateType);
      if (!template) {
        logger.error('[PageGenerator] 模板未找到', { templateType });
        throw new Error(`Template ${templateType} not found`);
      }

      logger.debug('[PageGenerator] 分析数据', { summaryType, customStart, customEnd });
      const data = await this.analyzer.analyze(summaryType, customStart, customEnd);

      logger.debug('[PageGenerator] 渲染模板');
      const blockTree = template.render(data, params);

      const pageName = this.generatePageName(summaryType, data.dateRange);
      logger.info('[PageGenerator] 创建页面', { pageName });

      const pageId = await this.createPage(pageName);

      if (pageId) {
        logger.debug('[PageGenerator] 插入块树', { pageId, blocksCount: blockTree.length });
        await this.insertBlockTree(pageId, blockTree);
        logger.info('[PageGenerator] 总结生成成功', { pageName, pageId });
      } else {
        logger.debug('[PageGenerator] 插入块树', { pageId, blocksCount: blockTree.length });
        await this.insertBlockTree(pageName, blockTree);
        logger.info('[PageGenerator] 总结生成成功', { pageName, pageId });
      }

      return pageName;
    } catch (error) {
      logger.error('[PageGenerator] 生成总结失败', error);
      logseqAPI.UI.showMsg(`生成总结失败: ${error instanceof Error ? error.message : String(error)}`, 'error');
      return null;
    }
  }

  async generateWeeklyPage(year: number, weekNumber: number): Promise<string | null> {
    logger.info('[PageGenerator] 开始生成周度页面', { year, weekNumber });
    
    const startDate = this.getWeekStartDate(year, weekNumber);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    return this.generate('gtd-work-review', 'weekly', startDate, endDate, {
      year,
      weekNumber
    });
  }

  async generateMonthlyPage(year: number, month: number): Promise<string | null> {
    logger.info('[PageGenerator] 开始生成月度页面', { year, month });
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return this.generate('gtd-work-review', 'monthly', startDate, endDate, {
      year,
      month
    });
  }

  private getWeekStartDate(year: number, weekNumber: number): Date {
    const startOfYear = new Date(year, 0, 1);
    const daysToAdd = (weekNumber - 1) * 7;
    const result = new Date(startOfYear);
    result.setDate(result.getDate() + daysToAdd);
    
    // 调整到周一
    const dayOfWeek = result.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    result.setDate(result.getDate() + diff);
    
    return result;
  }

  private generatePageName(summaryType: SummaryType, dateRange: { start: Date }): string {
    const now = dateRange.start;
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const weekNum = this.analyzer.getWeekNumber(now);

    switch (summaryType) {
      case 'weekly':
        return `周度总结-${year}-W${weekNum}`;
      case 'monthly':
        return `月度总结-${year}-${month.toString().padStart(2, '0')}`;
      case 'custom':
      default:
        const dateStr = now.toISOString().split('T')[0];
        return `自定义总结-${dateStr}`;
    }
  }

  private async createPage(pageName: string): Promise<string | null> {
    logger.debug('[PageGenerator] 查询页面是否存在', { pageName });
    const existingPage = await logseqAPI.Editor.getPage(pageName);

    if (!existingPage) {
      const page = await logseqAPI.Editor.createPage(pageName, {}, { createFirstBlock: true });
      logger.debug('[PageGenerator] 页面创建成功', { pageName, pageId: page?.uuid || page?.id });

      if (!page) {
        const existingPage = await logseqAPI.Editor.getPage(pageName);
        logger.debug('[PageGenerator] 页面创建失败，重新查询页面', { pageName, existingPageId: existingPage?.uuid || existingPage?.id });
        return existingPage?.uuid || existingPage?.id || null;
      }

      return page?.uuid || page?.id || null;
    }

    logger.debug('[PageGenerator] 页面已存在', { pageName });
    return existingPage?.uuid || existingPage?.id || null;
  }

  private async insertBlockTree(
    parentId: string,
    blocks: BlockNode[]
  ): Promise<void> {
    logger.debug('[PageGenerator] 插入块', { parentId, count: blocks.length });

    for (const block of blocks) {
      const createdBlock = await logseqAPI.Editor.insertBlock(
        parentId,
        block.content,
      );

      if (block.children?.length && createdBlock?.uuid) {
        await this.insertBlockTree(createdBlock.uuid, block.children);
      }
    }

    logger.debug('[PageGenerator] 块插入完成', { parentId });
  }
}
