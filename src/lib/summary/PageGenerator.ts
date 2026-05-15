import { logseqAPI } from '../../logseq';
import { BlockNode, TemplateType, SummaryType } from './types';
import { getTemplate } from './templates';
import { DataAnalyzer } from './DataAnalyzer';
import logger from '../logger';
import { getSettings } from '../../settings';

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
      const blockTree = template.render(data, { ...params, summaryType });

      const pageName = this.generatePageName(summaryType, data.dateRange, params.pageNameTemplate);
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

  async generateWeeklyPage(year: number, weekNumber: number, pageNameTemplate?: string): Promise<string | null> {
    logger.info('[PageGenerator] 开始生成周度页面', { year, weekNumber, pageNameTemplate });
    
    const startDate = this.getWeekStartDate(year, weekNumber);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    return this.generate('gtd-work-review', 'weekly', startDate, endDate, {
      year,
      weekNumber,
      pageNameTemplate
    });
  }

  async generateMonthlyPage(year: number, month: number, pageNameTemplate?: string): Promise<string | null> {
    logger.info('[PageGenerator] 开始生成月度页面', { year, month, pageNameTemplate });
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return this.generate('gtd-work-review', 'monthly', startDate, endDate, {
      year,
      month,
      pageNameTemplate
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

  private generatePageName(summaryType: SummaryType, dateRange: { start: Date }, pageNameTemplate?: string): string {
    const now = dateRange.start;
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const weekNum = this.analyzer.getWeekNumber(now);
    const dateStr = now.toISOString().split('T')[0];
    
    // 如果提供了模板，直接使用
    if (pageNameTemplate) {
      return this.replacePageNamePlaceholders(pageNameTemplate, {
        year,
        month,
        week: weekNum,
        date: dateStr,
        type: summaryType
      });
    }
    
    // 否则从设置中读取对应的模板
    const settings = getSettings();
    let template: string | undefined;
    
    switch (summaryType) {
      case 'weekly':
        template = settings.summary?.weeklyPageNameTemplate;
        break;
      case 'monthly':
        template = settings.summary?.monthlyPageNameTemplate;
        break;
      case 'custom':
      default:
        template = settings.summary?.customPageNameTemplate;
        break;
    }
    
    if (template) {
      return this.replacePageNamePlaceholders(template, {
        year,
        month,
        week: weekNum,
        date: dateStr,
        type: summaryType
      });
    }
    
    // 兜底方案
    switch (summaryType) {
      case 'weekly':
        return `周度总结-${year}-W${weekNum}`;
      case 'monthly':
        return `月度总结-${year}-${month.toString().padStart(2, '0')}`;
      case 'custom':
      default:
        return `自定义总结-${dateStr}`;
    }
  }
  
  private replacePageNamePlaceholders(template: string, vars: { 
    year: number; 
    month: number; 
    week: number; 
    date: string; 
    type: SummaryType 
  }): string {
    return template
      .replace(/\{\{year\}\}/g, String(vars.year))
      .replace(/\{\{month\}\}/g, String(vars.month).padStart(2, '0'))
      .replace(/\{\{week\}\}/g, String(vars.week))
      .replace(/\{\{date\}\}/g, vars.date)
      .replace(/\{\{type\}\}/g, vars.type);
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
