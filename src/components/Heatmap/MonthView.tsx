import React from 'react';
import HeatmapCell from './HeatmapCell';
import { HeatmapDataPoint, HeatmapConfig } from '../../lib/heatmap/types';
import { getColorByValue } from '../../lib/heatmap/colorCalculator';

interface MonthViewProps {
  data: HeatmapDataPoint[];
  config: HeatmapConfig;
  currentDate: Date;
}

const DAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
  
  const allDays: { date: string; day: number; isCurrentMonth: boolean }[] = [];
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  for (let d = 1; d <= endDate.getDate(); d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = dateObj.toISOString().split('T')[0];
    allDays.push({ date: dateStr, day: d, isCurrentMonth: true });
  }
  
  const weeks: { date: string; day: number; isCurrentMonth: boolean; isEmpty: boolean }[][] = [];
  let currentWeek: { date: string; day: number; isCurrentMonth: boolean; isEmpty: boolean }[] = [];
  
  const firstDate = new Date(year, month, 1);
  const startDayOfWeek = firstDate.getDay();
  const startPadding = startDayOfWeek;
  
  for (let i = 0; i < startPadding; i++) {
    currentWeek.push({ date: '', day: 0, isCurrentMonth: false, isEmpty: true });
  }
  
  allDays.forEach((dayInfo) => {
    currentWeek.push({ ...dayInfo, isEmpty: false });
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: '', day: 0, isCurrentMonth: false, isEmpty: true });
    }
    weeks.push(currentWeek);
  }
  
  const handleCellClick = (date: string) => {
    console.log('Month view cell clicked:', date);
  };

  const handleDayHeaderClick = (day: string, dayIndex: number) => {
    console.log('Month view day header clicked:', { day, dayIndex });
  };

  const handleWeekLabelClick = (weekLabel: string, weekIndex: number) => {
    console.log('Month view week label clicked:', { weekLabel, weekIndex });
  };

  const weekNumbers = weeks.map((_, i) => `W${String(i + 1).padStart(2, '0')}`);

  const getCellData = (week: typeof weeks[0], dayIndex: number) => {
    const cell = week[dayIndex];
    if (cell.isEmpty) return { date: '', count: 0, isCurrentMonth: false, isEmpty: true, day: 0 };
    const existingData = dataMap.get(cell.date);
    return { 
      date: cell.date, 
      count: existingData?.count || 0, 
      isCurrentMonth: cell.isCurrentMonth,
      day: cell.day,
      isEmpty: false
    };
  };

  return (
    <div className="heatmap-month-view">
      <div className="month-view-container">
        <div className="month-grid">
          <div className="month-axis-spacer" />
          {DAY_LABELS_EN.map((day, i) => (
            <div
              key={day}
              className="month-day-header"
              onClick={() => handleDayHeaderClick(day, i)}
            >
              {day}
            </div>
          ))}

          {weeks.map((week, weekIndex) => (
            <React.Fragment key={weekIndex}>
              <div
                className="month-week-label"
                onClick={() => handleWeekLabelClick(weekNumbers[weekIndex], weekIndex)}
              >
                {weekNumbers[weekIndex]}
              </div>
              {week.map((cell, dayIndex) => {
                const cellData = getCellData(week, dayIndex);
                return (
                  <HeatmapCell
                    key={`${weekIndex}-${dayIndex}`}
                    date={cellData.date}
                    value={cellData.count}
                    maxValue={maxValue}
                    color={getColorByValue(cellData.count, maxValue, config.colorScheme)}
                    isEmpty={cellData.isEmpty || cellData.count === 0}
                    isCurrentMonth={cellData.isCurrentMonth}
                    size="large"
                    onClick={handleCellClick}
                    showDay={cell.day > 0}
                    dayNumber={cell.day}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthView;
