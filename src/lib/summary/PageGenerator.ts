import { logseqAPI } from '../../logseq';
import { BlockNode, TemplateType, SummaryType } from './types';
import { getTemplate } from './templates';
import { DataAnalyzer } from './DataAnalyzer';

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
    try {
      const template = getTemplate(templateType);
      if (!template) {
        throw new Error(`Template ${templateType} not found`);
      }

      const data = await this.analyzer.analyze(summaryType, customStart, customEnd);
      const blockTree = template.render(data, params);

      const pageName = this.generatePageName(summaryType, data.dateRange);
      const pageId = await this.createPage(pageName);
      
      if (pageId) {
        await this.insertBlockTree(pageId, blockTree);
      }

      return pageName;
    } catch (error) {
      console.error('Failed to generate summary:', error);
      return null;
    }
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
      case 'yearly':
        return `年度总结-${year}`;
      case 'custom':
      default:
        const dateStr = now.toISOString().split('T')[0];
        return `自定义总结-${dateStr}`;
    }
  }

  private async createPage(pageName: string): Promise<string | null> {
    const existingPage = await logseqAPI.Editor.getPage(pageName);
    if (!existingPage) {
      const page = await logseqAPI.Editor.createPage(pageName, {}, { createFirstBlock: false });
      return page?.uuid || page?.id || null;
    }
    return existingPage?.uuid || existingPage?.id || null;
  }

  private async insertBlockTree(
    parentId: string,
    blocks: BlockNode[]
  ): Promise<void> {
    for (const block of blocks) {
      const createdBlock = await logseqAPI.Editor.insertBlock(
        parentId,
        block.content,
        'last'
      );

      if (block.children?.length && createdBlock?.uuid) {
        await this.insertBlockTree(createdBlock.uuid, block.children);
      }
    }
  }
}