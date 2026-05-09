import React, { useState } from 'react';
import { HeatmapTooltipData } from '../../lib/heatmap/types';
import { generateProgressBar } from '../../lib/heatmap/colorCalculator';

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
}

interface TooltipProps {
  data: HeatmapTooltipData;
  position: {
    x: number;
    y: number;
  };
}

const Tooltip: React.FC<TooltipProps> = ({ data, position }) => {
  const progressBar = generateProgressBar(data.percentage);
  return (
    <div
      className="heatmap-tooltip"
      style={{
        position: 'fixed',
        left: position.x + 12,
        top: position.y - 60,
        background: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid #c0c1ff',
        borderRadius: '8px',
        padding: '8px 12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        opacity: 1,
        transition: 'opacity 0.15s ease-in',
        pointerEvents: 'none',
      }}
    >
      <div style={{ color: '#c0c1ff', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
        {data.date}
      </div>
      <div style={{ color: '#dae2fd', fontSize: '12px', marginBottom: '2px' }}>
        Activity: {data.count} blocks
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#c7c4d7' }}>
        <span>Level:</span>
        <span style={{ fontFamily: 'monospace' }}>{progressBar}</span>
        <span>{data.percentage}%</span>
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
  dayNumber
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const percentage = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsHovered(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left,
      y: rect.top,
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
    console.log('Heatmap cell clicked:', date, value);
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
        />
      )}
    </>
  );
};

export default HeatmapCell;
