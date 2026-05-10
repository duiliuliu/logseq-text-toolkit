import React, { useState } from 'react';
import { HeatmapStatistics } from '../../lib/heatmap/types';
import { logseqAPI } from '../../logseq';

interface StatisticsProps {
  data: HeatmapStatistics;
  theme?: 'light' | 'dark';
}

interface BlockData {
  date: string;
  blocks: any[];
}

const Statistics: React.FC<StatisticsProps> = ({ data, theme = 'light' }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const isDark = theme === 'dark';

  const handleStatClick = (date: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopoverPosition({ x: rect.left, y: rect.bottom + 8 });
    setSelectedDate(date);
  };

  const handleClosePopover = () => {
    setSelectedDate(null);
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

  // Get blocks for selected date
  const selectedBlocks = selectedDate && data.blocksByDate 
    ? data.blocksByDate[selectedDate] || [] 
    : [];
  const displayBlocks = selectedBlocks.slice(0, 8);
  const hasMoreBlocks = selectedBlocks.length > 8;

  // Group blocks by date for clickable stats
  const statDates = Object.keys(data.blocksByDate || {}).slice(0, 4);

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
      
      {/* Click-triggered stacking display */}
      {selectedDate && (
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
            onClick={handleClosePopover}
          />
          <div 
            className="stat-blocks-popover"
            style={{
              position: 'fixed',
              left: Math.min(popoverPosition.x, window.innerWidth - 320),
              top: popoverPosition.y,
              zIndex: 1000,
              pointerEvents: 'auto',
            }}
          >
            <div 
              className="stat-blocks-center-card"
              style={{
                background: isDark ? 'rgba(23, 31, 51, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                border: `1px solid ${isDark ? '#c0c1ff' : '#3730a3'}`,
                borderRadius: '8px',
                padding: '12px',
                boxShadow: isDark 
                  ? '0 8px 32px rgba(0, 0, 0, 0.5)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.3)',
                minWidth: '280px',
                maxWidth: '360px',
                maxHeight: '400px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: isDark ? '#c0c1ff' : '#3730a3', 
                fontSize: '13px', 
                fontWeight: 600, 
                marginBottom: '10px',
                borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                paddingBottom: '8px',
              }}>
                <span>
                  {selectedDate === 'total' && `All Blocks: ${selectedBlocks.length}`}
                  {selectedDate === 'active' && `Active Days: ${Object.keys(data.blocksByDate || {}).length}`}
                  {selectedDate === 'max' && `Max Activity: ${data.maxCount} blocks`}
                  {selectedDate === 'avg' && `Average: ${data.avgCount} blocks/day`}
                </span>
                <button
                  onClick={handleClosePopover}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isDark ? '#9ca3af' : '#6b7280',
                    fontSize: '18px',
                    padding: '0 4px',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
              
              <div 
                className="stat-blocks-list" 
                style={{ 
                  flex: 1,
                  overflowY: 'auto',
                  maxHeight: '320px',
                }}
              >
                {displayBlocks.map((block, index) => (
                  <div 
                    key={block.uuid || index}
                    className="stat-block-item"
                    style={{
                      padding: '10px',
                      marginBottom: '6px',
                      background: isDark 
                        ? 'rgba(45, 52, 73, 0.6)' 
                        : 'rgba(239, 242, 255, 0.9)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: isDark ? '#dae2fd' : '#374151',
                      transition: 'all 0.2s ease',
                      transform: `rotate(${(index - 3.5) * 0.5}deg) translateY(${index * 0.5}px)`,
                      position: 'relative',
                      zIndex: displayBlocks.length - index,
                      border: `1px solid ${isDark ? 'rgba(192, 193, 255, 0.2)' : 'rgba(55, 48, 163, 0.1)'}`,
                    }}
                    onClick={() => handleBlockClick(block)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02) rotate(0deg)';
                      e.currentTarget.style.background = isDark 
                        ? 'rgba(192, 193, 255, 0.3)' 
                        : 'rgba(192, 193, 255, 0.4)';
                      e.currentTarget.style.boxShadow = isDark 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                        : '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = `rotate(${(index - 3.5) * 0.5}deg) translateY(${index * 0.5}px)`;
                      e.currentTarget.style.background = isDark 
                        ? 'rgba(45, 52, 73, 0.6)' 
                        : 'rgba(239, 242, 255, 0.9)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ 
                      fontWeight: 600, 
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '300px',
                      color: isDark ? '#c0c1ff' : '#3730a3',
                    }}>
                      {block.title || block.content?.substring(0, 35) || 'Untitled'}
                      {block.content && block.content.length > 35 && '...'}
                    </div>
                    {block['block/updated-at'] && (
                      <div style={{ 
                        fontSize: '10px', 
                        color: isDark ? '#6b7280' : '#9ca3af',
                        marginTop: '2px',
                      }}>
                        Updated: {new Date(block['block/updated-at']).toLocaleString()}
                      </div>
                    )}
                    {block['block/created-at'] && (
                      <div style={{ 
                        fontSize: '10px', 
                        color: isDark ? '#6b7280' : '#9ca3af',
                      }}>
                        Created: {new Date(block['block/created-at']).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
                {hasMoreBlocks && (
                  <div style={{ 
                    fontSize: '11px', 
                    color: isDark ? '#9ca3af' : '#6b7280',
                    textAlign: 'center',
                    padding: '8px',
                    fontStyle: 'italic',
                  }}>
                    +{selectedBlocks.length - 8} more blocks...
                  </div>
                )}
                {selectedBlocks.length === 0 && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: isDark ? '#9ca3af' : '#6b7280',
                    textAlign: 'center',
                    padding: '20px',
                  }}>
                    No blocks to display
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Statistics;