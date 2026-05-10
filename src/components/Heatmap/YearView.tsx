import React from 'react';
import HeatmapCell from './HeatmapCell';
import { HeatmapDataPoint, HeatmapConfig } from '../../lib/heatmap/types';
import { getColorByValue } from '../../lib/heatmap/colorCalculator';

interface YearViewProps {
  data: HeatmapDataPoint[];
  config: HeatmapConfig;
  currentDate: Date;
  onCellClick?: (date: string) => void;
  onMonthLabelClick?: (monthIndex: number) => void;
}

const YearView: React.FC<YearViewProps> = ({ data, config, currentDate, onCellClick, onMonthLabelClick }) => {
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
  const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  
  const getWeekMonthIndex = (week: HeatmapDataPoint[]): number | null => {
    const first = week.find(d => d.date);
    if (!first?.date) return null;
    const monthStr = first.date.split('-')[1];
    const monthIndex = monthStr ? parseInt(monthStr, 10) - 1 : NaN;
    if (Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return null;
    return monthIndex;
  };

  const monthSpans: { monthIndex: number; start: number; end: number }[] = [];
  let currentMonthIndex: number | null = null;
  let spanStart = 0;
  for (let i = 0; i < weeks.length; i++) {
    const mi = getWeekMonthIndex(weeks[i]);
    if (mi === null) continue;
    if (currentMonthIndex === null) {
      currentMonthIndex = mi;
      spanStart = i;
      continue;
    }
    if (mi !== currentMonthIndex) {
      monthSpans.push({ monthIndex: currentMonthIndex, start: spanStart, end: i });
      currentMonthIndex = mi;
      spanStart = i;
    }
  }
  if (currentMonthIndex !== null) {
    monthSpans.push({ monthIndex: currentMonthIndex, start: spanStart, end: weeks.length });
  }

  const handleCellClick = (date: string) => {
    if (date && onCellClick) {
      onCellClick(date);
    }
  };

  return (
    <div className="heatmap-year-view">
      {config.displayMode !== 'minimal' && (
        <div className="year-month-header">
          <div
            className="year-month-header-grid"
            style={{
              gridTemplateColumns: `var(--heatmap-year-axis-width) repeat(${weeks.length}, var(--heatmap-cell-small))`,
            }}
          >
            <div className="year-axis-spacer" />
            {monthSpans.map((span) => (
              <div
                key={`${span.monthIndex}-${span.start}`}
                className="year-month-label"
                style={{ gridColumn: `${span.start + 2} / ${span.end + 2}` }}
                onClick={() => onMonthLabelClick?.(span.monthIndex)}
              >
                {months[span.monthIndex]}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="year-grid">
        {config.displayMode !== 'minimal' && (
          <div className="weekday-labels">
            {weekdays.map((day, index) => (
              <div key={day} className="weekday-label-wrapper">
                <span className="weekday-label">{day}</span>
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
