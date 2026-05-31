/**
 * Milestone Badge 样式
 */

import React, { useState } from 'react';
import type { MilestoneItem, ColorScheme, MilestoneTooltipStyle } from '../../lib/milestone/types';
import { logseqAPI } from '../../../logseq';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../ui/Tooltip';
import { MilestoneTooltip as MilestoneTooltipContent } from '../MilestoneTooltip';

interface BadgeMilestoneProps {
  items: MilestoneItem[];
  colorScheme?: ColorScheme;
  showLabels?: boolean;
  showProgress?: boolean;
  tooltipStyle?: MilestoneTooltipStyle;
  overallProgress?: number;
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

const BadgeMilestone: React.FC<BadgeMilestoneProps> = ({
  items,
  colorScheme = defaultColorScheme,
  showLabels = true,
  showProgress = true,
  tooltipStyle = 'compact',
  overallProgress = 0,
  onNodeClick,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleNodeClick = (item: MilestoneItem) => {
    if (item.blockUuid) {
      try {
        logseqAPI.Editor.openInRightSidebar(item.blockUuid);
      } catch (error) {
        console.error('[BadgeMilestone] Failed to open in right sidebar:', error);
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
      case 'completed': return '●';
      case 'in_progress': return '◐';
      case 'failed': return '✕';
      case 'skipped': return '~';
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
    <div className="ltt-milestone-badge">
      <div className="ltt-milestone-grid">
        {items.map((item) => (
          <Tooltip key={item.id} open={hoveredItem === item.id}>
            <TooltipTrigger asChild>
              <div 
                className={`ltt-milestone-badge-item ${item.status === 'in_progress' ? 'ltt-milestone-pulse-node' : ''}`}
                onClick={() => handleNodeClick(item)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{ position: 'relative', cursor: item.blockUuid ? 'pointer' : 'default' }}
              >
                <span 
                  className="ltt-milestone-symbol"
                  style={{ color: getNodeColor(item.status) }}
                >
                  {getNodeSymbol(item.status)}
                </span>
                {showLabels && (
                  <>
                    <div className="ltt-milestone-label">{item.label}</div>
                    <div 
                      className="ltt-milestone-sublabel"
                      style={{ color: getNodeColor(item.status) }}
                    >
                      {item.status === 'completed' ? '已完成' : 
                       item.status === 'in_progress' ? `进行中 ${item.progress || 0}%` : 
                       item.status === 'failed' ? '失败' : '待开始'}
                    </div>
                  </>
                )}
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
        ))}
      </div>
      
      {showProgress && (
        <div className="ltt-milestone-overall-progress">
          <div 
            className="ltt-milestone-progress-bar"
            style={{ width: `${overallProgress}%` }}
          />
          <span className="ltt-milestone-progress-label">
            {overallProgress}%
          </span>
        </div>
      )}
    </div>
  );
};

export default BadgeMilestone;
