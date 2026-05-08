import React from 'react';
import { HeatmapStatistics } from '../../lib/heatmap/types';

interface StatisticsProps {
  data: HeatmapStatistics;
}

const Statistics: React.FC<StatisticsProps> = ({ data }) => {
  return (
    <div className="heatmap-statistics">
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
    </div>
  );
};

export default Statistics;