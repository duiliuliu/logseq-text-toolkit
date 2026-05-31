/**
 * Milestone Track 样式
 */

import React from 'react';
import type { MilestoneItem, ColorScheme, MilestoneTooltipStyle } from '../../lib/milestone/types';
import { logseqAPI } from '../../../logseq';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../ui/Tooltip';
import { MilestoneTooltip as MilestoneTooltipContent } from '../MilestoneTooltip';

interface TrackMilestoneProps {
  items: MilestoneItem[];
  colorScheme?: ColorScheme;
  showLabels?: boolean;
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

const TrackMilestone: React.FC<TrackMilestoneProps> = ({
  items,
  colorScheme = defaultColorScheme,
  showLabels = true,
  tooltipStyle = 'compact',
  onNodeClick,
}) => {
  const handleNodeClick = (item: MilestoneItem) => {
    if (item.blockUuid) {
      try {
        logseqAPI.Editor.openInRightSidebar(item.blockUuid);
      } catch (error) {
        console.error('[TrackMilestone] Failed to open in right sidebar:', error);
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
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="ltt-milestone-dot" 
                  data-status={item.status}
                  style={{ backgroundColor: getNodeColor(item.status), cursor: item.blockUuid ? 'pointer' : 'default' }}
                  onClick={() => handleNodeClick(item)}
                />
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={4}>
                <MilestoneTooltipContent 
                  item={item} 
                  colorScheme={colorScheme} 
                  tooltipStyle={tooltipStyle}
                />
              </TooltipContent>
            </Tooltip>
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
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <div 
                  className="ltt-milestone-label-item"
                  onClick={() => handleNodeClick(item)}
                  style={{ position: 'relative', cursor: item.blockUuid ? 'pointer' : 'default' }}
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
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4}>
                <MilestoneTooltipContent 
                  item={item} 
                  colorScheme={colorScheme} 
                  tooltipStyle={tooltipStyle}
                />
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrackMilestone;
