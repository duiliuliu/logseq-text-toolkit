import { SummaryTemplate, SummaryData, BlockNode, SummaryType } from '../types';
import { DataAnalyzer } from '../DataAnalyzer';

export class MinimalDashboardTemplate implements SummaryTemplate {
  id: TemplateType = 'minimal-dashboard';
  name = '极简数据看板';
  description = '简洁的数据概览看板';
  supportedTypes: SummaryType[] = ['weekly', 'monthly', 'yearly', 'custom'];

  private analyzer: DataAnalyzer;

  constructor() {
    this.analyzer = new DataAnalyzer();
  }

  render(data: SummaryData, _params: Record<string, any>): BlockNode[] {
    const topTags = this.analyzer.getTopTags(data.blocks.tags, 3);
    const dateRangeStr = this.analyzer.formatDateRange(data.dateRange);

    return [
      {
        content: `[:div.ltt-summary-page "${dateRangeStr}"]`,
        children: [
          {
            content: '## 📊 概览',
            children: [
              { content: `### 时间段` },
              { content: `${dateRangeStr}` },
            ],
          },
          {
            content: '## 📝 内容统计',
            children: [
              { content: `总块数: ${data.blocks.total}` },
              { content: `创建: ${data.blocks.created}` },
              { content: `修改: ${data.blocks.modified}` },
              { content: `平均长度: ${data.blocks.avgContentLength} 字符` },
            ],
          },
          {
            content: '## ✅ 任务状态',
            children: [
              { content: `总计: ${data.tasks.total}` },
              { content: `完成: ${data.tasks.completed} (${data.tasks.completionRate}%)` },
              { content: `进行中: ${data.tasks.inProgress}` },
              { content: `待办: ${data.tasks.todo}` },
              { content: `逾期: ${data.tasks.overdue}` },
            ],
          },
          {
            content: '## 📄 页面',
            children: [
              { content: `总数: ${data.pages.total}` },
              { content: `新增: ${data.pages.newPages}` },
              { content: `修改: ${data.pages.modifiedPages}` },
            ],
          },
          {
            content: '## 🏷️ 热门标签',
            children: topTags.map(([tag, count]) => ({
              content: `${tag}: ${count}`,
            })),
          },
        ],
      },
    ];
  }
}