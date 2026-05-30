import React from 'react';
import HeatmapCell from './HeatmapCell';
import { HeatmapDataPoint, HeatmapConfig, DateFieldConfig } from '../../lib/heatmap/types';
import { getColorByValue } from '../../lib/heatmap/colorCalculator';

interface WeekViewProps {
  data: HeatmapDataPoint[];
  config: HeatmapConfig;
  currentDate: Date;
  onCellClick?: (date: string) => void;
  dateField?: DateFieldConfig;
}

const WEEK_LABELS = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'];

const parseTimestamp = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    if (value > 1e10) return value;
    return value * 1000;
  }
  if (typeof value === 'string') {
    const num = Number(value);
    if (!isNaN(num)) {
      if (num > 1e10) return num;
      return num * 1000;
    }
    const parsedDate = new Date(value);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.getTime();
    }
  }
  return null;
};

const getTimestampByField = (block: any, dateField?: DateFieldConfig): number | null => {
  if (!dateField || dateField.type === 'created-at') {
    const v = block?.['created-at'] ?? block?.['block/created-at'] ?? block?.createdAt ?? block?.created_at;
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : null;
  }
  
  switch (dateField.type) {
    case 'updated-at':
      return parseTimestamp(block?.['updated-at'] ?? block?.['block/updated-at']);
    case 'scheduled':
      return parseTimestamp(block?.['scheduled'] ?? block?.['block/scheduled'] ?? block?.[':logseq.property/scheduled']);
    case 'deadline':
      return parseTimestamp(block?.['deadline'] ?? block?.['block/deadline'] ?? block?.[':logseq.property/deadline']);
    case 'custom':
      if (dateField.customKey) {
        const customValue = block?.['block/properties']?.[dateField.customKey] ?? block?.[dateField.customKey];
        return parseTimestamp(customValue);
      }
      return null;
    default:
      return parseTimestamp(block?.['created-at']);
  }
};

const parseTimeFromData = (dateValue: any): Date => {
  try {
    let timestamp: number;
    
    if (typeof dateValue === 'object' && dateValue !== null && 'created-at' in dateValue) {
      timestamp = dateValue['created-at'];
    } else if (typeof dateValue === 'number') {
      timestamp = dateValue;
    } else if (typeof dateValue === 'string') {
      const num = Number(dateValue);
      if (!isNaN(num)) {
        timestamp = num;
      } else {
        return new Date(dateValue);
      }
    } else {
      return new Date();
    }
    
    return new Date(timestamp);
  } catch {
    return new Date();
  }
};

const WeekView: React.FC<WeekViewProps> = ({ data, config, currentDate, onCellClick, dateField }) => {
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

  const blocksByDate = new Map<string, any[]>();
  data.forEach(dataPoint => {
    if (dataPoint && dataPoint.blocks) {
      const dateKey = dataPoint.date.split('T')[0];
      if (!blocksByDate.has(dateKey)) {
        blocksByDate.set(dateKey, []);
      }
      blocksByDate.get(dateKey)!.push(...dataPoint.blocks);
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
    const dayBlocks = blocksByDate.get(dayInfo.date) || [];
    dayBlocks.forEach(block => {
      try {
        const timestamp = getTimestampByField(block, dateField);
        if (timestamp) {
          const blockDate = new Date(timestamp);
          const hour = blockDate.getHours();
          const hourIndex = Math.floor(hour / 4);
          if (hourIndex >= 0 && hourIndex < 6) {
            hourBlocksData[hourIndex][dayIndex].count += 1;
          }
        } else {
          const blockDate = parseTimeFromData(block['created-at']);
          const hour = blockDate.getHours();
          const hourIndex = Math.floor(hour / 4);
          if (hourIndex >= 0 && hourIndex < 6) {
            hourBlocksData[hourIndex][dayIndex].count += 1;
          }
        }
      } catch {
      }
    });
  });

  const allCounts = hourBlocksData.flat().map(d => d.count);
  const maxValue = Math.max(...allCounts, 1);

  const handleCellClick = (date: string) => {
    if (date && onCellClick) {
      onCellClick(date);
    }
  };

  return (
    <div className="heatmap-week-view">
      <div className={`week-grid-container ${config.displayMode === 'minimal' ? 'minimal' : ''}`}>
        {config.displayMode !== 'minimal' && (
          <>
            <div className="hour-label-header" />
            {days.map((day) => (
              <div
                key={day.date}
                className="day-header-item"
              >
                <div className="day-name">{day.short}</div>
                <div className="day-date">{new Date(day.date).getDate()}</div>
              </div>
            ))}
          </>
        )}

        {hourBlocksData.map((hourRow, hourIndex) => (
          <React.Fragment key={hourIndex}>
            {config.displayMode !== 'minimal' && (
              <div
                className="hour-label-cell"
              >
                {WEEK_LABELS[hourIndex]}
              </div>
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
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default WeekView;
