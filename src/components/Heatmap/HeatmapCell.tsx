import React, { useState } from 'react';
import { HeatmapTooltipData } from '../../lib/heatmap/types';
import './HeatmapCell.css';

interface HeatmapCellProps {
  date: string;
  value: number;
  maxValue: number;
  color: string;
  isEmpty: boolean;
  isCurrentMonth?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: (date: string) => void;
  showDay?: boolean;
  dayNumber?: number;
  theme?: 'light' | 'dark';
  blocks?: any[];
}

interface TooltipProps {
  data: HeatmapTooltipData;
  position: {
    x: number;
    y: number;
    cellHeight: number;
  };
  theme?: 'light' | 'dark';
}

const Tooltip: React.FC<TooltipProps> = ({ data, position, theme = 'light' }) => {
  const isDark = theme === 'dark';

  return (
    <div
      className="heatmap-tooltip"
      style={{
        left: position.x,
        top: position.y - 8,
      }}
    >
      <div className="heatmap-tooltip-date">{data.date}</div>
      <div className="heatmap-tooltip-stats">
        <span className="heatmap-tooltip-count">{data.count} {data.count === 1 ? 'block' : 'blocks'}</span>
        <span className="heatmap-tooltip-percent">{data.percentage}%</span>
      </div>
      <div className="heatmap-tooltip-bar">
        <div
          className="heatmap-tooltip-bar-fill"
          style={{ width: `${data.percentage}%` }}
        />
      </div>
    </div>
  );
};

const HeatmapCell: React.FC<HeatmapCellProps> = ({
  date,
  value,
  maxValue,
  color,
  isEmpty,
  isCurrentMonth = true,
  size = 'small',
  onClick,
  showDay = false,
  dayNumber,
  theme = 'light',
  blocks = []
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
    cellHeight: number;
  } | null>(null);

  const percentage = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsHovered(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
      cellHeight: rect.height,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTooltipPosition(null);
  };

  const handleClick = () => {
    if (onClick) {
      onClick(date);
    }
  };

  const getBackgroundColor = () => {
    if (isEmpty) return 'transparent';
    if (!isCurrentMonth) return 'rgba(192, 193, 255, 0.1)';
    return color;
  };

  const getBorderStyle = () => {
    if (isEmpty && !showDay) return '1px solid rgba(70, 69, 84, 0.2)';
    return '1px solid rgba(70, 69, 84, 0.3)';
  };

  const tooltipData: HeatmapTooltipData = { date, count: value, percentage, maxValue };

  return (
    <>
      <div
        className={`heatmap-cell size-${size} ${isHovered ? 'hovered' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
        style={{
          backgroundColor: getBackgroundColor(),
          border: getBorderStyle(),
          opacity: !isEmpty && !isCurrentMonth ? 0.3 : 1,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        title={isEmpty ? undefined : `${date}: ${value} blocks`}
      >
        {showDay && dayNumber !== undefined && dayNumber > 0 && (
          <span className="heatmap-cell-day">{dayNumber}</span>
        )}
      </div>
      {isHovered && tooltipPosition && !isEmpty && (
        <Tooltip data={tooltipData} position={tooltipPosition} theme={theme} />
      )}
    </>
  );
};

export default HeatmapCell;
