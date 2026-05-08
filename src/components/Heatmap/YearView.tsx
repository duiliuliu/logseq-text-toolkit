import React from 'react';
import HeatmapCell from './HeatmapCell';
import { HeatmapDataPoint, HeatmapConfig } from '../../lib/heatmap/types';
import { getColorByValue } from '../../lib/heatmap/colorCalculator';

interface YearViewProps {
  data: HeatmapDataPoint[];
  config: HeatmapConfig;
  currentDate: Date;
}

const YearView: React.FC<YearViewProps> = ({ data, config, currentDate }) => {
  const year = currentDate.getFullYear();
  
  const dataMap = new Map<string, HeatmapDataPoint>();
  data.forEach(d => {
    if (d.date) {
      dataMap.set(d.date.split('T')[0], d);
    }
  });
  
  const nonEmptyData = data.filter(d => d.date && d.count > 0);
  const maxValue = nonEmptyData.length > 0 
    ? Math.max(...nonEmptyData.map(d => d.count)) 
    : 1;
  
  const allDays: HeatmapDataPoint[] = [];
  const startDate = new Date(Date.UTC(year, 0, 1));
  const endDate = new Date(Date.UTC(year + 1, 0, 1));
  
  for (const d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const existingData = dataMap.get(dateStr);
    if (existingData) {
      allDays.push(existingData);
    } else {
      allDays.push({ date: dateStr, count: 0, blocks: [] });
    }
  }
  
  const weeks: HeatmapDataPoint[][] = [];
  let currentWeek: HeatmapDataPoint[] = [];
  
  const firstDayOfYear = new Date(Date.UTC(year, 0, 1));
  const startDayOfWeek = firstDayOfYear.getDay();
  const startPadding = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  
  for (let i = 0; i < startPadding; i++) {
    currentWeek.push({ date: '', count: 0, blocks: [] });
  }
  
  allDays.forEach((point) => {
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
  const weekdays = ['MON', '', 'WED', '', 'FRI', '', ''];
  
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
              <div key={index} className="weekday-label-wrapper">
                {day && <span className="weekday-label">{day}</span>}
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