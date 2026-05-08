import React, { useState, useEffect } from 'react';
import { Heatmap } from '../../../components/Heatmap';
import { HeatmapConfig, HeatmapDataPoint, HeatmapViewType, DisplayMode, ColorFormula } from '../../../lib/heatmap/types';
import { fetchHeatmapData } from '../../../lib/heatmap/query';

interface HeatmapDemoProps {
  initialConfig?: Partial<HeatmapConfig>;
}

const HeatmapDemo: React.FC<HeatmapDemoProps> = ({ initialConfig }) => {
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

  useEffect(() => {
    loadData();
  }, [config.viewType, config.colorFormula]);

  const loadData = async () => {
    setIsLoading(true);
    const result = await fetchHeatmapData(
      {
        type: 'tag',
        value: 'work',
        year: new Date().getFullYear(),
      },
      config.viewType,
      config.colorFormula
    );
    setData(result);
    setIsLoading(false);
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

  return (
    <div className="heatmap-demo" style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 16px 0' }}>热力图演示</h3>
      
      {/* 控制面板 */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontSize: '12px', color: '#666', marginRight: '8px' }}>视图类型:</label>
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
          <label style={{ fontSize: '12px', color: '#666', marginRight: '8px' }}>显示模式:</label>
          <select 
            value={config.displayMode}
            onChange={(e) => handleDisplayModeChange(e.target.value as DisplayMode)}
            style={{ padding: '4px 8px', fontSize: '12px' }}
          >
            <option value="full">完整模式</option>
            <option value="basic">基础模式</option>
            <option value="minimal">极简模式</option>
          </select>
        </div>
        
        <div>
          <label style={{ fontSize: '12px', color: '#666', marginRight: '8px' }}>颜色公式:</label>
          <select 
            value={config.colorFormula}
            onChange={(e) => handleColorFormulaChange(e.target.value as ColorFormula)}
            style={{ padding: '4px 8px', fontSize: '12px' }}
          >
            <option value="simple">简化模式 (block数量)</option>
            <option value="weighted">加权模式 (含子节点)</option>
          </select>
        </div>
      </div>
      
      {/* 热力图组件 */}
      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          加载中...
        </div>
      ) : (
        <Heatmap config={config} data={data} />
      )}
    </div>
  );
};

export default HeatmapDemo;