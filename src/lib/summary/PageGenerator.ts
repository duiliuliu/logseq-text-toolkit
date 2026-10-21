import { logseqAPI } from '../../logseq';
import { BlockNode, TemplateType, SummaryType } from './types';
import { getTemplate } from './templates';
import { DataAnalyzer } from './DataAnalyzer';
import logger from '../logger';
import { getSettings } from '../../settings';
import { buildAISuggestions } from './ai';
import {
  addDays,
  endOfDay,
  formatLocalDate,
  getISOWeekInfo,
  getISOWeekStart,
} from './dateUtils';

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
      let template = getTemplate(templateType);
      if (!template) {
        logger.error('[PageGenerator] 模板未找到', { templateType });
        throw new Error(`Template ${templateType} not found`);
      }
      if (!template.supportedTypes.includes(summaryType)) {
        logger.warn('[PageGenerator] 模板不支持该总结类型，回退到极简看板', {
          templateType,
          summaryType,
          supportedTypes: template.supportedTypes,
        });
        template = getTemplate('minimal-dashboard');
      }
      if (!template) {
        throw new Error('Fallback template not found');
      }

      logger.debug('[PageGenerator] 分析数据', { summaryType, customStart, customEnd });
      const data = await this.analyzer.analyze(summaryType, customStart, customEnd);

      const settings = getSettings();
      const aiConfig = settings.summary?.ai;
      if (aiConfig?.enabled) {
        const aiSuggestions = await buildAISuggestions(data, aiConfig);
        if (aiSuggestions.length > 0) {
          data.aiSuggestions = aiSuggestions;
        }
      }

      logger.debug('[PageGenerator] 渲染模板');
      const blockTree = template.render(data, { ...params, summaryType });

      const pageName = this.generatePageName(summaryType, data.dateRange, params.pageNameTemplate);
      logger.info('[PageGenerator] 创建页面', { pageName });

      const page = await this.createPage(pageName);
      if (page.id && !page.existed) {
        await this.removeEmptyFirstBlock(page.id);
      }

      // 先记录旧总结块，插入新内容成功后再删除，避免插入失败导致旧内容丢失。
      const oldSummaryBlocks = page.id && page.existed
        ? await this.findGeneratedSummaryBlocks(page.id)
        : [];

      const insertTarget = page.id || pageName;
      logger.debug('[PageGenerator] 插入块树', { target: insertTarget, blocksCount: blockTree.length });
      await this.insertBlockTree(insertTarget, blockTree);

      if (oldSummaryBlocks.length > 0) {
        await this.removeBlocks(oldSummaryBlocks);
      }

      logger.info('[PageGenerator] 总结生成成功', { pageName, pageId: page.id });

      return pageName;
    } catch (error) {
      logger.error('[PageGenerator] 生成总结失败', error);
      logseqAPI.UI.showMsg(`生成总结失败: ${error instanceof Error ? error.message : String(error)}`, 'error');
      return null;
    }
  }

  async generateWeeklyPage(
    year: number, 
    weekNumber: number, 
    pageNameTemplate?: string,
    templateType: TemplateType = 'gtd-work-review'
  ): Promise<string | null> {
    logger.info('[PageGenerator] 开始生成周度页面', { year, weekNumber, pageNameTemplate, templateType });
    
    const startDate = getISOWeekStart(year, weekNumber);
    const endDate = endOfDay(addDays(startDate, 6));
    
    return this.generate(templateType, 'weekly', startDate, endDate, {
      year,
      weekNumber,
      pageNameTemplate
    });
  }

  async generateMonthlyPage(
    year: number, 
    month: number, 
    pageNameTemplate?: string,
    templateType: TemplateType = 'gtd-work-review'
  ): Promise<string | null> {
    logger.info('[PageGenerator] 开始生成月度页面', { year, month, pageNameTemplate, templateType });
    
    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = endOfDay(new Date(year, month, 0));
    
    return this.generate(templateType, 'monthly', startDate, endDate, {
      year,
      month,
      pageNameTemplate
    });
  }

  private generatePageName(summaryType: SummaryType, dateRange: { start: Date; end: Date }, pageNameTemplate?: string): string {
    const now = dateRange.start;
    const localYear = now.getFullYear();
    const month = now.getMonth() + 1;
    const weekInfo = getISOWeekInfo(now);
    // 周总结跨年时使用 ISO 周年，避免出现 2025-W1 但实际属于 2026 周。
    const year = summaryType === 'weekly' ? weekInfo.year : localYear;
    const weekNum = weekInfo.week;
    const dateStr = formatLocalDate(now);
    const endDateStr = formatLocalDate(dateRange.end);

    // 如果提供了模板，直接使用
    if (pageNameTemplate) {
      return this.replacePageNamePlaceholders(pageNameTemplate, {
        year,
        month,
        week: weekNum,
        date: dateStr,
        endDate: endDateStr,
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
      case 'yearly':
        template = settings.summary?.yearlyPageNameTemplate;
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
        endDate: endDateStr,
        type: summaryType
      });
    }
    
    // 兜底方案
    switch (summaryType) {
      case 'weekly':
        return `周度总结-${year}-W${weekNum}`;
      case 'monthly':
        return `月度总结-${year}-${month.toString().padStart(2, '0')}`;
      case 'yearly':
        return `年度总结-${year}`;
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
    endDate: string;
    type: SummaryType 
  }): string {
    return template
      .replace(/\{\{year\}\}/g, String(vars.year))
      .replace(/\{\{month\}\}/g, String(vars.month).padStart(2, '0'))
      .replace(/\{\{week\}\}/g, String(vars.week))
      .replace(/\{\{date\}\}/g, vars.date)
      .replace(/\{\{endDate\}\}/g, vars.endDate)
      .replace(/\{\{type\}\}/g, vars.type);
  }

  private async createPage(pageName: string): Promise<{ id: string | null; existed: boolean }> {
    const toId = (page: any): string | null => {
      if (!page) return null;
      if (page.uuid != null) return String(page.uuid);
      if (page.id != null) return String(page.id);
      return null;
    };

    logger.debug('[PageGenerator] 查询页面是否存在', { pageName });
    const existingPage = await logseqAPI.Editor.getPage(pageName);

    if (!existingPage) {
      const page = await logseqAPI.Editor.createPage(pageName, {}, { createFirstBlock: true });
      logger.debug('[PageGenerator] 页面创建成功', { pageName, pageId: page?.uuid || page?.id });

      if (!page) {
        const existingPage = await logseqAPI.Editor.getPage(pageName);
        logger.debug('[PageGenerator] 页面创建失败，重新查询页面', { pageName, existingPageId: existingPage?.uuid || existingPage?.id });
        return { id: toId(existingPage), existed: !!existingPage };
      }

      return { id: toId(page), existed: false };
    }

    logger.debug('[PageGenerator] 页面已存在', { pageName });
    return { id: toId(existingPage), existed: true };
  }

  private async findGeneratedSummaryBlocks(pageId: string): Promise<any[]> {
    try {
      const blocks = await logseqAPI.Editor.getPageBlocksTree(pageId);
      if (!Array.isArray(blocks)) return [];

      return blocks.filter((block) => {
        const content = block?.content || (block as any)?.title || '';
        return content.includes('.ltt-summary-page');
      });
    } catch (error) {
      logger.warn('[PageGenerator] Failed to find old summary blocks', error);
      return [];
    }
  }

  private async removeBlocks(blocks: any[]): Promise<void> {
    for (const block of blocks) {
      try {
        await this.removeBlock(block);
      } catch (error) {
        logger.warn('[PageGenerator] Failed to remove old summary block', error);
      }
    }
  }

  private async removeEmptyFirstBlock(pageId: string): Promise<void> {
    try {
      const blocks = await logseqAPI.Editor.getPageBlocksTree(pageId);
      if (!Array.isArray(blocks) || blocks.length !== 1) return;

      const block = blocks[0];
      const content = block?.content || (block as any)?.title || '';
      if (!content.trim()) {
        await this.removeBlock(block);
      }
    } catch (error) {
      logger.warn('[PageGenerator] Failed to remove empty first block', error);
    }
  }

  private async removeBlock(block: any): Promise<void> {
    const id = block?.uuid || block?.id;
    if (!id || typeof logseqAPI.Editor.removeBlock !== 'function') return;
    await logseqAPI.Editor.removeBlock(id);
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
