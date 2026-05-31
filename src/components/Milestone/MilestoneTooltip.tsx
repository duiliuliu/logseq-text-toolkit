/**
 * Milestone Tooltip 统一组件
 * 提供多种样式变体支持
 */

import React from 'react';
import type { MilestoneItem, ColorScheme, MilestoneTooltipStyle } from '../../lib/milestone/types';
import { TooltipContent } from '../ui/Tooltip';

interface MilestoneTooltipProps {
  item: MilestoneItem;
  colorScheme: ColorScheme;
  tooltipStyle?: MilestoneTooltipStyle;
}

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

const getStatusColor = (status: string, colorScheme: ColorScheme): string => {
  switch (status) {
    case 'completed': return colorScheme.completed;
    case 'in_progress': return colorScheme.inProgress;
    case 'failed': return colorScheme.failed;
    case 'skipped': return colorScheme.skipped;
    case 'pending':
    default: return colorScheme.pending;
  }
};

/**
 * 简约模式 Tooltip
 * 只显示标题和状态
 */
const MinimalTooltip: React.FC<{
  item: MilestoneItem;
  colorScheme: ColorScheme;
}> = ({ item, colorScheme }) => (
  <div className="ltt-milestone-tooltip-minimal">
    <div className="ltt-milestone-tooltip-minimal-label">{item.label}</div>
    <div
      className="ltt-milestone-tooltip-minimal-status"
      style={{ color: getStatusColor(item.status, colorScheme) }}
    >
      {getStatusText(item.status)}
    </div>
  </div>
);

/**
 * 紧凑模式 Tooltip
 * 显示标题、状态和时间（如果有）
 */
const CompactTooltip: React.FC<{
  item: MilestoneItem;
  colorScheme: ColorScheme;
}> = ({ item, colorScheme }) => (
  <div className="ltt-milestone-tooltip-compact">
    <div className="ltt-milestone-tooltip-compact-label">{item.label}</div>
    {item.date && (
      <div className="ltt-milestone-tooltip-compact-date">时间: {item.date}</div>
    )}
    <div
      className="ltt-milestone-tooltip-compact-status"
      style={{ color: getStatusColor(item.status, colorScheme) }}
    >
      状态: {getStatusText(item.status)}
    </div>
    {item.progress !== undefined && (
      <div className="ltt-milestone-tooltip-compact-progress">进度: {item.progress}%</div>
    )}
  </div>
);

/**
 * 详细模式 Tooltip
 * 显示完整信息，包括进度条
 */
const DetailedTooltip: React.FC<{
  item: MilestoneItem;
  colorScheme: ColorScheme;
}> = ({ item, colorScheme }) => (
  <div className="ltt-milestone-tooltip-detailed">
    <div className="ltt-milestone-tooltip-detailed-header">
      <div className="ltt-milestone-tooltip-detailed-label">{item.label}</div>
      <div
        className="ltt-milestone-tooltip-detailed-status"
        style={{ color: getStatusColor(item.status, colorScheme) }}
      >
        {getStatusText(item.status)}
      </div>
    </div>
    {item.date && (
      <div className="ltt-milestone-tooltip-detailed-date">
        <span className="ltt-milestone-tooltip-detailed-date-label">时间:</span>
        <span className="ltt-milestone-tooltip-detailed-date-value">{item.date}</span>
      </div>
    )}
    {item.progress !== undefined && (
      <div className="ltt-milestone-tooltip-detailed-progress-section">
        <div className="ltt-milestone-tooltip-detailed-progress-label">进度</div>
        <div className="ltt-milestone-tooltip-detailed-progress-bar-container">
          <div
            className="ltt-milestone-tooltip-detailed-progress-bar"
            style={{
              width: `${item.progress}%`,
              backgroundColor: getStatusColor(item.status, colorScheme),
            }}
          />
        </div>
        <div className="ltt-milestone-tooltip-detailed-progress-value">{item.progress}%</div>
      </div>
    )}
  </div>
);

/**
 * 优雅模式 Tooltip
 * 精美的卡片样式，带有图标
 */
const ElegantTooltip: React.FC<{
  item: MilestoneItem;
  colorScheme: ColorScheme;
}> = ({ item, colorScheme }) => {
  const statusColor = getStatusColor(item.status, colorScheme);
  return (
    <div className="ltt-milestone-tooltip-elegant">
      <div className="ltt-milestone-tooltip-elegant-header">
        <div
          className="ltt-milestone-tooltip-elegant-dot"
          style={{ backgroundColor: statusColor }}
        />
        <div className="ltt-milestone-tooltip-elegant-label">{item.label}</div>
      </div>
      <div className="ltt-milestone-tooltip-elegant-divider" />
      {item.date && (
        <div className="ltt-milestone-tooltip-elegant-row">
          <span className="ltt-milestone-tooltip-elegant-icon">📅</span>
          <span className="ltt-milestone-tooltip-elegant-text">{item.date}</span>
        </div>
      )}
      <div className="ltt-milestone-tooltip-elegant-row">
        <span className="ltt-milestone-tooltip-elegant-icon">🏷️</span>
        <span
          className="ltt-milestone-tooltip-elegant-text"
          style={{ color: statusColor }}
        >
          {getStatusText(item.status)}
        </span>
      </div>
      {item.progress !== undefined && (
        <div className="ltt-milestone-tooltip-elegant-row">
          <span className="ltt-milestone-tooltip-elegant-icon">📊</span>
          <span className="ltt-milestone-tooltip-elegant-text">{item.progress}% 完成</span>
        </div>
      )}
    </div>
  );
};

export const MilestoneTooltip: React.FC<MilestoneTooltipProps> = ({
  item,
  colorScheme,
  tooltipStyle = 'compact',
}) => {
  const content = (() => {
    switch (tooltipStyle) {
      case 'minimal':
        return <MinimalTooltip item={item} colorScheme={colorScheme} />;
      case 'compact':
        return <CompactTooltip item={item} colorScheme={colorScheme} />;
      case 'detailed':
        return <DetailedTooltip item={item} colorScheme={colorScheme} />;
      case 'elegant':
        return <ElegantTooltip item={item} colorScheme={colorScheme} />;
      default:
        return <CompactTooltip item={item} colorScheme={colorScheme} />;
    }
  })();

  return <TooltipContent>{content}</TooltipContent>;
};

export default MilestoneTooltip;
