import React from 'react';
import HeatmapCell from './HeatmapCell';
import { HeatmapDataPoint, HeatmapConfig } from '../../lib/heatmap/types';
import { getColorByValue } from '../../lib/heatmap/colorCalculator';

interface WeekViewProps {
  data: HeatmapDataPoint[];
  config: HeatmapConfig;
  currentDate: Date;
}

const WEEK_LABELS = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'];

const WeekView: React.FC<WeekViewProps> = ({ data, config, currentDate }) => {
  const dayOfWeek = currentDate.getDay();
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const days: { date: string; short: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      short: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    });
  }

  const dataMap = new Map<string, HeatmapDataPoint[]>();
  data.forEach(d => {
    if (d.date) {
      const dateKey = d.date.split('T')[0];
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, []);
      }
      dataMap.get(dateKey)!.push(d);
    }
  });

  const hourBlocksData: { date: string; count: number }[][] = [];
  for (let h = 0; h < 6; h++) {
    hourBlocksData.push([]);
    for (let d = 0; d < 7; d++) {
      hourBlocksData[h].push({ date: days[d].date, count: 0 });
    }
  }
  
  days.forEach((dayInfo, dayIndex) => {
    const dayData = dataMap.get(dayInfo.date) || [];
    dayData.forEach(d => {
      if (d.date) {
        const hour = new Date(d.date).getHours();
        const hourIndex = Math.floor(hour / 4);
        if (hourIndex >= 0 && hourIndex < 6) {
          hourBlocksData[hourIndex][dayIndex].count += d.count;
        }
      }
    });
  });

  const allCounts = hourBlocksData.flat().map(d => d.count);
  const maxValue = Math.max(...allCounts, 1);

  const handleCellClick = (date: string) => {
    console.log('Week view cell clicked:', date);
  };

  return (
    <div className="heatmap-week-view">
      {config.displayMode !== 'minimal' && (
        <div className="week-header">
          <div className="hour-label-header"></div>
          <div className="day-header">
            {days.map((day) => (
              <span key={day.date} className="day-header-item">
                <div className="day-name">{day.short}</div>
                <div className="day-date">{new Date(day.date).getDate()}</div>
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="week-grid">
        {hourBlocksData.map((hourRow, hourIndex) => (
          <div key={hourIndex} className="hour-row">
            {config.displayMode !== 'minimal' && (
              <div className="hour-label-cell">{WEEK_LABELS[hourIndex]}</div>
            )}
            {hourRow.map((cell, cellIndex) => (
              <HeatmapCell
                key={`${hourIndex}-${cellIndex}`}
                date={cell.date}
                value={cell.count}
                maxValue={maxValue}
                color={getColorByValue(cell.count, maxValue, config.colorScheme)}
                isEmpty={cell.count === 0}
                size="large"
                onClick={handleCellClick}
              />
            ))}
          </div>
        ))}
      </div>

      {config.displayMode === 'full' && (
        <div className="week-activities">
          <h4>Week Activities</h4>
          <ul className="activity-list">
            {days.filter(day => {
              const dayData = dataMap.get(day.date) || [];
              return dayData.reduce((sum, d) => sum + d.count, 0) > 0;
            }).map(day => {
              const dayData = dataMap.get(day.date) || [];
              const totalCount = dayData.reduce((sum, d) => sum + d.count, 0);
              return (
                <li key={day.date} className="activity-item">
                  <span className="activity-date">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="activity-count">{totalCount} activities</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WeekView;