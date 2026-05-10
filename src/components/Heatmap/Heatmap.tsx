import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import YearView from './YearView';
import MonthView from './MonthView';
import WeekView from './WeekView';
import Statistics from './Statistics';
import { HeatmapConfig, HeatmapDataPoint, HeatmapViewType, INDIGO_COLORS } from '../../lib/heatmap/types';
import { logseqAPI } from '../../logseq';
import { ensurePageAndNavigate } from '../../lib/heatmap/pageUtils';
import './heatmap.css';

interface HeatmapProps {
  config: HeatmapConfig;
  data: HeatmapDataPoint[];
  theme?: 'light' | 'dark';
  onBlockId?: string;
}

const Heatmap: React.FC<HeatmapProps> = ({ config, data, theme, onBlockId }) => {
  const containerClass = theme === 'dark' 
    ? `heatmap-container heatmap-${config.displayMode} dark`
    : `heatmap-container heatmap-${config.displayMode}`;
  const [viewType, setViewType] = useState<HeatmapViewType>(config.viewType);
  const [currentDate, setCurrentDate] = useState<Date>(config.referenceDate || new Date());
  const [manualWidth, setManualWidth] = useState<string | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const effectiveWidth = manualWidth || config.containerWidth;

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

  const handleMonthLabelClick = useCallback(async (monthIndex: number) => {
    if (!config.enableMonthPageCreation || !config.monthPageTemplate) return;
    
    const year = currentDate.getFullYear();
    const month = monthIndex + 1;
    let pageName = config.monthPageTemplate
      .replace(/\{month\}/g, String(month).padStart(2, '0'))
      .replace(/\{year\}/g, String(year));
    
    // 使用 ensurePageAndNavigate 确保页面存在并跳转
    await ensurePageAndNavigate(pageName, config.monthPageLogseqTemplate);
  }, [config, currentDate]);

  const handleWeekLabelClick = useCallback(async (weekNumber: number) => {
    if (!config.enableWeekPageCreation || !config.weekPageTemplate) return;
    
    const year = currentDate.getFullYear();
    let pageName = config.weekPageTemplate
      .replace(/\{week\}/g, String(weekNumber).padStart(2, '0'))
      .replace(/\{year\}/g, String(year));
    
    // 使用 ensurePageAndNavigate 确保页面存在并跳转
    await ensurePageAndNavigate(pageName, config.weekPageLogseqTemplate);
  }, [config, currentDate]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = containerRef.current?.clientWidth || 0;
    
    const handleResizeMove = (moveEvent: MouseEvent) => {
      if (!isResizing.current) return;
      const diff = moveEvent.clientX - startX.current;
      const newWidth = Math.max(200, startWidth.current + diff);
      setManualWidth(`${newWidth}px`);
    };
    
    const handleResizeEnd = async () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      
      if (onBlockId && manualWidth) {
        try {
          const currentBlock = await logseqAPI.Editor.getBlock(onBlockId);
          if (currentBlock) {
            const content = currentBlock.content;
            const updatedContent = content.replace(/width=[\w%]+/, `width=${manualWidth}`);
            await logseqAPI.Editor.updateBlock(onBlockId, updatedContent);
          }
        } catch (err) {
          console.error('Failed to update block:', err);
        }
      }
      
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [manualWidth, onBlockId]);

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

    // Adaptive gap calculation for month and week views (range: 2-10px)
    const minGap = 2;
    const maxGap = 10;
    const availableForMonth = Math.max(innerWidth - monthAxis, 0);
    const monthCellWidth = Math.max((availableForMonth - minGap * 6) / 7, 10);
    const monthGap = Math.min(Math.max((availableForMonth - monthCellWidth * 7) / 6, minGap), maxGap);
    
    const availableForWeek = Math.max(innerWidth - weekAxis, 0);
    const weekCellWidth = Math.max((availableForWeek - minGap * 6) / 7, 10);
    const weekGap = Math.min(Math.max((availableForWeek - weekCellWidth * 7) / 6, minGap), maxGap);

    // Calculate cell heights based on container width (width:height ratio control)
    const monthCellHeight = Math.min(Math.max(large * 0.6, 12), 40);
    const weekCellHeight = Math.min(Math.max(week * 0.6, 10), 36);

    const style: any = {
      '--heatmap-cell-small': `${small}px`,
      '--heatmap-cell-large': `${large}px`,
      '--heatmap-cell-large-height': `${monthCellHeight}px`,
      '--heatmap-cell-week': `${week}px`,
      '--heatmap-cell-week-height': `${weekCellHeight}px`,
      '--heatmap-gap-month': `${monthGap}px`,
      '--heatmap-gap-week': `${weekGap}px`,
      '--heatmap-month-cell-width': `${monthCellWidth}px`,
      '--heatmap-month-cell-height': `${monthCellHeight}px`,
      '--heatmap-week-cell-width': `${weekCellWidth}px`,
      '--heatmap-week-cell-height': `${weekCellHeight}px`,
    };
    
    if (effectiveWidth) {
      style.width = effectiveWidth;
    }

    return style;
  }, [containerWidth, config.displayMode, currentDate, effectiveWidth]);

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
        return (
          <YearView 
            data={viewData} 
            config={config} 
            currentDate={currentDate} 
            onCellClick={handleCellClick}
            onMonthLabelClick={handleMonthLabelClick}
            theme={theme}
          />
        );
      case 'month':
        return (
          <MonthView 
            data={viewData} 
            config={config} 
            currentDate={currentDate} 
            onCellClick={handleCellClick}
            onWeekLabelClick={handleWeekLabelClick}
            theme={theme}
          />
        );
      case 'week':
        return (
          <WeekView 
            data={viewData} 
            config={config} 
            currentDate={currentDate} 
            onCellClick={handleCellClick}
          />
        );
      default:
        return null;
    }
  };

  const statistics = React.useMemo(() => {
    const totalBlocks = data.reduce((sum, d) => sum + d.count, 0);
    const activeDays = data.filter(d => d.count > 0).length;
    const maxCount = Math.max(...data.map(d => d.count), 0);
    const avgCount = data.length > 0 ? Math.round(totalBlocks / data.length * 10) / 10 : 0;
    
    // Build blocksByDate map for statistics hover display
    const blocksByDate: Record<string, any[]> = {};
    data.forEach(d => {
      if (d && d.blocks && d.date) {
        const dateKey = d.date.split('T')[0];
        blocksByDate[dateKey] = d.blocks;
      }
    });
    
    return {
      totalBlocks,
      activeDays,
      maxCount,
      avgCount,
      dateRange: {
        start: data.length > 0 ? data[0].date : '',
        end: data.length > 0 ? data[data.length - 1].date : '',
      },
      blocksByDate,
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
      
      <div 
        className="heatmap-resize-handle"
        onMouseDown={handleResizeStart}
      />
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
