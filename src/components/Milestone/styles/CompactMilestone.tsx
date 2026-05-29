/**
 * Milestone Compact 样式
 */

import React from 'react';
import type { MilestoneItem, ColorScheme } from '../../lib/milestone/types';

interface CompactMilestoneProps {
  items: MilestoneItem[];
  colorScheme?: ColorScheme;
  showLabels?: boolean;
  showProgress?: boolean;
}

const defaultColorScheme: ColorScheme = {
  completed: '#10b981',
  inProgress: '#f59e0b',
  pending: '#d1d5db',
  failed: '#ef4444',
  background: '#ffffff',
  text: '#374151',
};

const CompactMilestone: React.FC<CompactMilestoneProps> = ({
  items,
  colorScheme = defaultColorScheme,
  showLabels = true,
  showProgress = true,
}) => {
  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'completed': return '✓';
      case 'in_progress': return '→';
      case 'failed': return '✕';
      case 'pending':
      default: return '·';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'completed': return '已完成';
      case 'in_progress': return '进行中';
      case 'failed': return '失败';
      case 'pending':
      default: return '待开始';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return colorScheme.completed;
      case 'in_progress': return colorScheme.inProgress;
      case 'failed': return colorScheme.failed;
      case 'pending':
      default: return colorScheme.pending;
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
    <div className="ltt-milestone-compact">
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <div 
            className="ltt-milestone-badge"
            data-status={item.status}
            style={{ backgroundColor: getStatusColor(item.status) }}
          >
            [{getStatusIcon(item.status)} {showLabels && item.label} {showProgress && `(${item.progress || 0}%)`}]
          </div>
          {index < items.length - 1 && (
            <span 
              className="ltt-milestone-connector"
              style={{ color: colorScheme.text, opacity: 0.4 }}
            >
              ───
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CompactMilestone;
