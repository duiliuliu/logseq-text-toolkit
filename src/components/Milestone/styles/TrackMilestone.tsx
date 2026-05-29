/**
 * Milestone Track 样式
 */

import React, { useState } from 'react';
import type { MilestoneItem, ColorScheme } from '../../lib/milestone/types';

interface TrackMilestoneProps {
  items: MilestoneItem[];
  colorScheme?: ColorScheme;
  showLabels?: boolean;
}

const defaultColorScheme: ColorScheme = {
  completed: '#10b981',
  inProgress: '#f59e0b',
  pending: '#d1d5db',
  failed: '#ef4444',
  background: '#ffffff',
  text: '#374151',
};

const TrackMilestone: React.FC<TrackMilestoneProps> = ({
  items,
  colorScheme = defaultColorScheme,
  showLabels = true,
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
    <div className="ltt-milestone-track-minimal">
      <div className="ltt-milestone-line-container">
        <div 
          className="ltt-milestone-line-bg"
          style={{ backgroundColor: colorScheme.pending }}
        />
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <div 
              className="ltt-milestone-dot" 
              data-status={item.status}
              style={{ backgroundColor: getNodeColor(item.status) }}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            />
            {hoveredItem === item.id && (
              <div className="ltt-milestone-tooltip-track">
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
            {index < items.length - 1 && (
              <div 
                className="ltt-milestone-segment" 
                style={{ 
                  backgroundColor: items[index + 1]?.status === 'completed' 
                    ? colorScheme.completed 
                    : colorScheme.pending 
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {showLabels && (
        <div className="ltt-milestone-labels">
          {items.map((item, index) => (
            <div 
              key={item.id} 
              className="ltt-milestone-label-item"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{ position: 'relative' }}
            >
              <span 
                className="ltt-milestone-time"
                style={{ color: colorScheme.text }}
              >
                {item.label}
              </span>
              {item.date && (
                <span 
                  className="ltt-milestone-desc"
                  style={{ color: colorScheme.text, opacity: 0.6 }}
                >
                  {item.date}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrackMilestone;
