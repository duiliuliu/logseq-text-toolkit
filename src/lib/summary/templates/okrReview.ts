import { TemplateType, SummaryTemplate, SummaryData, BlockNode, SummaryType } from '../types';
import { DataAnalyzer } from '../DataAnalyzer';

export class OKRReviewTemplate implements SummaryTemplate {
  id: TemplateType = 'okr-review';
  name = 'OKR 回顾';
  description = '基于 OKR 方法论的目标回顾模板';
  supportedTypes: SummaryType[] = ['monthly'];

  private analyzer: DataAnalyzer;

  constructor() {
    this.analyzer = new DataAnalyzer();
  }

  render(data: SummaryData, params: Record<string, any>): BlockNode[] {
    const dateRangeStr = this.analyzer.formatDateRange(data.dateRange);
    const objectives = params.objectives || [
      { name: '目标一', progress: 80, keyResults: ['KR1', 'KR2'] },
      { name: '目标二', progress: 60, keyResults: ['KR3'] },
      { name: '目标三', progress: 100, keyResults: ['KR4', 'KR5', 'KR6'] },
    ];

    return [
      {
        content: `[:div.ltt-summary-page "🎯 ${dateRangeStr} OKR 回顾"]`,
        children: [
          {
            content: '## 📊 OKR 完成概览',
            children: [
              { content: `- 时间段: ${dateRangeStr}` },
              { content: `- 总目标数: ${objectives.length}` },
              { content: `- 平均完成率: ${Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / objectives.length)}%` },
            ],
          },
          {
            content: '## 🎯 目标详情',
            children: objectives.map((obj, index) => ({
              content: `### ${index + 1}. ${obj.name}`,
              children: [
                { content: `**进度**: ${obj.progress}%` },
                { content: '**关键结果**:', children: obj.keyResults.map((kr, i) => ({ content: `${i + 1}. ${kr}` })) },
                { content: `**状态**: ${this.getStatusText(obj.progress)}` },
                { content: '**反思**: ' },
              ],
            })),
          },
          {
            content: '## ✅ 任务完成情况',
            children: [
              { content: `- 总任务数: ${data.tasks.total}` },
              { content: `- 已完成: ${data.tasks.completed} (${data.tasks.completionRate}%)` },
              { content: `- 逾期任务: ${data.tasks.overdue}` },
            ],
          },
          {
            content: '## 💡 洞察与反思',
            children: [
              { content: '### 做得好的地方' },
              { content: '- ' },
              { content: '### 需要改进的地方' },
              { content: '- ' },
              { content: '### 下月行动项' },
              { content: '- [ ] ' },
              { content: '- [ ] ' },
              { content: '- [ ] ' },
            ],
          },
          {
            content: '## 📈 数据指标',
            children: [
              { content: `- 创建块数: ${data.blocks.created}` },
              { content: `- 新增页面: ${data.pages.newPages}` },
              { content: `- 修改页面: ${data.pages.modifiedPages}` },
            ],
          },
        ],
      },
    ];
  }

  private getStatusText(progress: number): string {
    if (progress >= 90) return '✅ 达成';
    if (progress >= 70) return '🔄 进行中';
    if (progress >= 50) return '⚠️ 需关注';
    return '❌ 风险';
  }
}
