import React, { useState, useEffect, useCallback } from 'react';
import YearView from './YearView';
import MonthView from './MonthView';
import WeekView from './WeekView';
import Statistics from './Statistics';
import { HeatmapConfig, HeatmapDataPoint, HeatmapViewType, INDIGO_COLORS } from '../../lib/heatmap/types';
import './heatmap.css';

interface HeatmapProps {
  config: HeatmapConfig;
  data: HeatmapDataPoint[];
}

const Heatmap: React.FC<HeatmapProps> = ({ config, data }) => {
  const [viewType, setViewType] = useState<HeatmapViewType>(config.viewType);
  const [currentDate, setCurrentDate] = useState<Date>(config.referenceDate || new Date());

  const handleViewChange = useCallback((type: HeatmapViewType) => {
    setViewType(type);
  }, []);

  const getWeekNumber = useCallback((date: Date): number => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - startOfYear.getTime();
    const oneWeek = 604800000;
    return Math.ceil(diff / oneWeek);
  }, []);

  const getViewTitle = useCallback((): string => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    switch (viewType) {
      case 'year':
        return `${year}`;
      case 'month':
        return `${year}年${month + 1}月`;
      case 'week':
        return `${year}年第${getWeekNumber(currentDate)}周`;
      default:
        return '';
    }
  }, [viewType, currentDate, getWeekNumber]);

  const handlePrevPeriod = useCallback(() => {
    const newDate = new Date(currentDate);
    switch (viewType) {
      case 'year':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
    }
    setCurrentDate(newDate);
  }, [viewType, currentDate]);

  const handleNextPeriod = useCallback(() => {
    const newDate = new Date(currentDate);
    switch (viewType) {
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
    }
    setCurrentDate(newDate);
  }, [viewType, currentDate]);

  useEffect(() => {
    setViewType(config.viewType);
  }, [config.viewType]);

  const renderView = () => {
    const viewData = filterDataByView(data, viewType, currentDate);
    
    switch (viewType) {
      case 'year':
        return <YearView data={viewData} config={config} currentDate={currentDate} />;
      case 'month':
        return <MonthView data={viewData} config={config} currentDate={currentDate} />;
      case 'week':
        return <WeekView data={viewData} config={config} currentDate={currentDate} />;
      default:
        return null;
    }
  };

  const statistics = React.useMemo(() => {
    const totalBlocks = data.reduce((sum, d) => sum + d.count, 0);
    const activeDays = data.filter(d => d.count > 0).length;
    const maxCount = Math.max(...data.map(d => d.count), 0);
    const avgCount = data.length > 0 ? Math.round(totalBlocks / data.length * 10) / 10 : 0;
    
    return {
      totalBlocks,
      activeDays,
      maxCount,
      avgCount,
      dateRange: {
        start: data.length > 0 ? data[0].date : '',
        end: data.length > 0 ? data[data.length - 1].date : '',
      },
    };
  }, [data]);

  return (
    <div className={`heatmap-container heatmap-${config.displayMode}`}>
      {config.displayMode === 'full' && (
        <div className="heatmap-header">
          <div className="view-controls">
            <button
              className={`view-btn ${viewType === 'year' ? 'active' : ''}`}
              onClick={() => handleViewChange('year')}
            >
              Year
            </button>
            <button
              className={`view-btn ${viewType === 'month' ? 'active' : ''}`}
              onClick={() => handleViewChange('month')}
            >
              Month
            </button>
            <button
              className={`view-btn ${viewType === 'week' ? 'active' : ''}`}
              onClick={() => handleViewChange('week')}
            >
              Week
            </button>
          </div>
          
          <div className="navigation-controls">
            <button className="nav-btn" onClick={handlePrevPeriod} title="Previous">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="nav-label">{getViewTitle()}</span>
            <button className="nav-btn" onClick={handleNextPeriod} title="Next">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <div className="heatmap-content">
        {renderView()}
      </div>
      
      {config.displayMode === 'full' && (
        <Statistics data={statistics} />
      )}
      
      {config.displayMode === 'full' && (
        <div className="heatmap-legend">
          <span className="legend-label">Less</span>
          <div className="legend-colors">
            {INDIGO_COLORS.map((color, index) => (
              <div
                key={index}
                className="legend-color"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="legend-label">More</span>
        </div>
      )}
    </div>
  );
};

function filterDataByView(data: HeatmapDataPoint[], viewType: HeatmapViewType, currentDate: Date): HeatmapDataPoint[] {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  switch (viewType) {
    case 'year':
      return data.filter(d => d.date.startsWith(`${year}-`));
    case 'month':
      const monthStr = (month + 1).toString().padStart(2, '0');
      return data.filter(d => d.date.startsWith(`${year}-${monthStr}`));
    case 'week':
      const dayOfWeek = currentDate.getDay();
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      const startStr = monday.toISOString().split('T')[0];
      const endStr = sunday.toISOString().split('T')[0];
      
      return data.filter(d => {
        const dateStr = d.date.split('T')[0];
        return dateStr >= startStr && dateStr <= endStr;
      });
    default:
      return data;
  }
}

export default Heatmap;