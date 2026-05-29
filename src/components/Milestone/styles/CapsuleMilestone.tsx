/**
 * Milestone Capsule 样式
 */

import React, { useState } from 'react';
import type { MilestoneItem, ColorScheme, MilestoneDisplayStyle } from '../../lib/milestone/types';

interface CapsuleMilestoneProps {
  items: MilestoneItem[];
  colorScheme?: ColorScheme;
  showLabels?: boolean;
  showProgress?: boolean;
  style?: MilestoneDisplayStyle;
}

const defaultColorScheme: ColorScheme = {
  completed: '#10b981',
  inProgress: '#f59e0b',
  pending: '#d1d5db',
  failed: '#ef4444',
  background: '#ffffff',
  text: '#374151',
};

const CapsuleMilestone: React.FC<CapsuleMilestoneProps> = ({
  items,
  colorScheme = defaultColorScheme,
  showLabels = true,
  showProgress = true,
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
      case 'completed': return '✓';
      case 'in_progress': return '→';
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
    <div className="ltt-milestone-capsule">
      <div className="ltt-milestone-track">
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <div 
              className="ltt-milestone-node"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <span 
                className="ltt-milestone-symbol"
                style={{ color: getNodeColor(item.status) }}
              >
                {getNodeSymbol(item.status)}
              </span>
              
              {/* Hover Tooltip */}
              {hoveredItem === item.id && (
                <div className="ltt-milestone-tooltip">
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
              <div 
                className="ltt-milestone-line-dashed"
                style={{ 
                  borderColor: items[index + 1]?.status === 'completed' 
                    ? colorScheme.completed 
                    : colorScheme.pending 
                }}
              />
            )}
            
            {showLabels && (
              <div className="ltt-milestone-info">
                <div className="ltt-milestone-label">{item.label}</div>
                <div 
                  className="ltt-milestone-status"
                  style={{ color: getNodeColor(item.status) }}
                >
                  {getStatusText(item.status)}
                  {showProgress && item.progress !== undefined && (
                    <span> ({item.progress}%)</span>
                  )}
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CapsuleMilestone;
