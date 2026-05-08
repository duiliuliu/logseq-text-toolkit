import React, { useState, useEffect, useCallback } from 'react';
import { Heatmap } from '../../../components/Heatmap';
import { HeatmapConfig, HeatmapDataPoint, HeatmapViewType, DisplayMode, ColorFormula } from '../../../lib/heatmap/types';
import { fetchHeatmapData } from '../../../lib/heatmap/query';

interface HeatmapDemoProps {
  initialConfig?: Partial<HeatmapConfig>;
}

const HeatmapDemo: React.FC<HeatmapDemoProps> = ({ initialConfig }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [config, setConfig] = useState<HeatmapConfig>({
    viewType: 'year',
    displayMode: 'full',
    colorFormula: 'simple',
    colorScheme: {
      name: 'indigo',
      colors: ['#f5f5f5', '#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#3730a3'],
    },
    minColor: '#eef2ff',
    maxColor: '#3730a3',
    language: 'zh-CN',
    ...initialConfig,
  });
  
  const [data, setData] = useState<HeatmapDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const week = getWeekNumber(currentDate);
    
    const result = await fetchHeatmapData(
      {
        type: 'tag',
        value: 'work',
        year: year,
        month: month,
        week: week,
      },
      config.viewType,
      config.colorFormula
    );
    setData(result);
    setIsLoading(false);
  }, [currentDate, config.viewType, config.colorFormula]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getWeekNumber = (date: Date): number => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - startOfYear.getTime();
    const oneWeek = 604800000;
    return Math.ceil(diff / oneWeek);
  };

  const handleViewChange = (viewType: HeatmapViewType) => {
    setConfig(prev => ({ ...prev, viewType }));
  };

  const handleDisplayModeChange = (displayMode: DisplayMode) => {
    setConfig(prev => ({ ...prev, displayMode }));
  };

  const handleColorFormulaChange = (colorFormula: ColorFormula) => {
    setConfig(prev => ({ ...prev, colorFormula }));
  };

  const handlePrevPeriod = () => {
    const newDate = new Date(currentDate);
    switch (config.viewType) {
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
  };

  const handleNextPeriod = () => {
    const newDate = new Date(currentDate);
    switch (config.viewType) {
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
  };

  const getViewTitle = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    switch (config.viewType) {
      case 'year':
        return `${year}`;
      case 'month':
        return `${year}年${month + 1}月`;
      case 'week':
        return `${year}年第${getWeekNumber(currentDate)}周`;
      default:
        return '';
    }
  };

  return (
    <div className="heatmap-demo" style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 16px 0' }}>热力图演示</h3>
      
      {/* 控制面板 */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '12px', color: '#666', marginRight: '8px' }}>视图:</label>
          <select 
            value={config.viewType}
            onChange={(e) => handleViewChange(e.target.value as HeatmapViewType)}
            style={{ padding: '4px 8px', fontSize: '12px' }}
          >
            <option value="year">年度视图</option>
            <option value="month">月度视图</option>
            <option value="week">周度视图</option>
          </select>
        </div>
        
        <div>
          <label style={{ fontSize: '12px', color: '#666', marginRight: '8px' }}>显示:</label>
          <select 
            value={config.displayMode}
            onChange={(e) => handleDisplayModeChange(e.target.value as DisplayMode)}
            style={{ padding: '4px 8px', fontSize: '12px' }}
          >
            <option value="full">完整</option>
            <option value="basic">基础</option>
            <option value="minimal">极简</option>
          </select>
        </div>
        
        <div>
          <label style={{ fontSize: '12px', color: '#666', marginRight: '8px' }}>公式:</label>
          <select 
            value={config.colorFormula}
            onChange={(e) => handleColorFormulaChange(e.target.value as ColorFormula)}
            style={{ padding: '4px 8px', fontSize: '12px' }}
          >
            <option value="simple">简化</option>
            <option value="weighted">加权</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <button 
            onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
            style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button 
            onClick={handlePrevPeriod}
            style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
          >
            ←
          </button>
          <span style={{ fontSize: '12px', color: '#666', minWidth: '80px', textAlign: 'center' }}>
            {getViewTitle()}
          </span>
          <button 
            onClick={handleNextPeriod}
            style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
          >
            →
          </button>
        </div>
      </div>
      
      {/* 热力图组件 */}
      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          加载中...
        </div>
      ) : (
        <Heatmap config={config} data={data} theme={theme} />
      )}
    </div>
  );
};

export default HeatmapDemo;