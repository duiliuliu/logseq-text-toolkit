# Logseq 热力图组件设计方案

## 1. 产品需求分析

### 1.1 核心需求

| 需求编号 | 需求描述 | 来源 |
| :--- | :--- | :--- |
| REQ-001 | 多维度视图切换：年度、月度、周度 | 用户需求第2点 |
| REQ-002 | 动态导航交互：左右箭头切换时间周期 | 用户需求第2点 |
| REQ-003 | 色彩深度映射：基于 Indigo Density 设计系统 | 用户需求第2点 |
| REQ-004 | 悬停动画：Tooltip 浮窗提示及发光边框效果 | 用户需求第2点 |
| REQ-005 | 点击事件：支持详细数据穿透 | 用户需求第2点 |
| REQ-006 | 支持指定 tag 查询 | 用户需求第3.1点 |
| REQ-007 | 支持指定 page 查询（后续扩展） | 用户需求第3.1点 |
| REQ-008 | 支持指定 property 查询（后续扩展） | 用户需求第3.1点 |
| REQ-009 | 极简/全面展示模式切换 | 用户需求第3.2点 |
| REQ-010 | 颜色深度基于统计数据动态计算 | 用户需求第3.3点 |
| REQ-011 | 年度/月度视图每个格子代表一天 | 用户需求第4点 |
| REQ-012 | 周度视图每个格子代表4小时 | 用户需求第4点 |

### 1.2 功能概述

本功能为 Logseq 提供数据热力图可视化能力：

- **数据聚合层**：通过 Logseq API 查询指定条件（tag/page/property）的 block 数据，按时间维度聚合统计
- **展示层**：提供三种视图模式（年度/月度/周度），支持视图切换和时间导航
- **交互层**：悬停显示详情、点击触发穿透、平滑动画效果
- **配置层**：支持颜色配置、展示模式配置

### 1.3 使用方式

```
{{renderer :热力图  :年度视图 :tag=key1}}
{{renderer :热力图  :月度视图 :tag=work}}
{{renderer :热力图  :周度视图 :tag=study}}
{{renderer :热力图  :年度视图 :page=工作记录}}
{{renderer :热力图  :年度视图 :property=category::工作}}
```

---

## 2. 技术架构设计

### 2.1 项目整体架构

```
Text Toolkit Plugin (项目根目录)
├── src/
│   ├── components/
│   │   ├── Heatmap/                  (新增 - 热力图组件)
│   │   │   ├── index.ts
│   │   │   ├── Heatmap.tsx           (主组件)
│   │   │   ├── YearView.tsx          (年度视图)
│   │   │   ├── MonthView.tsx         (月度视图)
│   │   │   ├── WeekView.tsx          (周度视图)
│   │   │   ├── HeatmapCell.tsx       (单元格组件)
│   │   │   ├── HeatmapTooltip.tsx    (提示组件)
│   │   │   ├── ViewSwitcher.tsx      (视图切换器)
│   │   │   └── heatmap.css
│   │   └── SettingsModal/tabs/
│   │       └── HeatmapSettings.tsx   (新增 - 热力图设置)
│   ├── lib/
│   │   └── heatmap/                  (新增 - 热力图核心逻辑)
│   │       ├── index.ts
│   │       ├── register.ts           (宏注册)
│   │       ├── query.ts              (数据查询)
│   │       ├── colorCalculator.ts    (颜色计算)
│   │       └── types.ts              (类型定义)
│   ├── settings/
│   │   ├── types.ts                  (扩展热力图设置类型)
│   │   └── defaultSettings.json      (扩展默认配置)
│   └── main.tsx                      (注册热力图模块)
└── docs/
    └── Heatmap-Design.md             (本文档)
```

### 2.2 架构图

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        Text Toolkit Plugin (Heatmap)                     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                        main.tsx (入口)                             │  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │  registerHeatmap() - 注册宏渲染器和斜杠命令                   │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                        应用层 (Application Layer)                   │  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │              Heatmap Components (UI 组件)                     │ │  │
│  │  │  Heatmap | YearView | MonthView | WeekView | HeatmapCell     │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                      业务逻辑层 (Business Logic)                    │  │
│  │  ┌──────────────┐ ┌──────────────────┐ ┌──────────────────────┐   │  │
│  │  │ HeatmapQuery │ │ ColorCalculator  │ │ TimeRangeGenerator   │   │  │
│  │  │   数据查询    │ │   颜色深度计算    │ │   时间范围生成       │   │  │
│  │  └──────────────┘ └──────────────────┘ └──────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                      数据访问层 (Data Access)                       │  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │              Logseq API (真实/Mock)                           │ │  │
│  │  │  - DB.datascriptQuery()     执行查询                          │ │  │
│  │  │  - Editor.getBlock()        获取块信息                        │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                      配置层 (Configuration)                         │  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │  HeatmapSettings Tab (独立设置 Tab)                           │ │  │
│  │  │  - 颜色配置 (浅靛蓝到深靛蓝)                                   │ │  │
│  │  │  - 展示模式 (极简/全面)                                        │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.3 模块划分与文件位置

| 模块 | 职责 | 文件位置 | 状态 |
| :--- | :--- | :--- | :--- |
| `components/Heatmap/` | 热力图 UI 组件集合 | [src/components/Heatmap/](file:///workspace/src/components/Heatmap/) | ⏳ 未实现 |
| `lib/heatmap/register.ts` | Logseq API 注册 | [src/lib/heatmap/register.ts](file:///workspace/src/lib/heatmap/register.ts) | ⏳ 未实现 |
| `lib/heatmap/query.ts` | 数据查询逻辑 | [src/lib/heatmap/query.ts](file:///workspace/src/lib/heatmap/query.ts) | ⏳ 未实现 |
| `lib/heatmap/colorCalculator.ts` | 颜色深度计算 | [src/lib/heatmap/colorCalculator.ts](file:///workspace/src/lib/heatmap/colorCalculator.ts) | ⏳ 未实现 |
| `lib/heatmap/types.ts` | 类型定义 | [src/lib/heatmap/types.ts](file:///workspace/src/lib/heatmap/types.ts) | ⏳ 未实现 |
| `components/SettingsModal/tabs/HeatmapSettings.tsx` | 热力图设置 Tab | [src/components/SettingsModal/tabs/HeatmapSettings.tsx](file:///workspace/src/components/SettingsModal/tabs/HeatmapSettings.tsx) | ⏳ 未实现 |

---

## 3. 数据模型设计

### 3.1 核心数据结构

**文件位置**：[src/lib/heatmap/types.ts](file:///workspace/src/lib/heatmap/types.ts)

```typescript
export type HeatmapViewType = 'year' | 'month' | 'week';

export interface HeatmapDataPoint {
  date: string;           // ISO 日期字符串，如 "2024-03-15"
  count: number;          // 该时间段的数据计数
  blocks?: BlockEntity[]; // 关联的 block 列表（可选）
}

export interface BlockEntity {
  id: string;
  uuid: string;
  content: string;
  createdAt: string;      // 创建时间
  updatedAt: string;      // 更新时间
  childrenCount: number;  // 子节点数量
  properties?: Record<string, unknown>;
}

export interface HeatmapQueryParams {
  type: 'tag' | 'page' | 'property';
  value: string;
  propertyKey?: string;   // 当 type='property' 时使用
}

export interface HeatmapConfig {
  viewType: HeatmapViewType;
  showControls: boolean;  // 是否显示切换控件
  showStatistics: boolean; // 是否显示统计信息
  colorScheme: IndigoColorScheme;
  minColor: string;       // 最浅色
  maxColor: string;       // 最深色
}

export interface IndigoColorScheme {
  name: string;
  colors: string[];       // 从浅到深的颜色数组
}

export interface HeatmapCellData {
  date: string;
  value: number;
  maxValue: number;
  color: string;
  isEmpty: boolean;
}

export interface HeatmapStatistics {
  totalBlocks: number;
  activeDays: number;
  maxCount: number;
  avgCount: number;
  dateRange: {
    start: string;
    end: string;
  };
}
```

### 3.2 时间粒度定义

| 视图类型 | 时间颗粒度 | 格子代表时长 | 时间轴配置 |
| :--- | :--- | :--- | :--- |
| 年度视图 | 天 | 24小时 | 横轴：12个月，纵轴：7天（周一至周日） |
| 月度视图 | 天 | 24小时 | 横轴：日期（1-31），纵轴：周数（W1-W5） |
| 周度视图 | 4小时 | 4小时 | 横轴：7天（周一至周日），纵轴：6个时段（0-24点） |

### 3.3 集成到全局设置

**文件位置**：[src/settings/types.ts](file:///workspace/src/settings/types.ts)

```typescript
export interface Settings {
  // ... 现有设置 ...
  
  heatmap?: {
    enabled: boolean;
    defaultViewType: HeatmapViewType;
    showControlsByDefault: boolean;
    showStatisticsByDefault: boolean;
    colorScheme: {
      minColor: string;
      maxColor: string;
      gradientSteps: number;
    };
  };
}
```

---

## 4. 核心功能设计

### 4.1 Logseq 插件初始化与注册

**文件位置**：[src/lib/heatmap/register.ts](file:///workspace/src/lib/heatmap/register.ts)

#### 4.1.1 宏格式

```
{{renderer :热力图  :视图类型  :查询类型=查询值}}
```

**参数说明**：
- `视图类型`：`年度视图`、`月度视图`、`周度视图`（可选，默认为年度视图）
- `查询类型=查询值`：支持以下格式
  - `:tag=tagname` - 按标签查询
  - `:page=pagename` - 按页面查询
  - `:property=key::value` - 按属性查询

**示例**：
```
{{renderer :热力图 :年度视图 :tag=工作}}
{{renderer :热力图 :周度视图 :page=每日记录}}
{{renderer :热力图 :月度视图 :property=category::学习}}
```

#### 4.1.2 代码实现

```typescript
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { Heatmap } from '../../components/Heatmap/Heatmap';
import { fetchHeatmapData } from './query';
import { HeatmapViewType, HeatmapConfig } from './types';
import { getSettings } from '../../settings';
import logger from '../../lib/logger';

const MACRO_PREFIX = ':热力图';
const PLUGIN_ID = 'text-toolkit-heatmap';

const VIEW_TYPE_MAP: Record<string, HeatmapViewType> = {
  '年度视图': 'year',
  '年度': 'year',
  'year': 'year',
  'yearly': 'year',
  '月度视图': 'month',
  '月度': 'month',
  'month': 'month',
  'monthly': 'month',
  '周度视图': 'week',
  '周度': 'week',
  'week': 'week',
  'weekly': 'week',
};

let HeatmapComponent: React.FC<any> | null = null;

export function setHeatmapComponent(component: React.FC<any>) {
  HeatmapComponent = component;
}

async function parseMacroArguments(args: string[]): Promise<{
  viewType: HeatmapViewType;
  queryParams: { type: string; value: string; propertyKey?: string };
  showControls: boolean;
}> {
  let viewType: HeatmapViewType = 'year';
  let queryType = 'tag';
  let queryValue = '';
  let propertyKey = '';
  let showControls = false;

  for (const arg of args) {
    const trimmed = arg.trim();
    
    if (VIEW_TYPE_MAP[trimmed]) {
      viewType = VIEW_TYPE_MAP[trimmed];
    } else if (trimmed.startsWith(':tag=')) {
      queryType = 'tag';
      queryValue = trimmed.substring(5);
    } else if (trimmed.startsWith(':page=')) {
      queryType = 'page';
      queryValue = trimmed.substring(6);
    } else if (trimmed.startsWith(':property=')) {
      queryType = 'property';
      const propertyStr = trimmed.substring(10);
      const [key, value] = propertyStr.split('::');
      propertyKey = key;
      queryValue = value;
    } else if (trimmed === ':showControls' || trimmed === ':显示控件') {
      showControls = true;
    }
  }

  return {
    viewType,
    queryParams: { type: queryType, value: queryValue, propertyKey },
    showControls,
  };
}

async function renderHeatmap(slot: string, args: string[]) {
  try {
    const { viewType, queryParams, showControls } = await parseMacroArguments(args);
    const settings = await getSettings();
    
    const heatmapConfig: HeatmapConfig = {
      viewType,
      showControls: showControls || settings?.heatmap?.showControlsByDefault || false,
      showStatistics: settings?.heatmap?.showStatisticsByDefault || false,
      colorScheme: {
        name: 'indigo',
        colors: generateIndigoGradient(
          settings?.heatmap?.colorScheme?.minColor || '#eef2ff',
          settings?.heatmap?.colorScheme?.maxColor || '#3730a3',
          settings?.heatmap?.colorScheme?.gradientSteps || 5
        ),
      },
      minColor: settings?.heatmap?.colorScheme?.minColor || '#eef2ff',
      maxColor: settings?.heatmap?.colorScheme?.maxColor || '#3730a3',
    };

    const heatmapData = await fetchHeatmapData(queryParams, viewType);

    if (!HeatmapComponent) {
      logger.warn('[Heatmap] Component not registered');
      return;
    }

    const template = ReactDOMServer.renderToStaticMarkup(
      React.createElement(HeatmapComponent, {
        data: heatmapData,
        config: heatmapConfig,
      })
    );

    logseq.provideUI({
      key: PLUGIN_ID + '__' + slot,
      slot,
      reset: true,
      template,
    });

  } catch (err) {
    logger.error('[Heatmap] Render error:', err);
  }
}

export function registerHeatmap(): void {
  logseq.App.onMacroRendererSlotted(async ({ payload, slot }) => {
    const [type, ...args] = payload.arguments || [];
    
    if (!type || !type.startsWith(MACRO_PREFIX)) {
      return;
    }

    await renderHeatmap(slot, args);
  });

  logseq.Editor.registerSlashCommand(
    '[Text Toolkit] Insert Heatmap',
    async () => {
      await logseq.Editor.insertAtEditingCursor(
        '{{renderer :热力图 :年度视图 :tag=}}'
      );
    }
  );

  logger.info('[Heatmap] Registered successfully');
}

function generateIndigoGradient(minColor: string, maxColor: string, steps: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    colors.push(interpolateColor(minColor, maxColor, ratio));
  }
  return colors;
}

function interpolateColor(color1: string, color2: string, ratio: number): string {
  const hex = (c: number) => Math.round(c).toString(16).padStart(2, '0');
  const c1 = parseInt(color1.replace('#', ''), 16);
  const c2 = parseInt(color2.replace('#', ''), 16);
  const r = (c1 >> 16) + ((c2 >> 16) - (c1 >> 16)) * ratio;
  const g = ((c1 >> 8) & 0xff) + (((c2 >> 8) & 0xff) - ((c1 >> 8) & 0xff)) * ratio;
  const b = (c1 & 0xff) + ((c2 & 0xff) - (c1 & 0xff)) * ratio;
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}
```

### 4.2 数据查询逻辑

**文件位置**：[src/lib/heatmap/query.ts](file:///workspace/src/lib/heatmap/query.ts)

#### 4.2.1 查询策略

根据不同的查询类型构建相应的 Datascript 查询：

| 查询类型 | 查询逻辑 | Datascript 查询示例 |
| :--- | :--- | :--- |
| tag | 查询包含指定标签的所有 block | `[?b :block/tags ?t] [?t :block/title "tagname"]` |
| page | 查询指定页面下的所有 block | `[?b :block/page ?p] [?p :block/title "pagename"]` |
| property | 查询包含指定属性键值对的 block | `[?b :block/properties ?props] [(get ?props :key) ?value]` |

#### 4.2.2 时间范围计算

```typescript
export function getTimeRange(viewType: HeatmapViewType, referenceDate?: Date): {
  start: string;
  end: string;
} {
  const date = referenceDate || new Date();
  
  switch (viewType) {
    case 'year':
      return {
        start: `${date.getFullYear()}-01-01`,
        end: `${date.getFullYear()}-12-31`,
      };
    case 'month':
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const daysInMonth = new Date(year, month, 0).getDate();
      return {
        start: `${year}-${month.toString().padStart(2, '0')}-01`,
        end: `${year}-${month.toString().padStart(2, '0')}-${daysInMonth}`,
      };
    case 'week':
      const dayOfWeek = date.getDay();
      const monday = new Date(date);
      monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return {
        start: monday.toISOString().split('T')[0],
        end: sunday.toISOString().split('T')[0],
      };
    default:
      return {
        start: `${date.getFullYear()}-01-01`,
        end: `${date.getFullYear()}-12-31`,
      };
  }
}
```

#### 4.2.3 查询实现

```typescript
import { HeatmapDataPoint, HeatmapQueryParams, HeatmapViewType, BlockEntity } from './types';
import { logseqAPI } from '../../logseq';
import logger from '../../lib/logger';

export async function fetchHeatmapData(
  queryParams: HeatmapQueryParams,
  viewType: HeatmapViewType
): Promise<HeatmapDataPoint[]> {
  try {
    const { start, end } = getTimeRange(viewType);
    
    let query = buildQuery(queryParams, start, end);
    logger.debug('[Heatmap] Query:', query);
    
    const results = await logseqAPI.DB.datascriptQuery(query);
    logger.debug('[Heatmap] Query results:', results);
    
    return aggregateResults(results, viewType);
    
  } catch (error) {
    logger.error('[Heatmap] fetchHeatmapData error:', error);
    return [];
  }
}

function buildQuery(params: HeatmapQueryParams, start: string, end: string): string {
  let filterClause = '';
  
  switch (params.type) {
    case 'tag':
      filterClause = `
        [?b :block/tags ?t]
        [?t :block/title "${params.value}"]
      `;
      break;
    case 'page':
      filterClause = `
        [?b :block/page ?p]
        [?p :block/title "${params.value}"]
      `;
      break;
    case 'property':
      filterClause = `
        [?b :block/properties ?props]
        [(get ?props "${params.propertyKey}") ?propValue]
        [(= ?propValue "${params.value}")]
      `;
      break;
    default:
      filterClause = `
        [?b :block/tags ?t]
        [?t :block/title "${params.value}"]
      `;
  }

  return `
    [:find (pull ?b [:block/uuid :block/content :block/properties :block/created-at :block/updated-at])
     :where
     ${filterClause}
     [?b :block/created-at ?createdAt]
     [(>= ?createdAt #inst "${start}T00:00:00")]
     [(<= ?createdAt #inst "${end}T23:59:59")]
    ]
  `;
}

function aggregateResults(results: any[], viewType: HeatmapViewType): HeatmapDataPoint[] {
  const aggregated: Record<string, BlockEntity[]> = {};
  
  for (const result of results) {
    if (!result || !Array.isArray(result)) continue;
    
    const block = result[0];
    if (!block) continue;
    
    const createdAt = block['block/created-at'] || block.createdAt;
    if (!createdAt) continue;
    
    const dateStr = formatDateForAggregation(createdAt, viewType);
    
    if (!aggregated[dateStr]) {
      aggregated[dateStr] = [];
    }
    
    aggregated[dateStr].push({
      id: block['block/uuid']?.['$uuid$'] || block.id || '',
      uuid: block['block/uuid']?.['$uuid$'] || block.uuid || '',
      content: block['block/content'] || block.content || '',
      createdAt: createdAt,
      updatedAt: block['block/updated-at'] || block.updatedAt || createdAt,
      childrenCount: 0,
      properties: block['block/properties'] || block.properties,
    });
  }
  
  return Object.entries(aggregated).map(([date, blocks]) => ({
    date,
    count: blocks.length,
    blocks,
  }));
}

function formatDateForAggregation(date: string | Date, viewType: HeatmapViewType): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  switch (viewType) {
    case 'year':
    case 'month':
      return d.toISOString().split('T')[0];
    case 'week':
      const hour = Math.floor(d.getHours() / 4) * 4;
      return `${d.toISOString().split('T')[0]}T${hour.toString().padStart(2, '0')}:00:00`;
    default:
      return d.toISOString().split('T')[0];
  }
}
```

### 4.3 颜色深度计算

**文件位置**：[src/lib/heatmap/colorCalculator.ts](file:///workspace/src/lib/heatmap/colorCalculator.ts)

#### 4.3.1 颜色深度计算公式

根据用户需求，颜色深度应基于统计数据的大小动态计算。设计公式如下：

```
颜色深度值 = baseValue + (childrenCount * 0.3) + contentScore

其中：
- baseValue = 基础值（1，表示存在该 block）
- childrenCount = 子节点数量（乘以权重 0.3）
- contentScore = 内容长度评分（content.length / 100，最大为 1）
```

**颜色映射**：基于计算出的值，映射到 Indigo 色系的梯度：

| 数值范围 | 颜色 | 含义 |
| :--- | :--- | :--- |
| 0 | #f5f5f5 | 无数据（空白） |
| 0.1 - 1.0 | #eef2ff | 浅靛蓝（少量数据） |
| 1.1 - 2.0 | #e0e7ff | 浅靛蓝（中等数据） |
| 2.1 - 3.0 | #c7d2fe | 中靛蓝（较多数据） |
| 3.1 - 4.0 | #a5b4fc | 中深靛蓝（大量数据） |
| > 4.0 | #3730a3 | 深靛蓝（极大量数据） |

#### 4.3.2 代码实现

```typescript
import { BlockEntity } from './types';

const INDIGO_COLORS = [
  '#f5f5f5', // 0: 空白/无数据
  '#eef2ff', // 1: 浅靛蓝
  '#e0e7ff', // 2: 浅靛蓝
  '#c7d2fe', // 3: 中靛蓝
  '#a5b4fc', // 4: 中深靛蓝
  '#3730a3', // 5: 深靛蓝
];

export function calculateColorValue(blocks: BlockEntity[]): number {
  if (!blocks || blocks.length === 0) return 0;
  
  let totalValue = 0;
  
  for (const block of blocks) {
    // 基础值 1
    let value = 1;
    
    // 子节点数量贡献（最多 +3）
    const childrenContribution = Math.min(block.childrenCount * 0.3, 3);
    value += childrenContribution;
    
    // 内容长度贡献（最多 +1）
    const contentLength = block.content?.length || 0;
    const contentContribution = Math.min(contentLength / 100, 1);
    value += contentContribution;
    
    totalValue += value;
  }
  
  return totalValue;
}

export function getColorByValue(value: number, maxValue: number): string {
  if (value <= 0) return INDIGO_COLORS[0];
  
  // 归一化到 0-5 的范围
  const normalizedValue = Math.min((value / maxValue) * 5, 5);
  const index = Math.floor(normalizedValue);
  
  // 如果在两个颜色之间，进行插值
  const fraction = normalizedValue - index;
  if (fraction > 0 && index < INDIGO_COLORS.length - 1) {
    return interpolateColor(INDIGO_COLORS[index], INDIGO_COLORS[index + 1], fraction);
  }
  
  return INDIGO_COLORS[Math.min(index, INDIGO_COLORS.length - 1)];
}

function interpolateColor(color1: string, color2: string, ratio: number): string {
  const hex = (c: number) => Math.round(c).toString(16).padStart(2, '0');
  const c1 = parseInt(color1.replace('#', ''), 16);
  const c2 = parseInt(color2.replace('#', ''), 16);
  const r = (c1 >> 16) + ((c2 >> 16) - (c1 >> 16)) * ratio;
  const g = ((c1 >> 8) & 0xff) + (((c2 >> 8) & 0xff) - ((c1 >> 8) & 0xff)) * ratio;
  const b = (c1 & 0xff) + ((c2 & 0xff) - (c1 & 0xff)) * ratio;
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

export function generateColorGradient(minColor: string, maxColor: string, steps: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    colors.push(interpolateColor(minColor, maxColor, ratio));
  }
  return colors;
}
```

---

## 5. UI 组件设计

### 5.1 组件结构

**文件位置**：[src/components/Heatmap/](file:///workspace/src/components/Heatmap/)

```
src/components/Heatmap/
├── index.ts                          # 组件导出
├── types.ts                          # 组件类型定义
├── Heatmap.tsx                       # 主组件
├── YearView.tsx                      # 年度视图
├── MonthView.tsx                     # 月度视图
├── WeekView.tsx                      # 周度视图
├── HeatmapCell.tsx                   # 单元格组件
├── HeatmapTooltip.tsx                # 提示组件
├── ViewSwitcher.tsx                  # 视图切换器
├── TimeNav.tsx                       # 时间导航器
├── Statistics.tsx                    # 统计信息组件
└── heatmap.css                       # 样式文件
```

### 5.2 主组件

**文件位置**：[src/components/Heatmap/Heatmap.tsx](file:///workspace/src/components/Heatmap/Heatmap.tsx)

```typescript
import React, { useState, useMemo } from 'react';
import { HeatmapDataPoint, HeatmapConfig, HeatmapViewType } from '../../lib/heatmap/types';
import YearView from './YearView';
import MonthView from './MonthView';
import WeekView from './WeekView';
import ViewSwitcher from './ViewSwitcher';
import TimeNav from './TimeNav';
import Statistics from './Statistics';
import { calculateColorValue } from '../../lib/heatmap/colorCalculator';

interface HeatmapProps {
  data: HeatmapDataPoint[];
  config: HeatmapConfig;
}

export const Heatmap: React.FC<HeatmapProps> = ({ data, config }) => {
  const [viewType, setViewType] = useState<HeatmapViewType>(config.viewType);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tooltipData, setTooltipData] = useState<{
    date: string;
    count: number;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const maxValue = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => calculateColorValue(d.blocks || [])));
  }, [data]);

  const statistics = useMemo(() => {
    const totalBlocks = data.reduce((sum, d) => sum + d.count, 0);
    const activeDays = data.filter(d => d.count > 0).length;
    const maxCount = Math.max(...data.map(d => d.count), 0);
    const avgCount = data.length > 0 ? Math.round(totalBlocks / data.length * 10) / 10 : 0;
    
    return {
      totalBlocks,
      activeDays,
      maxCount,
      avgCount,
      dateRange: {
        start: data.length > 0 ? data[0].date : '',
        end: data.length > 0 ? data[data.length - 1].date : '',
      },
    };
  }, [data]);

  const handleViewChange = (newViewType: HeatmapViewType) => {
    setViewType(newViewType);
  };

  const handlePrevPeriod = () => {
    const newDate = new Date(currentDate);
    switch (viewType) {
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
    switch (viewType) {
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

  const handleCellHover = (date: string, count: number, value: number, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipData({
      date,
      count,
      value,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleCellLeave = () => {
    setTooltipData(null);
  };

  const handleCellClick = (date: string, count: number) => {
    console.log('Heatmap cell clicked:', { date, count });
    // TODO: 后续可扩展为打开详情面板或跳转到相关页面
  };

  const renderView = () => {
    switch (viewType) {
      case 'year':
        return (
          <YearView
            data={data}
            maxValue={maxValue}
            onCellHover={handleCellHover}
            onCellLeave={handleCellLeave}
            onCellClick={handleCellClick}
          />
        );
      case 'month':
        return (
          <MonthView
            data={data}
            date={currentDate}
            maxValue={maxValue}
            onCellHover={handleCellHover}
            onCellLeave={handleCellLeave}
            onCellClick={handleCellClick}
          />
        );
      case 'week':
        return (
          <WeekView
            data={data}
            date={currentDate}
            maxValue={maxValue}
            onCellHover={handleCellHover}
            onCellLeave={handleCellLeave}
            onCellClick={handleCellClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="heatmap-container">
      {config.showControls && (
        <div className="heatmap-header">
          <ViewSwitcher
            currentView={viewType}
            onViewChange={handleViewChange}
          />
          <TimeNav
            viewType={viewType}
            currentDate={currentDate}
            onPrev={handlePrevPeriod}
            onNext={handleNextPeriod}
          />
        </div>
      )}
      
      <div className="heatmap-content">
        {renderView()}
      </div>
      
      {config.showStatistics && (
        <Statistics data={statistics} />
      )}
      
      {tooltipData && (
        <HeatmapTooltip
          data={tooltipData}
          onClose={() => setTooltipData(null)}
        />
      )}
    </div>
  );
};

export default Heatmap;
```

### 5.3 年度视图组件

**文件位置**：[src/components/Heatmap/YearView.tsx](file:///workspace/src/components/Heatmap/YearView.tsx)

```typescript
import React, { useMemo } from 'react';
import { HeatmapDataPoint } from '../../lib/heatmap/types';
import HeatmapCell from './HeatmapCell';
import { calculateColorValue, getColorByValue } from '../../lib/heatmap/colorCalculator';

interface YearViewProps {
  data: HeatmapDataPoint[];
  maxValue: number;
  onCellHover: (date: string, count: number, value: number, event: React.MouseEvent) => void;
  onCellLeave: () => void;
  onCellClick: (date: string, count: number) => void;
}

const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export const YearView: React.FC<YearViewProps> = ({
  data,
  maxValue,
  onCellHover,
  onCellLeave,
  onCellClick,
}) => {
  const currentYear = new Date().getFullYear();
  
  const gridData = useMemo(() => {
    const result: { date: string; count: number; color: string; value: number }[][] = [];
    
    for (let month = 0; month < 12; month++) {
      const monthData: { date: string; count: number; color: string; value: number }[] = [];
      const firstDay = new Date(currentYear, month, 1);
      const lastDay = new Date(currentYear, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startDayOfWeek = firstDay.getDay() || 7; // 周日为 7
      
      // 填充空白格（该月第一天之前的日子）
      for (let i = 1; i < startDayOfWeek; i++) {
        monthData.push({ date: '', count: 0, color: '#f5f5f5', value: 0 });
      }
      
      // 填充实际日期
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const dataPoint = data.find(d => d.date === dateStr);
        const value = dataPoint ? calculateColorValue(dataPoint.blocks || []) : 0;
        const color = getColorByValue(value, maxValue);
        
        monthData.push({
          date: dateStr,
          count: dataPoint?.count || 0,
          color,
          value,
        });
      }
      
      result.push(monthData);
    }
    
    return result;
  }, [data, maxValue, currentYear]);

  return (
    <div className="heatmap-year-view">
      <div className="heatmap-months-header">
        {MONTHS.map(month => (
          <div key={month} className="heatmap-month-label">{month}</div>
        ))}
      </div>
      
      <div className="heatmap-weekdays-header">
        {WEEKDAYS.map(day => (
          <div key={day} className="heatmap-weekday-label">{day}</div>
        ))}
      </div>
      
      <div className="heatmap-year-grid">
        {gridData.map((monthData, monthIndex) => (
          <div key={monthIndex} className="heatmap-month-column">
            {monthData.map((cell, cellIndex) => (
              <HeatmapCell
                key={`${monthIndex}-${cellIndex}`}
                date={cell.date}
                count={cell.count}
                color={cell.color}
                value={cell.value}
                isEmpty={!cell.date}
                onHover={(e) => cell.date && onCellHover(cell.date, cell.count, cell.value, e)}
                onLeave={onCellLeave}
                onClick={() => cell.date && onCellClick(cell.date, cell.count)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default YearView;
```

### 5.4 周度视图组件

**文件位置**：[src/components/Heatmap/WeekView.tsx](file:///workspace/src/components/Heatmap/WeekView.tsx)

```typescript
import React, { useMemo } from 'react';
import { HeatmapDataPoint } from '../../lib/heatmap/types';
import HeatmapCell from './HeatmapCell';
import { calculateColorValue, getColorByValue } from '../../lib/heatmap/colorCalculator';

interface WeekViewProps {
  data: HeatmapDataPoint[];
  date: Date;
  maxValue: number;
  onCellHover: (date: string, count: number, value: number, event: React.MouseEvent) => void;
  onCellLeave: () => void;
  onCellClick: (date: string, count: number) => void;
}

const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const TIME_SLOTS = ['0-4', '4-8', '8-12', '12-16', '16-20', '20-24'];

export const WeekView: React.FC<WeekViewProps> = ({
  data,
  date,
  maxValue,
  onCellHover,
  onCellLeave,
  onCellClick,
}) => {
  const weekStart = useMemo(() => {
    const dayOfWeek = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return monday;
  }, [date]);

  const gridData = useMemo(() => {
    const result: { date: string; count: number; color: string; value: number }[][] = [];
    
    for (let day = 0; day < 7; day++) {
      const dayData: { date: string; count: number; color: string; value: number }[] = [];
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + day);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      for (let slot = 0; slot < 6; slot++) {
        const hour = slot * 4;
        const slotDateStr = `${dateStr}T${hour.toString().padStart(2, '0')}:00:00`;
        const dataPoint = data.find(d => d.date.startsWith(dateStr) && d.date.includes(`T${hour.toString().padStart(2, '0')}`));
        const value = dataPoint ? calculateColorValue(dataPoint.blocks || []) : 0;
        const color = getColorByValue(value, maxValue);
        
        dayData.push({
          date: slotDateStr,
          count: dataPoint?.count || 0,
          color,
          value,
        });
      }
      
      result.push(dayData);
    }
    
    return result;
  }, [data, weekStart, maxValue]);

  return (
    <div className="heatmap-week-view">
      <div className="heatmap-week-header">
        {WEEKDAYS.map((day, index) => {
          const dayDate = new Date(weekStart);
          dayDate.setDate(weekStart.getDate() + index);
          const dateStr = `${dayDate.getMonth() + 1}/${dayDate.getDate()}`;
          return (
            <div key={day} className="heatmap-weekday-header">
              <div className="heatmap-weekday-name">{day}</div>
              <div className="heatmap-weekday-date">{dateStr}</div>
            </div>
          );
        })}
      </div>
      
      <div className="heatmap-week-grid">
        {TIME_SLOTS.map((slot, slotIndex) => (
          <div key={slot} className="heatmap-time-row">
            <div className="heatmap-time-label">{slot}</div>
            <div className="heatmap-time-cells">
              {gridData.map((dayData, dayIndex) => {
                const cell = dayData[slotIndex];
                return (
                  <HeatmapCell
                    key={`${dayIndex}-${slotIndex}`}
                    date={cell.date}
                    count={cell.count}
                    color={cell.color}
                    value={cell.value}
                    isEmpty={false}
                    size="large"
                    onHover={(e) => onCellHover(cell.date, cell.count, cell.value, e)}
                    onLeave={onCellLeave}
                    onClick={() => onCellClick(cell.date, cell.count)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;
```

### 5.5 月度视图组件

**文件位置**：[src/components/Heatmap/MonthView.tsx](file:///workspace/src/components/Heatmap/MonthView.tsx)

```typescript
import React, { useMemo } from 'react';
import { HeatmapDataPoint } from '../../lib/heatmap/types';
import HeatmapCell from './HeatmapCell';
import { calculateColorValue, getColorByValue } from '../../lib/heatmap/colorCalculator';

interface MonthViewProps {
  data: HeatmapDataPoint[];
  date: Date;
  maxValue: number;
  onCellHover: (date: string, count: number, value: number, event: React.MouseEvent) => void;
  onCellLeave: () => void;
  onCellClick: (date: string, count: number) => void;
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export const MonthView: React.FC<MonthViewProps> = ({
  data,
  date,
  maxValue,
  onCellHover,
  onCellLeave,
  onCellClick,
}) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const gridData = useMemo(() => {
    const result: { date: string; count: number; color: string; value: number; weekNum: number }[][] = [];
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay() || 7;
    
    // 计算该月第一周是当年的第几周
    const firstWeekNum = getWeekNumber(firstDay);
    
    let currentWeekNum = firstWeekNum;
    let currentWeek: { date: string; count: number; color: string; value: number; weekNum: number }[] = [];
    
    // 填充空白格
    for (let i = 1; i < startDayOfWeek; i++) {
      currentWeek.push({ date: '', count: 0, color: '#f5f5f5', value: 0, weekNum: currentWeekNum });
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dataPoint = data.find(d => d.date === dateStr);
      const value = dataPoint ? calculateColorValue(dataPoint.blocks || []) : 0;
      const color = getColorByValue(value, maxValue);
      
      currentWeek.push({
        date: dateStr,
        count: dataPoint?.count || 0,
        color,
        value,
        weekNum: currentWeekNum,
      });
      
      // 周末换行
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
        currentWeekNum++;
      }
    }
    
    // 填充最后一周的空白格
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', count: 0, color: '#f5f5f5', value: 0, weekNum: currentWeekNum });
      }
      result.push(currentWeek);
    }
    
    return result;
  }, [data, year, month, maxValue]);

  function getWeekNumber(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const daysDiff = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    return Math.ceil((daysDiff + startOfYear.getDay() + 1) / 7);
  }

  const weekNumbers = useMemo(() => {
    return [...new Set(gridData.flat().map(cell => cell.weekNum))];
  }, [gridData]);

  return (
    <div className="heatmap-month-view">
      <div className="heatmap-month-header">
        <div className="heatmap-weeknum-header" />
        {WEEKDAYS.map(day => (
          <div key={day} className="heatmap-weekday-label">{day}</div>
        ))}
      </div>
      
      <div className="heatmap-month-grid">
        {gridData.map((week, weekIndex) => (
          <div key={weekIndex} className="heatmap-week-row">
            <div className="heatmap-weeknum-label">W{weekNumbers[weekIndex]}</div>
            {week.map((cell, cellIndex) => (
              <HeatmapCell
                key={`${weekIndex}-${cellIndex}`}
                date={cell.date}
                count={cell.count}
                color={cell.color}
                value={cell.value}
                isEmpty={!cell.date}
                size="medium"
                onHover={(e) => cell.date && onCellHover(cell.date, cell.count, cell.value, e)}
                onLeave={onCellLeave}
                onClick={() => cell.date && onCellClick(cell.date, cell.count)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthView;
```

### 5.6 单元格组件

**文件位置**：[src/components/Heatmap/HeatmapCell.tsx](file:///workspace/src/components/Heatmap/HeatmapCell.tsx)

```typescript
import React from 'react';

interface HeatmapCellProps {
  date: string;
  count: number;
  color: string;
  value: number;
  isEmpty: boolean;
  size?: 'small' | 'medium' | 'large';
  onHover: (event: React.MouseEvent) => void;
  onLeave: () => void;
  onClick: () => void;
}

export const HeatmapCell: React.FC<HeatmapCellProps> = ({
  date,
  count,
  color,
  value,
  isEmpty,
  size = 'small',
  onHover,
  onLeave,
  onClick,
}) => {
  const sizeClasses = {
    small: 'heatmap-cell-small',
    medium: 'heatmap-cell-medium',
    large: 'heatmap-cell-large',
  };

  return (
    <div
      className={`heatmap-cell ${sizeClasses[size]} ${isEmpty ? 'heatmap-cell-empty' : ''}`}
      style={{ backgroundColor: color }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      title={isEmpty ? '' : `${date}: ${count} 个记录`}
    />
  );
};

export default HeatmapCell;
```

### 5.7 样式设计

**文件位置**：[src/components/Heatmap/heatmap.css](file:///workspace/src/components/Heatmap/heatmap.css)

```css
.heatmap-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: var(--ls-primary-background-color, #ffffff);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.heatmap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--ls-border-color, #e5e7eb);
}

.heatmap-view-switcher {
  display: flex;
  gap: 4px;
}

.heatmap-view-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--ls-secondary-text-color, #6b7280);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.heatmap-view-btn:hover {
  background: var(--ls-secondary-background-color, #f3f4f6);
}

.heatmap-view-btn.active {
  background: var(--ls-primary-color, #6366f1);
  color: white;
}

.heatmap-time-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.heatmap-nav-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: var(--ls-secondary-background-color, #f3f4f6);
  color: var(--ls-primary-text-color, #1f2937);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.heatmap-nav-btn:hover {
  background: var(--ls-primary-color, #6366f1);
  color: white;
}

.heatmap-nav-date {
  font-size: 14px;
  font-weight: 500;
  color: var(--ls-primary-text-color, #1f2937);
  min-width: 100px;
  text-align: center;
}

.heatmap-content {
  overflow-x: auto;
}

.heatmap-year-view {
  display: flex;
  flex-direction: column;
}

.heatmap-months-header {
  display: flex;
  margin-bottom: 4px;
}

.heatmap-month-label {
  flex: 1;
  text-align: center;
  font-size: 11px;
  color: var(--ls-secondary-text-color, #6b7280);
  padding: 4px 2px;
}

.heatmap-weekdays-header {
  display: flex;
  flex-direction: column;
  width: 24px;
  margin-right: 4px;
}

.heatmap-weekday-label {
  height: 14px;
  line-height: 14px;
  font-size: 10px;
  color: var(--ls-secondary-text-color, #6b7280);
  text-align: right;
  padding-right: 4px;
}

.heatmap-year-grid {
  display: flex;
  gap: 2px;
}

.heatmap-month-column {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.heatmap-cell {
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.15s ease;
  position: relative;
}

.heatmap-cell-small {
  width: 12px;
  height: 12px;
}

.heatmap-cell-medium {
  width: 20px;
  height: 20px;
}

.heatmap-cell-large {
  width: 40px;
  height: 32px;
}

.heatmap-cell:hover {
  transform: scale(1.2);
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.5);
  z-index: 10;
}

.heatmap-cell-empty {
  background: transparent !important;
  cursor: default;
}

.heatmap-cell-empty:hover {
  transform: none;
  box-shadow: none;
}

.heatmap-week-view {
  display: flex;
  flex-direction: column;
}

.heatmap-week-header {
  display: flex;
  margin-bottom: 8px;
}

.heatmap-weekday-header {
  flex: 1;
  text-align: center;
}

.heatmap-weekday-name {
  font-size: 12px;
  color: var(--ls-primary-text-color, #1f2937);
  font-weight: 500;
}

.heatmap-weekday-date {
  font-size: 10px;
  color: var(--ls-secondary-text-color, #6b7280);
}

.heatmap-week-grid {
  display: flex;
  flex-direction: column;
}

.heatmap-time-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.heatmap-time-label {
  width: 40px;
  font-size: 10px;
  color: var(--ls-secondary-text-color, #6b7280);
  text-align: right;
  padding-right: 8px;
}

.heatmap-time-cells {
  flex: 1;
  display: flex;
  gap: 4px;
}

.heatmap-month-view {
  display: flex;
  flex-direction: column;
}

.heatmap-month-header {
  display: flex;
  margin-bottom: 8px;
}

.heatmap-weeknum-header {
  width: 32px;
}

.heatmap-month-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.heatmap-week-row {
  display: flex;
  gap: 2px;
}

.heatmap-weeknum-label {
  width: 32px;
  font-size: 10px;
  color: var(--ls-secondary-text-color, #6b7280);
  line-height: 20px;
}

.heatmap-statistics {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--ls-border-color, #e5e7eb);
}

.heatmap-stat-item {
  text-align: center;
}

.heatmap-stat-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--ls-primary-text-color, #1f2937);
}

.heatmap-stat-label {
  font-size: 12px;
  color: var(--ls-secondary-text-color, #6b7280);
  margin-top: 2px;
}

.heatmap-tooltip {
  position: fixed;
  background: var(--ls-primary-background-color, #ffffff);
  border: 1px solid var(--ls-border-color, #e5e7eb);
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transform: translateX(-50%) translateY(-100%);
  pointer-events: none;
}

.heatmap-tooltip-date {
  font-size: 14px;
  font-weight: 600;
  color: var(--ls-primary-text-color, #1f2937);
  margin-bottom: 4px;
}

.heatmap-tooltip-count {
  font-size: 12px;
  color: var(--ls-secondary-text-color, #6b7280);
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 12px;
}

.heatmap-legend-label {
  font-size: 10px;
  color: var(--ls-secondary-text-color, #6b7280);
  margin: 0 4px;
}

.heatmap-legend-cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}
```

---

## 6. 集成与注册

### 6.1 主入口注册

**文件位置**：[src/main.tsx](file:///workspace/src/main.tsx)

```typescript
import { registerHeatmap, setHeatmapComponent } from './lib/heatmap/register';
import Heatmap from './components/Heatmap/Heatmap';

// 在插件初始化时注册热力图组件
function initHeatmap() {
  setHeatmapComponent(Heatmap);
  registerHeatmap();
}

// 在主初始化函数中调用
export async function main() {
  // ... 其他初始化代码 ...
  
  initHeatmap();
  
  // ... 其他初始化代码 ...
}
```

### 6.2 样式导出

**文件位置**：[src/styles/index.ts](file:///workspace/src/styles/index.ts)

```typescript
import heatmapCSS from '../components/Heatmap/heatmap.css?raw';

export {
  // ... 其他样式 ...
  heatmapCSS,
};
```

---

## 7. Mock 实现

### 7.1 Mock 查询数据

**文件位置**：[src/logseq/mock/index.ts](file:///workspace/src/logseq/mock/index.ts)

```typescript
DB: {
  datascriptQuery: (query: string) => {
    console.log('Mock DB datascriptQuery called for Heatmap:', query);
    
    const now = new Date();
    const mockData: any[] = [];
    
    // 生成过去一年的模拟数据
    for (let i = 0; i < 365; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString();
      
      // 随机生成 0-5 个记录
      const count = Math.random() > 0.3 ? Math.floor(Math.random() * 6) : 0;
      
      for (let j = 0; j < count; j++) {
        mockData.push([{
          'block/uuid': { '$uuid$': `mock-uuid-${i}-${j}` },
          'block/content': `Task ${i}-${j}`,
          'block/properties': {},
          'block/created-at': dateStr,
          'block/updated-at': dateStr,
        }]);
      }
    }
    
    return Promise.resolve(mockData);
  },
}
```

---

## 8. 配置项说明

### 8.1 默认配置

**文件位置**：[src/settings/defaultSettings.json](file:///workspace/src/settings/defaultSettings.json)

```json
{
  "heatmap": {
    "enabled": true,
    "defaultViewType": "year",
    "showControlsByDefault": false,
    "showStatisticsByDefault": false,
    "colorScheme": {
      "minColor": "#eef2ff",
      "maxColor": "#3730a3",
      "gradientSteps": 5
    }
  }
}
```

### 8.2 设置面板字段

| 字段 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| enabled | boolean | true | 是否启用热力图功能 |
| defaultViewType | string | "year" | 默认视图类型（year/month/week） |
| showControlsByDefault | boolean | false | 默认是否显示切换控件 |
| showStatisticsByDefault | boolean | false | 默认是否显示统计信息 |
| colorScheme.minColor | string | "#eef2ff" | 最浅色（浅靛蓝） |
| color