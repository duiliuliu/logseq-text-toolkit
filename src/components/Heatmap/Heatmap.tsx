import React, { useState, useEffect } from 'react';
import YearView from './YearView';
import MonthView from './MonthView';
import WeekView from './WeekView';
import { HeatmapConfig, HeatmapDataPoint, HeatmapViewType, INDIGO_COLORS } from '../../lib/heatmap/types';
import './heatmap.css';

interface HeatmapProps {
  config: HeatmapConfig;
  data: HeatmapDataPoint[];
}

const Heatmap: React.FC<HeatmapProps> = ({ config, data }) => {
  const [viewType, setViewType] = useState<HeatmapViewType>(config.viewType);
  const [currentYear] = useState(config.referenceDate?.getFullYear() || new Date().getFullYear());
  const [currentMonth] = useState(config.referenceDate?.getMonth() || new Date().getMonth());

  const handleViewChange = (type: HeatmapViewType) => {
    setViewType(type);
  };

  const getViewTitle = () => {
    switch (viewType) {
      case 'year':
        return `${currentYear}`;
      case 'month':
        return `${currentYear}年${currentMonth + 1}月`;
      case 'week':
        return `${currentYear}年第${getWeekNumber()}周`;
      default:
        return '';
    }
  };

  const getWeekNumber = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - startOfYear.getTime();
    const oneWeek = 604800000;
    return Math.ceil(diff / oneWeek);
  };

  useEffect(() => {
    setViewType(config.viewType);
  }, [config.viewType]);

  const renderView = () => {
    switch (viewType) {
      case 'year':
        return <YearView data={data} config={config} />;
      case 'month':
        return <MonthView data={data} config={config} />;
      case 'week':
        return <WeekView data={data} config={config} />;
      default:
        return null;
    }
  };

  return (
    <div className={`heatmap-container heatmap-${config.displayMode}`}>
      {config.displayMode !== 'minimal' && (
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
            <button className="nav-btn" title="Previous">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="nav-label">{getViewTitle()}</span>
            <button className="nav-btn" title="Next">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <div className="heatmap-content">
        {renderView()}
      </div>
      
      {config.displayMode !== 'minimal' && (
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

export default Heatmap;