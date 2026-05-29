# Milestone 时间线组件设计方案

## 1. 概述

### 1.1 模块定位

Milestone 是一个用于展示项目进度、面试流程等阶段性进展的 UI 组件。它能够：

- 根据用户定义的属性枚举值展示不同的里程碑阶段
- 支持通过宏命令过滤数据（tag + property）
- 提供 5 种预设的展示样式
- 与现有的 Heatmap、TaskProgress 组件形成互补

### 1.2 核心特性

1. **属性枚举获取**：通过 Logseq DB API 获取用户自定义属性的所有枚举值
2. **宏命令过滤**：支持使用 Datascript 查询语法过滤数据
3. **多样式展示**：支持 5 种不同的 UI 展示风格
4. **动态配置**：支持通过宏参数自定义展示样式和行为

### 1.3 使用场景

```
面试流程管理：
  {{renderer :milestone :interview :style=capsule :property=stage}}

项目进度追踪：
  {{renderer :milestone :project :style=progress :property=phase}}

时间轴展示：
  {{renderer :milestone :timeline :style=track :property=quarter}}
```

## 2. 数据模型设计

### 2.1 核心数据结构

**文件位置**：`src/lib/milestone/types.ts`

```typescript
/**
 * Milestone 里程碑数据结构
 */

export interface MilestoneItem {
  id: string;
  label: string;           // 阶段名称
  status: MilestoneStatus; // 状态
  date?: string;           // 完成日期
  progress?: number;       // 进度百分比 (0-100)
  color?: string;          // 自定义颜色
}

export type MilestoneStatus = 
  | 'completed'   // 已完成
  | 'in-progress' // 进行中
  | 'pending'     // 待开始
  | 'failed';     // 已失败/未通过

export interface MilestoneData {
  items: MilestoneItem[];
  totalCount: number;
  completedCount: number;
  overallProgress: number;
}

export interface MilestoneConfig {
  property: string;              // 属性名 (如 "stage", "phase")
  tag?: string;                  // 过滤标签
  style: MilestoneDisplayStyle;  // 展示样式
  showProgress?: boolean;        // 是否显示进度
  showLabels?: boolean;          // 是否显示标签
  colorScheme?: ColorScheme;     // 颜色配置
  language?: string;             // 语言
}

export type MilestoneDisplayStyle = 
  | 'capsule'      // Style 1: 胶囊进度条
  | 'badge'        // Style 2: 数字徽标 + 进度
  | 'track'        // Style 3: 极简轨道
  | 'card'         // Style 4: 卡片浮层
  | 'compact';     // Style 5: 状态徽章

export interface ColorScheme {
  completed: string;    // 已完成颜色
  inProgress: string;   // 进行中颜色
  pending: string;      // 待开始颜色
  failed: string;       // 失败颜色
  background: string;    // 背景色
  text: string;         // 文字色
}
```

### 2.2 查询结果结构

```typescript
/**
 * Logseq DB 查询结果映射
 */

export interface BlockWithProperty {
  id: string;
  uuid: string;
  content: string;
  properties: {
    [key: string]: any;
    // 用户自定义属性
  };
  createdAt: string;
  updatedAt: string;
}

export interface PropertyEnumValue {
  value: string;        // 枚举值
  count: number;        // 使用次数
  blocks: BlockWithProperty[];  // 关联的块
}
```

## 3. 架构设计

### 3.1 整体架构

```
┌────────────────────────────────────────────────────────────────────┐
│                     Milestone 模块架构图                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                      应用层 (Application)                     │ │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────┐  │ │
│  │  │ CapsuleView│ │ BadgeView  │ │ TrackView  │ │CardView│  │ │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────┘  │ │
│  │  ┌────────────┐ ┌────────────────────────────────────┐   │ │
│  │  │CompactView │ │      Milestone Container             │   │ │
│  │  └────────────┘ └────────────────────────────────────┘   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    业务逻辑层 (Business Logic)                │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐   │ │
│  │  │MilestoneQuery│ │PropertyEnum  │ │ StatusCalculator  │   │ │
│  │  │   数据查询     │ │  枚举值获取    │ │    状态计算       │   │ │
│  │  └──────────────┘ └──────────────┘ └──────────────────────┘   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                      接口层 (Interface)                       │ │
│  │  ┌──────────────────────────────────────────────────────┐   │ │
│  │  │              Logseq DB API Wrapper                    │   │ │
│  │  │   - datascriptQuery                                    │   │ │
│  │  │   - getPropertyEnums                                   │   │ │
│  │  │   - getBlocksWithProperty                              │   │ │
│  │  └──────────────────────────────────────────────────────┘   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 3.2 模块文件结构

```
src/
├── components/
│   └── Milestone/
│       ├── index.ts
│       ├── Milestone.tsx                    # 主容器组件
│       ├── MilestoneContainer.tsx           # 容器组件
│       ├── styles/
│       │   ├── CapsuleMilestone.tsx         # Style 1: 胶囊进度条
│       │   ├── BadgeMilestone.tsx           # Style 2: 数字徽标
│       │   ├── TrackMilestone.tsx           # Style 3: 极简轨道
│       │   ├── CardMilestone.tsx             # Style 4: 卡片浮层
│       │   └── CompactMilestone.tsx         # Style 5: 状态徽章
│       ├── components/
│       │   ├── MilestoneNode.tsx            # 里程碑节点
│       │   ├── MilestoneLine.tsx            # 连接线
│       │   ├── MilestoneTooltip.tsx         # 提示框
│       │   └── MilestoneProgress.tsx       # 进度条
│       └── milestone.css
│
├── lib/
│   └── milestone/
│       ├── index.ts
│       ├── register.ts                      # 宏注册
│       ├── query.ts                         # 数据查询
│       ├── propertyEnum.ts                  # 属性枚举获取
│       ├── statusCalculator.ts              # 状态计算
│       ├── types.ts                         # 类型定义
│       └── constants.ts                     # 常量定义
│
├── settings/
│   └── tabs/
│       └── MilestoneSettings.tsx            # 设置面板
│
└── translations/
    ├── zh-CN.json
    ├── en.json
    └── milestone.json                       # milestone 专用翻译
```

## 4. 核心功能实现

### 4.1 属性枚举获取

**需求**：获取用户自定义属性 `a` 的所有枚举值

**API 示例**：

```bash
curl 'http://127.0.0.1:12315/api' \
-H 'Authorization: Bearer sw6ur06m7' \
-H 'Content-Type: application/json' \
--data-raw '{
  "method": "logseq.DB.datascriptQuery",
  "args": [
    "[:find (pull ?val [* {:block/refs [:block/title]}]) 
      :where 
      [_ :user.property/-ae_Y5gsx ?val]]"
  ]
}'
```

**实现代码**：

**文件位置**：`src/lib/milestone/propertyEnum.ts`

```typescript
/**
 * 属性枚举值获取模块
 */

import { logseqAPI } from '../../logseq/index.ts';
import type { PropertyEnumValue, BlockWithProperty } from './types.ts';
import logger from '../logger/index';

export class PropertyEnumService {
  /**
   * 获取属性的所有枚举值
   * @param propertyKey 属性键名 (如 "ae_Y5gsx" 或 "company")
   */
  static async getPropertyEnums(propertyKey: string): Promise<PropertyEnumValue[]> {
    try {
      // 构建 Datascript 查询
      // 注意：Logseq 中用户属性的格式为 :user.property/<key>
      const query = this.buildEnumQuery(propertyKey);
      
      const result = await logseqAPI.DB.datascriptQuery(query);
      
      if (!result || !Array.isArray(result)) {
        logger.warn('[PropertyEnum] No results found');
        return [];
      }

      return this.parseQueryResult(result, propertyKey);
    } catch (error) {
      logger.error('[PropertyEnum] Query failed:', error);
      return [];
    }
  }

  /**
   * 构建枚举查询语句
   */
  private static buildEnumQuery(propertyKey: string): string {
    // 转换属性名为 Datascript 格式
    // user.property/xxx -> user.property/xxx
    const formattedKey = propertyKey.startsWith('user.property/') 
      ? propertyKey 
      : `user.property/${propertyKey}`;

    return `[:find (pull ?val [* {:block/refs [:block/title]}]) 
                    :where 
                    [_ :${formattedKey} ?val]]`;
  }

  /**
   * 解析查询结果
   */
  private static parseQueryResult(
    result: any[], 
    propertyKey: string
  ): PropertyEnumValue[] {
    const enumMap = new Map<string, PropertyEnumValue>();

    for (const row of result) {
      if (!row || !Array.isArray(row)) continue;

      for (const item of row) {
        if (!item || !item['block/title']) continue;

        const value = item['block/title'];
        const refBlocks = item['block/refs'] || [];

        if (!enumMap.has(value)) {
          enumMap.set(value, {
            value,
            count: 0,
            blocks: [],
          });
        }

        const enumValue = enumMap.get(value)!;
        enumValue.count++;

        // 收集关联的块信息
        refBlocks.forEach((ref: any) => {
          if (ref && ref['block/title']) {
            enumValue.blocks.push({
              id: ref.id?.toString() || '',
              uuid: ref.uuid || '',
              content: ref['block/title'],
              properties: {},
              createdAt: '',
              updatedAt: '',
            });
          }
        });
      }
    }

    return Array.from(enumMap.values()).sort((a, b) => b.count - a.count);
  }

  /**
   * 获取带标签过滤的属性枚举值
   */
  static async getPropertyEnumsWithTag(
    propertyKey: string,
    tag: string
  ): Promise<PropertyEnumValue[]> {
    try {
      const query = this.buildFilteredEnumQuery(propertyKey, tag);
      const result = await logseqAPI.DB.datascriptQuery(query);

      if (!result || !Array.isArray(result)) {
        return [];
      }

      return this.parseQueryResult(result, propertyKey);
    } catch (error) {
      logger.error('[PropertyEnum] Filtered query failed:', error);
      return [];
    }
  }

  /**
   * 构建带标签过滤的查询语句
   */
  private static buildFilteredEnumQuery(
    propertyKey: string,
    tag: string
  ): string {
    const formattedKey = propertyKey.startsWith('user.property/') 
      ? propertyKey 
      : `user.property/${propertyKey}`;

    return `[:find (pull ?b [*])
                    :where
                    [?b :${formattedKey} ?val]
                    [?val :block/title ?title]
                    [?b :block/tags ?t]
                    [?t :block/title "${tag}"]]`;
  }
}
```

**使用示例**：

```typescript
// 获取 company 属性的所有枚举值
const companies = await PropertyEnumService.getPropertyEnums('company');
// 结果: [{ value: "安克", count: 5, blocks: [...] }, ...]

// 获取带"面试"标签的 company 属性枚举值
const interviewCompanies = await PropertyEnumService.getPropertyEnumsWithTag('company', '面试');
```

### 4.2 宏命令过滤

**需求**：支持通过宏命令设置 tag + property 过滤数据

**宏命令格式**：

```
{{renderer :milestone <tag> <style> <property=key>}}
```

**过滤示例**：

```markdown
// 面试流程 - 按公司过滤
{{renderer :milestone :interview :style=capsule :company}}

// 仅显示"安克"公司的面试
{{renderer :milestone :interview :style=badge :company=安克 :tag=面试}}

// 多重过滤
{{renderer :milestone :project :style=track :phase :tag=重要}}
```

**Datascript 查询模板**：

**文件位置**：`src/lib/milestone/query.ts`

```typescript
/**
 * 数据查询模块
 */

import { logseqAPI } from '../../logseq/index.ts';
import type { BlockWithProperty, MilestoneItem, MilestoneData } from './types.ts';
import { PropertyEnumService } from './propertyEnum.ts';
import { StatusCalculator } from './statusCalculator.ts';
import logger from '../logger/index';

export class MilestoneQuery {
  /**
   * 执行带过滤条件的查询
   */
  static async query(
    tag?: string,
    property?: string,
    propertyValue?: string
  ): Promise<MilestoneData> {
    try {
      // 1. 如果指定了属性值，直接查询该值对应的块
      if (property && propertyValue) {
        return await this.queryByPropertyValue(property, propertyValue, tag);
      }

      // 2. 如果只指定了属性，获取所有枚举值
      if (property) {
        return await this.queryByPropertyEnum(property, tag);
      }

      // 3. 如果只指定了标签，获取标签关联的所有块
      if (tag) {
        return await this.queryByTag(tag);
      }

      // 4. 默认查询
      return await this.queryDefault();
    } catch (error) {
      logger.error('[MilestoneQuery] Query failed:', error);
      return this.createEmptyData();
    }
  }

  /**
   * 根据属性值查询
   */
  private static async queryByPropertyValue(
    property: string,
    value: string,
    tag?: string
  ): Promise<MilestoneData> {
    const query = this.buildPropertyValueQuery(property, value, tag);
    const result = await logseqAPI.DB.datascriptQuery(query);

    return this.parseBlocksToMilestone(result, property);
  }

  /**
   * 根据属性枚举查询
   */
  private static async queryByPropertyEnum(
    property: string,
    tag?: string
  ): Promise<MilestoneData> {
    // 获取属性的所有枚举值
    const enums = tag 
      ? await PropertyEnumService.getPropertyEnumsWithTag(property, tag)
      : await PropertyEnumService.getPropertyEnums(property);

    // 为每个枚举值创建里程碑项
    const items: MilestoneItem[] = enums.map((enumItem, index) => ({
      id: `milestone-${index}`,
      label: enumItem.value,
      status: this.calculateStatus(enumItem.blocks),
      progress: this.calculateProgress(enumItem.blocks),
      color: undefined,
    }));

    return {
      items,
      totalCount: items.length,
      completedCount: items.filter(i => i.status === 'completed').length,
      overallProgress: this.calculateOverallProgress(items),
    };
  }

  /**
   * 根据标签查询
   */
  private static async queryByTag(tag: string): Promise<MilestoneData> {
    const query = `
      [:find (pull ?b [*])
       :where
       [?b :block/tags ?t]
       [?t :block/title "${tag}"]]
    `;

    const result = await logseqAPI.DB.datascriptQuery(query);
    return this.parseBlocksToMilestone(result);
  }

  /**
   * 构建属性值查询
   */
  private static buildPropertyValueQuery(
    property: string,
    value: string,
    tag?: string
  ): string {
    const formattedProperty = property.startsWith('user.property/') 
      ? property 
      : `user.property/${property}`;

    let query = `[:find (pull ?b [*])
                    :where
                    [?b :${formattedProperty} ?val]
                    [?val :block/title "${value}"]`;

    if (tag) {
      query += `\n[?b :block/tags ?t]
                 [?t :block/title "${tag}"]`;
    }

    query += ']';
    return query;
  }

  /**
   * 解析块数据为里程碑数据
   */
  private static parseBlocksToMilestone(
    result: any[],
    property?: string
  ): MilestoneData {
    const blocks: BlockWithProperty[] = [];

    for (const row of result) {
      if (!row || !Array.isArray(row)) continue;

      for (const item of row) {
        if (!item) continue;

        blocks.push({
          id: item.id?.toString() || '',
          uuid: item.uuid || '',
          content: item.content || item['block/title'] || '',
          properties: item.properties || {},
          createdAt: item.createdAt || '',
          updatedAt: item.updatedAt || '',
        });
      }
    }

    // 按属性值分组
    const groupByProperty = (blocks: BlockWithProperty[], prop: string) => {
      const groups = new Map<string, BlockWithProperty[]>();

      blocks.forEach(block => {
        const value = block.properties?.[prop]?.toString() || 'Unknown';
        if (!groups.has(value)) {
          groups.set(value, []);
        }
        groups.get(value)!.push(block);
      });

      return groups;
    };

    if (property) {
      const groups = groupByProperty(blocks, property);
      const items: MilestoneItem[] = [];

      let index = 0;
      groups.forEach((groupBlocks, value) => {
        items.push({
          id: `milestone-${index++}`,
          label: value,
          status: this.calculateStatus(groupBlocks),
          progress: this.calculateProgress(groupBlocks),
        });
      });

      return {
        items,
        totalCount: items.length,
        completedCount: items.filter(i => i.status === 'completed').length,
        overallProgress: this.calculateOverallProgress(items),
      };
    }

    // 无属性分组，直接使用块作为里程碑
    const items: MilestoneItem[] = blocks.map((block, index) => ({
      id: `milestone-${index}`,
      label: block.content.substring(0, 50),
      status: this.calculateStatus([block]),
      progress: this.calculateProgress([block]),
    }));

    return {
      items,
      totalCount: items.length,
      completedCount: items.filter(i => i.status === 'completed').length,
      overallProgress: this.calculateOverallProgress(items),
    };
  }

  /**
   * 计算状态
   */
  private static calculateStatus(blocks: BlockWithProperty[]): MilestoneStatus {
    return StatusCalculator.calculateFromBlocks(blocks);
  }

  /**
   * 计算进度
   */
  private static calculateProgress(blocks: BlockWithProperty[]): number {
    return StatusCalculator.calculateProgress(blocks);
  }

  /**
   * 计算总体进度
   */
  private static calculateOverallProgress(items: MilestoneItem[]): number {
    if (items.length === 0) return 0;
    
    const totalProgress = items.reduce((sum, item) => {
      return sum + (item.progress || 0);
    }, 0);

    return Math.round(totalProgress / items.length);
  }

  /**
   * 创建空数据
   */
  private static createEmptyData(): MilestoneData {
    return {
      items: [],
      totalCount: 0,
      completedCount: 0,
      overallProgress: 0,
    };
  }
}
```

**状态计算器**：

**文件位置**：`src/lib/milestone/statusCalculator.ts`

```typescript
/**
 * 状态计算器
 */

import type { BlockWithProperty, MilestoneStatus } from './types.ts';

export class StatusCalculator {
  /**
   * 从块列表计算状态
   */
  static calculateFromBlocks(blocks: BlockWithProperty[]): MilestoneStatus {
    if (blocks.length === 0) {
      return 'pending';
    }

    // 检查是否有 marker 属性
    const markers = blocks
      .map(b => b.properties?.marker?.toString().toLowerCase())
      .filter(Boolean);

    if (markers.some(m => m === 'done')) {
      // 如果有任何块标记为完成
      if (markers.every(m => m === 'done')) {
        return 'completed';
      }
      return 'in-progress';
    }

    if (markers.some(m => m === 'doing' || m === 'in-progress')) {
      return 'in-progress';
    }

    return 'pending';
  }

  /**
   * 计算进度百分比
   */
  static calculateProgress(blocks: BlockWithProperty[]): number {
    if (blocks.length === 0) {
      return 0;
    }

    const markers = blocks.map(b => b.properties?.marker?.toString().toLowerCase());
    const doneCount = markers.filter(m => m === 'done').length;

    return Math.round((doneCount / blocks.length) * 100);
  }

  /**
   * 从日期计算状态
   */
  static calculateFromDate(
    dateStr: string,
    referenceDate: Date = new Date()
  ): MilestoneStatus {
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      return 'pending';
    }

    if (date < referenceDate) {
      return 'completed';
    }

    if (date.toDateString() === referenceDate.toDateString()) {
      return 'in-progress';
    }

    return 'pending';
  }
}
```

### 4.3 宏命令注册

**文件位置**：`src/lib/milestone/register.ts`

```typescript
/**
 * Milestone 宏注册
 */

import { logseqAPI } from '../../logseq/index.ts';
import { MilestoneQuery } from './query.ts';
import { PropertyEnumService } from './propertyEnum.ts';
import { Milestone } from '../../components/Milestone/index.ts';
import type { MilestoneDisplayStyle } from './types.ts';
import logger from '../logger/index';

interface MacroPayload {
  arguments: string[];
  uuid: string;
}

interface MacroSlot {
  slot: string;
}

/**
 * 注册 Milestone 宏渲染器
 */
export function registerMilestone(): void {
  logseqAPI.App.onMacroRendererSlotted(async ({ 
    payload, 
    slot 
  }: MacroPayload & MacroSlot) => {
    try {
      // 解析参数
      const config = parseMacroArguments(payload.arguments);

      // 查询数据
      const milestoneData = await MilestoneQuery.query(
        config.tag,
        config.property,
        config.propertyValue
      );

      // 渲染组件
      const template = renderMilestoneTemplate(milestoneData, config);

      logseqAPI.provideUI({
        key: `milestone-${slot}`,
        slot,
        reset: true,
        template,
      });
    } catch (error) {
      logger.error('[Milestone] Render failed:', error);
    }
  });
}

/**
 * 解析宏参数
 */
function parseMacroArguments(args: string[]): {
  tag?: string;
  style: MilestoneDisplayStyle;
  property?: string;
  propertyValue?: string;
} {
  let tag: string | undefined;
  let style: MilestoneDisplayStyle = 'capsule';
  let property: string | undefined;
  let propertyValue: string | undefined;

  for (const arg of args) {
    if (!arg) continue;

    // 解析 style=xxx
    if (arg.startsWith('style=')) {
      const styleValue = arg.substring(6);
      if (['capsule', 'badge', 'track', 'card', 'compact'].includes(styleValue)) {
        style = styleValue as MilestoneDisplayStyle;
      }
      continue;
    }

    // 解析 property=xxx 或 property
    if (arg.startsWith('property=')) {
      property = arg.substring(9);
    } else if (arg.startsWith(':') && !arg.includes('=')) {
      // 可能是 tag
      tag = arg.substring(1);
    } else if (arg.includes('=')) {
      // property=value 格式
      const [key, value] = arg.split('=');
      if (key && value) {
        property = key;
        propertyValue = value;
      }
    } else if (!property) {
      // 默认作为 property
      property = arg;
    }
  }

  return { tag, style, property, propertyValue };
}

/**
 * 渲染模板
 */
function renderMilestoneTemplate(
  data: any,
  config: any
): string {
  // 使用 React 的服务端渲染
  // 这里返回简单的 HTML 模板，实际渲染由客户端处理
  return `<div class="milestone-renderer" data-style="${config.style}" data-config='${JSON.stringify(config)}'>
    <div class="milestone-loading">Loading...</div>
  </div>`;
}
```

## 5. UI 组件设计

### 5.1 五种展示样式

#### Style 1: 胶囊进度条 (Capsule)

**设计说明**：
- 水平排列的胶囊形状进度条
- 每个阶段显示名称和状态
- 支持通过/进行中/待定状态

**UI 草图**：

```
  投递简历    HR 筛选    技术一面    技术二面      终    面      Offer
   ●━━━━━━━━━●━━━━━━━━━●━━━━━━━━━◐ ━━━━━━━━ ○ ━━━━━━━━ ○
  2/01 通过  2/04 通过  2/10 通过   进行中       待定         待定
```

**代码实现**：`src/components/Milestone/styles/CapsuleMilestone.tsx`

```tsx
import React from 'react';
import type { MilestoneItem, ColorScheme } from '../../lib/milestone/types';

interface CapsuleMilestoneProps {
  items: MilestoneItem[];
  colorScheme?: ColorScheme;
  showLabels?: boolean;
}

const CapsuleMilestone: React.FC<CapsuleMilestoneProps> = ({
  items,
  colorScheme = defaultColorScheme,
  showLabels = true,
}) => {
  const getNodeColor = (status: string) => {
    switch (status) {
      case 'completed': return colorScheme.completed;
      case 'in-progress': return colorScheme.inProgress;
      case 'pending': return colorScheme.pending;
      default: return colorScheme.pending;
    }
  };

  const getNodeSymbol = (status: string) => {
    switch (status) {
      case 'completed': return '●';
      case 'in-progress': return '◐';
      case 'pending': return '○';
      default: return '○';
    }
  };

  return (
    <div className="milestone-capsule">
      <div className="milestone-track">
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            {/* 阶段标签 */}
            <div className="milestone-node">
              <span 
                className="milestone-symbol"
                style={{ color: getNodeColor(item.status) }}
              >
                {getNodeSymbol(item.status)}
              </span>
              {index < items.length - 1 && (
                <div 
                  className="milestone-line"
                  style={{ 
                    backgroundColor: items[index + 1]?.status === 'completed' 
                      ? colorScheme.completed 
                      : colorScheme.pending 
                  }}
                />
              )}
            </div>
            
            {/* 阶段信息 */}
            {showLabels && (
              <div className="milestone-info">
                <div className="milestone-label">{item.label}</div>
                <div 
                  className="milestone-status"
                  style={{ color: getNodeColor(item.status) }}
                >
                  {item.date ? `${item.date} ` : ''}
                  {item.status === 'completed' ? '通过' : 
                   item.status === 'in-progress' ? '进行中' : '待定'}
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const defaultColorScheme: ColorScheme = {
  completed: '#10b981',   // 绿色
  inProgress: '#f59e0b',  // 黄色
  pending: '#d1d5db',     // 灰色
  failed: '#ef4444',      // 红色
  background: '#ffffff',
  text: '#374151',
};

export default CapsuleMilestone;
```

#### Style 2: 数字徽标 + 进度 (Badge)

**设计说明**：
- 每个阶段显示数字编号
- 显示当前阶段进度百分比
- 底部整体进度条

**UI 草图**：

```
  01           02           03           04           05
  ●            ●            ◐            ○            ○
需求分析      系统设计      开发阶段      测试验收      上线发布
 已完成        已完成       进行中 65%    待开始        待开始
──────────────────────────────────────────────────────────
████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 40%
```

**代码实现**：`src/components/Milestone/styles/BadgeMilestone.tsx`

```tsx
import React from 'react';
import type { MilestoneItem, ColorScheme } from '../../lib/milestone/types';

interface BadgeMilestoneProps {
  items: MilestoneItem[];
  colorScheme?: ColorScheme;
  showLabels?: boolean;
  overallProgress?: number;
}

const BadgeMilestone: React.FC<BadgeMilestoneProps> = ({
  items,
  colorScheme = defaultColorScheme,
  showLabels = true,
  overallProgress = 0,
}) => {
  const getNodeColor = (status: string) => {
    switch (status) {
      case 'completed': return colorScheme.completed;
      case 'in-progress': return colorScheme.inProgress;
      case 'pending': return colorScheme.pending;
      default: return colorScheme.pending;
    }
  };

  const getNodeSymbol = (status: string) => {
    switch (status) {
      case 'completed': return '●';
      case 'in-progress': return '◐';
      case 'pending': return '○';
      default: return '○';
    }
  };

  return (
    <div className="milestone-badge">
      <div className="milestone-grid">
        {items.map((item, index) => (
          <div key={item.id} className="milestone-badge-item">
            <div className="milestone-badge-number">
              {String(index + 1).padStart(2, '0')}
            </div>
            <span 
              className="milestone-symbol"
              style={{ color: getNodeColor(item.status) }}
            >
              {getNodeSymbol(item.status)}
            </span>
            {showLabels && (
              <>
                <div className="milestone-label">{item.label}</div>
                <div 
                  className="milestone-sublabel"
                  style={{ color: getNodeColor(item.status) }}
                >
                  {item.status === 'completed' ? '已完成' : 
                   item.status === 'in-progress' ? `进行中 ${item.progress || 0}%` : '待开始'}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      
      {/* 整体进度条 */}
      <div className="milestone-overall-progress">
        <div 
          className="milestone-progress-bar"
          style={{ width: `${overallProgress}%` }}
        />
        <span className="milestone-progress-label">
          {overallProgress}%
        </span>
      </div>
    </div>
  );
};

export default BadgeMilestone;
```

#### Style 3: 极简轨道 (Track)

**设计说明**：
- 最小化的圆点线条
- 仅显示阶段名称
- 时间线格式

**UI 草图**：

```
━━━●━━━━━━━━━━━●━━━━━━━━━━━●━━━━━━━━━━━◌━━━━━━━━━━━◌━━━
  Q1           Q2           Q3           Q4          Q1'26
 启动期        成长期        扩张期       巩固期       上市
```

**代码实现**：`src/components/Milestone/styles/TrackMilestone.tsx`

```tsx
import React from 'react';
import type { MilestoneItem, ColorScheme } from '../../lib/milestone/types';

const TrackMilestone: React.FC<{ items: MilestoneItem[] }> = ({ items }) => {
  return (
    <div className="milestone-track-minimal">
      <div className="milestone-line-container">
        <div className="milestone-line" />
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <div className="milestone-dot" data-status={item.status} />
            {index < items.length - 1 && <div className="milestone-segment" />}
          </React.Fragment>
        ))}
      </div>
      <div className="milestone-labels">
        {items.map((item, index) => (
          <div key={item.id} className="milestone-label-item">
            <span className="milestone-time">{item.label}</span>
            {item.date && <span className="milestone-desc">{item.date}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackMilestone;
```

#### Style 4: 卡片浮层 (Card)

**设计说明**：
- 上下交替的卡片
- 箭头指向连接线
- 显示日期信息

**UI 草图**：

```
   [需求评审]              [开发完成]              [正式上线]
      ▲                      ▲                      ▲
━━━━━●━━━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━●━━━━━
                  ▼                      ▼
             [设计完稿]              [测试通过]
             2025.03.10            2025.05.01
```

**代码实现**：`src/components/Milestone/styles/CardMilestone.tsx`

```tsx
const CardMilestone: React.FC<{ items: MilestoneItem[] }> = ({ items }) => {
  return (
    <div className="milestone-card">
      <div className="milestone-center-line" />
      {items.map((item, index) => (
        <div 
          key={item.id} 
          className={`milestone-card-item ${index % 2 === 0 ? 'top' : 'bottom'}`}
        >
          <div className="milestone-card-content">
            <div className="milestone-card-title">{item.label}</div>
            {item.date && (
              <div className="milestone-card-date">{item.date}</div>
            )}
          </div>
          <div className={`milestone-arrow ${index % 2 === 0 ? 'down' : 'up'}`}>
            {index % 2 === 0 ? '▲' : '▼'}
          </div>
        </div>
      ))}
    </div>
  );
};
```

#### Style 5: 状态徽章 (Compact)

**设计说明**：
- 紧凑的横排徽章样式
- 使用图标和文字组合
- 横向连接线

**UI 草图**：

```
[✓ 已完成] ──── [✓ 已完成] ──── [→ 进行中] ──── [· 待开始] ──── [· 待开始]
  投递           筛选             面试              背调             录用
```

**代码实现**：`src/components/Milestone/styles/CompactMilestone.tsx`

```tsx
const CompactMilestone: React.FC<{ items: MilestoneItem[] }> = ({ items }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'in-progress': return '→';
      case 'pending': return '·';
      default: return '·';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'in-progress': return '进行中';
      case 'pending': return '待开始';
      default: return '待开始';
    }
  };

  return (
    <div className="milestone-compact">
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <div className="milestone-badge" data-status={item.status}>
            [{getStatusIcon(item.status)} {getStatusText(item.status)}]
          </div>
          {index < items.length - 1 && (
            <span className="milestone-connector">────</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
```

### 5.2 主容器组件

**文件位置**：`src/components/Milestone/Milestone.tsx`

```tsx
import React from 'react';
import type { MilestoneData, MilestoneConfig } from '../../lib/milestone/types';
import CapsuleMilestone from './styles/CapsuleMilestone';
import BadgeMilestone from './styles/BadgeMilestone';
import TrackMilestone from './styles/TrackMilestone';
import CardMilestone from './styles/CardMilestone';
import CompactMilestone from './styles/CompactMilestone';

interface MilestoneProps {
  data: MilestoneData;
  config: MilestoneConfig;
}

const Milestone: React.FC<MilestoneProps> = ({ data, config }) => {
  const renderStyle = () => {
    const commonProps = {
      items: data.items,
      colorScheme: config.colorScheme,
      showLabels: config.showLabels,
    };

    switch (config.style) {
      case 'capsule':
        return <CapsuleMilestone {...commonProps} />;
      case 'badge':
        return (
          <BadgeMilestone 
            {...commonProps} 
            overallProgress={data.overallProgress}
          />
        );
      case 'track':
        return <TrackMilestone {...commonProps} />;
      case 'card':
        return <CardMilestone {...commonProps} />;
      case 'compact':
        return <CompactMilestone {...commonProps} />;
      default:
        return <CapsuleMilestone {...commonProps} />;
    }
  };

  return (
    <div className="milestone-container" data-style={config.style}>
      {renderStyle()}
    </div>
  );
};

export default Milestone;
```

### 5.3 样式文件

**文件位置**：`src/components/Milestone/milestone.css`

```css
.milestone-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 16px;
  background: var(--ls-primary-background-color, #ffffff);
  border-radius: 8px;
}

/* Capsule Style */
.milestone-capsule {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.milestone-track {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.milestone-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.milestone-symbol {
  font-size: 20px;
}

.milestone-line {
  position: absolute;
  top: 10px;
  left: 20px;
  right: 20px;
  height: 2px;
  background: var(--ls-border-color, #e5e7eb);
}

/* Badge Style */
.milestone-badge .milestone-grid {
  display: flex;
  justify-content: space-between;
}

.milestone-badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.milestone-badge-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--ls-primary-color, #6366f1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.milestone-overall-progress {
  margin-top: 16px;
  height: 8px;
  background: var(--ls-secondary-background-color, #f3f4f6);
  border-radius: 4px;
  position: relative;
}

.milestone-progress-bar {
  height: 100%;
  background: var(--ls-primary-color, #6366f1);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Track Style */
.milestone-track-minimal {
  display: flex;
  flex-direction: column;
}

.milestone-line-container {
  display: flex;
  align-items: center;
}

.milestone-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--ls-primary-color, #6366f1);
}

.milestone-dot[data-status="pending"] {
  background: var(--ls-border-color, #e5e7eb);
}

.milestone-segment {
  flex: 1;
  height: 2px;
  background: var(--ls-border-color, #e5e7eb);
}

/* Card Style */
.milestone-card {
  position: relative;
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
}

.milestone-center-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--ls-border-color, #e5e7eb);
}

.milestone-card-item {
  position: relative;
  z-index: 1;
}

.milestone-card-item.top {
  align-self: flex-start;
}

.milestone-card-item.bottom {
  align-self: flex-end;
}

.milestone-card-content {
  background: var(--ls-primary-background-color, #ffffff);
  border: 1px solid var(--ls-border-color, #e5e7eb);
  border-radius: 6px;
  padding: 8px 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Compact Style */
.milestone-compact {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.milestone-connector {
  color: var(--ls-border-color, #e5e7eb);
  user-select: none;
}
```

## 6. 配置设计

### 6.1 默认配置

**文件位置**：`src/settings/defaultSettings.json`

```json
{
  "milestone": {
    "enabled": true,
    "defaultStyle": "capsule",
    "colorScheme": {
      "completed": "#10b981",
      "inProgress": "#f59e0b",
      "pending": "#d1d5db",
      "failed": "#ef4444",
      "background": "#ffffff",
      "text": "#374151"
    },
    "showLabels": true,
    "showProgress": true
  }
}
```

### 6.2 设置面板

**文件位置**：`src/components/SettingsModal/tabs/MilestoneSettings.tsx`

```tsx
import { t } from '../../../translations/i18n.ts';
import CustomSelect from '../../CustomSelect/index.tsx';
import { Settings } from '../../../settings/types.ts';

function MilestoneSettings({ settings, setSettings }: TabComponentProps) {
  return (
    <div className="settings-section">
      <h3>{t('milestone.settings.title')}</h3>
      
      <div className="setting-item">
        <label>{t('milestone.settings.defaultStyle')}</label>
        <CustomSelect
          value={settings.milestone?.defaultStyle || 'capsule'}
          options={[
            { value: 'capsule', label: t('milestone.styles.capsule') },
            { value: 'badge', label: t('milestone.styles.badge') },
            { value: 'track', label: t('milestone.styles.track') },
            { value: 'card', label: t('milestone.styles.card') },
            { value: 'compact', label: t('milestone.styles.compact') },
          ]}
          onChange={(value) => updateSetting('milestone.defaultStyle', value)}
        />
      </div>

      <div className="setting-item">
        <label>{t('milestone.settings.showLabels')}</label>
        <input
          type="checkbox"
          checked={settings.milestone?.showLabels ?? true}
          onChange={(e) => updateSetting('milestone.showLabels', e.target.checked)}
        />
      </div>
    </div>
  );
}
```

## 7. 国际化

**文件位置**：`src/translations/milestone.json`

```json
{
  "milestone": {
    "moduleName": "里程碑",
    "styles": {
      "capsule": "胶囊进度条",
      "badge": "数字徽标",
      "track": "极简轨道",
      "card": "卡片浮层",
      "compact": "状态徽章"
    },
    "status": {
      "completed": "已完成",
      "in-progress": "进行中",
      "pending": "待开始",
      "failed": "失败"
    },
    "settings": {
      "title": "里程碑设置",
      "defaultStyle": "默认样式",
      "showLabels": "显示标签",
      "showProgress": "显示进度"
    }
  }
}
```

## 8. 实施计划

| 阶段 | 任务 | 文件位置 | 预估时间 |
|------|------|---------|---------|
| 阶段一 | 类型定义和常量 | types.ts, constants.ts | 0.5 天 |
| 阶段二 | 属性枚举获取 | propertyEnum.ts | 1 天 |
| 阶段三 | 数据查询逻辑 | query.ts | 1.5 天 |
| 阶段四 | 状态计算器 | statusCalculator.ts | 0.5 天 |
| 阶段五 | UI 组件实现 (5种样式) | styles/*.tsx | 3 天 |
| 阶段六 | 宏命令注册 | register.ts | 0.5 天 |
| 阶段七 | 设置面板 | MilestoneSettings.tsx | 0.5 天 |
| 阶段八 | 样式和国际化 | milestone.css, i18n | 0.5 天 |
| 阶段九 | 集成测试 | main.tsx | 0.5 天 |

**总预估时间**：约 8.5 天

---

## 附录：A. 使用示例

### 示例 1：面试流程

```markdown
## 安克面试进展

{{renderer :milestone :interview :style=capsule :property=stage}}

### 面试进度详情

- **简历投递** ✅ 2026-02-01
- **HR 筛选** ✅ 2026-02-04
- **技术一面** ✅ 2026-02-10
- **技术二面** 🔄 2026-02-15
- **终面** ○ 2026-02-20
- **Offer** ○ 待定
```

### 示例 2：项目里程碑

```markdown
## 项目 Alpha 发布

{{renderer :milestone :project :style=badge :property=phase :showProgress=true}}

### 阶段概览

1. 需求分析 - 已完成
2. 系统设计 - 已完成  
3. 开发阶段 - 进行中 65%
4. 测试验收 - 待开始
5. 上线发布 - 待开始
```

### 示例 3：季度追踪

```markdown
## 2026 Q1-Q4 规划

{{renderer :milestone :quarterly :style=track :property=quarter}}

| 季度 | 主题 | 状态 |
|------|------|------|
| Q1 | 启动期 | 已完成 |
| Q2 | 成长期 | 进行中 |
| Q3 | 扩张期 | 待开始 |
| Q4 | 巩固期 | 待开始 |
```

## 附录：B. Datascript 查询参考

### 获取属性枚举值

```clojure
;; 获取 company 属性的所有枚举值
[:find (pull ?val [* {:block/refs [:block/title]}]) 
 :where [_ :user.property/company ?val]]
```

### 带标签过滤

```clojure
;; 获取带有"面试"标签的 company 属性枚举值
[:find (pull ?b [*])
 :where
 [?b :user.property/company ?val]
 [?val :block/title "安克"]
 [?b :block/tags ?t]
 [?t :block/title "面试"]]
```

### 按属性值分组

```clojure
;; 按 company 分组并统计
[:find ?company (count ?b)
 :where
 [?b :user.property/company ?val]
 [?val :block/title ?company]]
```

---

## 附录：C. CSS 样式规范（遵循 `ltt-` 前缀和 CSS 变量规范）

### C.1 类名前缀规范

根据 [CSS 变量统一化设计方案](2026-05-29-css-variables-refactor-plan.md)，所有 Milestone 组件必须使用 `ltt-` 前缀：

| 组件 | 旧类名 | 新类名 | 状态 |
|------|--------|--------|------|
| 容器 | `.milestone-container` | `.ltt-milestone-container` | ✅ 已更新 |
| 胶囊样式 | `.milestone-capsule` | `.ltt-milestone-capsule` | ✅ 已更新 |
| 轨道 | `.milestone-track` | `.ltt-milestone-track` | ✅ 已更新 |
| 节点 | `.milestone-node` | `.ltt-milestone-node` | ✅ 已更新 |
| 符号 | `.milestone-symbol` | `.ltt-milestone-symbol` | ✅ 已更新 |
| 连接线 | `.milestone-line` | `.ltt-milestone-line` | ✅ 已更新 |
| 信息 | `.milestone-info` | `.ltt-milestone-info` | ✅ 已更新 |
| 标签 | `.milestone-label` | `.ltt-milestone-label` | ✅ 已更新 |
| 状态 | `.milestone-status` | `.ltt-milestone-status` | ✅ 已更新 |
| 徽章样式 | `.milestone-badge` | `.ltt-milestone-badge` | ✅ 已更新 |
| 进度条 | `.milestone-progress-bar` | `.ltt-milestone-progress-bar` | ✅ 已更新 |
| 卡片样式 | `.milestone-card` | `.ltt-milestone-card` | ✅ 已更新 |

### C.2 CSS 变量规范

Milestone 组件使用统一的 CSS 变量系统：

#### 全局变量

```css
:root,
.light-mode {
  /* 背景色 */
  --ltt-bg-primary: #ffffff;
  --ltt-bg-secondary: #f8fafc;
  --ltt-bg-tertiary: #f1f5f9;
  
  /* 文本色 */
  --ltt-text-primary: #1e293b;
  --ltt-text-secondary: #64748b;
  --ltt-text-muted: #94a3b8;
  
  /* 边框色 */
  --ltt-border: #e2e8f0;
  
  /* 强调色 */
  --ltt-accent: #3b82f6;
  
  /* 间距 */
  --ltt-comp-spacing-xs: 4px;
  --ltt-comp-spacing-sm: 8px;
  --ltt-comp-spacing-md: 16px;
  --ltt-comp-spacing-lg: 24px;
  
  /* 圆角 */
  --ltt-comp-radius-sm: 4px;
  --ltt-comp-radius-md: 8px;
  --ltt-comp-radius-lg: 12px;
  --ltt-comp-radius-full: 9999px;
  
  /* 过渡 */
  --ltt-transition-fast: 150ms ease;
  --ltt-transition-normal: 300ms ease;
}

.dark-mode,
[data-theme="dark"] {
  --ltt-bg-primary: #0f172a;
  --ltt-bg-secondary: #1e293b;
  --ltt-bg-tertiary: #334155;
  
  --ltt-text-primary: #f1f5f9;
  --ltt-text-secondary: #94a3b8;
  --ltt-text-muted: #64748b;
  
  --ltt-border: #334155;
  --ltt-accent: #60a5fa;
}
```

#### 组件私有变量

```css
/* Milestone 专用变量 */
:root {
  /* 里程碑状态颜色 */
  --ltt-comp-milestone-completed: #10b981;   /* 绿色 - 已完成 */
  --ltt-comp-milestone-in-progress: #f59e0b; /* 黄色 - 进行中 */
  --ltt-comp-milestone-pending: #d1d5db;     /* 灰色 - 待开始 */
  --ltt-comp-milestone-failed: #ef4444;      /* 红色 - 失败 */
  
  /* Milestone 组件变量 */
  --ltt-comp-milestone-symbol-size: 20px;
  --ltt-comp-milestone-line-height: 2px;
  --ltt-comp-milestone-node-size: 32px;
  --ltt-comp-milestone-gap: 8px;
}
```

### C.3 完整样式文件

```css
/**
 * Milestone 组件样式
 * 遵循 CSS 变量统一化设计方案
 * 使用 ltt- 前缀规范
 */

/* ========== 容器 ========== */
.ltt-milestone-container {
  font-family: var(--ltt-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  padding: var(--ltt-comp-spacing-md);
  background: var(--ltt-bg-primary);
  border-radius: var(--ltt-comp-radius-md);
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

/* ========== 胶囊样式 ========== */
.ltt-milestone-capsule {
  display: flex;
  flex-direction: column;
  gap: var(--ltt-comp-milestone-gap);
}

.ltt-milestone-track {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.ltt-milestone-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--ltt-comp-milestone-gap) / 2);
}

.ltt-milestone-symbol {
  font-size: var(--ltt-comp-milestone-symbol-size);
  transition: color var(--ltt-transition-fast);
}

.ltt-milestone-line {
  position: absolute;
  top: 10px;
  left: 20px;
  right: 20px;
  height: var(--ltt-comp-milestone-line-height);
  background: var(--ltt-border);
  transition: background-color var(--ltt-transition-normal);
}

.ltt-milestone-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.ltt-milestone-label {
  font-size: var(--ltt-font-size-sm);
  font-weight: 500;
  color: var(--ltt-text-primary);
}

.ltt-milestone-status {
  font-size: var(--ltt-font-size-xs);
  color: var(--ltt-text-secondary);
}

/* ========== 徽章样式 ========== */
.ltt-milestone-badge .ltt-milestone-grid {
  display: flex;
  justify-content: space-between;
  gap: var(--ltt-comp-spacing-md);
}

.ltt-milestone-badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--ltt-comp-milestone-gap) / 2);
}

.ltt-milestone-badge-number {
  width: var(--ltt-comp-milestone-node-size);
  height: var(--ltt-comp-milestone-node-size);
  border-radius: var(--ltt-comp-radius-full);
  background: var(--ltt-accent);
  color: var(--ltt-bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--ltt-font-size-sm);
}

.ltt-milestone-overall-progress {
  margin-top: var(--ltt-comp-spacing-md);
  height: 8px;
  background: var(--ltt-bg-tertiary);
  border-radius: var(--ltt-comp-radius-sm);
  overflow: hidden;
}

.ltt-milestone-progress-bar {
  height: 100%;
  background: var(--ltt-accent);
  border-radius: var(--ltt-comp-radius-sm);
  transition: width var(--ltt-transition-normal);
}

.ltt-milestone-progress-label {
  display: block;
  text-align: center;
  margin-top: var(--ltt-comp-spacing-xs);
  font-size: var(--ltt-font-size-sm);
  color: var(--ltt-text-secondary);
}

/* ========== 轨道样式 ========== */
.ltt-milestone-track-minimal {
  position: relative;
  padding: var(--ltt-comp-spacing-md) 0;
}

.ltt-milestone-line-container {
  display: flex;
  align-items: center;
  position: relative;
  height: 4px;
  background: var(--ltt-border);
  border-radius: var(--ltt-comp-radius-full);
}

.ltt-milestone-dot {
  width: 12px;
  height: 12px;
  border-radius: var(--ltt-comp-radius-full);
  background: var(--ltt-comp-milestone-pending);
  border: 2px solid var(--ltt-bg-primary);
  z-index: 1;
  transition: background-color var(--ltt-transition-fast);
}

.ltt-milestone-dot[data-status="completed"] {
  background: var(--ltt-comp-milestone-completed);
}

.ltt-milestone-dot[data-status="in-progress"] {
  background: var(--ltt-comp-milestone-in-progress);
}

.ltt-milestone-segment {
  flex: 1;
  height: 4px;
  background: var(--ltt-comp-milestone-pending);
}

.ltt-milestone-labels {
  display: flex;
  justify-content: space-between;
  margin-top: var(--ltt-comp-spacing-sm);
}

.ltt-milestone-label-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.ltt-milestone-time {
  font-size: var(--ltt-font-size-sm);
  font-weight: 500;
  color: var(--ltt-text-primary);
}

.ltt-milestone-desc {
  font-size: var(--ltt-font-size-xs);
  color: var(--ltt-text-muted);
}

/* ========== 卡片样式 ========== */
.ltt-milestone-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--ltt-comp-spacing-md);
}

.ltt-milestone-center-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--ltt-border);
  transform: translateX(-50%);
}

.ltt-milestone-card-item {
  display: flex;
  align-items: center;
  position: relative;
}

.ltt-milestone-card-item.top {
  justify-content: flex-start;
  padding-right: calc(50% + var(--ltt-comp-spacing-md));
}

.ltt-milestone-card-item.bottom {
  justify-content: flex-end;
  padding-left: calc(50% + var(--ltt-comp-spacing-md));
}

.ltt-milestone-card-content {
  padding: var(--ltt-comp-spacing-sm);
  background: var(--ltt-bg-secondary);
  border-radius: var(--ltt-comp-radius-md);
  border: 1px solid var(--ltt-border);
}

.ltt-milestone-card-title {
  font-weight: 500;
  color: var(--ltt-text-primary);
  font-size: var(--ltt-font-size-sm);
}

.ltt-milestone-card-date {
  font-size: var(--ltt-font-size-xs);
  color: var(--ltt-text-muted);
  margin-top: 2px;
}

.ltt-milestone-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 6px solid transparent;
}

.ltt-milestone-arrow.down {
  top: 50%;
  left: calc(50% - 6px);
  border-top-color: var(--ltt-border);
  transform: translateY(-50%);
}

.ltt-milestone-arrow.up {
  bottom: 50%;
  left: calc(50% - 6px);
  border-bottom-color: var(--ltt-border);
  transform: translateY(50%);
}

/* ========== 紧凑样式 ========== */
.ltt-milestone-compact {
  display: flex;
  align-items: center;
  gap: var(--ltt-comp-spacing-xs);
  flex-wrap: wrap;
}

.ltt-milestone-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--ltt-comp-radius-full);
  font-size: var(--ltt-font-size-xs);
  font-weight: 500;
  background: var(--ltt-bg-tertiary);
  color: var(--ltt-text-secondary);
}

.ltt-milestone-badge[data-status="completed"] {
  background: var(--ltt-comp-milestone-completed);
  color: white;
}

.ltt-milestone-badge[data-status="in-progress"] {
  background: var(--ltt-comp-milestone-in-progress);
  color: white;
}

.ltt-milestone-badge[data-status="failed"] {
  background: var(--ltt-comp-milestone-failed);
  color: white;
}

.ltt-milestone-connector {
  color: var(--ltt-text-muted);
  font-size: var(--ltt-font-size-xs);
}
```

### C.4 组件 TypeScript 类型（已更新）

```typescript
import './milestone.css';

interface MilestoneStyles {
  container: string;
  capsule: string;
  track: string;
  node: string;
  symbol: string;
  line: string;
  info: string;
  label: string;
  status: string;
  badge: string;
  badgeItem: string;
  badgeNumber: string;
  overallProgress: string;
  progressBar: string;
  progressLabel: string;
  trackMinimal: string;
  lineContainer: string;
  dot: string;
  segment: string;
  labels: string;
  labelItem: string;
  time: string;
  desc: string;
  card: string;
  centerLine: string;
  cardItem: string;
  cardContent: string;
  cardTitle: string;
  cardDate: string;
  arrow: string;
  compact: string;
  connector: string;
}

export const milestoneStyles: MilestoneStyles = {
  container: 'ltt-milestone-container',
  capsule: 'ltt-milestone-capsule',
  track: 'ltt-milestone-track',
  node: 'ltt-milestone-node',
  symbol: 'ltt-milestone-symbol',
  line: 'ltt-milestone-line',
  info: 'ltt-milestone-info',
  label: 'ltt-milestone-label',
  status: 'ltt-milestone-status',
  badge: 'ltt-milestone-badge',
  badgeItem: 'ltt-milestone-badge-item',
  badgeNumber: 'ltt-milestone-badge-number',
  overallProgress: 'ltt-milestone-overall-progress',
  progressBar: 'ltt-milestone-progress-bar',
  progressLabel: 'ltt-milestone-progress-label',
  trackMinimal: 'ltt-milestone-track-minimal',
  lineContainer: 'ltt-milestone-line-container',
  dot: 'ltt-milestone-dot',
  segment: 'ltt-milestone-segment',
  labels: 'ltt-milestone-labels',
  labelItem: 'ltt-milestone-label-item',
  time: 'ltt-milestone-time',
  desc: 'ltt-milestone-desc',
  card: 'ltt-milestone-card',
  centerLine: 'ltt-milestone-center-line',
  cardItem: 'ltt-milestone-card-item',
  cardContent: 'ltt-milestone-card-content',
  cardTitle: 'ltt-milestone-card-title',
  cardDate: 'ltt-milestone-card-date',
  arrow: 'ltt-milestone-arrow',
  compact: 'ltt-milestone-compact',
  connector: 'ltt-milestone-connector',
};
```

### C.5 深色模式兼容性

Milestone 组件完全兼容深色模式，无需额外的 `.dark` 或 `[data-theme="dark"]` 选择器。所有颜色通过 CSS 变量自动响应。

### C.6 迁移指南

**从旧类名迁移到新类名**：

1. **React 组件**：
   ```tsx
   // 旧代码
   <div className="milestone-container">
     <div className="milestone-capsule">...</div>
   </div>

   // 新代码
   <div className="ltt-milestone-container">
     <div className="ltt-milestone-capsule">...</div>
   </div>
   ```

2. **CSS 变量**：
   ```css
   /* 旧代码 */
   background: var(--ls-primary-background-color, #ffffff);

   /* 新代码 */
   background: var(--ltt-bg-primary);
   ```

3. **向后兼容**（临时）：
   ```css
   /* 过渡阶段可以同时保留新旧类名 */
   .ltt-milestone-container,
   .milestone-container {
     background: var(--ltt-bg-primary);
   }
   ```

---

**相关文档**：
- [CSS 变量统一化设计方案](2026-05-29-css-variables-refactor-plan.md)
- [SelectToolbar SDK 优化方案](2026-05-29-SelectToolbar-SDK-Optimization.md)
