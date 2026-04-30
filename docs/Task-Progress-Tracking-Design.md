# Task Progress Tracking 设计方案

## 1. 产品需求分析

### 1.1 核心需求

| 需求编号 | 需求描述 | 来源 |
| :--- | :--- | :--- |
| REQ-001 | 在 Logseq task 父节点上展示任务进度 | 用户需求第1点 |
| REQ-002 | 任务子节点标记属性 `task_tracking` 值为 `true` | 用户需求第1点（优化版） |
| REQ-003 | 查询父节点下的 task 子节点（标签为 task 或属性有 status 的子节点） | 用户需求第2点 |
| REQ-004 | 统计 task 数量，并按照 status 聚合统计（如 ToDo 10, Done 20） | 用户需求第2点 |
| REQ-005 | 仅关注一层嵌套，多层嵌套场景忽略深层子节点 | 用户需求第2点 |
| REQ-006 | 支持多种展示方式可配置：微型三色圆环、点阵进度、状态光标、进度胶囊、阶梯进度 | 用户需求第3点 |
| REQ-007 | 每次 block 渲染时按需获取子任务数据并计算进度（方案一） | 用户需求 |

### 1.2 功能概述

本功能旨在为 Logseq 提供任务进度可视化能力：
- **数据聚合层**：每次渲染时通过 Logseq API 获取父节点下的一级子任务，统计任务总数和各状态数量
- **展示层**：提供多种进度展示组件，支持用户自定义选择
- **实现方式**：采用方案一，按需渲染，不做事件监听和缓存，实现简单可靠

### 1.3 属性命名规范

根据用户要求，使用下划线命名方式：
- 属性名：`task_tracking`
- 属性值：`true`（启用进度追踪）
- 设置位置：任务子节点上

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
│   │   │       ├── GeneralSettings.tsx              (已实现)
│   │   │       ├── ToolbarSettings.tsx              (已实现)
│   │   │       ├── AdvancedSettings.tsx             (已实现)
│   │   │       └── TaskProgressSettings.tsx         (未实现 - 任务进度设置)
│   │   ├── Toast/                    (已实现)
│   │   ├── Toolbar/                  (已实现 - 工具栏)
│   │   └── TaskProgress/             (未实现 - 任务进度组件)
│   │
│   ├── lib/
│   │   ├── logger/                   (已实现)
│   │   ├── toolbar/                  (已实现 - 工具栏核心逻辑)
│   │   └── taskProgress/             (未实现 - 任务进度核心逻辑)
│   │
│   ├── logseq/mock/                  (已实现 - Logseq Mock)
│   ├── settings/                     (已实现 - 设置管理)
│   ├── styles/                       (已实现 - 样式目录)
│   ├── test/                         (已实现 - 测试)
│   └── main.tsx                      (已实现 - 入口)
│
└── docs/                             (文档目录)
```

**模块状态标识**：
- ✅ 已实现：现有功能模块
- ⏳ 未实现：任务进度追踪模块（本方案设计内容）

### 2.2 架构图

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         Text Toolkit Plugin (Task Progress)                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        main.tsx (入口)                                    │   │
│  │  ┌───────────────────────────────────────────────────────────────────┐ │   │
│  │  │  1. 加载 CSS (styles/index.ts)                                     │ │   │
│  │  │  2. 初始化 i18n                                                    │ │   │
│  │  │  3. registerTaskProgress() - 注册宏渲染器和斜杠命令                 │ │   │
│  │  └───────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                   应用层 (Application Layer)                              │   │
│  │  ┌───────────────────────────────────────────────────────────────────┐ │   │
│  │  │              TaskProgress Components (UI 组件)                     │ │   │
│  │  │  MiniCircle | DotMatrix | StatusCursor | Capsule | Step           │ │   │
│  │  └───────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                   业务逻辑层 (Business Logic)                             │   │
│  │  ┌──────────────────────┐ ┌──────────────────────┐                     │   │
│  │  │ TaskQueryService     │ │ StatsCalculator      │                     │   │
│  │  │    任务查询服务       │ │    统计计算服务      │                     │   │
│  │  └──────────────────────┘ └──────────────────────┘                     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                   数据访问层 (Data Access)                                │   │
│  │  ┌───────────────────────────────────────────────────────────────────┐ │   │
│  │  │              Logseq API (真实/Mock)                                 │ │   │
│  │  │  - Editor.getBlock()        获取块                                  │ │   │
│  │  │  - Editor.getBlockChildren() 获取子块                               │ │   │
│  │  │  - DB.datascriptQuery()     执行查询                                │ │   │
│  │  │  - provideUI()              提供UI渲染                               │ │   │
│  │  │  - provideStyle()           提供样式                                 │ │   │
│  │  └───────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                   配置层 (Configuration)                                  │   │
│  │  ┌───────────────────────────────────────────────────────────────────┐ │   │
│  │  │  TaskProgressSettings Tab (独立设置 Tab)                           │ │   │
│  │  └───────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                   测试层 (Testing)                                        │   │
│  │  ┌───────────────────────────────────────────────────────────────────┐ │   │
│  │  │  TestApp 集成 - 支持测试环境                                        │ │   │
│  │  │  - mock Logseq App/Editor/DB API                                   │ │   │
│  │  │  - 模拟 block/child block 数据                                     │ │   │
│  │  └───────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 模块划分与文件位置

| 模块 | 职责 | 文件位置 | 状态 |
| :--- | :--- | :--- | :--- |
| `components/TaskProgress/` | 进度展示组件集合 | [src/components/TaskProgress/](file:///workspace/src/components/TaskProgress/) | ⏳ 未实现 |
| `lib/taskProgress/` | 任务进度核心逻辑 | [src/lib/taskProgress/](file:///workspace/src/lib/taskProgress/) | ⏳ 未实现 |
| `lib/taskProgress/register.ts` | Logseq API 注册 | [src/lib/taskProgress/register.ts](file:///workspace/src/lib/taskProgress/register.ts) | ⏳ 未实现 |
| `components/SettingsModal/tabs/TaskProgressSettings.tsx` | 任务进度设置 Tab | [src/components/SettingsModal/tabs/TaskProgressSettings.tsx](file:///workspace/src/components/SettingsModal/tabs/TaskProgressSettings.tsx) | ⏳ 未实现 |
| `settings/types.ts` | 任务进度类型定义 | [src/settings/types.ts](file:///workspace/src/settings/types.ts) | 需扩展 |
| `settings/defaultSettings.json` | 默认配置 | [src/settings/defaultSettings.json](file:///workspace/src/settings/defaultSettings.json) | 需扩展 |
| `styles/index.ts` | 样式导出 | [src/styles/index.ts](file:///workspace/src/styles/index.ts) | 需扩展 |
| `logseq/mock/app.ts` | Mock App API | [src/logseq/mock/app.ts](file:///workspace/src/logseq/mock/app.ts) | 需扩展 |
| `logseq/mock/editor.ts` | Mock Editor API | [src/logseq/mock/editor.ts](file:///workspace/src/logseq/mock/editor.ts) | 需扩展 |
| `logseq/mock/index.ts` | Mock DB API | [src/logseq/mock/index.ts](file:///workspace/src/logseq/mock/index.ts) | 需扩展 |
| `test/testAPP.tsx` | 测试 App 集成 | [src/test/testAPP.tsx](file:///workspace/src/test/testAPP.tsx) | 需扩展 |

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
import { calculateTaskProgress } from './taskQuery';
import { TaskProgress } from '../components/TaskProgress/TaskProgress';
import { getSettings } from '../../settings';

const MACRO_PREFIX = ':taskprogress';
const PLUGIN_ID = 'text-toolkit-taskprogress';

async function renderProgress(blockId: string, slot: string) {
  try {
    const progressData = await calculateTaskProgress(blockId);
    
    if (!progressData) {
      logseq.provideUI({
        key: PLUGIN_ID + '__' + slot,
        slot,
        reset: true,
        template: '',
      });
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
    
    logseq.provideUI({
      key: PLUGIN_ID + '__' + slot,
      slot,
      reset: true,
      template,
    });
  } catch (err) {
    console.error('[TaskProgress] Render error:', err);
  }
}

export function registerTaskProgress() {
  logseq.App.onMacroRendererSlotted(async ({ payload, slot }) => {
    const [type] = payload.arguments;
    if (!type?.startsWith(MACRO_PREFIX)) {
      return;
    }
    
    let blockId = null;
    if (type === MACRO_PREFIX) {
      blockId = payload.uuid;
    } else {
      blockId = type.substring(MACRO_PREFIX.length + 1);
    }
    
    if (blockId) {
      await renderProgress(blockId, slot);
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

### 4.2 任务查询与统计逻辑

**文件位置**：[src/lib/taskProgress/taskQuery.ts](file:///workspace/src/lib/taskProgress/taskQuery.ts)

```typescript
import { TaskProgress, TaskBlock } from './types';
import { getSettings } from '../../settings';

const STATUS_COLORS: Record<string, string> = {
  todo: '#f59e0b',
  doing: '#3b82f6',
  done: '#10b981',
  waiting: '#8b5cf6',
  canceled: '#6b7280',
};

function getStatusColor(status: string): string {
  const settings = getSettings();
  return settings?.taskProgress?.statusColors?.[status] || STATUS_COLORS[status] || '#6b7280';
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

export async function calculateTaskProgress(parentBlockId: string): Promise<TaskProgress | null> {
  const tasks = await getDirectTaskChildren(parentBlockId);
  if (tasks.length === 0) return null;
  
  const statusStats: { status: string; count: number; color?: string }[] = [];
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
    blockId: parentBlockId,
    parentBlockId: parentBlockId,
    totalTasks,
    completedTasks,
    statusStats,
    progress,
  };
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
└── StepProgress.tsx                  # 阶梯进度
```

### 5.2 主组件

**文件位置**：[src/components/TaskProgress/TaskProgress.tsx](file:///workspace/src/components/TaskProgress/TaskProgress.tsx)

```typescript
import React from 'react';
import { TaskProgress as TaskProgressType, ProgressDisplayType, StatusStat } from '../../lib/taskProgress/types';
import MiniCircleProgress from './MiniCircleProgress';
import DotMatrixProgress from './DotMatrixProgress';
import StatusCursorProgress from './StatusCursorProgress';
import ProgressCapsule from './ProgressCapsule';
import StepProgress from './StepProgress';

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

### 5.4 样式导出

**文件位置**：[src/styles/index.ts](file:///workspace/src/styles/index.ts)

```typescript
import settingsModalCSS from '../components/SettingsModal/settingsModal.css?raw';
import modalCSS from '../components/Modal/modal.css?raw';
import toolbarCSS from '../components/Toolbar/toolbar.css?raw';
import inlineCommentCSS from '../components/Comment/inlineComment.css?raw';
import customsToolbarItemsCSS from './customsToolbarItems.css?raw';
import taskProgressCSS from '../components/TaskProgress/taskProgress.css?raw';

export {
  settingsModalCSS,
  modalCSS,
  toolbarCSS,
  inlineCommentCSS,
  customsToolbarItemsCSS,
  taskProgressCSS
};
```

### 5.5 main.tsx 样式加载

**文件位置**：[src/main.tsx](file:///workspace/src/main.tsx)

```typescript
import {
  settingsModalCSS,
  modalCSS,
  toolbarCSS,
  inlineCommentCSS,
  customsToolbarItemsCSS,
  taskProgressCSS
} from './styles/index.ts';

const loadCSS = async () => {
  try {
    const cssFiles = [
      { name: 'settingsModal.css', content: settingsModalCSS },
      { name: 'modal.css', content: modalCSS },
      { name: 'toolbar.css', content: toolbarCSS },
      { name: 'inlineComment.css', content: inlineCommentCSS },
      { name: 'customsToolbarItems.css', content: customsToolbarItemsCSS },
      { name: 'taskProgress.css', content: taskProgressCSS }
    ];

    for (const cssFile of cssFiles) {
      try {
        const response = await fetch(`./${cssFile.name}`);
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('text/css')) {
            const cssContent = await response.text();
            if (cssContent.trim()) {
              logseq.provideStyle(cssContent);
              logger.info(`Loaded CSS file from root: ${cssFile.name}`);
            } else {
              logger.info(`CSS file is empty in root, using built-in CSS: ${cssFile.name}`);
              if (cssFile.content) {
                logseq.provideStyle(cssFile.content);
                logger.info(`Loaded built-in CSS for ${cssFile.name}`);
              }
            }
          } else {
            logger.info(`Response is not CSS, using built-in CSS: ${cssFile.name}`);
            if (cssFile.content) {
              logseq.provideStyle(cssFile.content);
              logger.info(`Loaded built-in CSS for ${cssFile.name}`);
            }
          }
        } else {
          logger.info(`CSS file not found in root, using built-in CSS: ${cssFile.name}`);
          if (cssFile.content) {
            logseq.provideStyle(cssFile.content);
            logger.info(`Loaded built-in CSS for ${cssFile.name}`);
          }
        }
      } catch (error) {
        logger.warn(`Error loading CSS file from root ${cssFile.name}:`, error);
        if (cssFile.content) {
          logseq.provideStyle(cssFile.content);
          logger.info(`Loaded built-in CSS for ${cssFile.name} (fallback)`);
        }
      }
    }
  } catch (error) {
    logger.error('Error in loadCSS:', error);
  }
};
```

---

## 6. Mock Logseq 实现

### 6.1 Mock DB 扩展

**文件位置**：[src/logseq/mock/index.ts](file:///workspace/src/logseq/mock/index.ts)

```typescript
// Mock Logseq DB API
interface MockBlock {
  id: string;
  content: string;
  properties?: {
    status?: string;
    task_tracking?: boolean;
    [key: string]: unknown;
  };
  children?: MockBlock[];
}

const mockBlocks: Map<string, MockBlock> = new Map();

export function addMockBlock(block: MockBlock) {
  mockBlocks.set(block.id, block);
}

export function clearMockBlocks() {
  mockBlocks.clear();
}

const mockLogseq = {
  // ... 现有 mock 实现 ...
  
  DB: {
    datascriptQuery: async (query: string) => {
      console.log('Mock DB datascriptQuery called:', query);
      // 简单实现：返回匹配的 mock blocks
      const results: [MockBlock][] = [];
      mockBlocks.forEach(block => {
        if (block.properties?.task_tracking === true) {
          results.push([block]);
        }
      });
      return results;
    },
    q: () => Promise.resolve([]),
    customQuery: () => Promise.resolve([]),
    onChanged: () => () => {}
  }
};
```

### 6.2 Mock Editor 扩展

**文件位置**：[src/logseq/mock/editor.ts](file:///workspace/src/logseq/mock/editor.ts)

```typescript
import { getDocument } from '../utils.ts';

interface MockBlock {
  id: string;
  uuid: string;
  content: string;
  properties?: {
    status?: string;
    task_tracking?: boolean;
    [key: string]: unknown;
  };
  children?: MockBlock[];
  parentId?: string;
}

const mockBlocks: Map<string, MockBlock> = new Map();

export function addMockBlock(block: MockBlock) {
  mockBlocks.set(block.id, block);
  mockBlocks.set(block.uuid, block);
}

export function clearMockBlocks() {
  mockBlocks.clear();
}

const Editor: any = {
  // ... 现有 mock Editor API ...
  
  getBlock: async (blockId: string) => {
    console.log('Mock Editor.getBlock called:', blockId);
    return mockBlocks.get(blockId) || null;
  },
  
  getBlockChildren: async (blockId: string) => {
    console.log('Mock Editor.getBlockChildren called:', blockId);
    const parentBlock = mockBlocks.get(blockId);
    if (parentBlock?.children) {
      return parentBlock.children;
    }
    // 查找所有以该 block 为父节点的子节点
    const children: MockBlock[] = [];
    mockBlocks.forEach(block => {
      if (block.parentId === blockId) {
        children.push(block);
      }
    });
    return children;
  },
  
  updateBlock: async (blockId: string, content: string, properties?: any) => {
    console.log('Mock Editor.updateBlock called:', blockId, content, properties);
    const block = mockBlocks.get(blockId);
    if (block) {
      if (content) block.content = content;
      if (properties) block.properties = { ...block.properties, ...properties };
    }
    return true;
  },
  
  getCurrentBlock: async () => {
    console.log('Mock Editor.getCurrentBlock called');
    const blocks = Array.from(mockBlocks.values());
    if (blocks.length > 0) {
      return blocks[0];
    }
    return {
      uuid: 'default-block',
      content: 'Default block content',
      properties: {}
    };
  },
  
  insertAtEditingCursor: async (text: string) => {
    console.log('Mock Editor.insertAtEditingCursor called:', text);
    return true;
  },
  
  registerSlashCommand: (name: string, callback: Function) => {
    console.log('Mock Editor.registerSlashCommand called:', name);
    globalThis[name] = callback;
  }
};

export default Editor;
```

### 6.3 Mock App 扩展

**文件位置**：[src/logseq/mock/app.ts](file:///workspace/src/logseq/mock/app.ts)

```typescript
import { getDocument } from '../utils.ts';

const App: any = {
  // ... 现有 mock App API ...
  
  onMacroRendererSlotted: (callback: Function) => {
    console.log('Mock App.onMacroRendererSlotted registered');
    globalThis.logseqMacroRendererCallback = callback;
  },
  
  registerUIItem: (slot: string, config: any) => {
    console.log('Mock App.registerUIItem called:', slot, config);
    const doc = getDocument();
    const toolbarElement = doc.getElementById('toolbar');
    if (toolbarElement) {
      const existingElement = doc.getElementById(config.key);
      if (existingElement) {
        existingElement.remove();
      }
      const element = doc.createElement('div');
      element.id = config.key;
      element.innerHTML = config.template;
      toolbarElement.appendChild(element);
      
      const clickableElements = element.querySelectorAll('[data-on-click]');
      clickableElements.forEach(clickable => {
        clickable.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const functionName = clickable.getAttribute('data-on-click');
          if (functionName && typeof (globalThis as any)[functionName] === 'function') {
            console.log('Calling function:', functionName);
            (globalThis as any)[functionName]();
          }
        });
      });
    }
  }
};

export default App;
```

---

## 7. TestApp 集成

### 7.1 TestApp 任务进度演示

**文件位置**：[src/test/testAPP.tsx](file:///workspace/src/test/testAPP.tsx)

```typescript
import '../main.css';
import './testApp.css';
import TestLayout from './components/TestLayout/index.tsx';
import TextSelectionDemo from './components/TextSelectionDemo/index.tsx';
import HiccupRenderer from './components/HiccupRenderer/index.tsx';
import ToastContainer from '../components/Toast/Toast.tsx';
import CommentApp from '../components/Comment/CommentApp.tsx';
import TaskProgressDemo from './components/TaskProgressDemo/index.tsx';
import testConfig from './testConfig.ts';
import { useSettingsContext } from '../settings/useSettings.tsx';
import { useEffect } from 'react';
import { addMockBlock, clearMockBlocks } from '../logseq/mock/editor.ts';

function TestApp() {
  const { settings } = useSettingsContext();

  useEffect(() => {
    // 初始化 mock 数据
    clearMockBlocks();
    
    // 添加父任务块
    addMockBlock({
      id: 'parent-1',
      uuid: 'parent-1',
      content: 'My Project Tasks {{renderer :taskprogress}}',
      properties: {}
    });
    
    // 添加子任务块
    addMockBlock({
      id: 'child-1',
      uuid: 'child-1',
      content: 'Design the UI',
      properties: {
        status: 'done',
        task_tracking: true
      },
      parentId: 'parent-1'
    });
    
    addMockBlock({
      id: 'child-2',
      uuid: 'child-2',
      content: 'Implement the logic',
      properties: {
        status: 'doing',
        task_tracking: true
      },
      parentId: 'parent-1'
    });
    
    addMockBlock({
      id: 'child-3',
      uuid: 'child-3',
      content: 'Write documentation',
      properties: {
        status: 'todo',
        task_tracking: true
      },
      parentId: 'parent-1'
    });
    
    addMockBlock({
      id: 'child-4',
      uuid: 'child-4',
      content: 'Write tests',
      properties: {
        status: 'waiting',
        task_tracking: true
      },
      parentId: 'parent-1'
    });
  }, []);

  // 左侧面板内容
  const leftContent = (
    <div className="left-panel">
      <h3>{testConfig.leftPanel.title}</h3>
      {testConfig.leftPanel.sections.map((section, index) => (
        <div key={index} className="panel-section">
          <h4>{section.title}</h4>
          <ul>
            {section.items.map((item) => (
              <li key={item.id}>{item.label}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  // 右侧面板内容
  const rightContent = (
    <div className="right-panel">
      <h3>{testConfig.rightPanel.title}</h3>
      <div className="actions">
        {testConfig.rightPanel.actions.map((action) => (
          <button key={action.id} className="action-btn">
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );

  // 中间内容区域
  const centerContent = (
    <div className="center-content">
      <TextSelectionDemo />
      <div className="hiccup-renderer-container">
        <HiccupRenderer />
      </div>
      <TaskProgressDemo />
    </div>
  );

  return (
    <div id="app-container" className={`app ${settings?.theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      {/* 右上角工具栏横幅 */}
      <div id="toolbar" className="toolbar-banner">
        <div className="toolbar-banner-content">
          <span className="toolbar-banner-text">工具栏演示</span>
          <div className="toolbar-banner-actions">
            <button className="toolbar-banner-btn" title="粗体">
              <span className="toolbar-icon">B</span>
            </button>
            <button className="toolbar-banner-btn" title="斜体">
              <span className="toolbar-icon">I</span>
            </button>
            <button className="toolbar-banner-btn" title="下划线">
              <span className="toolbar-icon">U</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* 顶部区域 */}
      <div id="head" className="top-toolbar">
        <div className="toolbar-content">
          <h1>Text Toolkit Plugin (Test Mode)</h1>
        </div>
      </div>
      
      {/* 使用TestLayout布局 */}
      <TestLayout 
        leftContent={leftContent}
        centerContent={centerContent}
        rightContent={rightContent}
      />
      
      {/* Toast 容器 */}
      <ToastContainer />
    </div>
  );
}

export default TestApp;
```

### 7.2 TaskProgressDemo 组件

**文件位置**：[src/test/components/TaskProgressDemo/index.tsx](file:///workspace/src/test/components/TaskProgressDemo/index.tsx)

```typescript
import React, { useEffect, useState } from 'react';
import { TaskProgress } from '../../../components/TaskProgress/TaskProgress';
import { calculateTaskProgress } from '../../../lib/taskProgress/taskQuery';
import { getSettings } from '../../../settings';

const TaskProgressDemo: React.FC = () => {
  const [progressData, setProgressData] = useState<any>(null);
  const settings = getSettings();

  useEffect(() => {
    const loadProgress = async () => {
      const data = await calculateTaskProgress('parent-1');
      setProgressData(data);
    };
    loadProgress();
  }, []);

  const refreshProgress = async () => {
    const data = await calculateTaskProgress('parent-1');
    setProgressData(data);
  };

  if (!progressData) {
    return <div>Loading...</div>;
  }

  const displayTypes = [
    { type: 'mini-circle', label: '微型圆环' },
    { type: 'dot-matrix', label: '点阵进度' },
    { type: 'status-cursor', label: '状态光标' },
    { type: 'progress-capsule', label: '进度胶囊' },
    { type: 'step-progress', label: '阶梯进度' }
  ];

  return (
    <div className="task-progress-demo">
      <h3>任务进度演示</h3>
      <div className="demo-section">
        <div className="progress-info">
          <p>总任务数: {progressData.totalTasks}</p>
          <p>已完成: {progressData.completedTasks}</p>
          <p>进度: {progressData.progress}%</p>
        </div>
        
        <div className="all-display-types">
          {displayTypes.map(({ type, label }) => (
            <div key={type} className="display-type-item">
              <span className="type-label">{label}:</span>
              <TaskProgress
                progressData={progressData}
                displayType={type as any}
                config={settings?.taskProgress?.displayOptions?.[type]}
              />
            </div>
          ))}
        </div>
        
        <button className="refresh-btn" onClick={refreshProgress}>
          刷新进度
        </button>
      </div>
    </div>
  );
};

export default TaskProgressDemo;
```

---

## 8. 配置设计

### 8.1 默认配置

**文件位置**：[src/settings/defaultSettings.json](file:///workspace/src/settings/defaultSettings.json)

```json
{
  // ... 现有配置 ...
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
    }
  }
}
```

### 8.2 设置面板独立 Tab

**文件位置**：[src/components/SettingsModal/tabs/TaskProgressSettings.tsx](file:///workspace/src/components/SettingsModal/tabs/TaskProgressSettings.tsx)

```typescript
import { t } from '../../../translations/i18n.ts';
import CustomSelect from '../../CustomSelect/index.tsx';
import { Settings } from '../../../settings/types.ts';
import { TabComponentProps } from '../index.tsx';
import { ProgressDisplayType } from '../../../lib/taskProgress/types.ts';

function TaskProgressSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const handleSettingChange = (path: string, value: any) => {
    setSettings(prev => {
      if (!prev) return prev;
      const newSettings = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const displayTypeOptions = [
    { value: 'mini-circle', label: t('settings.taskProgress.miniCircle', language) },
    { value: 'dot-matrix', label: t('settings.taskProgress.dotMatrix', language) },
    { value: 'status-cursor', label: t('settings.taskProgress.statusCursor', language) },
    { value: 'progress-capsule', label: t('settings.taskProgress.progressCapsule', language) },
    { value: 'step-progress', label: t('settings.taskProgress.stepProgress', language) }
  ];

  const sizeOptions = [
    { value: 'small', label: t('settings.taskProgress.sizeSmall', language) },
    { value: 'medium', label: t('settings.taskProgress.sizeMedium', language) },
    { value: 'large', label: t('settings.taskProgress.sizeLarge', language) }
  ];

  const labelFormatOptions = [
    { value: 'fraction', label: t('settings.taskProgress.labelFraction', language) },
    { value: 'percentage', label: t('settings.taskProgress.labelPercentage', language) },
    { value: 'both', label: t('settings.taskProgress.labelBoth', language) }
  ];

  const taskProgress = settings.taskProgress || {
    enabled: true,
    defaultDisplayType: 'mini-circle',
    displayOptions: {},
    statusColors: {}
  };

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
  );
}

export default TaskProgressSettings;
```

---

## 9. main.tsx 集成

### 9.1 入口文件集成

**文件位置**：[src/main.tsx](file:///workspace/src/main.tsx)

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import TestApp from './test/testAPP.tsx';
import SettingsModal from './components/SettingsModal';
import SelectToolbar from './components/SelectToolbar';
import CommentApp from './components/Comment/CommentApp.tsx';
import { SettingsProvider } from './settings/useSettings.tsx';
import { logseqAPI } from './logseq/index.ts';
import { getSettings } from './settings/index.ts';
import { getDocument } from './logseq/utils.ts';
import { logger } from './lib/logger/logger.ts';
import { initI18n } from './translations/i18n.ts';
import {
  settingsModalCSS,
  modalCSS,
  toolbarCSS,
  inlineCommentCSS,
  customsToolbarItemsCSS,
  taskProgressCSS
} from './styles/index.ts';
import { registerTaskProgress } from './lib/taskProgress/register.ts';

// ... 现有 loadCSS, renderComponent, settingToggle, showSettingUI, showCommentApp, showSelectToolbar ...

const main = async () => {
  try {
    await loadCSS();

    await initI18n();
    logger.info('I18n initialized successfully');

    logseq.provideModel({ settingToggle });

    await showSettingUI();

    logseq.App.registerUIItem('toolbar', {
      key: 'text-toolkit-settings-btn',
      template: `
        <a class="button" id="ltt-settings-button"
        data-on-click="settingToggle"
        data-rect>
         <i class="ti ti-text-wrap"></i>
        </a>
      `,
    });

    await showSelectToolbar();
    await showCommentApp();
    
    // 注册任务进度功能
    registerTaskProgress();
    logger.info('Task progress registered successfully');
  } catch (error) {
    logger.error('Failed to initialize Text Toolkit Plugin:', error);
  }
};

if (import.meta.env.MODE === 'test') {
  const rootElement = getDocument().getElementById('root');
  renderComponent(rootElement, TestApp);
  logseqAPI.ready(main).catch((err) => logger.error('Plugin ready error:', err));
} else { 
  logseqAPI.ready(main).catch((err) => logger.error('Plugin ready error:', err));
}
```

---

## 10. 实施计划

| 阶段 | 任务 | 文件位置 | 预估时间 |
| :--- | :--- | :--- | :--- |
| 阶段一 | 类型定义和样式 | types.ts, taskProgress.css, styles/index.ts | 0.5 天 |
| 阶段二 | 核心逻辑实现（查询、统计） | taskQuery.ts | 1 天 |
| 阶段三 | Logseq API 注册 | register.ts | 0.5 天 |
| 阶段四 | UI 组件实现（5种展示方式） | components/TaskProgress/ | 3 天 |
| 阶段五 | 设置面板独立 Tab | SettingsModal/tabs/ | 0.5 天 |
| 阶段六 | Mock Logseq 扩展 | logseq/mock/ | 1 天 |
| 阶段七 | TestApp 集成 | test/ | 0.5 天 |
| 阶段八 | main.tsx 集成 | main.tsx | 0.5 天 |

---

## 附录

### A. 相关文件索引

| 文件/目录 | 说明 | 状态 |
| :--- | :--- | :--- |
| [src/lib/taskProgress/types.ts](file:///workspace/src/lib/taskProgress/types.ts) | 类型定义 | ⏳ 未实现 |
| [src/lib/taskProgress/taskQuery.ts](file:///workspace/src/lib/taskProgress/taskQuery.ts) | 任务查询和统计 | ⏳ 未实现 |
| [src/lib/taskProgress/register.ts](file:///workspace/src/lib/taskProgress/register.ts) | Logseq API 注册 | ⏳ 未实现 |
| [src/components/TaskProgress/](file:///workspace/src/components/TaskProgress/) | UI 组件目录 | ⏳ 未实现 |
| [src/components/TaskProgress/taskProgress.css](file:///workspace/src/components/TaskProgress/taskProgress.css) | 样式文件 | ⏳ 未实现 |
| [src/styles/index.ts](file:///workspace/src/styles/index.ts) | 样式导出 | 需扩展 |
| [src/components/SettingsModal/tabs/TaskProgressSettings.tsx](file:///workspace/src/components/SettingsModal/tabs/TaskProgressSettings.tsx) | 设置 Tab | ⏳ 未实现 |
| [src/settings/types.ts](file:///workspace/src/settings/types.ts) | 设置类型 | 需扩展 |
| [src/settings/defaultSettings.json](file:///workspace/src/settings/defaultSettings.json) | 默认配置 | 需扩展 |
| [src/logseq/mock/app.ts](file:///workspace/src/logseq/mock/app.ts) | Mock App | 需扩展 |
| [src/logseq/mock/editor.ts](file:///workspace/src/logseq/mock/editor.ts) | Mock Editor | 需扩展 |
| [src/logseq/mock/index.ts](file:///workspace/src/logseq/mock/index.ts) | Mock DB | 需扩展 |
| [src/test/testAPP.tsx](file:///workspace/src/test/testAPP.tsx) | TestApp | 需扩展 |
| [src/main.tsx](file:///workspace/src/main.tsx) | 入口文件 | 需扩展 |
