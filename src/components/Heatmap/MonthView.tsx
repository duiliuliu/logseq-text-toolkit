import React from 'react';
import HeatmapCell from './HeatmapCell';
import { HeatmapDataPoint, HeatmapConfig } from '../../lib/heatmap/types';
import { getColorByValue } from '../../lib/heatmap/colorCalculator';

interface MonthViewProps {
  data: HeatmapDataPoint[];
  config: HeatmapConfig;
  currentDate: Date;
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MonthView: React.FC<MonthViewProps> = ({ data, config, currentDate }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
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
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  for (let d = 1; d <= endDate.getDate(); d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = dateObj.toISOString().split('T')[0];
    const existingData = dataMap.get(dateStr);
    if (existingData) {
      allDays.push(existingData);
    } else {
      allDays.push({ date: dateStr, count: 0, blocks: [] });
    }
  }
  
  const weeks: HeatmapDataPoint[][] = [];
  let currentWeek: HeatmapDataPoint[] = [];
  
  const firstDate = new Date(year, month, 1);
  const startDayOfWeek = firstDate.getDay();
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
  
  const handleCellClick = (date: string) => {
    console.log('Month view cell clicked:', date);
  };

  const weekNumbers = weeks.map((_, i) => `W${i + 1}`);

  const showLabels = config.displayMode !== 'minimal';

  return (
    <div className="heatmap-month-view">
      {showLabels && (
        <div className="month-full-layout">
          <div className="month-grid-wrapper">
            <div className="month-week-labels">
              {weekNumbers.map((week, i) => (
                <div key={i} className="month-week-label">{week}</div>
              ))}
            </div>
            <div className="month-grid">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="week-row">
                  {week.map((day, dayIndex) => (
                    <HeatmapCell
                      key={dayIndex}
                      date={day.date}
                      value={day.count}
                      maxValue={maxValue}
                      color={getColorByValue(day.count, maxValue, config.colorScheme)}
                      isEmpty={!day.date || day.count === 0}
                      size="medium"
                      onClick={handleCellClick}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="month-day-labels">
            {WEEKDAY_LABELS.map((day, i) => (
              <div key={i} className="month-day-label">{day}</div>
            ))}
          </div>
        </div>
      )}
      {!showLabels && (
        <div className="month-grid">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="week-row">
              {week.map((day, dayIndex) => (
                <HeatmapCell
                  key={dayIndex}
                  date={day.date}
                  value={day.count}
                  maxValue={maxValue}
                  color={getColorByValue(day.count, maxValue, config.colorScheme)}
                  isEmpty={!day.date || day.count === 0}
                  size="medium"
                  onClick={handleCellClick}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonthView;
