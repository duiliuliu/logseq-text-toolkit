import React, { useState, useEffect, useCallback } from 'react';
import { Heatmap } from '../../../components/Heatmap';
import { HeatmapConfig, HeatmapDataPoint, HeatmapViewType, DisplayMode, ColorFormula, HeatmapQueryParams } from '../../../lib/heatmap/types';
import { fetchHeatmapData } from '../../../lib/heatmap/query';
import { logseqAPI, HealthStatus } from '../../services/logseqAPI';
import { fetchHeatmapDataByTokenQuery } from '../../services/heatmapTokenQuery';
import { useSettingsContext } from '../../../settings/useSettings';
import { HeatmapSettings } from '../../../settings/types';

interface HeatmapDemoProps {
  initialConfig?: Partial<HeatmapConfig>;
}

const HeatmapDemo: React.FC<HeatmapDemoProps> = ({ initialConfig }) => {
  const { settings } = useSettingsContext();
  const heatmapSettings = settings?.heatmap as HeatmapSettings | undefined;

  const generateColorGradient = (minColor: string, maxColor: string, steps: number): string[] => {
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    const rgbToHex = (r: number, g: number, b: number) => {
      return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    };

    const minRgb = hexToRgb(minColor);
    const maxRgb = hexToRgb(maxColor);
    const colors: string[] = [];

    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1);
      colors.push(rgbToHex(
        minRgb.r + ratio * (maxRgb.r - minRgb.r),
        minRgb.g + ratio * (maxRgb.g - minRgb.g),
        minRgb.b + ratio * (maxRgb.b - minRgb.b)
      ));
    }

    return colors;
  };

  // 设置初始日期为测试数据的日期范围
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 8));
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [dataSource, setDataSource] = useState<'mock' | 'api' | 'test'>('mock');
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
      if (dataSource === 'test') {
        // 使用用户提供的测试数据
        const testData = [
          [
            {
              "created-at": 1778362343035,
              "page": {"id": 198},
              "tags": [{"id": 158}],
              "title": "节点 3.3.2. 第六层 -叶子",
              "updated-at": 1778362352708,
              "uuid": "69ffa7e7-0932-4273-a61a-5ef7454eda57",
              "content": "节点 3.3.2. 第六层 -叶子",
              "full-title": "节点 3.3.2. 第六层 -叶子"
            }
          ],
          [
            {
              "created-at": 1778362343035,
              "page": {"id": 198},
              "tags": [{"id": 158}],
              "title": "节点3.3",
              "updated-at": 1778362347872,
              "uuid": "69ffa7e7-734f-40f6-a25f-59a61838ebae",
              "content": "节点3.3",
              "full-title": "节点3.3"
            }
          ],
          [
            {
              "created-at": 1778362304572,
              "page": {"id": 198},
              "tags": [{"id": 158}],
              "title": "dasdasd",
              "updated-at": 1778362319822,
              "uuid": "69ffa7c0-1a0e-4124-b0f7-0649ad4cf901",
              "content": "dasdasd",
              "full-title": "dasdasd"
            }
          ],
          [
            {
              "created-at": 1778039021077,
              "page": {"id": 199},
              "tags": [{"id": 158}],
              "title": "节点3.3",
              "updated-at": 1778042580334,
              "uuid": "69fab8ed-6fe6-44f6-ae61-8c4d0c458ab7",
              "content": "节点3.3",
              "full-title": "节点3.3"
            }
          ],
          [
            {
              "created-at": 1778039018302,
              "page": {"id": 199},
              "tags": [{"id": 158}],
              "title": "节点3.1-叶子",
              "updated-at": 1778049677974,
              "uuid": "69fab8ea-aca1-41bd-b2fe-adafd3a9a71c",
              "content": "节点3.1-叶子",
              "full-title": "节点3.1-叶子"
            }
          ],
          [
            {
              "created-at": 1778039010024,
              "page": {"id": 199},
              "tags": [{"id": 158}],
              "title": "节点3",
              "updated-at": 1778042573573,
              "uuid": "69fab8e2-221d-4ee3-9dac-d8a672f87b43",
              "content": "节点3",
              "full-title": "节点3"
            }
          ],
          [
            {
              "created-at": 1778039004891,
              "page": {"id": 199},
              "tags": [{"id": 158}],
              "title": "节点1-叶子",
              "updated-at": 1778043205863,
              "uuid": "69fab8dc-b4f3-4e37-845c-2e803b169e0b",
              "content": "节点1-叶子",
              "full-title": "节点1-叶子"
            }
          ]
        ];
        
        // 扁平化数据并转换为 HeatmapDataPoint 格式
        const flattenData = (items: any[]): any[] => {
          const result: any[] = [];
          items.forEach(item => {
            if (Array.isArray(item)) {
              result.push(...flattenData(item));
            } else {
              result.push(item);
            }
          });
          return result;
        };
        
        const flatBlocks = flattenData(testData);
        
        // 计算周范围，使用参考日期
        const dayOfWeek = currentDate.getDay();
        const monday = new Date(currentDate);
        monday.setDate(currentDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        monday.setHours(0, 0, 0, 0);
        
        const pad2 = (n: number) => String(n).padStart(2, '0');
        const formatLocalDateTimeNoTZ = (d: Date) =>
          `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
        
        // 构建分组
        const buckets: Record<string, any[]> = {};
        for (const b of flatBlocks) {
          const createdAt = b['created-at'];
          if (!createdAt) continue;
          const dt = new Date(createdAt);
          const dayIndex = Math.floor((dt.getTime() - monday.getTime()) / 86400000);
          if (dayIndex < 0 || dayIndex >= 7) continue;
          const hourIndex = Math.floor(dt.getHours() / 4);
          if (hourIndex < 0 || hourIndex >= 6) continue;
          const key = `${dayIndex}-${hourIndex}`;
          if (!buckets[key]) buckets[key] = [];
          buckets[key].push(b);
        }
        
        // 生成数据
        const data: HeatmapDataPoint[] = [];
        for (let hourIndex = 0; hourIndex < 6; hourIndex++) {
          for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + dayIndex);
            d.setHours(hourIndex * 4, 0, 0, 0);
            const key = `${dayIndex}-${hourIndex}`;
            const cellBlocks = buckets[key] || [];
            const count = cellBlocks.length;
            data.push({
              date: formatLocalDateTimeNoTZ(d),
              count,
              blocks: cellBlocks as BlockEntity[],
            });
          }
        }
        setData(data);
      } else if (dataSource === 'api') {
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

  useEffect(() => {
    if (heatmapSettings) {
      setConfig(prev => ({
        ...prev,
        viewType: heatmapSettings.defaultViewType || prev.viewType,
        displayMode: heatmapSettings.defaultDisplayMode || prev.displayMode,
        colorFormula: heatmapSettings.defaultColorFormula || prev.colorFormula,
        colorScheme: {
          name: 'custom',
          colors: generateColorGradient(heatmapSettings.colorScheme.minColor, heatmapSettings.colorScheme.maxColor, heatmapSettings.colorScheme.gradientSteps),
        },
        minColor: heatmapSettings.colorScheme.minColor,
        maxColor: heatmapSettings.colorScheme.maxColor,
      }));
    }
  }, [heatmapSettings?.defaultViewType, heatmapSettings?.defaultDisplayMode, heatmapSettings?.defaultColorFormula, heatmapSettings?.colorScheme?.minColor, heatmapSettings?.colorScheme?.maxColor, heatmapSettings?.colorScheme?.gradientSteps]);

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
            onChange={(e) => setDataSource(e.target.value as 'mock' | 'api' | 'test')}
            style={{ padding: '4px 8px', fontSize: '12px' }}
          >
            <option value="mock">Mock</option>
            <option value="api">API</option>
            <option value="test">Test</option>
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
