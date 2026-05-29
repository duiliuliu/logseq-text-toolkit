/**
 * Milestone Badge 样式
 */

import React, { useState } from 'react';
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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'completed': return '已完成';
      case 'in_progress': return '进行中';
      case 'failed': return '失败';
      case 'pending':
      default: return '待开始';
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
          <div 
            key={item.id} 
            className="ltt-milestone-badge-item"
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            style={{ position: 'relative' }}
          >
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
            
            {/* Hover Tooltip */}
            {hoveredItem === item.id && (
              <div className="ltt-milestone-tooltip-badge">
                <div className="ltt-milestone-tooltip-label">{item.label}</div>
                {item.date && (
                  <div className="ltt-milestone-tooltip-date">时间: {item.date}</div>
                )}
                <div className="ltt-milestone-tooltip-status" style={{ color: getNodeColor(item.status) }}>
                  状态: {getStatusText(item.status)}
                </div>
                {item.progress !== undefined && (
                  <div className="ltt-milestone-tooltip-progress">进度: {item.progress}%</div>
                )}
              </div>
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
