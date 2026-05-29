/**
 * Milestone Badge 样式
 */

import React from 'react';
import type { MilestoneItem, ColorScheme, MilestoneDisplayStyle } from '../../lib/milestone/types';

interface BadgeMilestoneProps {
  items: MilestoneItem[];
  colorScheme?: ColorScheme;
  showLabels?: boolean;
  showProgress?: boolean;
  overallProgress?: number;
}

const defaultColorScheme: ColorScheme = {
  completed: '#10b981',
  inProgress: '#f59e0b',
  pending: '#d1d5db',
  failed: '#ef4444',
  background: '#ffffff',
  text: '#374151',
};

const BadgeMilestone: React.FC<BadgeMilestoneProps> = ({
  items,
  colorScheme = defaultColorScheme,
  showLabels = true,
  showProgress = true,
  overallProgress = 0,
}) => {
  const getNodeColor = (status: string): string => {
    switch (status) {
      case 'completed': return colorScheme.completed;
      case 'in_progress': return colorScheme.inProgress;
      case 'failed': return colorScheme.failed;
      case 'pending':
      default: return colorScheme.pending;
    }
  };

  const getNodeSymbol = (status: string): string => {
    switch (status) {
      case 'completed': return '●';
      case 'in_progress': return '◐';
      case 'failed': return '✕';
      case 'pending':
      default: return '○';
    }
  };

  if (items.length === 0) {
    return (
      <div className="ltt-milestone-empty">
        <span style={{ color: colorScheme.text, opacity: 0.6 }}>暂无里程碑数据</span>
      </div>
    );
  }

  return (
    <div className="ltt-milestone-badge">
      <div className="ltt-milestone-grid">
        {items.map((item, index) => (
          <div key={item.id} className="ltt-milestone-badge-item">
            <div className="ltt-milestone-badge-number">
              {String(index + 1).padStart(2, '0')}
            </div>
            <span 
              className="ltt-milestone-symbol"
              style={{ color: getNodeColor(item.status) }}
            >
              {getNodeSymbol(item.status)}
            </span>
            {showLabels && (
              <>
                <div className="ltt-milestone-label">{item.label}</div>
                <div 
                  className="ltt-milestone-sublabel"
                  style={{ color: getNodeColor(item.status) }}
                >
                  {item.status === 'completed' ? '已完成' : 
                   item.status === 'in_progress' ? `进行中 ${item.progress || 0}%` : 
                   item.status === 'failed' ? '失败' : '待开始'}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      
      {showProgress && (
        <div className="ltt-milestone-overall-progress">
          <div 
            className="ltt-milestone-progress-bar"
            style={{ width: `${overallProgress}%` }}
          />
          <span className="ltt-milestone-progress-label">
            {overallProgress}%
          </span>
        </div>
      )}
    </div>
  );
};

export default BadgeMilestone;
