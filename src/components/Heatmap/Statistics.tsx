import { useState, useRef, useCallback, FC } from 'react';
import { HeatmapStatistics, BlockEntity } from '../../lib/heatmap/types';
import { logseqAPI } from '../../logseq';
import logger from '../../lib/logger';
import { getWindow } from '../../logseq/utils';

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
  const [anchorPosition, setAnchorPosition] = useState({ x: 0, y: 0 });
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 新增：绑定触发元素的 ref
  const triggerRef = useRef<HTMLElement | null>(null);
  const isDark = theme === 'dark';

  const fetchBlockDetails = useCallback(async (blocks: BlockEntity[]): Promise<TooltipItem[]> => {
    const items: TooltipItem[] = [];
    for (const block of blocks.slice(0, 8)) {
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
    return items;
  }, []);

  const handleStatClick = async (date: string, event: React.MouseEvent) => {
    logger.debug('Statistics stat clicked', { date });
    event.stopPropagation();

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    // 把当前点击的元素存进 ref
    triggerRef.current = event.currentTarget as HTMLElement;

    const rect = event.currentTarget.getBoundingClientRect();
    setAnchorPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });

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

    const tooltipItems = await fetchBlockDetails(blocks);
    setTooltips(tooltipItems);
    setIsOpen(true);
  };

  const handleClose = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setTooltips([]);
      // 关闭时清空 ref
      triggerRef.current = null;
    }, 150);
  }, []);


  const handleBlockClick = async (block: BlockEntity) => {
    logger.debug('Statistics block clicked', { blockId: block.uuid });
    if (block && block.uuid) {
      try {
        const uuid = typeof block.uuid === 'object' && block.uuid['$uuid$']
          ? block.uuid['$uuid$']
          : block.uuid;
        await logseqAPI.App.pushState('page', { id: uuid });
        setIsOpen(false);
        setTooltips([]);
        triggerRef.current = null;
      } catch (err) {
        logger.error('[Statistics] Failed to navigate to block:', err);
      }
    }
  };

  // 新的 getTooltipPosition：用 triggerRef 计算，固定在正上方居中
  const getTooltipPosition = () => {
    if (typeof getWindow() === 'undefined' || !triggerRef.current) {
      return { left: anchorPosition.x, top: anchorPosition.y + 10 };
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 220;
    const tooltipHeight = 60 + tooltips.length * 40;

    // 正上方居中：水平居中对齐触发元素，垂直放在触发元素上方
    let left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2 + 100;
    let top = triggerRect.top - tooltipHeight - 8; // 8px 间距，避免贴死

    // 边界检测，防止 tooltip 超出视窗
    if (left < 10) left = 10;
    if (left + tooltipWidth > getWindow().innerWidth - 10) {
      left = getWindow().innerWidth - tooltipWidth - 10;
    }
    // 如果上方空间不够，自动 fallback 到下方
    if (top < 10) {
      top = triggerRect.bottom + 8;
    }

    return { left, top };
  };

  const getCardTransform = (index: number, total: number) => {
    // 加大基础偏移，加深整体堆叠聚拢感
    const maxOffset = total * 6;
    // 加大垂直步长，卡片上下错落更明显
    const translateY = -maxOffset + index * 13;
    // 从 2.5 改成 5，旋转角度翻倍、扇形更开
    const angle = (index - (total - 1) / 2) * 6;
    // 中心基准 [-1 ~ 1]
    const center = (total - 1) / 2;
    const normalized = center === 0 ? 0 : (index - center) / center;

    // 使用 sin 曲线让扇形更圆润，而不是线性展开
    const curve = Math.sin(normalized * (Math.PI / 2));

    // 旋转不再线性，而是缓入缓出
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

  return (
    <>
      <div className="heatmap-statistics">
        <div
          className="stat-item"
          onClick={(e) => handleStatClick('total', e)}
        >
          <div className="stat-value">{data.totalBlocks}</div>
          <div className="stat-label">Total</div>
        </div>
        <div
          className="stat-item"
          onClick={(e) => handleStatClick('active', e)}
        >
          <div className="stat-value">{data.activeDays}</div>
          <div className="stat-label">Active</div>
        </div>
        <div
          className="stat-item"
          onClick={(e) => handleStatClick('max', e)}
        >
          <div className="stat-value">{data.maxCount}</div>
          <div className="stat-label">Max</div>
        </div>
        <div
          className="stat-item"
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
          <div
            style={{
              position: 'fixed',
              left: getTooltipPosition().left,
              top: getTooltipPosition().top,
              zIndex: 999,
              pointerEvents: 'auto',
            }}
          >
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
                    if (closeTimeoutRef.current) {
                      clearTimeout(closeTimeoutRef.current);
                      closeTimeoutRef.current = null;
                    }
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
                    handleClose();
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