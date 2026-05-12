import React, { useState } from 'react';
import { SummaryType, TemplateType } from '../../lib/summary/types';
import { getAllTemplates } from '../../lib/summary/templates';
import { PageGenerator } from '../../lib/summary/PageGenerator';
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
    try {
      const generator = new PageGenerator();
      let start: Date | undefined;
      let end: Date | undefined;

      if (summaryType === 'custom' && customStart && customEnd) {
        start = new Date(customStart);
        end = new Date(customEnd);
      }

      const pageName = await generator.generate(
        templateType,
        summaryType,
        start,
        end
      );

      if (pageName) {
        // 在 testAPP 中模拟展示生成的内容
        const mockBlocks = [
          {
            id: 'block-1',
            content: `# ${pageName}`,
            level: 1,
            children: [
              {
                id: 'block-1-1',
                content: '## 📊 数据概览',
                level: 2,
                children: [
                  { id: 'block-1-1-1', content: '- 创建块数: 15', level: 3 },
                  { id: 'block-1-1-2', content: '- 完成任务: 7 / 12', level: 3 },
                  { id: 'block-1-1-3', content: '- 任务完成率: 58%', level: 3 },
                  { id: 'block-1-1-4', content: '- 新增页面: 2', level: 3 },
                ],
              },
              {
                id: 'block-1-2',
                content: '## 🏷️ 热门标签',
                level: 2,
                children: [
                  { id: 'block-1-2-1', content: '- #task: 8', level: 3 },
                  { id: 'block-1-2-2', content: '- #project: 5', level: 3 },
                  { id: 'block-1-2-3', content: '- #note: 3', level: 3 },
                ],
              },
            ],
          },
        ];

        setGeneratedContent(mockBlocks);
        setShowResult(true);
        onGenerateSuccess?.(pageName, mockBlocks);
      }
    } catch (error) {
      console.error('Generate summary failed:', error);
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
            {generatedContent.map((block) => renderBlock(block))}
          </div>
        </div>
      )}
    </div>
  );
};
