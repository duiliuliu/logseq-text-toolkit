/**
 * Milestone Demo 演示组件
 */

import React, { useState } from 'react';
import { Milestone } from '../../../components/Milestone';
import type { MilestoneItem, MilestoneData, MilestoneDisplayStyle, ColorScheme } from '../../../lib/milestone/types';

const mockInterviewData: MilestoneData = {
  items: [
    { id: '1', label: '投递简历', status: 'completed', progress: 100, date: '2026-05-01' },
    { id: '2', label: 'HR筛选', status: 'completed', progress: 100, date: '2026-05-05' },
    { id: '3', label: '技术一面', status: 'completed', progress: 100, date: '2026-05-10' },
    { id: '4', label: '技术二面', status: 'in_progress', progress: 60, date: '2026-05-20' },
    { id: '5', label: '终面', status: 'pending', progress: 0, date: '2026-05-25' },
    { id: '6', label: 'Offer', status: 'pending', progress: 0 },
  ],
  totalCount: 6,
  completedCount: 3,
  inProgressCount: 1,
  pendingCount: 2,
  overallProgress: 50,
};

const mockProjectData: MilestoneData = {
  items: [
    { id: '1', label: '需求分析', status: 'completed', progress: 100, date: '2026-04-01' },
    { id: '2', label: '系统设计', status: 'completed', progress: 100, date: '2026-04-15' },
    { id: '3', label: '开发阶段', status: 'in_progress', progress: 45, date: '2026-05-15' },
    { id: '4', label: '测试验收', status: 'pending', progress: 0, date: '2026-05-25' },
    { id: '5', label: '上线发布', status: 'pending', progress: 0, date: '2026-06-01' },
  ],
  totalCount: 5,
  completedCount: 2,
  inProgressCount: 1,
  pendingCount: 2,
  overallProgress: 40,
};

const defaultColorScheme: ColorScheme = {
  completed: '#10b981',
  inProgress: '#f59e0b',
  pending: '#d1d5db',
  failed: '#ef4444',
  background: '#ffffff',
  text: '#374151',
};

const styles: MilestoneDisplayStyle[] = ['capsule', 'badge', 'track', 'card', 'compact'];

const styleLabels: Record<MilestoneDisplayStyle, string> = {
  capsule: '胶囊',
  badge: '徽标',
  track: '轨道',
  card: '卡片',
  compact: '紧凑',
};

const MilestoneDemo: React.FC = () => {
  const [selectedStyle, setSelectedStyle] = useState<MilestoneDisplayStyle>('capsule');
  const [showProgress, setShowProgress] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedData, setSelectedData] = useState<'interview' | 'project'>('interview');

  const currentData = selectedData === 'interview' ? mockInterviewData : mockProjectData;

  return (
    <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 16px 0' }}>🎯 Milestone 里程碑组件演示</h3>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontWeight: 500 }}>数据源：</span>
        <button
          onClick={() => setSelectedData('interview')}
          style={{
            padding: '4px 12px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: selectedData === 'interview' ? '#3b82f6' : '#e5e7eb',
            color: selectedData === 'interview' ? 'white' : '#374151',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          面试流程
        </button>
        <button
          onClick={() => setSelectedData('project')}
          style={{
            padding: '4px 12px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: selectedData === 'project' ? '#3b82f6' : '#e5e7eb',
            color: selectedData === 'project' ? 'white' : '#374151',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          项目进度
        </button>
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontWeight: 500 }}>样式：</span>
        {styles.map((style) => (
          <button
            key={style}
            onClick={() => setSelectedStyle(style)}
            style={{
              padding: '4px 12px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: selectedStyle === style ? '#10b981' : '#e5e7eb',
              color: selectedStyle === style ? 'white' : '#374151',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            {styleLabels[style]}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
          />
          显示标签
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showProgress}
            onChange={(e) => setShowProgress(e.target.checked)}
          />
          显示进度
        </label>
      </div>

      <div style={{ 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px', 
        padding: '16px',
        backgroundColor: 'white',
      }}>
        <div style={{ marginBottom: '8px', fontSize: '14px', color: '#6b7280' }}>
          宏命令：<code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
            {'{{renderer :milestone, style=' + selectedStyle + ', list=' + currentData.items.map(i => i.label).join(';') + '}}'}
          </code>
        </div>
        
        <Milestone
          data={currentData}
          config={{
            style: selectedStyle,
            showLabels,
            showProgress,
            colorScheme: defaultColorScheme,
          }}
        />
      </div>

      <div style={{ marginTop: '16px', fontSize: '13px', color: '#6b7280' }}>
        <strong>说明：</strong>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>面试流程示例展示了不同阶段的进度状态</li>
          <li>项目进度示例展示了软件开发的标准流程</li>
          <li>支持 5 种展示样式：胶囊、徽标、轨道、卡片、紧凑</li>
          <li>状态计算基于 scheduled 日期：已过→已完成，未来→进行中</li>
        </ul>
      </div>
    </div>
  );
};

export default MilestoneDemo;
