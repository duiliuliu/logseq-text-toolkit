/**
 * Milestone Compact 样式
 */

import React from 'react';
import { CheckCircle2, Clock, XCircle, SkipForward, Loader2 } from 'lucide-react';
import type { MilestoneItem, ColorScheme } from '../../lib/milestone/types';
import { logseqAPI } from '../../../logseq';
import { Tooltip } from '../../ui';

interface CompactMilestoneProps {
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

const CompactMilestone: React.FC<CompactMilestoneProps> = ({
  items,
  colorScheme = defaultColorScheme,
  showLabels = true,
  showProgress = true,
  onNodeClick,
}) => {
  const handleNodeClick = (item: MilestoneItem) => {
    if (item.blockUuid) {
      try {
        logseqAPI.Editor.openInRightSidebar(item.blockUuid);
      } catch (error) {
        console.error('[CompactMilestone] Failed to open in right sidebar:', error);
      }
    }
    onNodeClick?.(item);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={12} strokeWidth={2.5} />;
      case 'inProgress': return <Loader2 size={12} strokeWidth={2.5} className="ltt-milestone-spin-icon" />;
      case 'failed': return <XCircle size={12} strokeWidth={2.5} />;
      case 'skipped': return <SkipForward size={12} strokeWidth={2.5} />;
      case 'pending':
      default: return <Clock size={12} strokeWidth={2.5} />;
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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return colorScheme.completed;
      case 'inProgress': return colorScheme.inProgress;
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
          <Tooltip
            side="bottom"
            sideOffset={4}
            content={
              <div className="ltt-milestone-compact-tooltip-content">
                <div className="ltt-milestone-compact-tooltip-label">{item.label}</div>
                {item.date && (
                  <div className="ltt-milestone-compact-tooltip-date">时间: {item.date}</div>
                )}
                <div className="ltt-milestone-compact-tooltip-status" style={{ color: getStatusColor(item.status) }}>
                  状态: {getStatusText(item.status)}
                </div>
                {item.progress !== undefined && (
                  <div className="ltt-milestone-compact-tooltip-progress">进度: {item.progress}%</div>
                )}
              </div>
            }
          >
            <div 
              className="ltt-milestone-compact-item"
              style={{ position: 'relative', cursor: item.blockUuid ? 'pointer' : 'default' }}
              onClick={() => handleNodeClick(item)}
            >
              <div className="ltt-milestone-compact-icon" style={{ color: getStatusColor(item.status) }}>
                {getStatusIcon(item.status)}
              </div>
              {showLabels && (
                <div className="ltt-milestone-compact-content">
                  <div className="ltt-milestone-compact-label">{item.label}</div>
                  <div 
                    className="ltt-milestone-compact-status"
                    style={{ color: getStatusColor(item.status) }}
                  >
                    {getStatusText(item.status)}
                    {showProgress && item.progress !== undefined && (
                      <span className="ltt-milestone-compact-progress"> ({item.progress}%)</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Tooltip>
          
          {/* 连接线 */}
          {index < items.length - 1 && (
            <div 
              className="ltt-milestone-compact-connector"
              style={{ backgroundColor: getStatusColor(item.status) }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CompactMilestone;
