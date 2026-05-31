/**
 * Milestone Timeline Track 样式
 */

import React, { useState } from 'react';
import { CheckCircle2, Clock, XCircle, SkipForward, Loader2 } from 'lucide-react';
import type { MilestoneItem, ColorScheme } from '../../lib/milestone/types';
import { logseqAPI } from '../../../logseq';

interface TimelineTrackMilestoneProps {
  items: MilestoneItem[];
  colorScheme?: ColorScheme;
  showLabels?: boolean;
  showProgress?: boolean;
  onNodeClick?: (item: MilestoneItem) => void;
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

const TimelineTrackMilestone: React.FC<TimelineTrackMilestoneProps> = ({
  items,
  colorScheme = defaultColorScheme,
  showLabels = true,
  showProgress = true,
  onNodeClick,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleNodeClick = (item: MilestoneItem) => {
    if (item.blockUuid) {
      try {
        logseqAPI.Editor.openInRightSidebar(item.blockUuid);
      } catch (error) {
        console.error('[TimelineTrackMilestone] Failed to open in right sidebar:', error);
      }
    }
    onNodeClick?.(item);
  };

  const getNodeColor = (status: string): string => {
    switch (status) {
      case 'completed': return colorScheme.completed;
      case 'inProgress': return colorScheme.inProgress;
      case 'failed': return colorScheme.failed;
      case 'skipped': return colorScheme.skipped;
      case 'pending':
      default: return colorScheme.pending;
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'completed': return '已完成';
      case 'inProgress': return '进行中';
      case 'failed': return '失败';
      case 'skipped': return '已跳过';
      case 'pending':
      default: return '待开始';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={20} strokeWidth={2.5} />;
      case 'inProgress': return <Loader2 size={20} strokeWidth={2.5} className="ltt-milestone-spin-icon" />;
      case 'failed': return <XCircle size={20} strokeWidth={2.5} />;
      case 'skipped': return <SkipForward size={20} strokeWidth={2.5} />;
      case 'pending':
      default: return <Clock size={20} strokeWidth={2.5} />;
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
    <div className="ltt-milestone-timeline-track">
      <div className="ltt-milestone-timeline-track-inner">
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <div className="ltt-milestone-timeline-node-wrapper">
              {/* 前连接线 */}
              {index > 0 && (
                <div 
                  className="ltt-milestone-timeline-connector ltt-milestone-timeline-connector-left"
                  style={{ 
                    backgroundColor: getNodeColor(items[index - 1].status) 
                  }}
                />
              )}
              
              {/* 节点 */}
              <div 
                className={`ltt-milestone-timeline-node ${item.status === 'inProgress' ? 'ltt-milestone-timeline-node-active' : ''}`}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => handleNodeClick(item)}
                style={{ cursor: item.blockUuid ? 'pointer' : 'default' }}
              >
                <div 
                  className="ltt-milestone-timeline-icon-wrapper"
                  style={{ 
                    backgroundColor: item.status === 'completed' ? getNodeColor(item.status) : 'transparent',
                    borderColor: getNodeColor(item.status)
                  }}
                >
                  <div 
                    className="ltt-milestone-timeline-icon"
                    style={{ 
                      color: item.status === 'completed' ? '#ffffff' : getNodeColor(item.status) 
                    }}
                  >
                    {getStatusIcon(item.status)}
                  </div>
                </div>
                
                {showLabels && (
                  <div className="ltt-milestone-timeline-content">
                    <div className="ltt-milestone-timeline-label">{item.label}</div>
                    <div 
                      className="ltt-milestone-timeline-status"
                      style={{ color: getNodeColor(item.status) }}
                    >
                      {getStatusText(item.status)}
                      {showProgress && item.progress !== undefined && (
                        <span> ({item.progress}%)</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* 后连接线 */}
              {index < items.length - 1 && (
                <div 
                  className="ltt-milestone-timeline-connector ltt-milestone-timeline-connector-right"
                  style={{ 
                    backgroundColor: getNodeColor(item.status) 
                  }}
                />
              )}
            </div>
            
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
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TimelineTrackMilestone;
