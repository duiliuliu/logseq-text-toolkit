import { TemplateType, SummaryTemplate, SummaryData, BlockNode, SummaryType } from '../types';
import { DataAnalyzer } from '../DataAnalyzer';

export class BulletJournalTemplate implements SummaryTemplate {
  id: TemplateType = 'bullet-journal';
  name = '子弹日记';
  description = '基于子弹日记方法的记录模板';
  supportedTypes: SummaryType[] = ['weekly', 'monthly'];

  private analyzer: DataAnalyzer;

  constructor() {
    this.analyzer = new DataAnalyzer();
  }

  render(data: SummaryData, _params: Record<string, any>): BlockNode[] {
    const topTags = this.analyzer.getTopTags(data.blocks.tags, 5);
    const dateRangeStr = this.analyzer.formatDateRange(data.dateRange);

    return [
      {
        content: `[:div.ltt-summary-page "📔 ${dateRangeStr}"]`,
        children: [
          {
            content: '## 📅 日志概览',
            children: [
              { content: `时间段: ${dateRangeStr}` },
              { content: `记录条数: ${data.blocks.total}` },
            ],
          },
          {
            content: '## ✅ 任务追踪',
            children: [
              { content: `| 状态 | 数量 | 占比 |` },
              { content: `|------|------|------|` },
              { content: `| 完成 | ${data.tasks.completed} | ${data.tasks.completionRate}% |` },
              { content: `| 进行中 | ${data.tasks.inProgress} | ${data.tasks.total > 0 ? Math.round((data.tasks.inProgress / data.tasks.total) * 100) : 0}% |` },
              { content: `| 待办 | ${data.tasks.todo} | ${data.tasks.total > 0 ? Math.round((data.tasks.todo / data.tasks.total) * 100) : 0}% |` },
              { content: `| 逾期 | ${data.tasks.overdue} | ${data.tasks.total > 0 ? Math.round((data.tasks.overdue / data.tasks.total) * 100) : 0}% |` },
            ],
          },
          {
            content: '## 💡 想法记录',
            children: [
              { content: '本周/本月收集的想法和灵感' },
              { content: '待进一步探索的主题' },
            ],
          },
          {
            content: '## 📚 阅读笔记',
            children: [
              { content: '阅读的书籍/文章' },
              { content: '关键要点摘录' },
            ],
          },
          {
            content: '## 🏷️ 标签云',
            children: topTags.map(([tag, count]) => ({
              content: `${tag}: ${count}`,
            })),
          },
          {
            content: '## 🎯 下周/下月目标',
            children: [
              { content: '[ ] 目标一' },
              { content: '[ ] 目标二' },
              { content: '[ ] 目标三' },
            ],
          },
        ],
      },
    ];
  }
}
