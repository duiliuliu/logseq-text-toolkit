import React from 'react';
import HeatmapCell from './HeatmapCell';
import { HeatmapDataPoint, HeatmapConfig } from '../../lib/heatmap/types';
import { getColorByValue } from '../../lib/heatmap/colorCalculator';

interface YearViewProps {
  data: HeatmapDataPoint[];
  config: HeatmapConfig;
}

const YearView: React.FC<YearViewProps> = ({ data, config }) => {
  const maxValue = Math.max(...data.map(d => d.count), 1);
  
  const weeks: HeatmapDataPoint[][] = [];
  let currentWeek: HeatmapDataPoint[] = [];
  
  const firstDate = new Date(data[0]?.date || new Date());
  const startPadding = firstDate.getDay() || 7;
  
  for (let i = 1; i < startPadding; i++) {
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
  
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  
  const handleCellClick = (date: string) => {
    console.log('Year view cell clicked:', date);
  };

  return (
    <div className="heatmap-year-view">
      {config.displayMode !== 'minimal' && (
        <div className="month-labels">
          <span className="weekday-label-offset"></span>
          {months.map((month) => (
            <span key={month} className="month-label">
              {month}
            </span>
          ))}
        </div>
      )}
      
      <div className="year-grid">
        {config.displayMode !== 'minimal' && (
          <div className="weekday-labels">
            {weekdays.map((day, index) => (
              <div key={day} className="weekday-label-wrapper">
                {index % 2 === 0 && (
                  <span className="weekday-label">{day}</span>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="grid-container">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="week-column">
              {week.map((day, dayIndex) => (
                <HeatmapCell
                  key={`${weekIndex}-${dayIndex}`}
                  date={day.date}
                  value={day.count}
                  maxValue={maxValue}
                  color={getColorByValue(day.count, maxValue, config.colorScheme)}
                  isEmpty={!day.date || day.count === 0}
                  size="small"
                  onClick={handleCellClick}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YearView;