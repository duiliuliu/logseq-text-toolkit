import React from 'react';
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
  theme?: 'light' | 'dark';
}

const Tooltip: React.FC<TooltipProps> = ({ data, theme = 'light' }) => {
  const isDark = theme === 'dark';

  return (
    <div className="heatmap-tooltip">
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
  const percentage = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;

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
    <div className={`heatmap-cell-wrapper ${isEmpty ? 'empty' : ''}`}>
      <div
        className={`heatmap-cell size-${size} ${!isCurrentMonth ? 'other-month' : ''}`}
        style={{
          backgroundColor: getBackgroundColor(),
          border: getBorderStyle(),
          opacity: !isEmpty && !isCurrentMonth ? 0.3 : 1,
        }}
        onClick={handleClick}
        title={isEmpty ? undefined : `${date}: ${value} blocks`}
      >
        {showDay && dayNumber !== undefined && dayNumber > 0 && (
          <span className="heatmap-cell-day">{dayNumber}</span>
        )}
      </div>
      {!isEmpty && <Tooltip data={tooltipData} theme={theme} />}
    </div>
  );
};

export default HeatmapCell;
