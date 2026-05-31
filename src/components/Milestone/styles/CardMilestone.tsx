/**
 * Milestone Card 样式
 */

import React, { useState } from 'react';
import { CheckCircle2, Clock, XCircle, SkipForward, Loader2 } from 'lucide-react';
import type { MilestoneItem, ColorScheme, MilestoneTooltipStyle } from '../../lib/milestone/types';
import { logseqAPI } from '../../../logseq';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../ui/Tooltip';
import { MilestoneTooltip as MilestoneTooltipContent } from '../MilestoneTooltip';

interface CardMilestoneProps {
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

const CardMilestone: React.FC<CardMilestoneProps> = ({
  items,
  colorScheme = defaultColorScheme,
  showLabels = true,
  tooltipStyle = 'compact',
  onNodeClick,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleNodeClick = (item: MilestoneItem) => {
    if (item.blockUuid) {
      try {
        logseqAPI.Editor.openInRightSidebar(item.blockUuid);
      } catch (error) {
        console.error('[CardMilestone] Failed to open in right sidebar:', error);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={16} strokeWidth={2.5} />;
      case 'in_progress': return <Loader2 size={16} strokeWidth={2.5} className="ltt-milestone-spin-icon" />;
      case 'failed': return <XCircle size={16} strokeWidth={2.5} />;
      case 'skipped': return <SkipForward size={16} strokeWidth={2.5} />;
      case 'pending':
      default: return <Clock size={16} strokeWidth={2.5} />;
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
    <div className="ltt-milestone-card-horizontal">
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <Tooltip open={hoveredItem === item.id}>
            <TooltipTrigger asChild>
              <div
                className="ltt-milestone-card-item-horizontal"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => handleNodeClick(item)}
                style={{ cursor: item.blockUuid ? 'pointer' : 'default' }}
              >
                <div 
                  className={`ltt-milestone-card-content-horizontal ${item.status === 'in_progress' ? 'ltt-milestone-pulse-card' : ''}`}
                  style={{ borderColor: getNodeColor(item.status) }}
                >
                  {/* 第一层：状态文字+图标 */}
                  <div className="ltt-milestone-card-header">
                    <span 
                      className="ltt-milestone-card-status-text"
                      style={{ color: getNodeColor(item.status) }}
                    >
                      {getStatusText(item.status)}
                    </span>
                    <div 
                      className="ltt-milestone-card-icon-wrapper"
                      style={{ borderColor: getNodeColor(item.status), backgroundColor: getNodeColor(item.status) + '10' }}
                    >
                      <div style={{ color: getNodeColor(item.status) }}>
                        {getStatusIcon(item.status)}
                      </div>
                    </div>
                  </div>
                  
                  {/* 第二层：节点描述 */}
                  {showLabels && (
                    <div className="ltt-milestone-card-description">
                      {item.label}
                    </div>
                  )}
                  
                  {/* 第三层：进度条 */}
                  <div className="ltt-milestone-card-progress">
                    <div className="ltt-milestone-card-progress-bg" />
                    <div 
                      className="ltt-milestone-card-progress-fill"
                      style={{ 
                        width: `${item.progress || 0}%`,
                        backgroundColor: getNodeColor(item.status)
                      }}
                    />
                  </div>
                  
                  {/* 第四层：时间和进度百分比 */}
                  <div className="ltt-milestone-card-footer">
                    <span className="ltt-milestone-card-date">
                      {item.date || '-'}
                    </span>
                    <span 
                      className="ltt-milestone-card-percent"
                      style={{ color: getNodeColor(item.status) }}
                    >
                      {item.progress || 0}%
                    </span>
                  </div>
                </div>
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
            <div className="ltt-milestone-connector-horizontal" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CardMilestone;
