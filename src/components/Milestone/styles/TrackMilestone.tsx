/**
 * Milestone Track 样式
 */

import React from 'react';
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
  const getNodeColor = (status: string): string => {
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
            />
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
            <div key={item.id} className="ltt-milestone-label-item">
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
