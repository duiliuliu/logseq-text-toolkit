# Task Progress Tracking 设计方案

## 1. 产品需求分析

### 1.1 核心需求

| 需求编号 | 需求描述 | 来源 |
| :--- | :--- | :--- |
| REQ-001 | 在 Logseq task 父节点上展示任务进度 | 用户需求第1点 |
| REQ-002 | 任务子节点标记属性 `task_tracking` 值为 `true`，方便监听过滤 | 用户需求第1点（优化版） |
| REQ-003 | 查询父节点下的 task 子节点（标签为 task 或属性有 status 的子节点） | 用户需求第2点 |
| REQ-004 | 统计 task 数量，并按照 status 聚合统计（如 ToDo 10, Done 20） | 用户需求第2点 |
| REQ-005 | 仅关注一层嵌套，多层嵌套场景忽略深层子节点 | 用户需求第2点 |
| REQ-006 | 支持多种展示方式可配置：微型三色圆环、点阵进度、状态光标、进度胶囊、阶梯进度 | 用户需求第3点 |
| REQ-007 | 子任务数据更新时触发父节点更新展示 | 用户需求第4点 |

### 1.2 功能概述

本功能旨在为 Logseq 提供任务进度可视化能力：
- **数据聚合层**：通过 Logseq DB 查询 API 获取父节点下的一级子任务，统计任务总数和各状态数量
- **展示层**：提供多种进度展示组件，支持用户自定义选择
- **事件响应层**：监听子任务状态变化事件，通过 `task_tracking` 属性快速过滤，自动更新父节点进度展示

### 1.3 属性命名规范

根据用户要求，使用下划线命名方式，**属性设置在任务子节点上**：
- 属性名：`task_tracking`
- 属性值：`true`（启用进度追踪）
- 设计优势：方便事件监听时快速过滤相关任务

---

## 2. 技术架构设计

### 2.1 项目整体架构

将任务进度追踪模块纳入现有 Text Toolkit 项目整体架构：

```
Text Toolkit Plugin (项目根目录)
├── src/
│   ├── components/
│   │   ├── Comment/                  (已实现 - 评论功能)
│   │   ├── CustomSelect/             (已实现)
│   │   ├── Modal/                    (已实现)
│   │   ├── SelectToolbar/            (已实现 - 选择工具栏)
│   │   ├── SettingsModal/            (已实现 - 设置面板)
│   │   ├── Toast/                    (已实现)
│   │   ├── Toolbar/                  (已实现 - 工具栏)
│   │   ├── ToolbarItem/              (已实现)
│   │   ├── ui/                       (已实现)
│   │   └── TaskProgress/             (未实现 - 任务进度组件 [本方案])
│   │
│   ├── lib/
│   │   ├── logger/                   (已实现)
│   │   ├── textReplace/              (已实现)
│   │   ├── toolbar/                  (已实现 - 工具栏核心逻辑)
│   │   └── taskProgress/             (未实现 - 任务进度核心逻辑 [本方案])
│   │
│   ├── logseq/                       (已实现 - Logseq API 封装)
│   ├── settings/                     (已实现 - 设置管理)
│   ├── styles/                       (已实现)
│   ├── translations/                 (已实现)
│   ├── test/                         (已实现 - 测试)
│   ├── App.tsx                       (已实现)
│   └── main.tsx                      (已实现)
│
├── docs/                             (文档目录)
│   ├── Architecture-Optimization-Plan.md
│   ├── Toolbar-Configuration-Design.md
│   └── Task-Progress-Tracking-Design.md  (本文档)
│
└── package.json
```

**模块状态标识**：
- ✅ 已实现：现有功能模块
- ⏳ 未实现：任务进度追踪模块（本方案设计内容）

### 2.2 当前模块架构（Task Progress Tracking）

```
┌─────────────────────────────────────────────────────────────────┐
│                   应用层 (Application Layer)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Task Progress Components (UI 组件)              │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐  │  │
│  │  │MiniCircle    │ │DotMatrix     │ │StatusCursor      │  │  │
│  │  │Progress      │ │Progress      │ │Progress          │  │  │
│  │  └──────────────┘ └──────────────┘ └──────────────────┘  │  │
│  │  ┌──────────────────┐ ┌──────────────┐                    │  │
│  │  │ProgressCapsule   │ │StepProgress  │                    │  │
│  │  └──────────────────┘ └──────────────┘                    │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                       │
├─────────────────────────┼───────────────────────────────────────┤
│              业务逻辑层 (Business Logic Layer)                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              TaskProgressManager (进度管理器)             │  │
│  │  ┌──────────────────────┐ ┌──────────────────────┐       │  │
│  │  │ TaskQueryService     │ │ TaskStatsCalculator  │       │  │
│  │  │ (任务查询服务)       │ │ (统计计算服务)      │       │  │
│  │  └──────────────────────┘ └──────────────────────┘       │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │         TaskProgressEventListener                │   │  │
│  │  │         (任务进度事件监听器)                       │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────────────────────┤
│               数据访问层 (Data Access Layer)                      │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │              Logseq DB Query API Wrapper                     ││
│  │  - getBlockById()                                            ││
│  │  - getBlockChildren()                                        ││
│  │  - datascriptQuery()                                         ││
│  └──────────────────────────────────────────────────────────────┘│
├───────────────────────────────────────────────────────────────────┤
│               配置与设置层 (Configuration Layer)                  │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  taskProgress Settings (任务进度设置)                        ││
│  │  (集成到现有 Settings 模块)                                  ││
│  └──────────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────────┘
```

### 2.3 模块划分与文件位置

| 模块 | 职责 | 文件位置 | 状态 |
| :--- | :--- | :--- | :--- |
| `components/TaskProgress/` | 进度展示组件集合 | [src/components/TaskProgress/](file:///workspace/src/components/TaskProgress/) | ⏳ 未实现 |
| `lib/taskProgress/` | 任务进度核心逻辑 | [src/lib/taskProgress/](file:///workspace/src/lib/taskProgress/) | ⏳ 未实现 |
| `settings/types.ts` | 任务进度类型定义 | [src/settings/types.ts](file:///workspace/src/settings/types.ts) | 需扩展 |
| `settings/defaultSettings.json` | 默认配置 | [src/settings/defaultSettings.json](file:///workspace/src/settings/defaultSettings.json) | 需扩展 |
| `settings/SettingsModal/` | 设置面板集成 | [src/components/SettingsModal/](file:///workspace/src/components/SettingsModal/) | 需扩展 |
| `logseq/` | Logseq API 封装扩展 | [src/logseq/](file:///workspace/src/logseq/) | 需扩展 |

---

## 3. 数据模型设计

### 3.1 核心数据结构

**文件位置**：[src/lib/taskProgress/types.ts](file:///workspace/src/lib/taskProgress/types.ts)

```typescript
export interface TaskProgress {
  blockId: string;
  parentBlockId: string | null;
  totalTasks: number;
  completedTasks: number;
  statusStats: StatusStat[];
  progress: number;
  lastUpdated: number;
}

export interface StatusStat {
  status: string;
  count: number;
  color?: string;
}

export interface TaskBlock {
  id: string;
  content: string;
  status?: string;
  isTask: boolean;
  taskTrackingEnabled: boolean; // task_tracking 属性
  properties?: Record<string, unknown>;
  children?: TaskBlock[];
}
```

### 3.2 进度展示配置

**文件位置**：[src/lib/taskProgress/types.ts](file:///workspace/src/lib/taskProgress/types.ts)

```typescript
export type ProgressDisplayType = 
  | 'mini-circle'      // 微型三色圆环
  | 'dot-matrix'       // 点阵进度
  | 'status-cursor'    // 状态光标
  | 'progress-capsule' // 进度胶囊
  | 'step-progress';   // 阶梯进度

export interface ProgressDisplayConfig {
  type: ProgressDisplayType;
  showLabel: boolean;
  labelFormat: 'fraction' | 'percentage' | 'both';
  size: 'small' | 'medium' | 'large';
  colors?: {
    todo: string;
    doing: string;
    done: string;
    [key: string]: string;
  };
}
```

### 3.3 集成到全局设置

**文件位置**：[src/settings/types.ts](file:///workspace/src/settings/types.ts)

```typescript
// 扩展现有 Settings 接口
export interface Settings {
  // ... 现有设置 ...
  
  // 新增：任务进度追踪设置
  taskProgress?: {
    enabled: boolean;
    defaultDisplayType: ProgressDisplayType;
    displayOptions: {
      [key in ProgressDisplayType]?: Record<string, any>;
    };
    statusColors: Record<string, string>;
    updateInterval: number;
  };
}
```

---

## 4. 核心功能设计

### 4.1 任务查询逻辑

**文件位置**：[src/lib/taskProgress/taskQuery.ts](file:///workspace/src/lib/taskProgress/taskQuery.ts)

#### 4.1.1 查询条件

| 条件 | 描述 |
| :--- | :--- |
| **标签条件** | `#task` 标签 |
| **属性条件** | 包含 `status` 属性 |
| **层级条件** | 仅查询直接子节点（深度为1） |
| **追踪条件** | 子节点属性 `task_tracking = true` |

#### 4.1.2 查询实现方案

```typescript
import { TaskBlock } from './types';

/**
 * 查询父节点下的一级子任务（过滤带有 task_tracking=true 的子任务）
 */
export async function queryTaskChildren(parentBlockId: string): Promise<TaskBlock[]> {
  const query = `
    [:find (pull ?block [*])
     :where
     [?parent :block/uuid "${parentBlockId}"]
     [?block :block/parent ?parent]
     (or
       [?block :block/tags [:tag "task"]]
       [?block :block/properties ?props]
       [(get ?props :status)]
     )
    ]
  `;
  
  const results = await logseq.DB.datascriptQuery(query);
  return results.map(row => row[0]);
}

/**
 * 获取一级子节点（忽略深层嵌套）
 */
export async function getDirectTaskChildren(parentBlockId: string): Promise<TaskBlock[]> {
  const children = await logseq.Editor.getBlockChildren(parentBlockId);
  
  return children
    .filter(child => {
      const content = child.content || '';
      // 判断是否为 task 块：包含 status 属性或 #task 标签
      const hasStatusProp = child.properties?.status !== undefined;
      const hasTaskTag = content.includes('#task');
      // 检查 task_tracking 属性
      const hasTaskTracking = child.properties?.task_tracking === true;
      return (hasStatusProp || hasTaskTag) && hasTaskTracking;
    })
    .map(child => ({
      id: child.id,
      content: child.content || '',
      status: child.properties?.status as string,
      isTask: true,
      taskTrackingEnabled: child.properties?.task_tracking === true,
      properties: child.properties,
    }));
}
```

### 4.2 统计聚合逻辑

**文件位置**：[src/lib/taskProgress/statsCalculator.ts](file:///workspace/src/lib/taskProgress/statsCalculator.ts)

```typescript
import { TaskProgress, StatusStat, TaskBlock } from './types';

const STATUS_COLORS: Record<string, string> = {
  todo: '#f59e0b',
  doing: '#3b82f6',
  done: '#10b981',
  waiting: '#8b5cf6',
  canceled: '#6b7280',
};

function getStatusColor(status: string): string {
  return STATUS_COLORS[status] || '#6b7280';
}

export function aggregateTaskStats(tasks: TaskBlock[]): TaskProgress {
  const statusStats: StatusStat[] = [];
  const statusCountMap = new Map<string, number>();
  
  // 统计各状态数量
  tasks.forEach(task => {
    const status = task.status || 'todo';
    statusCountMap.set(status, (statusCountMap.get(status) || 0) + 1);
  });
  
  // 转换为数组
  statusCountMap.forEach((count, status) => {
    statusStats.push({ status, count, color: getStatusColor(status) });
  });
  
  const totalTasks = tasks.length;
  const completedTasks = statusCountMap.get('done') || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  return {
    blockId: '',
    parentBlockId: '',
    totalTasks,
    completedTasks,
    statusStats,
    progress,
    lastUpdated: Date.now(),
  };
}
```

### 4.3 事件监听机制

**文件位置**：[src/lib/taskProgress/eventListener.ts](file:///workspace/src/lib/taskProgress/eventListener.ts)

根据 Logseq 插件 API，监听块变更事件，通过 `task_tracking` 属性快速过滤：

```typescript
import type { IBlock } from '@logseq/libs/dist/LSPlugin';

export class TaskProgressEventListener {
  private listeners: Map<string, () => void> = new Map();
  private parentBlockCache: Map<string, string> = new Map(); // 缓存子节点->父节点映射
  
  startListening() {
    // 监听块内容变更
    logseq.App.onBlockChanged((block) => {
      this.handleBlockChange(block);
    });
    
    // 监听块删除
    logseq.App.onBlockRemoved((blockId) => {
      this.handleBlockRemove(blockId);
    });
  }
  
  private async handleBlockChange(block: IBlock) {
    // 快速过滤：先检查 task_tracking 属性
    if (block.properties?.task_tracking !== true) return;
    
    // 获取父节点
    const parentBlockId = block.parentId;
    if (!parentBlockId) return;
    
    // 触发更新
    this.notifyUpdate(parentBlockId);
  }
  
  private async handleBlockRemove(blockId: string) {
    // 查找是否在缓存中
    const parentBlockId = this.parentBlockCache.get(blockId);
    if (parentBlockId) {
      this.notifyUpdate(parentBlockId);
      this.parentBlockCache.delete(blockId);
    }
  }
  
  private notifyUpdate(parentBlockId: string) {
    const handler = this.listeners.get(parentBlockId);
    handler?.();
  }
  
  subscribe(parentBlockId: string, handler: () => void) {
    this.listeners.set(parentBlockId, handler);
  }
  
  unsubscribe(parentBlockId: string) {
    this.listeners.delete(parentBlockId);
  }
  
  // 缓存子节点和父节点的映射关系
  cacheChildParentMapping(childBlockId: string, parentBlockId: string) {
    this.parentBlockCache.set(childBlockId, parentBlockId);
  }
}
```

### 4.4 进度管理器

**文件位置**：[src/lib/taskProgress/manager.ts](file:///workspace/src/lib/taskProgress/manager.ts)

```typescript
import { TaskProgress, TaskBlock } from './types';
import { getDirectTaskChildren } from './taskQuery';
import { aggregateTaskStats } from './statsCalculator';
import { TaskProgressEventListener } from './eventListener';

export class TaskProgressManager {
  private eventListener: TaskProgressEventListener;
  private progressCache: Map<string, TaskProgress> = new Map();
  
  constructor() {
    this.eventListener = new TaskProgressEventListener();
  }
  
  initialize() {
    this.eventListener.startListening();
  }
  
  async getOrCalculateProgress(parentBlockId: string): Promise<TaskProgress | null> {
    // 检查缓存
    const cached = this.progressCache.get(parentBlockId);
    if (cached && Date.now() - cached.lastUpdated < 5000) {
      return cached;
    }
    
    // 计算新数据
    const tasks = await getDirectTaskChildren(parentBlockId);
    if (tasks.length === 0) return null;
    
    const progress = aggregateTaskStats(tasks);
    progress.blockId = parentBlockId;
    progress.parentBlockId = parentBlockId;
    
    // 缓存并建立子节点映射
    this.progressCache.set(parentBlockId, progress);
    tasks.forEach(task => {
      this.eventListener.cacheChildParentMapping(task.id, parentBlockId);
    });
    
    return progress;
  }
  
  subscribeToUpdate(parentBlockId: string, handler: () => void) {
    this.eventListener.subscribe(parentBlockId, handler);
  }
  
  clearCache() {
    this.progressCache.clear();
  }
}
```

---

## 5. UI 组件设计

### 5.1 组件结构

**文件位置**：[src/components/TaskProgress/](file:///workspace/src/components/TaskProgress/)

```
src/components/TaskProgress/
├── index.ts                          # 组件导出
├── types.ts                          # 组件类型定义
├── TaskProgress.tsx                  # 主组件（展示方式切换）
├── MiniCircleProgress.tsx            # 微型三色圆环
├── DotMatrixProgress.tsx             # 点阵进度
├── StatusCursorProgress.tsx          # 状态光标
├── ProgressCapsule.tsx               # 进度胶囊
├── StepProgress.tsx                  # 阶梯进度
└── taskProgress.css                  # 样式文件
```

### 5.2 组件设计规范

#### 5.2.1 MiniCircleProgress（微型三色圆环）

**文件位置**：[src/components/TaskProgress/MiniCircleProgress.tsx](file:///workspace/src/components/TaskProgress/MiniCircleProgress.tsx)

```typescript
interface MiniCircleProgressProps {
  stats: StatusStat[];
  progress: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  labelFormat?: 'fraction' | 'percentage' | 'both';
  completedTasks: number;
  totalTasks: number;
}
```

**设计草图说明**：
- 圆环直径：small(16px) / medium(24px) / large(32px)
- 圆环分段颜色：根据状态动态分配
- 圆环中心显示：`完成数/总数` 或 `百分比`

#### 5.2.2 DotMatrixProgress（点阵进度）

**文件位置**：[src/components/TaskProgress/DotMatrixProgress.tsx](file:///workspace/src/components/TaskProgress/DotMatrixProgress.tsx)

```typescript
interface DotMatrixProgressProps {
  stats: StatusStat[];
  progress: number;
  totalTasks: number;
  maxDots?: number;
  size?: 'small' | 'medium' | 'large';
}
```

**设计草图说明**：
- 点阵排列：横向排列，最多显示 maxDots 个点
- 点颜色：根据状态映射（todo=黄色, doing=蓝色, done=绿色）
- 超出 maxDots 时：显示 `N+`

#### 5.2.3 StatusCursorProgress（状态光标）

**文件位置**：[src/components/TaskProgress/StatusCursorProgress.tsx](file:///workspace/src/components/TaskProgress/StatusCursorProgress.tsx)

```typescript
interface StatusCursorProgressProps {
  stats: StatusStat[];
  progress: number;
}
```

**设计草图说明**：
- 单个光标图标，颜色随进度变化
- 图标样式：✓（完成数）/ ○（进行中数）/ ●（待办数）
- 悬停提示：显示详细统计（各状态数量）

#### 5.2.4 ProgressCapsule（进度胶囊）

**文件位置**：[src/components/TaskProgress/ProgressCapsule.tsx](file:///workspace/src/components/TaskProgress/ProgressCapsule.tsx)

```typescript
interface ProgressCapsuleProps {
  stats: StatusStat[];
  progress: number;
  completedTasks: number;
  totalTasks: number;
}
```

**设计草图说明**：
- 胶囊形状背景
- 内部显示进度条，按状态分段着色
- 右侧显示文字：`完成数/总数`

#### 5.2.5 StepProgress（阶梯进度）

**文件位置**：[src/components/TaskProgress/StepProgress.tsx](file:///workspace/src/components/TaskProgress/StepProgress.tsx)

```typescript
interface StepProgressProps {
  stats: StatusStat[];
  progress: number;
}
```

**设计草图说明**：
- 阶梯形状进度条
- 每级阶梯代表一个状态阶段
- 阶梯高度：按状态数量比例分配
- 阶梯宽度：按状态任务数比例分配

### 5.3 样式设计

**文件位置**：[src/components/TaskProgress/taskProgress.css](file:///workspace/src/components/TaskProgress/taskProgress.css)

```css
.task-progress {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  vertical-align: middle;
}

.task-progress-mini-circle {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.task-progress-mini-circle svg {
  transform: rotate(-90deg);
}

.task-progress-mini-circle .center-text {
  position: absolute;
  font-size: 10px;
  font-weight: 600;
}

.task-progress-dot-matrix {
  display: flex;
  gap: 2px;
}

.task-progress-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.task-progress-capsule {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 9999px;
  background-color: var(--ls-secondary-background-color);
}

.task-progress-capsule-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  overflow: hidden;
}

.task-progress-capsule-segment {
  height: 100%;
  float: left;
}

.task-progress-cursor {
  font-size: 14px;
  cursor: help;
}

.task-progress-step {
  display: flex;
  align-items: flex-end;
  height: 16px;
  gap: 1px;
}

.task-progress-step-segment {
  width: 8px;
  border-radius: 2px 2px 0 0;
}
```

### 5.4 主组件

**文件位置**：[src/components/TaskProgress/TaskProgress.tsx](file:///workspace/src/components/TaskProgress/TaskProgress.tsx)

```typescript
import React from 'react';
import { TaskProgress as TaskProgressType, ProgressDisplayType, StatusStat } from '../../lib/taskProgress/types';
import MiniCircleProgress from './MiniCircleProgress';
import DotMatrixProgress from './DotMatrixProgress';
import StatusCursorProgress from './StatusCursorProgress';
import ProgressCapsule from './ProgressCapsule';
import StepProgress from './StepProgress';
import './taskProgress.css';

interface TaskProgressProps {
  progressData: TaskProgressType;
  displayType: ProgressDisplayType;
  config?: any;
}

export const TaskProgress: React.FC<TaskProgressProps> = ({ 
  progressData, 
  displayType,
  config 
}) => {
  const renderComponent = () => {
    const commonProps = {
      stats: progressData.statusStats,
      progress: progressData.progress,
    };
    
    switch (displayType) {
      case 'mini-circle':
        return (
          <MiniCircleProgress
            {...commonProps}
            completedTasks={progressData.completedTasks}
            totalTasks={progressData.totalTasks}
            {...config}
          />
        );
      case 'dot-matrix':
        return (
          <DotMatrixProgress
            {...commonProps}
            totalTasks={progressData.totalTasks}
            {...config}
          />
        );
      case 'status-cursor':
        return <StatusCursorProgress {...commonProps} />;
      case 'progress-capsule':
        return (
          <ProgressCapsule
            {...commonProps}
            completedTasks={progressData.completedTasks}
            totalTasks={progressData.totalTasks}
          />
        );
      case 'step-progress':
        return <StepProgress {...commonProps} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="task-progress">
      {renderComponent()}
    </div>
  );
};

export default TaskProgress;
```

---

## 6. 配置设计

### 6.1 默认配置

**文件位置**：[src/settings/defaultSettings.json](file:///workspace/src/settings/defaultSettings.json)

```json
{
  // ... 现有配置 ...
  
  // 新增：任务进度追踪配置
  "taskProgress": {
    "enabled": true,
    "defaultDisplayType": "mini-circle",
    "displayOptions": {
      "mini-circle": {
        "size": "small",
        "showLabel": true,
        "labelFormat": "fraction"
      },
      "dot-matrix": {
        "maxDots": 10,
        "size": "small"
      },
      "status-cursor": {},
      "progress-capsule": {},
      "step-progress": {}
    },
    "statusColors": {
      "todo": "#f59e0b",
      "doing": "#3b82f6",
      "done": "#10b981",
      "waiting": "#8b5cf6",
      "canceled": "#6b7280"
    },
    "updateInterval": 1000
  }
}
```

### 6.2 配置项说明

| 配置项 | 类型 | 说明 | 位置 |
| :--- | :--- | :--- | :--- |
| `taskProgress.enabled` | boolean | 是否启用任务进度功能 | defaultSettings.json |
| `taskProgress.defaultDisplayType` | string | 默认展示类型 | defaultSettings.json |
| `taskProgress.displayOptions.*.size` | string | 组件尺寸 | defaultSettings.json |
| `taskProgress.displayOptions.mini-circle.showLabel` | boolean | 是否显示标签 | defaultSettings.json |
| `taskProgress.displayOptions.mini-circle.labelFormat` | string | 标签格式 | defaultSettings.json |
| `taskProgress.displayOptions.dot-matrix.maxDots` | number | 最大显示点数 | defaultSettings.json |
| `taskProgress.statusColors` | object | 状态颜色映射 | defaultSettings.json |
| `taskProgress.updateInterval` | number | 更新间隔（毫秒） | defaultSettings.json |

### 6.3 设置面板集成

**文件位置**：[src/components/SettingsModal/tabs/GeneralSettings.tsx](file:///workspace/src/components/SettingsModal/tabs/GeneralSettings.tsx)（或新建单独的设置页）

需添加以下设置项：
- 启用/禁用任务进度功能开关
- 默认展示方式选择（下拉菜单）
- 状态颜色自定义设置
- 高级设置（更新间隔等）

---

## 7. 数据流设计

### 7.1 初始化流程

```
插件加载 → 初始化 TaskProgressManager → 开始监听事件
用户打开页面 → 渲染块 → 查询子任务（task_tracking=true）→ 计算统计 → 渲染进度组件
```

### 7.2 更新流程

```
子任务变更 → onBlockChanged 事件 → 检查 task_tracking 属性 → 
查找父节点 → 查询更新 → 重新计算统计 → 更新组件
```

### 7.3 核心数据流

**文件位置**：[src/lib/taskProgress/manager.ts](file:///workspace/src/lib/taskProgress/manager.ts)

```typescript
// 初始化
async function initTaskProgress(blockId: string) {
  const tasks = await getDirectTaskChildren(blockId);
  if (tasks.length === 0) return;
  
  const stats = aggregateTaskStats(tasks);
  
  // 渲染组件
  renderProgressComponent(blockId, stats);
  
  // 订阅更新
  eventListener.subscribe(blockId, () => {
    refreshTaskProgress(blockId);
  });
  
  // 缓存子节点映射
  tasks.forEach(task => {
    eventListener.cacheChildParentMapping(task.id, blockId);
  });
}

// 刷新
async function refreshTaskProgress(blockId: string) {
  const tasks = await getDirectTaskChildren(blockId);
  const stats = aggregateTaskStats(tasks);
  updateProgressComponent(blockId, stats);
}
```

---

## 8. Logseq API 使用参考

### 8.1 查询 API

| API | 用途 | 文档参考 |
| :--- | :--- | :--- |
| `logseq.Editor.getBlock(blockId)` | 获取块详情 | db_query_guide.md |
| `logseq.Editor.getBlockChildren(blockId)` | 获取子块列表 | db_query_guide.md |
| `logseq.DB.datascriptQuery(query)` | 执行复杂查询 | db_query_guide.md |

### 8.2 事件 API

| API | 用途 | 触发时机 |
| :--- | :--- | :--- |
| `logseq.App.onBlockChanged(callback)` | 监听块变更 | 块内容或属性修改 |
| `logseq.App.onBlockRemoved(callback)` | 监听块删除 | 块被删除时 |
| `logseq.App.onPageChanged(callback)` | 监听页面切换 | 页面切换时 |

### 8.3 查询示例

```typescript
// 查询所有带有 task_tracking=true 的块
const query = `
  [:find (pull ?block [*])
   :where
   [?block :block/properties ?props]
   [(get ?props :task_tracking)]
   [(= % true)]
  ]
`;
const result = await logseq.DB.datascriptQuery(query);
```

---

## 9. 性能优化考虑

### 9.1 缓存策略

**文件位置**：[src/lib/taskProgress/manager.ts](file:///workspace/src/lib/taskProgress/manager.ts)

- **结果缓存**：缓存查询结果，避免重复查询
- **过期机制**：设置缓存过期时间，在事件触发时失效
- **子节点-父节点映射缓存**：快速定位需要更新的父节点

### 9.2 批量处理

- **快速过滤**：先检查 `task_tracking` 属性，快速筛选相关任务
- **合并更新**：短时间内多个子任务变更合并为一次更新
- **防抖处理**：使用 debounce 减少频繁更新

### 9.3 懒加载

- **按需渲染**：只渲染可见区域的进度组件
- **延迟加载**：页面加载时延迟一段时间再初始化

---

## 10. 测试方案

### 10.1 单元测试

| 测试用例 | 描述 | 文件位置 |
| :--- | :--- | :--- |
| `aggregateTaskStats` | 测试统计聚合逻辑 | statsCalculator.test.ts |
| `getDirectTaskChildren` | 测试子任务查询 | taskQuery.test.ts |
| `getStatusColor` | 测试状态颜色映射 | statsCalculator.test.ts |

### 10.2 集成测试

| 测试场景 | 描述 |
| :--- | :--- |
| 属性检测 | 验证子节点 `task_tracking = true` 时父节点显示进度 |
| 状态更新 | 验证子任务状态变更时父节点更新 |
| 嵌套处理 | 验证仅显示一级子任务 |
| 配置切换 | 验证不同展示方式切换正常 |
| 事件过滤 | 验证非 task_tracking 任务不会触发更新 |

---

## 11. 实施计划

| 阶段 | 任务 | 文件位置 | 预估时间 |
| :--- | :--- | :--- | :--- |
| 阶段一 | 核心逻辑实现（查询、统计、事件监听） | lib/taskProgress/ | 3-4 天 |
| 阶段二 | UI 组件实现（5种展示方式） | components/TaskProgress/ | 4-5 天 |
| 阶段三 | 配置系统集成 | settings/、SettingsModal/ | 2 天 |
| 阶段四 | Logseq 集成与事件监听 | 集成代码 | 1-2 天 |
| 阶段五 | 测试与优化 | test/ | 2-3 天 |
| 阶段六 | 文档完善 | docs/ | 1 天 |

---

## 12. 风险评估

| 风险 | 描述 | 缓解措施 |
| :--- | :--- | :--- |
| API 兼容性 | Logseq API 可能变更 | 使用稳定的 API 版本，添加兼容性处理 |
| 性能问题 | 大量任务时查询慢 | 实现缓存和快速过滤机制 |
| 样式冲突 | 与主题样式冲突 | 使用 CSS 变量，支持主题适配 |
| 嵌套深度 | 多层嵌套处理复杂 | 明确只处理一级子节点 |
| 属性位置变更 | task_tracking 在子节点可能有理解偏差 | 清晰的文档说明和用户引导 |

---

## 附录

### A. 相关文件索引

| 文件/目录 | 说明 | 状态 |
| :--- | :--- | :--- |
| [src/lib/taskProgress/types.ts](file:///workspace/src/lib/taskProgress/types.ts) | 类型定义 | ⏳ 未实现 |
| [src/lib/taskProgress/taskQuery.ts](file:///workspace/src/lib/taskProgress/taskQuery.ts) | 任务查询 | ⏳ 未实现 |
| [src/lib/taskProgress/statsCalculator.ts](file:///workspace/src/lib/taskProgress/statsCalculator.ts) | 统计计算 | ⏳ 未实现 |
| [src/lib/taskProgress/eventListener.ts](file:///workspace/src/lib/taskProgress/eventListener.ts) | 事件监听 | ⏳ 未实现 |
| [src/lib/taskProgress/manager.ts](file:///workspace/src/lib/taskProgress/manager.ts) | 进度管理器 | ⏳ 未实现 |
| [src/components/TaskProgress/](file:///workspace/src/components/TaskProgress/) | UI 组件目录 | ⏳ 未实现 |
| [src/settings/types.ts](file:///workspace/src/settings/types.ts) | 设置类型（需扩展） | ✅ 需修改 |
| [src/settings/defaultSettings.json](file:///workspace/src/settings/defaultSettings.json) | 默认配置（需扩展） | ✅ 需修改 |
