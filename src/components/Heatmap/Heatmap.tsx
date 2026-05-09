import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import YearView from './YearView';
import MonthView from './MonthView';
import WeekView from './WeekView';
import Statistics from './Statistics';
import { HeatmapConfig, HeatmapDataPoint, HeatmapViewType, INDIGO_COLORS } from '../../lib/heatmap/types';
import { logseqAPI } from '../../logseq';
import './heatmap.css';

interface HeatmapProps {
  config: HeatmapConfig;
  data: HeatmapDataPoint[];
  theme?: 'light' | 'dark';
}

const Heatmap: React.FC<HeatmapProps> = ({ config, data, theme }) => {
  const containerClass = theme === 'dark' 
    ? `heatmap-container heatmap-${config.displayMode} dark`
    : `heatmap-container heatmap-${config.displayMode}`;
  const [viewType, setViewType] = useState<HeatmapViewType>(config.viewType);
  const [currentDate, setCurrentDate] = useState<Date>(config.referenceDate || new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const handleViewChange = useCallback((type: HeatmapViewType) => {
    setViewType(type);
  }, []);

  const getWeekNumber = useCallback((date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const day = firstDayOfYear.getDay() || 7; // 周一为1
    const adjustedStart = new Date(firstDayOfYear);
    adjustedStart.setDate(firstDayOfYear.getDate() - day + 1);
    
    if (adjustedStart > date) {
      adjustedStart.setFullYear(adjustedStart.getFullYear() - 1);
      adjustedStart.setDate(adjustedStart.getDate() - day + 1);
    }
    
    const diff = date.getTime() - adjustedStart.getTime();
    const weekNumber = Math.floor(diff / 604800000) + 1;
    return weekNumber;
  }, []);

  const getViewTitle = useCallback((): string => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    switch (viewType) {
      case 'year':
        return `${year}`;
      case 'month':
        return `${year}/${month + 1}`;
      case 'week':
        return `${year} W${String(getWeekNumber(currentDate)).padStart(2, '0')}`;
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

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setContainerWidth(el.clientWidth);
    });
    ro.observe(el);
    setContainerWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const dynamicStyle = useMemo(() => {
    const el = containerRef.current;
    if (!el || !containerWidth) return undefined;

    const cs = getComputedStyle(el);
    const paddingLeft = parseFloat(cs.paddingLeft || '0') || 0;
    const paddingRight = parseFloat(cs.paddingRight || '0') || 0;
    const innerWidth = Math.max(containerWidth - paddingLeft - paddingRight, 0);

    const gap = 2;

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

    const calcCell = (cols: number, axis: number, min: number, max: number) => {
      const available = Math.max(innerWidth - axis - gap * Math.max(cols - 1, 0), 0);
      const raw = cols > 0 ? available / cols : min;
      return clamp(raw, min, max);
    };

    const getYearWeeksCount = (year: number) => {
      const first = new Date(Date.UTC(year, 0, 1));
      const startDayOfWeek = first.getDay();
      const startPadding = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
      const days = ((Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000) | 0;
      return Math.ceil((startPadding + days) / 7);
    };

    const yearAxis = config.displayMode !== 'minimal' ? 28 : 0;
    const monthAxis = 32;
    const weekAxis = config.displayMode !== 'minimal' ? 44 : 0;

    const yearCols = getYearWeeksCount(currentDate.getFullYear());
    const monthCols = 7;
    const weekCols = 7;

    const small = calcCell(yearCols, yearAxis, 6, 16);
    const large = calcCell(monthCols, monthAxis, 16, 56);
    const week = calcCell(weekCols, weekAxis, 14, 48);

    return {
      ['--heatmap-cell-small' as any]: `${small}px`,
      ['--heatmap-cell-large' as any]: `${large}px`,
      ['--heatmap-cell-week' as any]: `${week}px`,
    } as React.CSSProperties;
  }, [containerWidth, config.displayMode, currentDate]);

  const handleCellClick = useCallback(async (date: string) => {
    if (date) {
      try {
        logseqAPI.App.pushState(`page`, {
          date: date.replace(/-/g, '/'),
        });
      } catch (err) {
        console.error('Failed to navigate to date:', err);
      }
    }
  }, []);

  const renderView = () => {
    const viewData = filterDataByView(data, viewType, currentDate);
    
    switch (viewType) {
      case 'year':
        return <YearView data={viewData} config={config} currentDate={currentDate} onCellClick={handleCellClick} />;
      case 'month':
        return <MonthView data={viewData} config={config} currentDate={currentDate} onCellClick={handleCellClick} />;
      case 'week':
        return <WeekView data={viewData} config={config} currentDate={currentDate} onCellClick={handleCellClick} />;
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
    <div ref={containerRef} className={containerClass} style={dynamicStyle}>
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
              <svg className="nav-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <span className="nav-label">{getViewTitle()}</span>
            <button className="nav-btn" onClick={handleNextPeriod} title="Next">
              <svg className="nav-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
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
