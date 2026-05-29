/**
 * Milestone Card 样式
 */

import React from 'react';
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
      case 'completed': return '✓';
      case 'in_progress': return '→';
      case 'failed': return '✕';
      case 'pending':
      default: return '·';
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
    <div className="ltt-milestone-card">
      <div className="ltt-milestone-center-line" style={{ backgroundColor: colorScheme.pending }} />
      {items.map((item, index) => (
        <div 
          key={item.id} 
          className={`ltt-milestone-card-item ${index % 2 === 0 ? 'top' : 'bottom'}`}
        >
          <div 
            className="ltt-milestone-card-content"
            style={{ borderColor: getNodeColor(item.status) }}
          >
            <div 
              className="ltt-milestone-card-title"
              style={{ color: colorScheme.text }}
            >
              {showLabels && (
                <>
                  <span>{getStatusText(item.status)} {item.label}</span>
                  {item.date && (
                    <span className="ltt-milestone-card-date">{item.date}</span>
                  )}
                </>
              )}
            </div>
          </div>
          <div 
            className={`ltt-milestone-arrow ${index % 2 === 0 ? 'down' : 'up'}`}
            style={{ 
              borderTopColor: index % 2 === 0 ? colorScheme.pending : 'transparent',
              borderBottomColor: index % 2 !== 0 ? colorScheme.pending : 'transparent',
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default CardMilestone;
