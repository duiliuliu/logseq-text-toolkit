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
│   │   │   └── tabs/
│   │   │       ├── GeneralSettings.tsx    (已实现)
│   │   │       ├── ToolbarSettings.tsx    (已实现)
│   │   │       ├── AdvancedSettings.tsx   (已实现)
│   │   │       └── TaskProgressSettings.tsx (未实现 - 任务进度设置 [本方案])
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

### 2.2 架构图

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Text Toolkit Plugin                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                          main.tsx (入口文件)                              │   │
│  │                           ┌───────────────┐                              │   │
│  │                           │  Logseq API   │                              │   │
│  │                           │  初始化注册    │                              │   │
│  │                           └───────┬───────┘                              │   │
│  └───────────────────────────────────┼─────────────────────────────────────┘   │
│                                      │                                          │
│          ┌───────────────────────────┼───────────────────────────┐             │
│          │                           │                           │             │
│          ▼                           ▼                           ▼             │
│  ┌───────────────┐          ┌───────────────┐          ┌───────────────┐      │
│  │   Toolbar     │          │    Comment    │          │ TaskProgress  │      │
│  │   Module      │          │    Module     │          │   Module      │      │
│  │  (已实现)     │          │   (已实现)    │          │  (未实现)     │      │
│  └───────┬───────┘          └───────────────┘          └───────┬───────┘      │
│          │                                                      │             │
│          │                                                      │             │
│  ┌───────┴───────────────────────────────────────────────────────┴───────┐    │
│  │                        Task Progress Module Detail                     │    │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │    │
│  │  │                     应用层 (Application Layer)                   │  │    │
│  │  │  ┌─────────────────────────────────────────────────────────┐    │  │    │
│  │  │  │              TaskProgressRenderer (渲染器)               │    │  │    │
│  │  │  │  - registerMacroRenderer()  注册宏渲染器                 │    │  │    │
│  │  │  │  - registerSlashCommand()   注册斜杠命令                 │    │  │    │
│  │  │  └─────────────────────────────────────────────────────────┘    │  │    │
│  │  │  ┌─────────────────────────────────────────────────────────┐    │  │    │
│  │  │  │              UI Components (进度展示组件)                │    │  │    │
│  │  │  │  MiniCircle | DotMatrix | StatusCursor | Capsule | Step │    │  │    │
│  │  │  └─────────────────────────────────────────────────────────┘    │  │    │
│  │  └─────────────────────────────────────────────────────────────────┘  │    │
│  │                              │                                        │    │
│  │  ┌───────────────────────────┴───────────────────────────────────┐   │    │
│  │  │                   业务逻辑层 (Business Logic)                  │   │    │
│  │  │  ┌──────────────────────────────────────────────────────────┐ │   │    │
│  │  │  │              TaskProgressManager (进度管理器)             │ │   │    │
│  │  │  │  - initialize()      初始化                              │ │   │    │
│  │  │  │  - getProgress()     获取进度数据                        │ │   │    │
│  │  │  │  - subscribe()       订阅更新                            │ │   │    │
│  │  │  └──────────────────────────────────────────────────────────┘ │   │    │
│  │  │  ┌──────────────────┐ ┌──────────────────┐ ┌───────────────┐  │ │   │    │
│  │  │  │ TaskQueryService │ │ StatsCalculator  │ │ EventListener │  │ │   │    │
│  │  │  │    任务查询       │ │    统计计算      │ │   事件监听    │  │ │   │    │
│  │  │  └──────────────────┘ └──────────────────┘ └───────────────┘  │ │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  │                              │                                        │    │
│  │  ┌───────────────────────────┴───────────────────────────────────┐   │    │
│  │  │                   数据访问层 (Data Access)                     │   │    │
│  │  │  ┌──────────────────────────────────────────────────────────┐ │   │    │
│  │  │  │              Logseq API Wrapper (API 封装)                │ │   │    │
│  │  │  │  - Editor.getBlock()        获取块                       │ │   │    │
│  │  │  │  - Editor.getBlockChildren() 获取子块                    │ │   │    │
│  │  │  │  - DB.datascriptQuery()     执行查询                     │ │   │    │
│  │  │  │  - App.onBlockChanged()     监听块变更                   │ │   │    │
│  │  │  │  - provideUI()              提供UI渲染                   │ │   │    │
│  │  │  │  - provideStyle()           提供样式                     │ │   │    │
│  │  │  └──────────────────────────────────────────────────────────┘ │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  │                              │                                        │    │
│  │  ┌───────────────────────────┴───────────────────────────────────┐   │    │
│  │  │                   配置层 (Configuration)                       │   │    │
│  │  │  ┌──────────────────────────────────────────────────────────┐ │   │    │
│  │  │  │           TaskProgressSettings (设置面板 Tab)             │ │   │    │
│  │  │  │  - 启用/禁用开关                                          │ │   │    │
│  │  │  │  - 展示方式选择                                           │ │   │    │
│  │  │  │  - 状态颜色配置                                           │ │   │    │
│  │  │  └──────────────────────────────────────────────────────────┘ │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 当前模块架构（Task Progress Tracking）

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
│  │  TaskProgressSettings Tab (任务进度设置面板)                ││
│  │  (独立 Tab，与 GeneralSettings 同级)                        ││
│  └──────────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────────┘
```

### 2.4 模块划分与文件位置

| 模块 | 职责 | 文件位置 | 状态 |
| :--- | :--- | :--- | :--- |
| `components/TaskProgress/` | 进度展示组件集合 | [src/components/TaskProgress/](file:///workspace/src/components/TaskProgress/) | ⏳ 未实现 |
| `lib/taskProgress/` | 任务进度核心逻辑 | [src/lib/taskProgress/](file:///workspace/src/lib/taskProgress/) | ⏳ 未实现 |
| `lib/taskProgress/register.ts` | Logseq API 注册 | [src/lib/taskProgress/register.ts](file:///workspace/src/lib/taskProgress/register.ts) | ⏳ 未实现 |
| `components/SettingsModal/tabs/TaskProgressSettings.tsx` | 任务进度设置 Tab | [src/components/SettingsModal/tabs/TaskProgressSettings.tsx](file:///workspace/src/components/SettingsModal/tabs/TaskProgressSettings.tsx) | ⏳ 未实现 |
| `settings/types.ts` | 任务进度类型定义 | [src/settings/types.ts](file:///workspace/src/settings/types.ts) | 需扩展 |
| `settings/defaultSettings.json` | 默认配置 | [src/settings/defaultSettings.json](file:///workspace/src/settings/defaultSettings.json) | 需扩展 |
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
  taskTrackingEnabled: boolean;
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
export interface Settings {
  // ... 现有设置 ...
  
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

### 4.1 Logseq 插件初始化与注册

**文件位置**：[src/lib/taskProgress/register.ts](file:///workspace/src/lib/taskProgress/register.ts)

参考 [logseq-plugin-todo-master](https://github.com/pengx17/logseq-plugin-todo-master) 的实现方式，使用 Logseq 的 Macro Renderer 和 Slash Command 机制：

```typescript
import ReactDOMServer from 'react-dom/server';
import { TaskProgressManager } from './manager';
import { TaskProgress } from '../components/TaskProgress/TaskProgress';
import { getSettings } from '../../settings';
import taskProgressStyle from './style.css?raw';

const MACRO_PREFIX = ':taskprogress';
const PLUGIN_ID = 'text-toolkit-taskprogress';

const rendering = new Map<string, { blockId: string; template: string }>();

function slotExists(slot: string): Promise<boolean> {
  return Promise.race([
    Promise.resolve(logseq.App.queryElementById(slot)),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1000)),
  ]);
}

async function renderProgress(blockId: string, slot: string, counter: number) {
  try {
    if (rendering.get(slot)?.blockId !== blockId) {
      return;
    }
    
    const manager = TaskProgressManager.getInstance();
    const progressData = await manager.getOrCalculateProgress(blockId);
    
    if (rendering.get(slot)?.blockId !== blockId) {
      return;
    }
    
    const settings = getSettings();
    const displayType = settings?.taskProgress?.defaultDisplayType || 'mini-circle';
    
    const template = ReactDOMServer.renderToStaticMarkup(
      <TaskProgress 
        progressData={progressData} 
        displayType={displayType}
        config={settings?.taskProgress?.displayOptions?.[displayType]}
      />
    );
    
    if (counter === 0 || (await slotExists(slot))) {
      if (rendering.get(slot)?.template === template) {
        return true;
      }
      rendering.get(slot)!.template = template;
      
      logseq.provideUI({
        key: PLUGIN_ID + '__' + slot,
        slot,
        reset: true,
        template,
      });
      return true;
    }
  } catch (err) {
    console.error('[TaskProgress] Render error:', err);
  }
}

async function startRendering(blockId: string, slot: string) {
  rendering.set(slot, { blockId, template: '' });
  let counter = 0;
  
  const intervalId = setInterval(async () => {
    await renderProgress(blockId, slot, counter++);
    const exist = await slotExists(slot);
    if (!exist) {
      rendering.delete(slot);
      clearInterval(intervalId);
    }
  }, 5000);
  
  await renderProgress(blockId, slot, counter);
}

export function registerTaskProgress() {
  logseq.provideStyle({ key: PLUGIN_ID, style: taskProgressStyle });
  
  logseq.App.onMacroRendererSlotted(async ({ payload, slot }) => {
    const [type] = payload.arguments;
    if (!type?.startsWith(MACRO_PREFIX)) {
      return;
    }
    
    logseq.provideStyle({
      key: slot,
      style: `#${slot} {display: inline-flex;}`,
    });
    
    let blockId = null;
    if (type === MACRO_PREFIX) {
      blockId = payload.uuid;
    } else {
      blockId = type.substring(MACRO_PREFIX.length + 1);
    }
    
    if (blockId) {
      await startRendering(blockId, slot);
    }
  });
  
  logseq.Editor.registerSlashCommand(
    '[Text Toolkit] Insert Task Progress',
    async () => {
      const block = await logseq.Editor.getCurrentBlock();
      if (block?.uuid) {
        await logseq.Editor.insertAtEditingCursor(
          `{{renderer ${MACRO_PREFIX}}}`
        );
      }
    }
  );
}
```

### 4.2 任务查询逻辑

**文件位置**：[src/lib/taskProgress/taskQuery.ts](file:///workspace/src/lib/taskProgress/taskQuery.ts)

```typescript
import { TaskBlock } from './types';

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

export async function getDirectTaskChildren(parentBlockId: string): Promise<TaskBlock[]> {
  const children = await logseq.Editor.getBlockChildren(parentBlockId);
  
  return children
    .filter(child => {
      const content = child.content || '';
      const hasStatusProp = child.properties?.status !== undefined;
      const hasTaskTag = content.includes('#task');
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

### 4.3 统计聚合逻辑

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
  
  tasks.forEach(task => {
    const status = task.status || 'todo';
    statusCountMap.set(status, (statusCountMap.get(status) || 0) + 1);
  });
  
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

### 4.4 事件监听机制

**文件位置**：[src/lib/taskProgress/eventListener.ts](file:///workspace/src/lib/taskProgress/eventListener.ts)

```typescript
import type { IBlock } from '@logseq/libs/dist/LSPlugin';

export class TaskProgressEventListener {
  private listeners: Map<string, () => void> = new Map();
  private parentBlockCache: Map<string, string> = new Map();
  
  startListening() {
    logseq.App.onBlockChanged((block) => {
      this.handleBlockChange(block);
    });
    
    logseq.App.onBlockRemoved((blockId) => {
      this.handleBlockRemove(blockId);
    });
  }
  
  private async handleBlockChange(block: IBlock) {
    if (block.properties?.task_tracking !== true) return;
    
    const parentBlockId = block.parentId;
    if (!parentBlockId) return;
    
    this.notifyUpdate(parentBlockId);
  }
  
  private async handleBlockRemove(blockId: string) {
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
  
  cacheChildParentMapping(childBlockId: string, parentBlockId: string) {
    this.parentBlockCache.set(childBlockId, parentBlockId);
  }
}
```

### 4.5 进度管理器

**文件位置**：[src/lib/taskProgress/manager.ts](file:///workspace/src/lib/taskProgress/manager.ts)

```typescript
import { TaskProgress, TaskBlock } from './types';
import { getDirectTaskChildren } from './taskQuery';
import { aggregateTaskStats } from './statsCalculator';
import { TaskProgressEventListener } from './eventListener';

export class TaskProgressManager {
  private static instance: TaskProgressManager;
  private eventListener: TaskProgressEventListener;
  private progressCache: Map<string, TaskProgress> = new Map();
  
  private constructor() {
    this.eventListener = new TaskProgressEventListener();
  }
  
  public static getInstance(): TaskProgressManager {
    if (!TaskProgressManager.instance) {
      TaskProgressManager.instance = new TaskProgressManager();
    }
    return TaskProgressManager.instance;
  }
  
  initialize() {
    this.eventListener.startListening();
  }
  
  async getOrCalculateProgress(parentBlockId: string): Promise<TaskProgress | null> {
    const cached = this.progressCache.get(parentBlockId);
    if (cached && Date.now() - cached.lastUpdated < 5000) {
      return cached;
    }
    
    const tasks = await getDirectTaskChildren(parentBlockId);
    if (tasks.length === 0) return null;
    
    const progress = aggregateTaskStats(tasks);
    progress.blockId = parentBlockId;
    progress.parentBlockId = parentBlockId;
    
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

---

## 6. 配置设计

### 6.1 默认配置

**文件位置**：[src/settings/defaultSettings.json](file:///workspace/src/settings/defaultSettings.json)

```json
{
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

| 配置项 | 类型 | 说明 |
| :--- | :--- | :--- |
| `taskProgress.enabled` | boolean | 是否启用任务进度功能 |
| `taskProgress.defaultDisplayType` | string | 默认展示类型 |
| `taskProgress.displayOptions.*.size` | string | 组件尺寸 |
| `taskProgress.displayOptions.mini-circle.showLabel` | boolean | 是否显示标签 |
| `taskProgress.displayOptions.mini-circle.labelFormat` | string | 标签格式 |
| `taskProgress.displayOptions.dot-matrix.maxDots` | number | 最大显示点数 |
| `taskProgress.statusColors` | object | 状态颜色映射 |
| `taskProgress.updateInterval` | number | 更新间隔（毫秒） |

### 6.3 设置面板独立 Tab

**文件位置**：[src/components/SettingsModal/tabs/TaskProgressSettings.tsx](file:///workspace/src/components/SettingsModal/tabs/TaskProgressSettings.tsx)

创建独立的设置 Tab，与 GeneralSettings、ToolbarSettings、AdvancedSettings 同级：

```typescript
import { t } from '../../../translations/i18n.ts'
import CustomSelect from '../../CustomSelect/index.tsx'
import { Settings } from '../../../settings/types.ts'
import { TabComponentProps } from '../index.tsx'
import { ProgressDisplayType } from '../../../lib/taskProgress/types'

function TaskProgressSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const handleSettingChange = (path: string, value: any) => {
    setSettings(prev => {
      if (!prev) return prev
      const newSettings = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let current = newSettings
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newSettings
    })
  }

  const displayTypeOptions = [
    { value: 'mini-circle', label: t('settings.taskProgress.miniCircle', language) },
    { value: 'dot-matrix', label: t('settings.taskProgress.dotMatrix', language) },
    { value: 'status-cursor', label: t('settings.taskProgress.statusCursor', language) },
    { value: 'progress-capsule', label: t('settings.taskProgress.progressCapsule', language) },
    { value: 'step-progress', label: t('settings.taskProgress.stepProgress', language) }
  ]

  const sizeOptions = [
    { value: 'small', label: t('settings.taskProgress.sizeSmall', language) },
    { value: 'medium', label: t('settings.taskProgress.sizeMedium', language) },
    { value: 'large', label: t('settings.taskProgress.sizeLarge', language) }
  ]

  const labelFormatOptions = [
    { value: 'fraction', label: t('settings.taskProgress.labelFraction', language) },
    { value: 'percentage', label: t('settings.taskProgress.labelPercentage', language) },
    { value: 'both', label: t('settings.taskProgress.labelBoth', language) }
  ]

  const taskProgress = settings.taskProgress || {
    enabled: true,
    defaultDisplayType: 'mini-circle',
    displayOptions: {},
    statusColors: {},
    updateInterval: 1000
  }

  return (
    <div className="ltt-settings-tab-content">
      <p className="ltt-tab-section-description-small">
        {t('settings.taskProgressDescription', language)}
      </p>
      
      <div className="ltt-setting-item">
        <label>{t('settings.taskProgress.enabled', language)}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={taskProgress.enabled || false}
            onChange={(e) => handleSettingChange('taskProgress.enabled', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.taskProgress.defaultDisplayType', language)}</label>
        <CustomSelect
          options={displayTypeOptions}
          value={taskProgress.defaultDisplayType || 'mini-circle'}
          onChange={(value) => handleSettingChange('taskProgress.defaultDisplayType', value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.taskProgress.size', language)}</label>
        <CustomSelect
          options={sizeOptions}
          value={taskProgress.displayOptions?.['mini-circle']?.size || 'small'}
          onChange={(value) => handleSettingChange('taskProgress.displayOptions.mini-circle.size', value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.taskProgress.showLabel', language)}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={taskProgress.displayOptions?.['mini-circle']?.showLabel ?? true}
            onChange={(e) => handleSettingChange('taskProgress.displayOptions.mini-circle.showLabel', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.taskProgress.labelFormat', language)}</label>
        <CustomSelect
          options={labelFormatOptions}
          value={taskProgress.displayOptions?.['mini-circle']?.labelFormat || 'fraction'}
          onChange={(value) => handleSettingChange('taskProgress.displayOptions.mini-circle.labelFormat', value)}
        />
      </div>

      <div className="ltt-settings-actions">
        <button 
          className="ltt-settings-btn ltt-settings-btn-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? t('settings.saving', language) : t('settings.saveTaskProgressSettings', language)}
        </button>
      </div>
    </div>
  )
}

export default TaskProgressSettings
```

### 6.4 SettingsModal 集成

**文件位置**：[src/components/SettingsModal/index.tsx](file:///workspace/src/components/SettingsModal/index.tsx)

在现有的 tabs 数组中添加 TaskProgressSettings：

```typescript
import TaskProgressSettings from './tabs/TaskProgressSettings.tsx'

// 在 tabs 数组中添加
const tabs: Tab[] = [
  { id: 'general', component: GeneralSettings, label: t('settings.tabs.general', language) },
  { id: 'toolbar', component: ToolbarSettings, label: t('settings.tabs.toolbar', language) },
  { id: 'task-progress', component: TaskProgressSettings, label: t('settings.tabs.taskProgress', language) },
  { id: 'advanced', component: AdvancedSettings, label: t('settings.tabs.advanced', language) }
]
```

---

## 7. 数据流设计

### 7.1 初始化流程

```
插件加载 (main.tsx)
    │
    ├── registerTaskProgress()  注册宏渲染器和斜杠命令
    │       │
    │       ├── logseq.provideStyle()        提供样式
    │       ├── logseq.App.onMacroRendererSlotted()  注册宏渲染器
    │       └── logseq.Editor.registerSlashCommand() 注册斜杠命令
    │
    └── TaskProgressManager.initialize()  初始化管理器
            │
            └── eventListener.startListening()  开始监听事件
```

### 7.2 渲染流程

```
用户输入 {{renderer :taskprogress}}
    │
    ├── onMacroRendererSlotted 触发
    │       │
    │       ├── 解析参数获取 blockId
    │       └── startRendering(blockId, slot)
    │
    ├── getOrCalculateProgress(blockId)
    │       │
    │       ├── 检查缓存
    │       ├── getDirectTaskChildren(blockId)  查询子任务
    │       └── aggregateTaskStats(tasks)       计算统计
    │
    ├── ReactDOMServer.renderToStaticMarkup()  生成 HTML
    │
    └── logseq.provideUI()  渲染到 slot
```

### 7.3 更新流程

```
子任务变更
    │
    ├── onBlockChanged 事件触发
    │       │
    │       ├── 检查 task_tracking 属性
    │       ├── 获取父节点 ID
    │       └── notifyUpdate(parentBlockId)
    │
    └── 重新渲染进度组件
```

---

## 8. Logseq API 使用参考

### 8.1 核心 API

| API | 用途 | 文档参考 |
| :--- | :--- | :--- |
| `logseq.provideStyle()` | 提供自定义样式 | [plugins-doc.logseq.com](https://plugins-doc.logseq.com/) |
| `logseq.provideUI()` | 提供自定义 UI | [plugins-doc.logseq.com](https://plugins-doc.logseq.com/) |
| `logseq.App.onMacroRendererSlotted()` | 注册宏渲染器 | [plugins-doc.logseq.com](https://plugins-doc.logseq.com/) |
| `logseq.Editor.registerSlashCommand()` | 注册斜杠命令 | [plugins-doc.logseq.com](https://plugins-doc.logseq.com/) |
| `logseq.Editor.getBlock()` | 获取块详情 | [plugins-doc.logseq.com](https://plugins-doc.logseq.com/) |
| `logseq.Editor.getBlockChildren()` | 获取子块列表 | [plugins-doc.logseq.com](https://plugins-doc.logseq.com/) |
| `logseq.DB.datascriptQuery()` | 执行复杂查询 | [plugins-doc.logseq.com](https://plugins-doc.logseq.com/) |
| `logseq.App.onBlockChanged()` | 监听块变更 | [plugins-doc.logseq.com](https://plugins-doc.logseq.com/) |
| `logseq.App.queryElementById()` | 查询 DOM 元素 | [plugins-doc.logseq.com](https://plugins-doc.logseq.com/) |

### 8.2 参考实现

- [logseq-plugin-todo-master](https://github.com/pengx17/logseq-plugin-todo-master) - 任务进度条实现
- [Logseq Plugin Docs](https://plugins-doc.logseq.com/) - 官方插件文档

---

## 9. 性能优化考虑

### 9.1 缓存策略

- **结果缓存**：缓存查询结果，避免重复查询
- **过期机制**：设置缓存过期时间，在事件触发时失效
- **子节点-父节点映射缓存**：快速定位需要更新的父节点

### 9.2 批量处理

- **快速过滤**：先检查 `task_tracking` 属性，快速筛选相关任务
- **合并更新**：短时间内多个子任务变更合并为一次更新
- **防抖处理**：使用 debounce 减少频繁更新

### 9.3 渲染优化

- **模板比对**：渲染前比对模板，相同则跳过
- **slot 存在检测**：检测 slot 是否存在，避免无效渲染
- **定时刷新**：使用 interval 定时刷新，而非频繁事件触发

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
| 阶段三 | Logseq API 注册与渲染 | lib/taskProgress/register.ts | 2 天 |
| 阶段四 | 设置面板独立 Tab | SettingsModal/tabs/ | 1 天 |
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
| [src/lib/taskProgress/register.ts](file:///workspace/src/lib/taskProgress/register.ts) | Logseq API 注册 | ⏳ 未实现 |
| [src/components/TaskProgress/](file:///workspace/src/components/TaskProgress/) | UI 组件目录 | ⏳ 未实现 |
| [src/components/SettingsModal/tabs/TaskProgressSettings.tsx](file:///workspace/src/components/SettingsModal/tabs/TaskProgressSettings.tsx) | 设置 Tab | ⏳ 未实现 |
| [src/settings/types.ts](file:///workspace/src/settings/types.ts) | 设置类型（需扩展） | ✅ 需修改 |
| [src/settings/defaultSettings.json](file:///workspace/src/settings/defaultSettings.json) | 默认配置（需扩展） | ✅ 需修改 |

### B. 国际化配置

**文件位置**：[src/translations/zh-CN.json](file:///workspace/src/translations/zh-CN.json)

```json
{
  "settings": {
    "tabs": {
      "taskProgress": "任务进度"
    },
    "taskProgress": {
      "enabled": "启用任务进度功能",
      "defaultDisplayType": "默认展示方式",
      "miniCircle": "微型圆环",
      "dotMatrix": "点阵进度",
      "statusCursor": "状态光标",
      "progressCapsule": "进度胶囊",
      "stepProgress": "阶梯进度",
      "size": "组件尺寸",
      "sizeSmall": "小",
      "sizeMedium": "中",
      "sizeLarge": "大",
      "showLabel": "显示标签",
      "labelFormat": "标签格式",
      "labelFraction": "分数 (10/20)",
      "labelPercentage": "百分比 (50%)",
      "labelBoth": "两者 (10/20 50%)"
    },
    "taskProgressDescription": "配置任务进度追踪功能的展示方式和行为。",
    "saveTaskProgressSettings": "保存任务进度设置"
  }
}
```
