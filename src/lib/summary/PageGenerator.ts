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
      await this.createPage(pageName);
      await this.insertBlockTree(pageName, blockTree);

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

  private async createPage(pageName: string): Promise<void> {
    const existingPage = await logseqAPI.Editor.getPage(pageName);
    if (!existingPage) {
      await logseqAPI.Editor.createPage(pageName, {}, { createFirstBlock: false });
    }
  }

  private async insertBlockTree(
    pageName: string,
    blocks: BlockNode[],
    parentId?: string
  ): Promise<void> {
    for (const block of blocks) {
      const createdBlock = await logseqAPI.Editor.createBlock(
        parentId || pageName,
        block.content,
        { sibling: !!parentId }
      );

      if (block.children?.length) {
        await this.insertBlockTree(pageName, block.children, createdBlock?.uuid);
      }
    }
  }
}