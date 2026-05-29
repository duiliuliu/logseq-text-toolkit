/**
 * Milestone Card 样式
 */

import React, { useState } from 'react';
import type { MilestoneItem, ColorScheme } from '../../lib/milestone/types';

interface CardMilestoneProps {
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

const CardMilestone: React.FC<CardMilestoneProps> = ({
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

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'completed': return '✓';
      case 'in_progress': return '→';
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
    <div className="ltt-milestone-card-horizontal">
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <div 
            className="ltt-milestone-card-item-horizontal"
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div 
              className="ltt-milestone-card-content-horizontal"
              style={{ borderColor: getNodeColor(item.status) }}
            >
              <div 
                className="ltt-milestone-card-icon"
                style={{ color: getNodeColor(item.status) }}
              >
                {getStatusIcon(item.status)}
              </div>
              
              {showLabels && (
                <div className="ltt-milestone-card-info">
                  <div className="ltt-milestone-card-title-horizontal">
                    {item.label}
                  </div>
                  {item.date && (
                    <div className="ltt-milestone-card-date-horizontal">
                      {item.date}
                    </div>
                  )}
                  <div 
                    className="ltt-milestone-card-status-horizontal"
                    style={{ color: getNodeColor(item.status) }}
                  >
                    {getStatusText(item.status)}
                  </div>
                </div>
              )}
            </div>
            
            {/* Hover Tooltip */}
            {hoveredItem === item.id && (
              <div className="ltt-milestone-tooltip-horizontal">
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
          
          {index < items.length - 1 && (
            <div className="ltt-milestone-connector-horizontal" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CardMilestone;
