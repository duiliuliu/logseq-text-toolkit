/**
 * Milestone Compact 样式
 */

import React, { useState } from 'react';
import { CheckCircle2, Clock, XCircle, SkipForward, Loader2 } from 'lucide-react';
import type { MilestoneItem, ColorScheme, MilestoneTooltipStyle } from '../../lib/milestone/types';
import { logseqAPI } from '../../../logseq';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../ui/Tooltip';
import { MilestoneTooltip as MilestoneTooltipContent } from '../MilestoneTooltip';

interface CompactMilestoneProps {
  items: MilestoneItem[];
  colorScheme?: ColorScheme;
  showLabels?: boolean;
  showProgress?: boolean;
  tooltipStyle?: MilestoneTooltipStyle;
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
  tooltipStyle = 'compact',
  onNodeClick,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

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
      case 'in_progress': return <Loader2 size={12} strokeWidth={2.5} className="ltt-milestone-spin-icon" />;
      case 'failed': return <XCircle size={12} strokeWidth={2.5} />;
      case 'skipped': return <SkipForward size={12} strokeWidth={2.5} />;
      case 'pending':
      default: return <Clock size={12} strokeWidth={2.5} />;
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
          <Tooltip open={hoveredItem === item.id}>
            <TooltipTrigger asChild>
              <div 
                className="ltt-milestone-compact-item"
                style={{ position: 'relative', cursor: item.blockUuid ? 'pointer' : 'default' }}
                onClick={() => handleNodeClick(item)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
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
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <MilestoneTooltipContent 
                item={item} 
                colorScheme={colorScheme} 
                tooltipStyle={tooltipStyle}
              />
            </TooltipContent>
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
