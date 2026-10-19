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
    const objectives = Array.isArray(params.objectives) ? params.objectives : [];
    const insights = data.aiSuggestions?.length ? data.aiSuggestions : (data.insights || []);
    const averageProgress = objectives.length > 0
      ? Math.round(objectives.reduce((sum: number, objective: any) => sum + Number(objective.progress || 0), 0) / objectives.length)
      : 0;

    return [
      {
        content: `[:div.ltt-summary-page "🎯 ${dateRangeStr} OKR 回顾"]`,
        children: [
          {
            content: '## 📊 OKR 完成概览',
            children: [
              { content: `时间段: ${dateRangeStr}` },
              { content: `总目标数: ${objectives.length}` },
              { content: `平均完成率: ${averageProgress}%` },
            ],
          },
          {
            content: '## 🎯 目标详情',
            children: objectives.length > 0
              ? objectives.map((obj: any, index: number) => ({
                  content: `### ${index + 1}. ${obj.name || `目标 ${index + 1}`}`,
                  children: [
                    { content: `**进度**: ${Number(obj.progress || 0)}%` },
                    { content: '**关键结果**:', children: (Array.isArray(obj.keyResults) ? obj.keyResults : []).map((kr: any, i: number) => ({ content: `${i + 1}. ${kr}` })) },
                    { content: `**状态**: ${this.getStatusText(Number(obj.progress || 0))}` },
                    { content: '**反思**: ' },
                  ],
                }))
              : [{ content: '暂无 OKR 目标数据。请在生成参数中提供 objectives，或生成后手动填写。' }],
          },
          {
            content: '## ✅ 任务完成情况',
            children: [
              { content: `总任务数: ${data.tasks.total}` },
              { content: `已完成: ${data.tasks.completed} (${data.tasks.completionRate}%)` },
              { content: `逾期任务: ${data.tasks.overdue}` },
            ],
          },
          {
            content: '## 💡 洞察与反思',
            children: [
              { content: '### 做得好的地方' },
              { content: '' },
              { content: '### 需要改进的地方' },
              { content: '' },
              { content: '### 下月行动项' },
              { content: '[ ] ' },
              { content: '[ ] ' },
              { content: '[ ] ' },
            ],
          },
          {
            content: '## 💡 自动洞察',
            children: insights.length > 0
              ? insights.map((item) => ({ content: `- ${item}` }))
              : [{ content: '- 暂无额外洞察' }],
          },
          {
            content: '## 📈 数据指标',
            children: [
              { content: `创建块数: ${data.blocks.created}` },
              { content: `新增页面: ${data.pages.newPages}` },
              { content: `修改页面: ${data.pages.modifiedPages}` },
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
