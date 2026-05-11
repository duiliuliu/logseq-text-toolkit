import { useState, useCallback, FC, useRef } from 'react';
import { HeatmapStatistics, BlockEntity } from '../../lib/heatmap/types';
import { logseqAPI } from '../../logseq';
import logger from '../../lib/logger';

interface StatisticsProps {
  data: HeatmapStatistics;
  theme?: 'light' | 'dark';
}

interface TooltipItem {
  id: string;
  block: BlockEntity;
  content: string;
  pageTitle: string;
}

let tooltipIdCounter = 0;
function generateTooltipId(): string {
  return `tooltip-${++tooltipIdCounter}-${Date.now()}`;
}

const Statistics: FC<StatisticsProps> = ({ data, theme = 'light' }) => {
  const [tooltips, setTooltips] = useState<TooltipItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const isDark = theme === 'dark';

  const handleStatClick = async (date: string, event: React.MouseEvent) => {
    logger.debug('Statistics stat clicked', { date });
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    setTriggerRect(rect);

    let blocks: BlockEntity[] = [];
    if (date === 'total') {
      const allBlocks: BlockEntity[] = [];
      Object.values(data.blocksByDate || {}).forEach((dayBlocks) => {
        allBlocks.push(...dayBlocks);
      });
      blocks = allBlocks.slice(0, 8);
    } else if (date === 'active') {
      const activeDays = Object.entries(data.blocksByDate || {});
      const lastDayBlocks = activeDays.length > 0
        ? activeDays[activeDays.length - 1][1]
        : [];
      blocks = lastDayBlocks.slice(0, 8);
    } else if (date === 'max') {
      let maxDate = '';
      let maxCount = 0;
      Object.entries(data.blocksByDate || {}).forEach(([d, dayBlocks]) => {
        if (dayBlocks.length > maxCount) {
          maxCount = dayBlocks.length;
          maxDate = d;
        }
      });
      blocks = (data.blocksByDate?.[maxDate] || []).slice(0, 8);
    } else if (date === 'avg') {
      const days = Object.entries(data.blocksByDate || {});
      if (days.length > 0) {
        const randomDay = days[Math.floor(Math.random() * days.length)];
        blocks = randomDay[1].slice(0, 8);
      }
    } else if (data.blocksByDate?.[date]) {
      blocks = data.blocksByDate[date].slice(0, 8);
    }

    const items: TooltipItem[] = [];
    for (const block of blocks) {
      try {
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
        const shortContent = content.length > 40 ? content.substring(0, 40) + '…' : content;

        items.push({
          id: generateTooltipId(),
          block,
          content: shortContent,
          pageTitle,
        });
      } catch (err) {
        logger.error('[Statistics] Failed to process block:', err);
      }
    }

    setTooltips(items);
    setActiveTooltipId(date);
    setIsOpen(true);
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setTooltips([]);
    setActiveTooltipId(null);
    setTriggerRect(null);
  }, []);

  const handleBlockClick = async (block: BlockEntity) => {
    logger.debug('Statistics block clicked', { blockId: block.uuid });
    if (block && block.uuid) {
      try {
        const uuid = typeof block.uuid === 'object' && block.uuid['$uuid$']
          ? block.uuid['$uuid$']
          : block.uuid;
        await logseqAPI.App.pushState('page', { id: uuid });
        handleClose();
      } catch (err) {
        logger.error('[Statistics] Failed to navigate to block:', err);
      }
    }
  };

  const getCardTransform = (index: number, total: number) => {
    const maxOffset = total * 6;
    const translateY = -maxOffset + index * 13;
    const angle = (index - (total - 1) / 2) * 6;
    const center = (total - 1) / 2;
    const normalized = center === 0 ? 0 : (index - center) / center;
    const curve = Math.sin(normalized * (Math.PI / 2));
    const rotate = curve * 9;
    return {
      transform: `translateY(${translateY}px) rotate(${angle}deg)`,
      zIndex: total - index,
      rotate,
    };
  };

  const getCardHoverTransform = () => {
    return {
      transform: 'translateY(-8px) scale(1.03)',
      zIndex: 100,
    };
  };

  const getCardStyle = (index: number, total: number) => {
    const baseStyle = isDark ? {
      background: 'rgba(30, 35, 50, 0.95)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: `0 ${4 + index * 2}px ${12 + index * 3}px rgba(0, 0, 0, ${0.25 + index * 0.03})`,
    } : {
      background: 'rgba(255, 255, 255, 0.98)',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      boxShadow: `0 ${3 + index * 2}px ${10 + index * 3}px rgba(0, 0, 0, ${0.08 + index * 0.01})`,
    };

    return {
      padding: '6px 10px',
      borderRadius: '4px',
      cursor: 'pointer',
      minWidth: '200px',
      maxWidth: '220px',
      transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
      ...getCardTransform(index, total),
      ...baseStyle,
    };
  };

  const getHoverStyle = () => {
    const baseStyle = isDark ? {
      background: 'rgba(192, 193, 255, 0.25)',
      border: '1px solid rgba(192, 193, 255, 0.35)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
    } : {
      background: 'rgba(255, 255, 255, 1)',
      border: '1px solid rgba(59, 130, 246, 0.25)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    };

    return {
      ...getCardHoverTransform(),
      transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
      ...baseStyle,
    };
  };

  const getTooltipStyle = (): React.CSSProperties => {
    if (!triggerRect) {
      return { display: 'none' };
    }
    return {
      position: 'fixed',
      left: triggerRect.left,
      top: triggerRect.top,
      transform: 'translateY(calc(-100% - 8px))',
      zIndex: 999,
      pointerEvents: 'auto',
    };
  };

  return (
    <>
      <div className="heatmap-statistics">
        <div
          className={`stat-item ${activeTooltipId === 'total' && isOpen ? 'active' : ''}`}
          onClick={(e) => handleStatClick('total', e)}
        >
          <div className="stat-value">{data.totalBlocks}</div>
          <div className="stat-label">Total</div>
        </div>
        <div
          className={`stat-item ${activeTooltipId === 'active' && isOpen ? 'active' : ''}`}
          onClick={(e) => handleStatClick('active', e)}
        >
          <div className="stat-value">{data.activeDays}</div>
          <div className="stat-label">Active</div>
        </div>
        <div
          className={`stat-item ${activeTooltipId === 'max' && isOpen ? 'active' : ''}`}
          onClick={(e) => handleStatClick('max', e)}
        >
          <div className="stat-value">{data.maxCount}</div>
          <div className="stat-label">Max</div>
        </div>
        <div
          className={`stat-item ${activeTooltipId === 'avg' && isOpen ? 'active' : ''}`}
          onClick={(e) => handleStatClick('avg', e)}
        >
          <div className="stat-value">{data.avgCount}</div>
          <div className="stat-label">Avg</div>
        </div>
      </div>

      {isOpen && tooltips.length > 0 && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998,
            }}
            onClick={handleClose}
          />
          <div style={getTooltipStyle()}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                padding: '6px',
              }}
            >
              {tooltips.map((tooltip, index) => (
                <div
                  key={tooltip.id}
                  onClick={() => handleBlockClick(tooltip.block)}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.transform = getHoverStyle().transform;
                    el.style.zIndex = String(getHoverStyle().zIndex);
                    el.style.background = getHoverStyle().background;
                    el.style.border = getHoverStyle().border;
                    el.style.boxShadow = getHoverStyle().boxShadow;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    const transforms = getCardTransform(index, tooltips.length);
                    el.style.transform = transforms.transform;
                    el.style.zIndex = String(transforms.zIndex);
                    el.style.background = isDark ? 'rgba(30, 35, 50, 0.95)' : 'rgba(255, 255, 255, 0.98)';
                    el.style.border = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
                    el.style.boxShadow = isDark
                      ? `0 ${4 + index * 2}px ${12 + index * 3}px rgba(0, 0, 0, ${0.25 + index * 0.03})`
                      : `0 ${3 + index * 2}px ${10 + index * 3}px rgba(0, 0, 0, ${0.08 + index * 0.01})`;
                  }}
                  style={{
                    ...getCardStyle(index, tooltips.length),
                  }}
                >
                  <div style={{
                    fontSize: '11px',
                    lineHeight: '1.3',
                    wordBreak: 'break-word',
                    color: isDark ? '#e5e7eb' : '#1f2937',
                    marginBottom: '2px',
                  }}>
                    {tooltip.content}
                  </div>
                  <div style={{
                    fontSize: '9px',
                    color: isDark ? '#9ca3af' : '#6b7280',
                  }}>
                    {tooltip.pageTitle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Statistics;
