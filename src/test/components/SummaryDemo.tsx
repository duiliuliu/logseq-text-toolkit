import React, { useState } from 'react';
import { SummaryType, TemplateType } from '../../lib/summary/types';
import { getAllTemplates } from '../../lib/summary/templates';
import { PageGenerator } from '../../lib/summary/PageGenerator';
import logger from '../../lib/logger';
import './SummaryDemo.css';

const summaryTypes: { value: SummaryType; label: string }[] = [
  { value: 'weekly', label: '周度总结' },
  { value: 'monthly', label: '月度总结' },
  { value: 'yearly', label: '年度总结' },
  { value: 'custom', label: '自定义' },
];

interface SummaryDemoProps {
  onGenerateSuccess?: (pageName: string, blocks: any[]) => void;
}

export const SummaryDemo: React.FC<SummaryDemoProps> = ({ onGenerateSuccess }) => {
  const [summaryType, setSummaryType] = useState<SummaryType>('weekly');
  const [templateType, setTemplateType] = useState<TemplateType>('gtd-work-review');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [showResult, setShowResult] = useState(false);

  const templates = getAllTemplates();

  const handleGenerate = async () => {
    setIsGenerating(true);
    logger.info('[SummaryDemo] 开始生成总结', { summaryType, templateType });
    
    try {
      const generator = new PageGenerator();
      let start: Date | undefined;
      let end: Date | undefined;

      if (summaryType === 'custom' && customStart && customEnd) {
        start = new Date(customStart);
        end = new Date(customEnd);
        logger.debug('[SummaryDemo] 自定义时间范围', { start, end });
      }

      const pageName = await generator.generate(
        templateType,
        summaryType,
        start,
        end
      );

      if (pageName) {
        logger.info('[SummaryDemo] 总结生成成功', { pageName });
        
        // 按照设计方案生成完整的内容结构
        const mockBlocks = [
          {
            id: 'block-0',
            content: `[:div.ltt-summary-page "📊 周度总结 - 2026年第20周"]`,
            level: 0
          },
          {
            id: 'block-1',
            content: '## 📈 数据概览',
            level: 1,
            children: [
              { id: 'block-1-1', content: '### 核心指标', level: 2 },
              { id: 'block-1-2', content: '- 创建块数: 156', level: 3 },
              { id: 'block-1-3', content: '- 完成任务: 28 / 35', level: 3 },
              { id: 'block-1-4', content: '- 活跃天数: 6 / 7', level: 3 },
              { id: 'block-1-5', content: '- 新增页面: 12', level: 3 },
            ]
          },
          {
            id: 'block-2',
            content: '## 📈 活跃度热力图',
            level: 1,
            children: [
              { id: 'block-2-1', content: '{{renderer :heatmap :week :tag=work}}', level: 2 },
            ]
          },
          {
            id: 'block-3',
            content: '## ✅ 任务回顾',
            level: 1,
            children: [
              { id: 'block-3-1', content: '### 完成任务清单', level: 2 },
              { id: 'block-3-2', content: '- [x] 完成项目A设计', level: 3 },
              { id: 'block-3-3', content: '- [x] 代码评审', level: 3 },
              { id: 'block-3-4', content: '- [x] 团队周会', level: 3 },
              { id: 'block-3-5', content: '### 任务统计', level: 2 },
              { id: 'block-3-6', content: '| 状态 | 数量 |', level: 3 },
              { id: 'block-3-7', content: '|------|------|', level: 3 },
              { id: 'block-3-8', content: '| 完成 | 28 |', level: 3 },
              { id: 'block-3-9', content: '| 进行中 | 5 |', level: 3 },
              { id: 'block-3-10', content: '| 待办 | 2 |', level: 3 },
              { id: 'block-3-11', content: '### 优先级分布', level: 2 },
              { id: 'block-3-12', content: '- A: 8', level: 3 },
              { id: 'block-3-13', content: '- B: 12', level: 3 },
              { id: 'block-3-14', content: '- C: 7', level: 3 },
            ]
          },
          {
            id: 'block-4',
            content: '## 📝 内容分析',
            level: 1,
            children: [
              { id: 'block-4-1', content: '### 热门标签', level: 2 },
              { id: 'block-4-2', content: '- [[工作]] (45)', level: 3 },
              { id: 'block-4-3', content: '- [[学习]] (28)', level: 3 },
              { id: 'block-4-4', content: '- [[项目A]] (22)', level: 3 },
              { id: 'block-4-5', content: '### 页面分布', level: 2 },
              { id: 'block-4-6', content: '- 工作笔记: 8页', level: 3 },
              { id: 'block-4-7', content: '- 学习笔记: 4页', level: 3 },
              { id: 'block-4-8', content: '- 会议记录: 3页', level: 3 },
            ]
          },
          {
            id: 'block-5',
            content: '## 🤖 AI 分析建议',
            level: 1,
            children: [
              { id: 'block-5-1', content: '> 本周任务完成率较高，建议继续保持。', level: 2 },
              { id: 'block-5-2', content: '> 学习时间较上周有所增加，继续保持。', level: 2 },
              { id: 'block-5-3', content: '> 建议关注B优先级任务，避免延误。', level: 2 },
            ]
          },
        ];

        setGeneratedContent(mockBlocks);
        setShowResult(true);
        onGenerateSuccess?.(pageName, mockBlocks);
        logger.debug('[SummaryDemo] 展示生成的内容', { pageName, blocksCount: mockBlocks.length });
      }
    } catch (error) {
      logger.error('[SummaryDemo] 生成总结失败', error);
      alert('生成总结失败，请查看控制台');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderBlock = (block: any, indent: number = 0) => {
    const indentStyle = { marginLeft: `${indent * 20}px` };
    return (
      <div key={block.id} className="summary-block" style={indentStyle}>
        <div className="summary-block-content">
          {block.content}
        </div>
        {block.children?.map((child: any) => renderBlock(child, indent + 1))}
      </div>
    );
  };

  return (
    <div className="summary-demo">
      <h2>📋 Summary 生成器</h2>

      <div className="summary-config">
        <div className="config-group">
          <label>总结类型</label>
          <select
            value={summaryType}
            onChange={(e) => setSummaryType(e.target.value as SummaryType)}
          >
            {summaryTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {summaryType === 'custom' && (
          <div className="config-row">
            <div className="config-group">
              <label>开始日期</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
            </div>
            <div className="config-group">
              <label>结束日期</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="config-group">
          <label>模板</label>
          <select
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value as TemplateType)}
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.description}
              </option>
            ))}
          </select>
        </div>

        <button
          className="generate-btn"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? '生成中...' : '生成总结'}
        </button>
      </div>

      {showResult && (
        <div className="summary-result">
          <div className="result-header">
            <h3>✅ 生成成功！</h3>
            <button onClick={() => setShowResult(false)}>关闭</button>
          </div>
          <div className="result-content">
            <div className="summary-stats-grid">
              <div className="summary-stat-card">
                <div className="summary-stat-value">156</div>
                <div className="summary-stat-label">创建块数</div>
              </div>
              <div className="summary-stat-card">
                <div className="summary-stat-value">28/35</div>
                <div className="summary-stat-label">完成任务</div>
              </div>
              <div className="summary-stat-card">
                <div className="summary-stat-value">6/7</div>
                <div className="summary-stat-label">活跃天数</div>
              </div>
              <div className="summary-stat-card">
                <div className="summary-stat-value">12</div>
                <div className="summary-stat-label">新增页面</div>
              </div>
            </div>

            {generatedContent.map((block) => renderBlock(block))}
          </div>
        </div>
      )}
    </div>
  );
};
