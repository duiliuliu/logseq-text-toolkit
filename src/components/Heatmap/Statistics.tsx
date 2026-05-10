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
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const isDark = theme === 'dark';

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleDateHover = (date: string) => {
    setHoveredDate(date);
  };

  const handleDateLeave = () => {
    setHoveredDate(null);
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

  // Get blocks for hovered date
  const hoveredBlocks = hoveredDate && data.blocksByDate 
    ? data.blocksByDate[hoveredDate] || [] 
    : [];
  const displayBlocks = hoveredBlocks.slice(0, 5);
  const hasMoreBlocks = hoveredBlocks.length > 5;

  return (
    <div className="heatmap-statistics" onMouseMove={handleMouseMove}>
      <div className="stat-item">
        <div className="stat-value">{data.totalBlocks}</div>
        <div className="stat-label">Total</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{data.activeDays}</div>
        <div className="stat-label">Active</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{data.maxCount}</div>
        <div className="stat-label">Max</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{data.avgCount}</div>
        <div className="stat-label">Avg</div>
      </div>
      
      {/* Fan-out stacking display on hover */}
      {hoveredBlocks.length > 0 && (
        <div 
          className="stat-blocks-fan-container"
          style={{
            position: 'fixed',
            left: mousePosition.x + 20,
            top: mousePosition.y - 80,
            zIndex: 1000,
            pointerEvents: 'auto',
          }}
        >
          <div 
            className="stat-blocks-center-card"
            style={{
              background: isDark ? 'rgba(23, 31, 51, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${isDark ? '#c0c1ff' : '#3730a3'}`,
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.2)',
              minWidth: '200px',
              maxWidth: '300px',
            }}
          >
            <div style={{ 
              color: isDark ? '#c0c1ff' : '#3730a3', 
              fontSize: '12px', 
              fontWeight: 500, 
              marginBottom: '8px',
              borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              paddingBottom: '4px'
            }}>
              {hoveredDate}: {hoveredBlocks.length} blocks
            </div>
            
            <div className="stat-blocks-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {displayBlocks.map((block, index) => (
                <div 
                  key={block.uuid || index}
                  className="stat-block-item"
                  style={{
                    padding: '6px 8px',
                    marginBottom: '4px',
                    background: isDark ? 'rgba(45, 52, 73, 0.4)' : 'rgba(239, 242, 255, 0.8)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: isDark ? '#dae2fd' : '#374151',
                    transition: 'all 0.2s ease',
                    transform: `rotate(${(index - 2) * 3}deg) translateY(${index * 2}px)`,
                    position: 'relative',
                    zIndex: displayBlocks.length - index,
                  }}
                  onClick={() => handleBlockClick(block)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05) rotate(0deg)';
                    e.currentTarget.style.background = isDark ? 'rgba(192, 193, 255, 0.3)' : 'rgba(192, 193, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = `rotate(${(index - 2) * 3}deg) translateY(${index * 2}px)`;
                    e.currentTarget.style.background = isDark ? 'rgba(45, 52, 73, 0.4)' : 'rgba(239, 242, 255, 0.8)';
                  }}
                >
                  <div style={{ 
                    fontWeight: 500, 
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '250px'
                  }}>
                    {block.title || block.content?.substring(0, 30) || 'Untitled'}
                  </div>
                  {block['block/updated-at'] && (
                    <div style={{ 
                      fontSize: '10px', 
                      color: isDark ? '#6b7280' : '#9ca3af' 
                    }}>
                      Updated: {new Date(block['block/updated-at']).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
              {hasMoreBlocks && (
                <div style={{ 
                  fontSize: '11px', 
                  color: isDark ? '#9ca3af' : '#6b7280',
                  textAlign: 'center',
                  padding: '4px'
                }}>
                  +{hoveredBlocks.length - 5} more...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;