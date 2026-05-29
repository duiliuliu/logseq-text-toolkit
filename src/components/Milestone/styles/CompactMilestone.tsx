/**
 * Milestone Compact 样式
 */

import React, { useState } from 'react';
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
  skipped: '#9ca3af',
  background: '#ffffff',
  text: '#374151',
};

const CompactMilestone: React.FC<CompactMilestoneProps> = ({
  items,
  colorScheme = defaultColorScheme,
  showLabels = true,
  showProgress = true,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'completed': return '✓';
      case 'in_progress': return '→';
      case 'failed': return '✕';
      case 'skipped': return '~';
      case 'pending':
      default: return '·';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'completed': return '已完成';
      case 'in_progress': return '进行中';
      case 'failed': return '失败';
      case 'skipped': return '已跳过';
      case 'pending':
      default: return '待开始';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return colorScheme.completed;
      case 'in_progress': return colorScheme.inProgress;
      case 'failed': return colorScheme.failed;
      case 'skipped': return colorScheme.skipped;
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
            style={{ backgroundColor: getStatusColor(item.status), position: 'relative' }}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            [{getStatusIcon(item.status)} {showLabels && item.label} {showProgress && `(${item.progress || 0}%)`}]
            
            {/* Hover Tooltip */}
            {hoveredItem === item.id && (
              <div className="ltt-milestone-tooltip-compact">
                <div className="ltt-milestone-tooltip-label">{item.label}</div>
                {item.date && (
                  <div className="ltt-milestone-tooltip-date">时间: {item.date}</div>
                )}
                <div className="ltt-milestone-tooltip-status" style={{ color: getStatusColor(item.status) }}>
                  状态: {getStatusText(item.status)}
                </div>
                {item.progress !== undefined && (
                  <div className="ltt-milestone-tooltip-progress">进度: {item.progress}%</div>
                )}
              </div>
            )}
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
