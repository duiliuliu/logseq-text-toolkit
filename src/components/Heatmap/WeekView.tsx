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

  const cellData = days.map(dayInfo => {
    const dayData = data.filter(d => d.date && d.date.startsWith(dayInfo.date));
    const totalCount = dayData.reduce((sum, d) => sum + d.count, 0);
    return {
      ...dayInfo,
      count: totalCount,
      blocks: dayData.flatMap(d => d.blocks || []),
    };
  });

  const nonEmptyData = cellData.filter(d => d.count > 0);
  const maxValue = nonEmptyData.length > 0 
    ? Math.max(...nonEmptyData.map(d => d.count)) 
    : 1;

  const handleCellClick = (date: string) => {
    console.log('Week view cell clicked:', date);
  };

  return (
    <div className="heatmap-week-view">
      {config.displayMode !== 'minimal' && (
        <div className="week-header">
          <div className="hour-label-header"></div>
          <div className="day-header">
            {cellData.map((day) => (
              <span key={day.date} className="day-header-item">
                <div className="day-name">{day.short}</div>
                <div className="day-date">{new Date(day.date).getDate()}</div>
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="week-grid">
        <div className="hour-row full-width-row">
          {config.displayMode !== 'minimal' && (
            <div className="hour-label-cell"></div>
          )}
          {cellData.map((day, index) => (
            <HeatmapCell
              key={day.date}
              date={day.date}
              value={day.count}
              maxValue={maxValue}
              color={getColorByValue(day.count, maxValue, config.colorScheme)}
              isEmpty={day.count === 0}
              size="large"
              onClick={handleCellClick}
            />
          ))}
        </div>
      </div>

      {config.displayMode === 'full' && cellData.some(d => d.count > 0) && (
        <div className="week-activities">
          <h4>Week Activities</h4>
          <ul className="activity-list">
            {cellData.filter(d => d.count > 0).map(day => (
              <li key={day.date} className="activity-item">
                <span className="activity-date">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span className="activity-count">{day.count} activities</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WeekView;