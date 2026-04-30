# Task Progress Tracking 设计方案

## 1. 产品需求分析

### 1.1 核心需求

| 需求编号 | 需求描述 | 来源 |
| :--- | :--- | :--- |
| REQ-001 | 在 Logseq task 父节点上展示任务进度 | 用户需求第1点 |
| REQ-002 | 父节点的所有 task 子节点标记属性 `task_tracking` 值为 `true` | 用户需求第1点 |
| REQ-003 | 查询父节点下的 task 子节点（标签为 task 或属性有 status 的子节点） | 用户需求第2点 |
| REQ-004 | 统计 task 数量，并按照 status 聚合统计（如 ToDo 10, Done 20） | 用户需求第2点 |
| REQ-005 | 仅关注一层嵌套，多层嵌套场景忽略深层子节点 | 用户需求第2点 |
| REQ-006 | 支持多种展示方式可配置：微型三色圆环、点阵进度、状态光标、进度胶囊、阶梯进度 | 用户需求第3点 |
| REQ-007 | 子任务数据更新时触发父节点更新展示 | 用户需求第4点 |

### 1.2 功能概述

本功能旨在为 Logseq 提供任务进度可视化能力：
- **数据聚合层**：通过 Logseq DB 查询 API 获取父节点下的一级子任务，统计任务总数和各状态数量
- **展示层**：提供多种进度展示组件，支持用户自定义选择
- **事件响应层**：监听子任务状态变化事件，自动更新父节点进度展示

### 1.3 属性命名规范

根据用户要求，使用下划线命名方式：
- 属性名：`task_tracking`
- 属性值：`true`（启用进度追踪）

---

## 2. 技术架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      应用层 (Application)                        │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │  TaskProgressUI  │    │  SettingsPanel   │                   │
│  │   (进度展示组件)  │    │   (配置面板)     │                   │
│  └────────┬─────────┘    └──────────────────┘                   │
│           │                                                     │
├───────────┼─────────────────────────────────────────────────────┤
│                      业务逻辑层 (Business Logic)                 │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │          TaskProgressManager (进度管理器)                     ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐      ││
│  │  │ TaskQuery   │  │ TaskStats   │  │ EventListener   │      ││
│  │  │  (任务查询) │  │  (统计计算) │  │  (事件监听)     │      ││
│  │  └─────────────┘  └─────────────┘  └─────────────────┘      ││
│  └──────────────────────────────────────────────────────────────┘│
├───────────────────────────────────────────────────────────────────┤
│                      数据访问层 (Data Access)                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │              Logseq DB Query API Wrapper                     ││
│  │  - blocksQuery()                                             ││
│  │  - getBlockChildren()                                        ││
│  │  - onBlockChanged()                                          ││
│  └──────────────────────────────────────────────────────────────┘│
├───────────────────────────────────────────────────────────────────┤
│                      基础设施层 (Infrastructure)                 │
│                    Logseq Plugin SDK / Logseq API                │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 模块划分

| 模块 | 职责 | 位置 |
| :--- | :--- | :--- |
| `components/TaskProgress/` | 进度展示组件集合 | `src/components/` |
| `lib/taskProgress/` | 任务进度核心逻辑 | `src/lib/` |
| `settings/` | 配置管理 | `src/settings/` |
| `logseq/` | Logseq API 封装 | `src/logseq/` |

---

## 3. 数据模型设计

### 3.1 核心数据结构

#### TaskProgress 接口

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
  properties?: Record<string, unknown>;
  children?: TaskBlock[];
}
```

#### 进度展示配置

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
  labelFormat: 'fraction' | 'percentage' | 'both'; // "10/20" | "50%" | "10/20 (50%)"
  size: 'small' | 'medium' | 'large';
  colors?: {
    todo: string;
    doing: string;
    done: string;
    [key: string]: string;
  };
}
```

---

## 4. 核心功能设计

### 4.1 任务查询逻辑

根据 Logseq `db_query_guide.md` 文档，查询父节点下的一级子任务：

#### 4.1.1 查询条件

| 条件 | 描述 |
| :--- | :--- |
| **标签条件** | `#task` 标签 |
| **属性条件** | 包含 `status` 属性 |
| **层级条件** | 仅查询直接子节点（深度为1） |
| **追踪条件** | 父节点属性 `task_tracking = true` |

#### 4.1.2 查询实现方案

```typescript
// 查询父节点下的一级子任务
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

// 检查父节点是否启用进度追踪
export async function isTaskTrackingEnabled(blockId: string): Promise<boolean> {
  const block = await logseq.Editor.getBlock(blockId);
  return block?.properties?.task_tracking === true;
}
```

#### 4.1.3 多层嵌套处理

```typescript
// 获取一级子节点（忽略深层嵌套）
export async function getDirectTaskChildren(parentBlockId: string): Promise<TaskBlock[]> {
  const children = await logseq.Editor.getBlockChildren(parentBlockId);
  
  return children
    .filter(child => {
      const content = child.content || '';
      // 判断是否为 task 块：包含 status 属性或 #task 标签
      const hasStatusProp = child.properties?.status !== undefined;
      const hasTaskTag = content.includes('#task');
      return hasStatusProp || hasTaskTag;
    })
    .map(child => ({
      id: child.id,
      content: child.content || '',
      status: child.properties?.status as string,
      isTask: true,
      properties: child.properties,
    }));
}
```

### 4.2 统计聚合逻辑

```typescript
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

// 状态颜色映射
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
```

### 4.3 事件监听机制

根据 Logseq 插件 API，监听块变更事件：

```typescript
export class TaskProgressEventListener {
  private listeners: Map<string, () => void> = new Map();
  
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
    // 检查是否为 task 块
    if (!this.isTaskBlock(block)) return;
    
    // 获取父节点
    const parentBlock = await logseq.Editor.getBlock(block.parentId);
    if (!parentBlock) return;
    
    // 检查父节点是否启用进度追踪
    if (parentBlock.properties?.task_tracking !== true) return;
    
    // 触发更新
    this.notifyUpdate(parentBlock.id);
  }
  
  private isTaskBlock(block: IBlock): boolean {
    const hasStatusProp = block.properties?.status !== undefined;
    const hasTaskTag = block.content?.includes('#task');
    return hasStatusProp || hasTaskTag;
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
}
```

---

## 5. UI 组件设计

### 5.1 组件结构

```
src/components/TaskProgress/
├── index.ts
├── types.ts
├── TaskProgress.tsx          # 主组件（展示方式切换）
├── MiniCircleProgress.tsx    # 微型三色圆环
├── DotMatrixProgress.tsx     # 点阵进度
├── StatusCursorProgress.tsx  # 状态光标
├── ProgressCapsule.tsx       # 进度胶囊
├── StepProgress.tsx          # 阶梯进度
└── taskProgress.css
```

### 5.2 组件设计规范

#### 5.2.1 MiniCircleProgress（微型三色圆环）

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

```typescript
interface StatusCursorProgressProps {
  stats: StatusStat[];
  progress: number;
}
```

**设计草图说明**：
- 单个光标图标，颜色随进度变化
- 图标样式：✓（完成）/ ○（进行中）/ ●（待办）
- 悬停提示：显示详细统计

#### 5.2.4 ProgressCapsule（进度胶囊）

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

### 5.3 样式设计

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
| `enabled` | boolean | 是否启用任务进度功能 |
| `defaultDisplayType` | string | 默认展示类型 |
| `displayOptions.*.size` | string | 组件尺寸 |
| `displayOptions.mini-circle.showLabel` | boolean | 是否显示标签 |
| `displayOptions.mini-circle.labelFormat` | string | 标签格式 |
| `displayOptions.dot-matrix.maxDots` | number | 最大显示点数 |
| `statusColors` | object | 状态颜色映射 |
| `updateInterval` | number | 更新间隔（毫秒） |

---

## 7. 数据流设计

### 7.1 初始化流程

```
用户打开页面 → 渲染块 → 检查块属性 task_tracking → 查询子任务 → 计算统计 → 渲染进度组件
```

### 7.2 更新流程

```
子任务变更 → onBlockChanged 事件 → 检查父节点 → 查询更新 → 重新计算统计 → 更新组件
```

### 7.3 核心数据流

```typescript
// 初始化
async function initTaskProgress(blockId: string) {
  const enabled = await isTaskTrackingEnabled(blockId);
  if (!enabled) return;
  
  const tasks = await getDirectTaskChildren(blockId);
  const stats = aggregateTaskStats(tasks);
  
  // 渲染组件
  renderProgressComponent(blockId, stats);
  
  // 订阅更新
  eventListener.subscribe(blockId, () => {
    refreshTaskProgress(blockId);
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
// 查询所有启用 task_tracking 的块
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

- **结果缓存**：缓存查询结果，避免重复查询
- **过期机制**：设置缓存过期时间，在事件触发时失效

### 9.2 批量处理

- **合并更新**：短时间内多个子任务变更合并为一次更新
- **防抖处理**：使用 debounce 减少频繁更新

### 9.3 懒加载

- **按需渲染**：只渲染可见区域的进度组件
- **延迟加载**：页面加载时延迟一段时间再初始化

---

## 10. 测试方案

### 10.1 单元测试

| 测试用例 | 描述 |
| :--- | :--- |
| `aggregateTaskStats` | 测试统计聚合逻辑 |
| `getDirectTaskChildren` | 测试子任务查询 |
| `getStatusColor` | 测试状态颜色映射 |

### 10.2 集成测试

| 测试场景 | 描述 |
| :--- | :--- |
| 属性检测 | 验证 `task_tracking = true` 时显示进度 |
| 状态更新 | 验证子任务状态变更时父节点更新 |
| 嵌套处理 | 验证仅显示一级子任务 |
| 配置切换 | 验证不同展示方式切换正常 |

---

## 11. 实施计划

| 阶段 | 任务 | 预估时间 |
| :--- | :--- | :--- |
| 阶段一 | 核心逻辑实现（查询、统计、事件监听） | 3-4 天 |
| 阶段二 | UI 组件实现（5种展示方式） | 4-5 天 |
| 阶段三 | 配置系统集成 | 2 天 |
| 阶段四 | 测试与优化 | 2-3 天 |
| 阶段五 | 文档完善 | 1 天 |

---

## 12. 风险评估

| 风险 | 描述 | 缓解措施 |
| :--- | :--- | :--- |
| API 兼容性 | Logseq API 可能变更 | 使用稳定的 API 版本，添加兼容性处理 |
| 性能问题 | 大量任务时查询慢 | 实现缓存和批量处理 |
| 样式冲突 | 与主题样式冲突 | 使用 CSS 变量，支持主题适配 |
| 嵌套深度 | 多层嵌套处理复杂 | 明确只处理一级子节点 |