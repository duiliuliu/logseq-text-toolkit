import { TemplateType, SummaryTemplate, SummaryData, BlockNode, SummaryType } from '../types';
import { DataAnalyzer } from '../DataAnalyzer';

export class StudySummaryTemplate implements SummaryTemplate {
  id: TemplateType = 'study-summary';
  name = '学习总结';
  description = '学习进度和成果的总结模板';
  supportedTypes: SummaryType[] = ['weekly', 'monthly'];

  private analyzer: DataAnalyzer;

  constructor() {
    this.analyzer = new DataAnalyzer();
  }

  render(data: SummaryData, params: Record<string, any>): BlockNode[] {
    const dateRangeStr = this.analyzer.formatDateRange(data.dateRange);
    const topTags = this.analyzer.getTopTags(data.blocks.tags, 5);
    const studyTopics = params.topics || ['编程', '英语', '阅读', '数学'];

    return [
      {
        content: `[:div.ltt-summary-page "📚 ${dateRangeStr} 学习总结"]`,
        children: [
          {
            content: '## 📊 学习概览',
            children: [
              { content: `- 时间段: ${dateRangeStr}` },
              { content: `- 学习记录数: ${data.blocks.total}` },
            ],
          },
          {
            content: '## 📖 学习主题',
            children: studyTopics.map((topic, index) => ({
              content: `### ${index + 1}. ${topic}`,
              children: [
                { content: '- 学习内容:' },
                { content: '- 关键知识点:' },
                { content: '- 待复习:' },
              ],
            })),
          },
          {
            content: '## ✅ 学习任务',
            children: [
              { content: `| 状态 | 数量 |` },
              { content: `|------|------|` },
              { content: `| 完成 | ${data.tasks.completed} |` },
              { content: `| 进行中 | ${data.tasks.inProgress} |` },
              { content: `| 待办 | ${data.tasks.todo} |` },
            ],
          },
          {
            content: '## 🏷️ 知识标签',
            children: topTags.map(([tag, count]) => ({
              content: `- #${tag}: ${count}`,
            })),
          },
          {
            content: '## 💡 学习心得',
            children: [
              { content: '- 本周学到的最重要的知识点:' },
              { content: '- 遇到的难点和解决方法:' },
              { content: '- 下一步学习计划:' },
            ],
          },
          {
            content: '## 🎯 学习目标',
            children: [
              { content: '- [ ] 完成课程章节' },
              { content: '- [ ] 练习项目' },
              { content: '- [ ] 复习巩固' },
            ],
          },
        ],
      },
    ];
  }
}
