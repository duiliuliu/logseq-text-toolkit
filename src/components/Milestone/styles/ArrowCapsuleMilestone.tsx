/**
 * Milestone Arrow Capsule 样式 - 箭头胶囊
 */

import React, { useState } from 'react';
import type { MilestoneItem, ColorScheme, MilestoneTooltipStyle } from '../../lib/milestone/types';
import { logseqAPI } from '../../../logseq';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../ui/Tooltip';
import { MilestoneTooltip as MilestoneTooltipContent } from '../MilestoneTooltip';

interface ArrowCapsuleMilestoneProps {
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

const ArrowCapsuleMilestone: React.FC<ArrowCapsuleMilestoneProps> = ({
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
        console.error('[ArrowCapsuleMilestone] Failed to open in right sidebar:', error);
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

  const getNodeIcon = (status: string): string => {
    switch (status) {
      case 'completed': return '✓';
      case 'in_progress': return '⏳';
      case 'failed': return '✕';
      case 'skipped': return '≈';
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
    <div className="ltt-milestone-arrow-capsule">
      <div className="ltt-milestone-arrow-track">
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <Tooltip open={hoveredItem === item.id}>
              <TooltipTrigger asChild>
                <div
                  className={`ltt-milestone-arrow-node ${item.status === 'in_progress' ? 'ltt-milestone-arrow-node-active' : ''}`}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => handleNodeClick(item)}
                  style={{
                    cursor: item.blockUuid ? 'pointer' : 'default' }}
                >
                  <div 
                    className="ltt-milestone-arrow-icon-wrapper"
                    style={{ borderColor: getNodeColor(item.status), backgroundColor: item.status === 'completed' ? getNodeColor(item.status) : 'transparent' }}
                  >
                    <span 
                      className="ltt-milestone-arrow-icon"
                      style={{ 
                        color: item.status === 'completed' ? '#ffffff' : getNodeColor(item.status) }}
                    >
                      {getNodeIcon(item.status)}
                    </span>
                  </div>

                  {showLabels && (
                    <div className="ltt-milestone-arrow-content">
                      <div className="ltt-milestone-arrow-label">{item.label}</div>
                      <div 
                        className="ltt-milestone-arrow-status"
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
              <div className="ltt-milestone-arrow-connector">
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ArrowCapsuleMilestone;
