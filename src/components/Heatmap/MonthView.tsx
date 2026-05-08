import React from 'react';
import HeatmapCell from './HeatmapCell';
import { HeatmapDataPoint, HeatmapConfig } from '../../lib/heatmap/types';
import { getColorByValue } from '../../lib/heatmap/colorCalculator';

interface MonthViewProps {
  data: HeatmapDataPoint[];
  config: HeatmapConfig;
  currentDate: Date;
}

const MonthView: React.FC<MonthViewProps> = ({ data, config, currentDate }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const nonEmptyData = data.filter(d => d.date && d.count > 0);
  const maxValue = nonEmptyData.length > 0 
    ? Math.max(...nonEmptyData.map(d => d.count)) 
    : 1;
  
  const weeks: HeatmapDataPoint[][] = [];
  let currentWeek: HeatmapDataPoint[] = [];
  
  const firstDate = new Date(year, month, 1);
  const startDayOfWeek = firstDate.getDay();
  const startPadding = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  
  for (let i = 0; i < startPadding; i++) {
    currentWeek.push({ date: '', count: 0, blocks: [] });
  }
  
  data.forEach((point) => {
    currentWeek.push(point);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: '', count: 0, blocks: [] });
    }
    weeks.push(currentWeek);
  }
  
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const handleCellClick = (date: string) => {
    console.log('Month view cell clicked:', date);
  };

  return (
    <div className="heatmap-month-view">
      {config.displayMode !== 'minimal' && (
        <div className="month-header">
          <div className="week-number-header"></div>
          <div className="weekday-header">
            {weekdays.map((day) => (
              <span key={day} className="weekday-header-item">
                {day}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="month-grid">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="week-row">
            {config.displayMode !== 'minimal' && (
              <div className="week-number-cell">
                W{String(weekIndex + 1).padStart(2, '0')}
              </div>
            )}
            {week.map((day, dayIndex) => {
              const dayNumber = day.date ? new Date(day.date).getDate() : '';
              return (
                <div key={dayIndex} className="day-cell-wrapper">
                  <HeatmapCell
                    date={day.date}
                    value={day.count}
                    maxValue={maxValue}
                    color={getColorByValue(day.count, maxValue, config.colorScheme)}
                    isEmpty={!day.date || day.count === 0}
                    size="medium"
                    onClick={handleCellClick}
                  />
                  {dayNumber && (
                    <span className="day-number">{dayNumber}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthView;