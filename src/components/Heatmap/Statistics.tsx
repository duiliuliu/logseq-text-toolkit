import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HeatmapStatistics } from '../../lib/heatmap/types';
import { logseqAPI } from '../../logseq';

interface StatisticsProps {
  data: HeatmapStatistics;
  theme?: 'light' | 'dark';
}

interface TooltipItem {
  id: string;
  block: any;
  page: any;
  content: string;
  pageTitle: string;
}

const Statistics: React.FC<StatisticsProps> = ({ data, theme = 'light' }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltips, setTooltips] = useState<TooltipItem[]>([]);
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  const fetchBlockDetails = useCallback(async (blocks: any[]): Promise<TooltipItem[]> => {
    const items: TooltipItem[] = [];
    for (const block of blocks.slice(0, 8)) {
      try {
        const uuid = typeof block.uuid === 'object' && block.uuid['$uuid$']
          ? block.uuid['$uuid$']
          : block.uuid;

        let pageTitle = 'Untitled';
        if (block['block/page']) {
          const pageName = typeof block['block/page'] === 'object'
            ? block['block/page']['page/name']
            : block['block/page'];
          if (pageName) pageTitle = pageName;
        } else if (block.page) {
          pageTitle = typeof block.page === 'object'
            ? block.page['page/name'] || 'Untitled'
            : block.page;
        }

        const content = block.content || block.title || 'Untitled';
        const shortContent = content.length > 40 ? content.substring(0, 40) + '...' : content;

        items.push({
          id: uuid || `block-${Math.random().toString(36).substr(2, 9)}`,
          block,
          page: block['block/page'] || block.page,
          content: shortContent,
          pageTitle,
        });
      } catch (err) {
        console.error('Failed to process block:', err);
      }
    }
    return items;
  }, []);

  const handleStatClick = async (date: string, event: React.MouseEvent) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.right + 12;
    const y = rect.top;
    setTooltipPosition({ x, y });

    let blocks: any[] = [];
    if (date === 'total') {
      const allBlocks: any[] = [];
      Object.values(data.blocksByDate || {}).forEach((dayBlocks) => {
        allBlocks.push(...(dayBlocks as any[]));
      });
      blocks = allBlocks.slice(0, 8);
    } else if (date === 'active') {
      const activeDays = Object.entries(data.blocksByDate || {});
      const lastDayBlocks = activeDays.length > 0
        ? (activeDays[activeDays.length - 1][1] as any[])
        : [];
      blocks = lastDayBlocks.slice(0, 8);
    } else if (date === 'max') {
      let maxDate = '';
      let maxCount = 0;
      Object.entries(data.blocksByDate || {}).forEach(([d, dayBlocks]) => {
        if ((dayBlocks as any[]).length > maxCount) {
          maxCount = (dayBlocks as any[]).length;
          maxDate = d;
        }
      });
      blocks = (data.blocksByDate?.[maxDate] || []) as any[];
      blocks = blocks.slice(0, 8);
    } else if (date === 'avg') {
      const days = Object.entries(data.blocksByDate || {});
      if (days.length > 0) {
        const randomDay = days[Math.floor(Math.random() * days.length)];
        blocks = (randomDay[1] as any[]).slice(0, 8);
      }
    } else if (data.blocksByDate?.[date]) {
      blocks = (data.blocksByDate[date] as any[]).slice(0, 8);
    }

    const tooltipItems = await fetchBlockDetails(blocks);
    setTooltips(tooltipItems);
    setSelectedDate(date);
  };

  const handleClose = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setSelectedDate(null);
      setTooltips([]);
    }, 150);
  }, []);

  const handleMouseEnterTooltip = (tooltipId: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setHoveredTooltip(tooltipId);
  };

  const handleMouseLeaveTooltip = () => {
    setHoveredTooltip(null);
    handleClose();
  };

  const handleBlockClick = async (block: any) => {
    if (block && block.uuid) {
      try {
        const uuid = typeof block.uuid === 'object' && block.uuid['$uuid$']
          ? block.uuid['$uuid$']
          : block.uuid;
        await logseqAPI.App.pushState('page', { id: uuid });
      } catch (err) {
        console.error('Failed to navigate to block:', err);
      }
    }
  };

  const statDates = Object.keys(data.blocksByDate || {}).slice(0, 4);

  const getHeaderText = () => {
    switch (selectedDate) {
      case 'total':
        return `All: ${Object.values(data.blocksByDate || {}).reduce((sum, b) => sum + (b as any[]).length, 0)} blocks`;
      case 'active':
        return `Active: ${Object.keys(data.blocksByDate || {}).length} days`;
      case 'max':
        return `Max: ${data.maxCount} blocks`;
      case 'avg':
        return `Avg: ${data.avgCount}/day`;
      default:
        return `Blocks`;
    }
  };

  return (
    <>
      <div className="heatmap-statistics">
        <div
          className="stat-item"
          onClick={(e) => handleStatClick('total', e)}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-value">{data.totalBlocks}</div>
          <div className="stat-label">Total</div>
        </div>
        <div
          className="stat-item"
          onClick={(e) => handleStatClick('active', e)}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-value">{data.activeDays}</div>
          <div className="stat-label">Active</div>
        </div>
        <div
          className="stat-item"
          onClick={(e) => handleStatClick('max', e)}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-value">{data.maxCount}</div>
          <div className="stat-label">Max</div>
        </div>
        <div
          className="stat-item"
          onClick={(e) => handleStatClick('avg', e)}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-value">{data.avgCount}</div>
          <div className="stat-label">Avg</div>
        </div>
      </div>

      {selectedDate && tooltips.length > 0 && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={handleClose}
          />
          <div
            ref={containerRef}
            style={{
              position: 'fixed',
              left: Math.min(tooltipPosition.x, window.innerWidth - 350),
              top: Math.max(0, tooltipPosition.y - 40),
              zIndex: 1000,
              pointerEvents: 'auto',
            }}
          >
            <div
              style={{
                background: isDark ? 'rgba(23, 31, 51, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                border: `1px solid ${isDark ? '#c0c1ff' : '#3730a3'}`,
                borderRadius: '8px',
                padding: '10px 12px',
                marginBottom: '8px',
                boxShadow: isDark
                  ? '0 4px 20px rgba(0, 0, 0, 0.5)'
                  : '0 4px 20px rgba(0, 0, 0, 0.15)',
                minWidth: '280px',
                maxWidth: '320px',
              }}
            >
              <div style={{
                color: isDark ? '#c0c1ff' : '#3730a3',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '8px',
                borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                paddingBottom: '6px',
              }}>
                {getHeaderText()}
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}>
                {tooltips.map((tooltip, index) => (
                  <div
                    key={tooltip.id}
                    onMouseEnter={() => handleMouseEnterTooltip(tooltip.id)}
                    onMouseLeave={handleMouseLeaveTooltip}
                    onClick={() => handleBlockClick(tooltip.block)}
                    style={{
                      position: 'relative',
                      padding: '10px 12px',
                      background: isDark
                        ? 'rgba(45, 52, 73, 0.8)'
                        : 'rgba(239, 242, 255, 0.95)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: `translateY(${index * -8}px) rotate(${(index - 3.5) * 0.3}deg)`,
                      zIndex: tooltips.length - index,
                      border: `1px solid ${isDark ? 'rgba(192, 193, 255, 0.15)' : 'rgba(55, 48, 163, 0.1)'}`,
                      boxShadow: isDark
                        ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                        : '0 2px 8px rgba(0, 0, 0, 0.08)',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = `translateY(${index * -12}px) scale(1.02)`;
                      e.currentTarget.style.background = isDark
                        ? 'rgba(192, 193, 255, 0.25)'
                        : 'rgba(192, 193, 255, 0.35)';
                      e.currentTarget.style.boxShadow = isDark
                        ? '0 6px 20px rgba(0, 0, 0, 0.4)'
                        : '0 6px 20px rgba(0, 0, 0, 0.15)';
                      e.currentTarget.style.zIndex = '1000';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = `translateY(${index * -8}px) rotate(${(index - 3.5) * 0.3}deg)`;
                      e.currentTarget.style.background = isDark
                        ? 'rgba(45, 52, 73, 0.8)'
                        : 'rgba(239, 242, 255, 0.95)';
                      e.currentTarget.style.boxShadow = isDark
                        ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                        : '0 2px 8px rgba(0, 0, 0, 0.08)';
                      e.currentTarget.style.zIndex = String(tooltips.length - index);
                    }}
                  >
                    <div style={{
                      fontSize: '12px',
                      color: isDark ? '#dae2fd' : '#374151',
                      lineHeight: '1.4',
                      marginBottom: '4px',
                      wordBreak: 'break-word',
                    }}>
                      {tooltip.content}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: isDark ? '#9ca3af' : '#6b7280',
                      fontStyle: 'italic',
                    }}>
                      {tooltip.pageTitle}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: '4px',
                right: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isDark ? '#9ca3af' : '#6b7280',
                fontSize: '18px',
                lineHeight: 1,
                padding: '2px 6px',
                zIndex: 1001,
              }}
            >
              ×
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default Statistics;
