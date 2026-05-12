import { SummaryTemplate, SummaryData, BlockNode, SummaryType } from '../types';
import { DataAnalyzer } from '../DataAnalyzer';

export class GTDWorkReviewTemplate implements SummaryTemplate {
  id: TemplateType = 'gtd-work-review';
  name = 'GTD 工作回顾';
  description = '基于 GTD 方法的工作回顾模版';
  supportedTypes: SummaryType[] = ['weekly', 'monthly'];

  private analyzer: DataAnalyzer;

  constructor() {
    this.analyzer = new DataAnalyzer();
  }

  render(data: SummaryData, _params: Record<string, any>): BlockNode[] {
    const topTags = this.analyzer.getTopTags(data.blocks.tags);
    const title = this.getTitle(data);

    return [
      {
        content: `[:div.ltt-summary-page "${title}"]`,
        children: [
          {
            content: '## 📈 数据概览',
            children: [
              { content: '### 核心指标' },
              { content: `- 创建块数: ${data.blocks.created}` },
              { content: `- 完成任务: ${data.tasks.completed} / ${data.tasks.total}` },
              { content: `- 任务完成率: ${data.tasks.completionRate}%` },
              { content: `- 新增页面: ${data.pages.newPages}` },
            ],
          },
          {
            content: '## 📈 活跃度热力图',
            children: [
              { content: '{{renderer :heatmap :week}}' },
            ],
          },
          {
            content: '## ✅ 任务回顾',
            children: [
              { content: '### 任务统计' },
              { content: '| 状态 | 数量 |' },
              { content: '|------|------|' },
              { content: `| 完成 | ${data.tasks.completed} |` },
              { content: `| 进行中 | ${data.tasks.inProgress} |` },
              { content: `| 待办 | ${data.tasks.todo} |` },
              { content: `| 逾期 | ${data.tasks.overdue} |` },
              { content: '### 优先级分布' },
              ...this.renderPriorityDistribution(data.tasks.byPriority),
            ],
          },
          {
            content: '## 📝 内容分析',
            children: [
              { content: '### 热门标签' },
              ...topTags.map(([tag, count]) => ({ content: `- #${tag} (${count})` })),
              { content: '### 页面统计' },
              { content: `- 总页面数: ${data.pages.total}` },
              { content: `- 新增页面: ${data.pages.newPages}` },
              { content: `- 修改页面: ${data.pages.modifiedPages}` },
            ],
          },
          {
            content: '## 🤖 AI 分析建议',
            children: [
              { content: '> 在此处添加 AI 生成的分析建议...' },
            ],
          },
        ],
      },
    ];
  }

  private getTitle(data: SummaryData): string {
    const year = data.dateRange.start.getFullYear();
    const weekNum = this.analyzer.getWeekNumber(data.dateRange.start);
    const monthName = data.dateRange.start.toLocaleDateString('zh-CN', { month: 'long' });
    
    if (this.supportedTypes.includes('weekly')) {
      return `📊 周度总结 - ${year}年第${weekNum}周`;
    }
    return `📊 月度总结 - ${year}年${monthName}`;
  }

  private renderPriorityDistribution(byPriority: Record<string, number>): BlockNode[] {
    if (Object.keys(byPriority).length === 0) {
      return [{ content: '- 暂无优先级数据' }];
    }
    return Object.entries(byPriority).map(([priority, count]) => ({
      content: `- ${priority}: ${count} 个`,
    }));
  }
}