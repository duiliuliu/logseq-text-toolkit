/**
 * GTD 工作回顾模板
 * 增加 🤖 AI 结构化摘要渲染（aiInsights）
 */

import {
  TemplateType,
  SummaryTemplate,
  SummaryData,
  BlockNode,
  SummaryType,
} from '../types';
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

  render(data: SummaryData, params: Record<string, any> = {}): BlockNode[] {
    const topTags = this.analyzer.getTopTags(data.blocks.tags);
    const summaryType = params.summaryType || 'weekly';
    const title = this.getTitle(data, summaryType);

    const heatmapRenderer =
      summaryType === 'weekly'
        ? '{{renderer :heatmap week, tag=Task}}'
        : summaryType === 'monthly'
          ? '{{renderer :heatmap month, tag=Task}}'
          : '{{renderer :heatmap year, tag=Task}}';

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
                  { content: `创建块数: ${data.blocks.created}` },
                  { content: `完成任务: ${data.tasks.completed} / ${data.tasks.total}` },
                  { content: `任务完成率: ${(data.tasks.completionRate * 100).toFixed(1)}%` },
                  { content: `新增页面: ${data.pages.newPages}` },
                ],
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
| 逾期 | ${data.tasks.overdue} |`,
                  },
                ],
              },
              {
                content: '### 优先级分布',
                children: this.renderPriorityDistribution(data.tasks.byPriority),
              },
            ],
          },
          {
            content: '## 📝 内容分析',
            children: [
              {
                content: '### 热门标签',
                children: topTags.map(([tag, count]) => ({
                  content: `- ${tag} (${count})`,
                })),
              },
            ],
          },
          // 🤖 AI 摘要（新版）
          this.renderAISection(data),
          {
            content: '## 📈 活跃度热力图',
            children: [{ content: heatmapRenderer }],
          },
        ],
      },
    ];
  }

  /** 🤖 AI 摘要渲染（支持新版结构化 / 旧版 plain 两种） */
  private renderAISection(data: SummaryData): BlockNode {
    const insights = data.aiInsights;
    const hasNew =
      insights &&
      (insights.overview ||
        insights.highlights.length ||
        insights.nextActions.length);

    if (!hasNew) {
      return {
        content: '## 🤖 AI 分析建议',
        children: [
          {
            content:
              data.aiSuggestions && data.aiSuggestions.length
                ? data.aiSuggestions.map(s => `- ${s}`).join('\n')
                : '_未启用 AI 或暂未生成建议_',
          },
        ],
      };
    }

    const children: BlockNode[] = [];
    if (insights!.overview) {
      children.push({
        content: `### 概览\n- ${insights!.overview}`,
      });
    }
    if (insights!.highlights.length) {
      children.push({
        content: '### 亮点成就',
        children: insights!.highlights.map(s => ({ content: `- ${s}` })),
      });
    }
    if (insights!.improvements.length) {
      children.push({
        content: '### 改进建议',
        children: insights!.improvements.map(s => ({ content: `- ${s}` })),
      });
    }
    if (insights!.nextActions.length) {
      children.push({
        content: '### 下期行动',
        children: insights!.nextActions.map(s => ({ content: `- TODO ${s}` })),
      });
    }
    return { content: '## 🤖 AI 分析建议', children };
  }

  private getTitle(data: SummaryData, summaryType: SummaryType): string {
    const year = data.dateRange.start.getFullYear();
    const weekNum = this.analyzer.getWeekNumber(data.dateRange.start);
    const monthName = data.dateRange.start.toLocaleDateString('zh-CN', {
      month: 'long',
    });

    if (summaryType === 'weekly') {
      return `📊 周度总结 - ${year}年第${weekNum}周`;
    } else if (summaryType === 'monthly') {
      return `📊 月度总结 - ${year}年${monthName}`;
    } else if (summaryType === 'yearly') {
      return `📊 年度总结 - ${year}年`;
    }
    return `📊 自定义总结`;
  }

  private renderPriorityDistribution(
    byPriority: Record<string, number>,
  ): BlockNode[] {
    if (Object.keys(byPriority).length === 0) {
      return [{ content: '- 暂无优先级数据' }];
    }
    return Object.entries(byPriority).map(([priority, count]) => ({
      content: `- ${priority}: ${count} 个`,
    }));
  }
}
