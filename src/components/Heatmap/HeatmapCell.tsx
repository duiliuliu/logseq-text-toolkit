import React, { useState } from 'react';
import { HeatmapTooltipData } from '../../lib/heatmap/types';
import { generateProgressBar } from '../../lib/heatmap/colorCalculator';

interface HeatmapCellProps {
  date: string;
  value: number;
  maxValue: number;
  color: string;
  isEmpty: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: (date: string) => void;
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

const HeatmapCell: React.FC<HeatmapCellProps> = ({ date, value, maxValue, color, isEmpty, size = 'small', onClick }) => {
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

  const sizeMap = {
    small: { width: 10, height: 10 },
    medium: { width: 14, height: 14 },
    large: { width: 28, height: 32 },
  };

  const { width, height } = sizeMap[size];

  return (
    <>
      <div
        className={`heatmap-cell ${isEmpty ? 'empty' : ''} ${isHovered ? 'hovered' : ''}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: isEmpty ? '#f5f5f5' : color,
          borderRadius: '2px',
          cursor: 'pointer',
          transition: 'transform 0.1s ease, box-shadow 0.1s ease',
          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
          boxShadow: isHovered ? '0 0 8px rgba(192, 193, 255, 0.6)' : 'none',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        title={isEmpty ? undefined : `${date}: ${value} blocks`}
      />
      {isHovered && tooltipPosition && (
        <Tooltip 
          data={{ date, count: value, percentage, maxValue }} 
          position={tooltipPosition} 
        />
      )}
    </>
  );
};

export default HeatmapCell;