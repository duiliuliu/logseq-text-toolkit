/**
 * Milestone Capsule 样式
 */

import React, { useState } from 'react';
import type { MilestoneItem, ColorScheme, MilestoneDisplayStyle, MilestoneTooltipStyle } from '../../lib/milestone/types';
import { logseqAPI } from '../../../logseq';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../ui/Tooltip';
import { MilestoneTooltip as MilestoneTooltipContent } from '../MilestoneTooltip';

interface CapsuleMilestoneProps {
  items: MilestoneItem[];
  colorScheme?: ColorScheme;
  showLabels?: boolean;
  showProgress?: boolean;
  style?: MilestoneDisplayStyle;
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

const CapsuleMilestone: React.FC<CapsuleMilestoneProps> = ({
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
        console.error('[CapsuleMilestone] Failed to open in right sidebar:', error);
      }
    }
    onNodeClick?.(item);
  };

  const getNodeColor = (status: string): string => {
    switch (status) {
      case 'completed': return colorScheme.completed;
      case 'in_progress': return colorScheme.inProgress;
      case 'failed': return colorScheme.failed;
      case 'skipped': return colorScheme.skipped;
      case 'pending':
      default: return colorScheme.pending;
    }
  };

  const getNodeSymbol = (status: string): string => {
    switch (status) {
      case 'completed': return '✓';
      case 'in_progress': return '→';
      case 'failed': return '✕';
      case 'skipped': return '~';
      case 'pending':
      default: return '○';
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
            <Tooltip open={hoveredItem === item.id}>
              <TooltipTrigger asChild>
                <div 
                  className={`ltt-milestone-node ${item.status === 'in_progress' ? 'ltt-milestone-pulse-node' : ''}`}
                  onClick={() => handleNodeClick(item)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{ cursor: item.blockUuid ? 'pointer' : 'default' }}
                >
                  <span 
                    className="ltt-milestone-symbol"
                    style={{ color: getNodeColor(item.status) }}
                  >
                    {getNodeSymbol(item.status)}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <MilestoneTooltipContent 
                  item={item} 
                  colorScheme={colorScheme} 
                  tooltipStyle={tooltipStyle}
                />
              </TooltipContent>
            </Tooltip>
            
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
