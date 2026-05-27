import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import YearView from './YearView';
import MonthView from './MonthView';
import WeekView from './WeekView';
import Statistics from './Statistics';
import { HeatmapConfig, HeatmapDataPoint, HeatmapViewType, INDIGO_COLORS } from '../../lib/heatmap/types';
import { logseqAPI } from '../../logseq';
import { ensurePageAndNavigate, formatDateForPage } from '../../lib/heatmap/pageUtils';
import logger from '../../lib/logger';
import './heatmap.css';
import { getDocument } from '../../logseq/utils';
import { updateHeatmapRendererArgs } from '../../lib/heatmap/register';
import { t } from '../../translations/i18n';
import { getSettings } from '../../settings';
import { PageGenerator } from '../../lib/summary/PageGenerator';

// 扩展 dayjs 插件
dayjs.extend(weekOfYear);

/**
 * 计算给定日期的周数
 * @param date - 日期对象
 * @returns 周数（1-53）
 */
const getWeekNumber = (date: Date): number => {
  return dayjs(date).week();
};

/**
 * 计算给定年份的总周数
 * @param year - 年份
 * @returns 该年份的总周数
 */
const getYearWeeksCount = (year: number): number => {
  const lastDayOfYear = dayjs(`${year}-12-31`);
  return lastDayOfYear.week() === 1 ? 52 : lastDayOfYear.week();
};

interface HeatmapProps {
  config: HeatmapConfig;
  data: HeatmapDataPoint[];
  theme?: 'light' | 'dark';
  onBlockId?: string;
}

const Heatmap: React.FC<HeatmapProps> = ({ config, data, theme, onBlockId }) => {

  const language = getSettings()?.language || 'zh-CN';

  const containerClass = theme === 'dark'
    ? `heatmap-container heatmap-${config.displayMode} dark`
    : `heatmap-container heatmap-${config.displayMode}`;
  const [viewType, setViewType] = useState<HeatmapViewType>(config.viewType);
  const [currentDate, setCurrentDate] = useState<Date>(config.referenceDate || new Date());
  const [manualWidth, setManualWidth] = useState<string | undefined>(undefined);
  const manualWidthRef = useRef<string | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const effectiveWidth = manualWidth || config.containerWidth;

  useEffect(() => {
    manualWidthRef.current = manualWidth;
  }, [manualWidth]);

  const handleViewChange = useCallback((type: HeatmapViewType) => {
    setViewType(type);
  }, []);

  const getViewTitle = useCallback((): string => {
    const date = dayjs(currentDate);
    const year = date.year();
    const month = date.month();

    switch (viewType) {
      case 'year':
        return `${year}`;
      case 'month':
        return `${year}/${month + 1}`;
      case 'week':
        return `${year} W${String(date.week()).padStart(2, '0')}`;
      default:
        return '';
    }
  }, [viewType, currentDate]);

  const handlePrevPeriod = useCallback(() => {
    const date = dayjs(currentDate);
    let newDate;
    switch (viewType) {
      case 'year':
        newDate = date.subtract(1, 'year').toDate();
        break;
      case 'month':
        newDate = date.subtract(1, 'month').toDate();
        break;
      case 'week':
        newDate = date.subtract(1, 'week').toDate();
        break;
      default:
        newDate = date.toDate();
    }
    setCurrentDate(newDate);
  }, [viewType, currentDate]);

  const handleNextPeriod = useCallback(() => {
    const date = dayjs(currentDate);
    let newDate;
    switch (viewType) {
      case 'year':
        newDate = date.add(1, 'year').toDate();
        break;
      case 'month':
        newDate = date.add(1, 'month').toDate();
        break;
      case 'week':
        newDate = date.add(1, 'week').toDate();
        break;
      default:
        newDate = date.toDate();
    }
    setCurrentDate(newDate);
  }, [viewType, currentDate]);

  const handleMonthLabelClick = useCallback(async (monthIndex: number) => {
    logger.debug('📐 Heatmap: Month label clicked', { monthIndex });
    if (!config.enableMonthPageCreation || !config.monthPageTemplate) return;

    const year = currentDate.getFullYear();
    const month = monthIndex + 1;
    const pageName = config.monthPageTemplate
      .replace(/\{year\}/g, String(year))
      .replace(/\{month\}/g, String(month).padStart(2, '0'));

    const existingPage = await logseqAPI.Editor.getPage(pageName);
    
    if (existingPage) {
      await logseqAPI.UI.openInRightSidebar(existingPage.uuid);
    } else if (config.monthPageTemplateType) {
      const pageGenerator = new PageGenerator();
      const result = await pageGenerator.generateMonthlyPage(
        year, 
        month, 
        pageName,
        config.monthPageTemplateType as any
      );
      
      if (result) {
        const newPage = await logseqAPI.Editor.getPage(result);
        if (newPage) {
          await logseqAPI.UI.openInRightSidebar(newPage.uuid);
        }
      }
    } else {
      await ensurePageAndNavigate(pageName);
    }
  }, [config, currentDate]);

  const handleWeekLabelClick = useCallback(async (weekNumber: number) => {
    logger.debug('📐 Heatmap: Week label clicked', { weekNumber });
    if (!config.enableWeekPageCreation || !config.weekPageTemplate) return;

    const year = currentDate.getFullYear();
    const pageName = config.weekPageTemplate
      .replace(/\{year\}/g, String(year))
      .replace(/\{week\}/g, String(weekNumber).padStart(2, '0'));

    const existingPage = await logseqAPI.Editor.getPage(pageName);
    
    if (existingPage) {
      await logseqAPI.UI.openInRightSidebar(existingPage.uuid);
    } else if (config.weekPageTemplateType) {
      const pageGenerator = new PageGenerator();
      const result = await pageGenerator.generateWeeklyPage(
        year, 
        weekNumber, 
        pageName,
        config.weekPageTemplateType as any
      );
      
      if (result) {
        const newPage = await logseqAPI.Editor.getPage(result);
        if (newPage) {
          await logseqAPI.UI.openInRightSidebar(newPage.uuid);
        }
      }
    } else {
      await ensurePageAndNavigate(pageName);
    }
  }, [config, currentDate]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    logger.debug('📐 Heatmap: Resize start', { clientX: e.clientX, manualWidth: manualWidthRef.current });
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
      logger.debug('📐 Heatmap: Resize end', { manualWidth: manualWidthRef.current });
      if (!isResizing.current) return;
      isResizing.current = false;

      const finalWidth = manualWidthRef.current;
      if (onBlockId && finalWidth) {
        try {
          const currentBlock = await logseqAPI.Editor.getBlock(onBlockId);
          if (currentBlock) {
            const content = currentBlock.content || '';
            
            // 🔥 使用通用的宏参数更新函数
            const updatedContent = updateHeatmapRendererArgs(content, { containerWidth: finalWidth });

            await logseqAPI.Editor.updateBlock(onBlockId, updatedContent);
            logger.debug('📐 Heatmap: Width updated to block', { onBlockId, finalWidth, updatedContent });
          }
        } catch (err) {
          logger.error('Failed to update block:', err);
        }
      }

      getDocument().removeEventListener('mousemove', handleResizeMove);
      getDocument().removeEventListener('mouseup', handleResizeEnd);
    };

    getDocument().addEventListener('mousemove', handleResizeMove);
    getDocument().addEventListener('mouseup', handleResizeEnd);
  }, [onBlockId]);

  useEffect(() => {
    setViewType(config.viewType);
  }, [config.viewType]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const blockElementId = "ls-block-" + onBlockId;
    let animationFrameId: number | null = null;

    const ro = new ResizeObserver(() => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(() => {
        const blockEl = getDocument().getElementById(blockElementId);
        if (!blockEl) return;

        const containerWidth = el.getBoundingClientRect().width;
        const blockWidth = blockEl.getBoundingClientRect().width;
        const safeWidth = Math.min(containerWidth, blockWidth);

        setContainerWidth(safeWidth);
      });
    });

    ro.observe(el);
    const blockEl = getDocument().getElementById(blockElementId);
    if (blockEl) ro.observe(blockEl);

    const initialBlockEl = getDocument().getElementById(blockElementId);
    const initialWidth = Math.min(
      el.getBoundingClientRect().width,
      initialBlockEl?.getBoundingClientRect().width || el.getBoundingClientRect().width
    );
    setContainerWidth(initialWidth);

    return () => {
      ro.disconnect();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [onBlockId]);

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

    const yearAxis = config.displayMode !== 'minimal' ? 28 : 0;
    const monthAxis = 32;
    const weekAxis = config.displayMode !== 'minimal' ? 44 : 0;

    const yearCols = getYearWeeksCount(dayjs(currentDate).year());
    const monthCols = 7;
    const weekCols = 7;

    const small = calcCell(yearCols, yearAxis, 6, 16);
    const large = calcCell(monthCols, monthAxis, 16, 56);
    const week = calcCell(weekCols, weekAxis, 14, 48);

    const minGap = 2;
    const maxGap = 10;
    const availableForMonth = Math.max(innerWidth - monthAxis, 0);
    const monthCellWidth = Math.max((availableForMonth - minGap * 6) / 7, 10);
    const monthGap = Math.min(Math.max((availableForMonth - monthCellWidth * 7) / 6, minGap), maxGap);

    const availableForWeek = Math.max(innerWidth - weekAxis, 0);
    const weekCellWidth = Math.max((availableForWeek - minGap * 6) / 7, 10);
    const weekGap = Math.min(Math.max((availableForWeek - weekCellWidth * 7) / 6, minGap), maxGap);

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
    logger.debug('📐 Heatmap: Cell clicked', { date });
    if (date) {
      try {
        const pageName = formatDateForPage(date, config?.dateFormat);
        logger.debug('📐 Heatmap: Navigating to page', { pageName, date, dateFormat: config?.dateFormat });
        ensurePageAndNavigate(pageName);
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
              {t('settings.heatmap.viewTypeYear', language)}
            </button>
            <button
              className={`view-btn ${viewType === 'month' ? 'active' : ''}`}
              onClick={() => handleViewChange('month')}
            >
              {t('settings.heatmap.viewTypeMonth', language)}
            </button>
            <button
              className={`view-btn ${viewType === 'week' ? 'active' : ''}`}
              onClick={() => handleViewChange('week')}
            >
              {t('settings.heatmap.viewTypeWeek', language)}
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
  const date = dayjs(currentDate);

  switch (viewType) {
    case 'year':
      const year = date.year();
      return data.filter(d => d.date.startsWith(`${year}-`));
    case 'month':
      const yearMonth = date.format('YYYY-MM');
      return data.filter(d => d.date.startsWith(yearMonth));
    case 'week':
      const startOfWeek = date.startOf('week');
      const endOfWeek = date.endOf('week');
      
      return data.filter(d => {
        const dDate = dayjs(d.date);
        return dDate.isAfter(startOfWeek.subtract(1, 'second')) && 
               dDate.isBefore(endOfWeek.add(1, 'second'));
      });
    default:
      return data;
  }
}

export default Heatmap;
