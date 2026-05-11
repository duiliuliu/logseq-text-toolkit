import React, { useState } from 'react';
import { HeatmapTooltipData } from '../../lib/heatmap/types';
import { generateProgressBar } from '../../lib/heatmap/colorCalculator';
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

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: position.x,
    top: position.y,
    transform: 'translateY(-100%) translateY(-8px)',
    background: isDark ? '#1e1e1e' : '#ffffff',
    border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`,
    borderRadius: '8px',
    padding: '8px 12px',
    boxShadow: isDark
      ? '0 4px 12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      : '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 9999,
    pointerEvents: 'none',
    minWidth: '120px',
    animation: 'tooltipFadeIn 0.15s ease-out',
  };

  return (
    <div className="heatmap-tooltip" style={tooltipStyle}>
      <div style={{
        color: isDark ? '#f4f4f5' : '#18181b',
        fontSize: '13px',
        fontWeight: 600,
        marginBottom: '4px',
        letterSpacing: '-0.01em',
      }}>
        {data.date}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}>
        <span style={{
          color: isDark ? '#a1a1aa' : '#71717a',
          fontSize: '12px',
        }}>
          {data.count} {data.count === 1 ? 'block' : 'blocks'}
        </span>
        <span style={{
          color: isDark ? '#d4d4d8' : '#27272a',
          fontSize: '12px',
          fontWeight: 500,
        }}>
          {data.percentage}%
        </span>
      </div>
      <div style={{
        marginTop: '6px',
        height: '4px',
        background: isDark ? '#27272a' : '#f4f4f5',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${data.percentage}%`,
          height: '100%',
          background: data.percentage > 0
            ? (data.percentage > 50 ? '#22c55e' : '#3b82f6')
            : 'transparent',
          borderRadius: '2px',
          transition: 'width 0.3s ease',
        }} />
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
      x: rect.left,
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

  return (
    <>
      <div
        className={`heatmap-cell size-${size} ${isEmpty ? 'empty' : ''} ${isHovered ? 'hovered' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
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
          <span style={{
            fontSize: '8px',
            color: isCurrentMonth ? '#c7c4d7' : '#6b7280',
            fontFamily: 'monospace',
            lineHeight: 1,
            position: 'absolute',
            top: '2px',
            left: '2px',
          }}>
            {dayNumber}
          </span>
        )}
      </div>
      {isHovered && tooltipPosition && !isEmpty && (
        <Tooltip
          data={{ date, count: value, percentage, maxValue }}
          position={tooltipPosition}
          theme={theme}
        />
      )}
    </>
  );
};

export default HeatmapCell;
