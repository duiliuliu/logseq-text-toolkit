import { TemplateType, SummaryTemplate, SummaryData, BlockNode, SummaryType } from '../types';
import { DataAnalyzer } from '../DataAnalyzer';
import { getISOWeekInfo } from '../dateUtils';

export class GTDWorkReviewTemplate implements SummaryTemplate {
  id: TemplateType = 'gtd-work-review';
  name = 'GTD 工作回顾';
  description = '基于 GTD 方法的工作回顾模版';
  supportedTypes: SummaryType[] = ['weekly', 'monthly'];

  private analyzer: DataAnalyzer;

  constructor() {
    this.analyzer = new DataAnalyzer();
  }

  render(data: SummaryData, params: Record<string, any> = {}): BlockNode[] {
    const topTags = this.analyzer.getTopTags(data.blocks.tags);
    const summaryType = params.summaryType || 'weekly';
    const title = this.getTitle(data, summaryType);
    const insights = data.insights || [];
    const aiSuggestions = data.aiSuggestions || [];

    return [
      {
        content: `[:div.ltt-summary-page "${title}"]`,
        children: [
          {
            content: '## 📈 数据概览',
            children: [
              {
                content: '### 核心指标',
                children: [
                  { content: `活跃块数: ${data.blocks.total}` },
                  { content: `新建块: ${data.blocks.created}` },
                  { content: `修改块: ${data.blocks.modified}` },
                  { content: `完成任务: ${data.tasks.completed} / ${data.tasks.total}` },
                  { content: `任务完成率: ${data.tasks.completionRate}%` },
                  { content: `新增页面: ${data.pages.newPages}` },
                ]
              },
            ],
          },
          {
            content: '## 📈 活跃度热力图',
            children: [
              {
                content: ((): string => {
                  if (summaryType === 'weekly') {
                    return '{{renderer :heatmap, view=week, tag=Task}}'
                  } else if (summaryType === 'monthly') {
                    return '{{renderer :heatmap, view=month, tag=Task}}'
                  } else {
                    return '{{renderer :heatmap, view=year, tag=Task}}'
                  }
                })()
              },
            ],
          },
          {
            content: '## ✅ 任务回顾',
            children: [
              {
                content: '### 任务统计',
                children: [
                  {
                    content: `| 状态 | 数量 |
                              |------|------|
                              | 完成 | ${data.tasks.completed} |
                              | 进行中 | ${data.tasks.inProgress} |
                              | 待办 | ${data.tasks.todo} |
                              | 逾期 | ${data.tasks.overdue} |`
                  },
                ]
              },
              {
                content: '### 优先级分布',
                children: [
                  ...this.renderPriorityDistribution(data.tasks.byPriority)
                ],
              },
            ],
          },
          {
            content: '## 📝 内容分析',
            children: [
              {
                content: '### 热门标签',
                children: [
                  ...topTags.map(([tag, count]) => ({ content: `${tag} (${count})` }))
                ]
              },
              {
                content: '### 页面统计',
                children: [
                  { content: `总页面数: ${data.pages.total}` },
                  { content: `新增页面: ${data.pages.newPages}` },
                  { content: `修改页面: ${data.pages.modifiedPages}` },
                ]
              },
            ],
          },
          {
            content: aiSuggestions.length > 0 ? '## 🤖 AI 分析建议' : '## 💡 自动洞察',
            children: (aiSuggestions.length > 0 ? aiSuggestions : insights).length > 0
              ? (aiSuggestions.length > 0 ? aiSuggestions : insights).map((item) => ({ content: `- ${item}` }))
              : [{ content: '- 暂无额外洞察' }],
          },
        ],
      },
    ];
  }

  private getTitle(data: SummaryData, summaryType: SummaryType): string {
    const weekInfo = getISOWeekInfo(data.dateRange.start);
    const year = summaryType === 'weekly' ? weekInfo.year : data.dateRange.start.getFullYear();
    const weekNum = weekInfo.week;
    const monthName = data.dateRange.start.toLocaleDateString('zh-CN', { month: 'long' });

    if (summaryType === 'weekly') {
      return `📊 周度总结 - ${year}年第${weekNum}周`;
    } else if (summaryType === 'monthly') {
      return `📊 月度总结 - ${year}年${monthName}`;
    } else if (summaryType === 'yearly') {
      return `📊 年度总结 - ${year}年`;
    }
    return `📊 自定义总结`;
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
