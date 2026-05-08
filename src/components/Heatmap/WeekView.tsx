import React from 'react';
import HeatmapCell from './HeatmapCell';
import { HeatmapDataPoint, HeatmapConfig } from '../../lib/heatmap/types';
import { getColorByValue } from '../../lib/heatmap/colorCalculator';

interface WeekViewProps {
  data: HeatmapDataPoint[];
  config: HeatmapConfig;
  currentDate: Date;
}

const WeekView: React.FC<WeekViewProps> = ({ data, config, currentDate }) => {
  const maxValue = Math.max(...data.map(d => d.count), 1);
  
  const hourBlocks = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'];
  
  const dayOfWeek = currentDate.getDay();
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  const days: { date: string; label: string; short: string }[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      label: date.toLocaleDateString('en-US', { weekday: 'long' }),
      short: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    });
  }
  
  const gridData: HeatmapDataPoint[][] = [];
  
  hourBlocks.forEach(() => {
    gridData.push([]);
  });
  
  data.forEach((point) => {
    if (point.date) {
      const timePart = point.date.split('T')[1];
      const hour = parseInt(timePart.split(':')[0], 10);
      const hourIndex = Math.floor(hour / 4);
      if (hourIndex >= 0 && hourIndex < 6) {
        gridData[hourIndex].push(point);
      }
    }
  });
  
  gridData.forEach((row) => {
    while (row.length < 7) {
      row.push({ date: '', count: 0, blocks: [] });
    }
  });
  
  const handleCellClick = (date: string) => {
    console.log('Week view cell clicked:', date);
  };

  return (
    <div className="heatmap-week-view">
      {config.displayMode !== 'minimal' && (
        <div className="week-header">
          <div className="hour-label-header"></div>
          <div className="day-header">
            {days.map((day, index) => (
              <span key={day.date + index} className="day-header-item">
                <div className="day-name">{day.short}</div>
                <div className="day-date">{new Date(day.date).getDate()}</div>
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="week-grid">
        {gridData.map((hourRow, hourIndex) => (
          <div key={hourIndex} className="hour-row">
            {config.displayMode !== 'minimal' && (
              <div className="hour-label-cell">
                {hourBlocks[hourIndex]}
              </div>
            )}
            {hourRow.map((cell, cellIndex) => (
              <HeatmapCell
                key={cellIndex}
                date={cell.date}
                value={cell.count}
                maxValue={maxValue}
                color={getColorByValue(cell.count, maxValue, config.colorScheme)}
                isEmpty={!cell.date || cell.count === 0}
                size="large"
                onClick={handleCellClick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;