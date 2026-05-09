import React, { useState, useEffect, useCallback } from 'react';
import { Heatmap } from '../../../components/Heatmap';
import { HeatmapConfig, HeatmapDataPoint, HeatmapViewType, DisplayMode, ColorFormula, HeatmapQueryParams } from '../../../lib/heatmap/types';
import { fetchHeatmapData } from '../../../lib/heatmap/query';
import { logseqAPI, HealthStatus } from '../../services/logseqAPI';
import { fetchHeatmapDataByTokenQuery } from '../../services/heatmapTokenQuery';

interface HeatmapDemoProps {
  initialConfig?: Partial<HeatmapConfig>;
}

const HeatmapDemo: React.FC<HeatmapDemoProps> = ({ initialConfig }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [dataSource, setDataSource] = useState<'mock' | 'api'>('mock');
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
  const [enabled, setEnabled] = useState(false);
  const [apiToken, setApiToken] = useState('');
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [queryType, setQueryType] = useState<HeatmapQueryParams['type']>('tag');
  const [queryValue, setQueryValue] = useState('work');
  const [propertyKey, setPropertyKey] = useState('');

  const checkConnection = useCallback(async () => {
    try {
      const status = await logseqAPI.checkHealth();
      setHealthStatus(status);
      if (!status.connected) {
        setError(status.error === 'invalid_token'
          ? 'Invalid API token. Check your token in Logseq settings.'
          : 'Cannot connect to Logseq. Make sure the API server is enabled.');
      } else {
        setError(null);
      }
    } catch (err: any) {
      setHealthStatus({ connected: false, graphName: null, error: 'connection_refused' });
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (dataSource === 'api' && enabled && apiToken) {
      logseqAPI.setToken(apiToken);
      checkConnection();
    }
    if (dataSource === 'mock') {
      setError(null);
      setHealthStatus(null);
    }
  }, [dataSource, enabled, apiToken, checkConnection]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const week = getWeekNumber(currentDate);
    
    const queryParams: HeatmapQueryParams = {
      type: queryType,
      value: queryValue,
      propertyKey: queryType === 'property' ? propertyKey : undefined,
      year,
      month,
      week,
    };

    try {
      if (dataSource === 'api') {
        if (!enabled || !apiToken) {
          setData([]);
          setIsLoading(false);
          return;
        }
        if (healthStatus && !healthStatus.connected) {
          setData([]);
          setIsLoading(false);
          return;
        }
        const result = await fetchHeatmapDataByTokenQuery(
          queryParams,
          config.viewType,
          config.colorFormula,
          currentDate
        );
        setData(result);
      } else {
        const result = await fetchHeatmapData(
          queryParams,
          config.viewType,
          config.colorFormula
        );
        setData(result);
      }
    } catch (err: any) {
      setError(err.message || String(err));
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, config.viewType, config.colorFormula, dataSource, enabled, apiToken, healthStatus, queryType, queryValue, propertyKey]);

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
          <label style={{ fontSize: '12px', color: '#666', marginRight: '8px' }}>数据源:</label>
          <select
            value={dataSource}
            onChange={(e) => setDataSource(e.target.value as 'mock' | 'api')}
            style={{ padding: '4px 8px', fontSize: '12px' }}
          >
            <option value="mock">Mock</option>
            <option value="api">API</option>
          </select>
        </div>

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
          <label style={{ fontSize: '12px', color: '#666', marginRight: '8px' }}>查询:</label>
          <select
            value={queryType}
            onChange={(e) => setQueryType(e.target.value as HeatmapQueryParams['type'])}
            style={{ padding: '4px 8px', fontSize: '12px', marginRight: '8px' }}
          >
            <option value="tag">Tag</option>
            <option value="page">Page</option>
            <option value="property">Property</option>
          </select>
          <input
            value={queryValue}
            onChange={(e) => setQueryValue(e.target.value)}
            placeholder={queryType === 'tag' ? 'e.g. work' : queryType === 'page' ? 'e.g. My Page' : 'e.g. high'}
            style={{ padding: '4px 8px', fontSize: '12px', width: '140px' }}
          />
        </div>

        {queryType === 'property' && (
          <div>
            <label style={{ fontSize: '12px', color: '#666', marginRight: '8px' }}>属性名:</label>
            <input
              value={propertyKey}
              onChange={(e) => setPropertyKey(e.target.value)}
              placeholder="e.g. category"
              style={{ padding: '4px 8px', fontSize: '12px', width: '140px' }}
            />
          </div>
        )}
        
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
            onClick={loadData}
            style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
          >
            Reload
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

      {dataSource === 'api' && !enabled && (
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
              Enable Logseq API Query
            </label>
            <button
              onClick={() => setEnabled(true)}
              style={{ padding: '6px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
            >
              Enable
            </button>
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
            Connect to local Logseq server to query blocks
          </div>
        </div>
      )}

      {dataSource === 'api' && enabled && (
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
              Enable Logseq API Query
            </label>
            <button
              onClick={() => {
                setEnabled(false);
                setApiToken('');
                setHealthStatus(null);
              }}
              style={{ padding: '6px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
            >
              Disable
            </button>
            {healthStatus?.connected && (
              <span style={{ fontSize: '12px', color: '#16a34a', marginLeft: 'auto' }}>
                Connected{healthStatus.graphName ? `: ${healthStatus.graphName}` : ''}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>
                API Token (from Logseq Settings)
              </label>
              <input
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Enter your Logseq API token"
                style={{ width: '320px', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <button
              onClick={checkConnection}
              style={{ padding: '8px 16px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', alignSelf: 'flex-end' }}
            >
              Check
            </button>
          </div>

          {error && (
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#ef4444' }}>
              {error}
            </div>
          )}
        </div>
      )}
      
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
