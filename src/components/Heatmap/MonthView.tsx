import React from 'react';
import HeatmapCell from './HeatmapCell';
import { HeatmapDataPoint, HeatmapConfig } from '../../lib/heatmap/types';
import { getColorByValue } from '../../lib/heatmap/colorCalculator';

interface MonthViewProps {
  data: HeatmapDataPoint[];
  config: HeatmapConfig;
  currentDate: Date;
  onCellClick?: (date: string) => void;
  onWeekLabelClick?: (weekNumber: number) => void;
  theme?: 'light' | 'dark';
}

const DAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const day = firstDayOfYear.getDay() || 7; // 周一为1
  const adjustedStart = new Date(firstDayOfYear);
  adjustedStart.setDate(firstDayOfYear.getDate() - day + 1);
  
  if (adjustedStart > date) {
    adjustedStart.setFullYear(adjustedStart.getFullYear() - 1);
    const newDay = adjustedStart.getDay() || 7;
    adjustedStart.setDate(adjustedStart.getDate() - newDay + 1);
  }
  
  const diff = date.getTime() - adjustedStart.getTime();
  const weekNumber = Math.floor(diff / 604800000) + 1;
  return weekNumber;
};

const MonthView: React.FC<MonthViewProps> = ({ data, config, currentDate, onCellClick, onWeekLabelClick, theme = 'light' }) => {
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
  
  const pad2 = (n: number) => String(n).padStart(2, '0');
  
  for (let d = 1; d <= endDate.getDate(); d++) {
    const dateObj = new Date(year, month, d);
    // 使用本地时间格式化，避免时区偏移问题
    const dateStr = `${dateObj.getFullYear()}-${pad2(dateObj.getMonth() + 1)}-${pad2(dateObj.getDate())}`;
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
  
  // 计算正确的周数
  const weekNumbers: string[] = [];
  weeks.forEach((week) => {
    // 找到当前周中第一个非空的日期
    const firstValidDay = week.find(day => day.date);
    if (firstValidDay) {
      const weekNum = getWeekNumber(new Date(firstValidDay.date));
      weekNumbers.push(`W${String(weekNum).padStart(2, '0')}`);
    } else {
      weekNumbers.push('');
    }
  });

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

  const handleCellClick = (date: string) => {
    if (date && onCellClick) {
      onCellClick(date);
    }
  };

  const handleWeekLabelClick = (weekNumberStr: string) => {
    const weekNum = parseInt(weekNumberStr.replace('W', ''), 10);
    if (weekNum > 0 && onWeekLabelClick) {
      onWeekLabelClick(weekNum);
    }
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
            >
              {day}
            </div>
          ))}

          {weeks.map((week, weekIndex) => (
            <React.Fragment key={weekIndex}>
              <div
                className="month-week-label"
                onClick={() => handleWeekLabelClick(weekNumbers[weekIndex])}
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
                    theme={theme}
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
