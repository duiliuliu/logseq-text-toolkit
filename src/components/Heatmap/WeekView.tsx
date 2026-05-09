import React from 'react';
import HeatmapCell from './HeatmapCell';
import { HeatmapDataPoint, HeatmapConfig } from '../../lib/heatmap/types';
import { getColorByValue } from '../../lib/heatmap/colorCalculator';

interface WeekViewProps {
  data: HeatmapDataPoint[];
  config: HeatmapConfig;
  currentDate: Date;
  onCellClick?: (date: string) => void;
}

const WEEK_LABELS = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'];

const parseTimeFromData = (dateValue: any): Date => {
  // 处理多种日期格式：时间戳数字、日期字符串、或包含 'created-at' 字段的对象
  try {
    let timestamp: number;
    
    // 如果是对象且有 'created-at' 字段
    if (typeof dateValue === 'object' && dateValue !== null && 'created-at' in dateValue) {
      timestamp = dateValue['created-at'];
    } 
    // 如果是数字
    else if (typeof dateValue === 'number') {
      timestamp = dateValue;
    } 
    // 如果是字符串，尝试解析为数字或日期
    else if (typeof dateValue === 'string') {
      const num = Number(dateValue);
      if (!isNaN(num)) {
        timestamp = num;
      } else {
        return new Date(dateValue);
      }
    } 
    // 其他情况，返回当前时间
    else {
      return new Date();
    }
    
    return new Date(timestamp);
  } catch {
    return new Date();
  }
};

const WeekView: React.FC<WeekViewProps> = ({ data, config, currentDate, onCellClick }) => {
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

  // 处理数据，支持多种数据格式
  const allBlocks: any[] = [];
  
  // 扁平化处理嵌套数组数据结构
  const flattenData = (items: any[]): any[] => {
    const result: any[] = [];
    items.forEach(item => {
      if (Array.isArray(item)) {
        result.push(...flattenData(item));
      } else {
        result.push(item);
      }
    });
    return result;
  };
  
  // 提取所有块数据
  const flatData = flattenData(data);
  
  // 构建按日期分组的块数据
  const blocksByDate = new Map<string, any[]>();
  flatData.forEach(block => {
    if (block && (block['created-at'] || block.date)) {
      const blockDate = parseTimeFromData(block);
      const dateKey = blockDate.toISOString().split('T')[0];
      if (!blocksByDate.has(dateKey)) {
        blocksByDate.set(dateKey, []);
      }
      blocksByDate.get(dateKey)!.push(block);
    }
  });

  // 初始化小时块数据
  const hourBlocksData: { date: string; count: number }[][] = [];
  for (let h = 0; h < 6; h++) {
    hourBlocksData.push([]);
    for (let d = 0; d < 7; d++) {
      hourBlocksData[h].push({ date: days[d].date, count: 0 });
    }
  }
  
  // 填充小时块数据
  days.forEach((dayInfo, dayIndex) => {
    const dayBlocks = blocksByDate.get(dayInfo.date) || [];
    dayBlocks.forEach(block => {
      try {
        const blockDate = parseTimeFromData(block);
        const hour = blockDate.getHours();
        const hourIndex = Math.floor(hour / 4);
        if (hourIndex >= 0 && hourIndex < 6) {
          hourBlocksData[hourIndex][dayIndex].count += 1;
        }
      } catch {
        // 忽略解析错误
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

      {config.displayMode === 'full' && (
        <div className="week-activities">
          <h4>Week Activities</h4>
          <ul className="activity-list">
            {days.filter(day => {
              const dayBlocks = blocksByDate.get(day.date) || [];
              return dayBlocks.length > 0;
            }).map(day => {
              const dayBlocks = blocksByDate.get(day.date) || [];
              const totalCount = dayBlocks.length;
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
