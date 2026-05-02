# Task Progress Tracking V2 设计方案

## 1. 产品需求分析

### 1.1 核心需求

| 需求编号 | 需求描述 | 来源 |
| :--- | :--- | :--- |
| REQ-001 | 在 Logseq task 父节点上展示任务进度 | V1 |
| REQ-002 | 查询父节点下的 task 子节点（标签为 task 或属性有 status 的子节点） | V1 |
| REQ-003 | 统计 task 数量，并按照 status 聚合统计（如 ToDo 10, Done 20） | V1 |
| REQ-004 | ~~仅关注一层嵌套，多层嵌套场景忽略深层子节点~~ → **扩展为可选配置** | V2 核心变更 |
| REQ-005 | 支持多种展示方式可配置：微型三色圆环、点阵进度、状态光标、进度胶囊、阶梯进度 | V1 |
| REQ-006 | 每次 block 渲染时按需获取子任务数据并计算进度 | V1 |
| REQ-007 | **新增**：支持配置查询嵌套层级（1层、2层、3层、无限制） | V2 新增 |
| REQ-008 | **新增**：支持配置排除属性，被设置该属性的任务块将从统计中排除 | V2 新增 |

### 1.2 功能概述

V2 版本在 V1 基础上进行扩展：

- **核心变更**：从单一的一层嵌套查询，扩展为可配置的嵌套层级查询
- **配置灵活性**：用户可选择只查询直接子节点，或查询所有层级的嵌套任务
- **向后兼容**：保持 V1 的默认行为（一层嵌套），确保现有用户无感知升级

### 1.3 任务识别规则

任务识别条件（满足任一即可）：

- 块包含 `#task` 标签
- 块属性包含 `status`

## 2. 功能1：嵌套层级查询

### 2.1 嵌套层级配置设计

#### 2.1.1 配置项定义

```typescript
// 嵌套层级枚举
export type NestingLevel = 
  | 1        // 只查询直接子节点（一层）
  | 2        // 查询两层嵌套
  | 3        // 查询三层嵌套
  | 'all'    // 查询所有层级（无限制）

// V2 配置扩展
export interface TaskProgressNestingConfig {
  nestingLevel: NestingLevel  // 嵌套层级配置
  excludeParents?: boolean    // 是否排除父级任务节点（只统计叶子节点）
}
```

#### 2.1.2 用户配置界面

在任务进度设置面板中添加嵌套层级选择器：

| 配置项 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| 嵌套层级 | Select | 1 | 可选：1层、2层、3层、全部 |
| 仅统计叶子节点 | Toggle | false | true=只统计没有子任务的节点，false=统计所有任务 |

### 2.2 查询逻辑实现

#### 2.2.1 推荐方案：多次查询 + 客户端聚合

考虑到 Logseq Datalog 的限制，采用可靠的迭代方案：

```typescript
interface NestedTaskQueryOptions {
  parentBlockId: string
  maxDepth: number           // 1 = 直接子节点, 2 = 两层, 3 = 三层, -1 = 全部
  onlyLeaves: boolean       // true = 只统计叶子节点
}

/**
 * 分层获取嵌套任务
 */
async function queryNestedTasks(options: NestedTaskQueryOptions): Promise<BlockEntity[]> {
  const { parentBlockId, maxDepth, onlyLeaves } = options
  const allTasks: BlockEntity[] = []
  
  // 获取直接子块
  const directChildren = await queryDirectChildren(parentBlockId)
  
  // 过滤出任务块
  const directTasks = filterTaskBlocks(directChildren)
  allTasks.push(...directTasks)
  
  // 递归获取更深层级
  if (maxDepth !== 1) {
    const remainingDepth = maxDepth === -1 ? -1 : maxDepth - 1
    for (const task of directTasks) {
      const descendants = await queryNestedTasks({
        parentBlockId: task.uuid,
        maxDepth: remainingDepth,
        onlyLeaves: false
      })
      allTasks.push(...descendants)
    }
  }
  
  // 如果只统计叶子节点，排除有子任务的块
  if (onlyLeaves) {
    const leafTasks = filterLeafTasks(allTasks)
    return leafTasks
  }
  
  return allTasks
}

/**
 * 获取直接子块
 */
async function queryDirectChildren(parentBlockId: string): Promise<BlockEntity[]> {
  const query = `
    [:find (pull ?b [*])
     :in $ ?parent-uuid
     :where
     [?p :block/uuid ?parent-uuid]
     [?b :block/parent ?p]]
  `
  
  const results = await logseq.DB.datascriptQuery(query, `#uuid "${parentBlockId}"`)
  return (results || []).flat()
}

/**
 * 过滤任务块
 */
function filterTaskBlocks(blocks: BlockEntity[]): BlockEntity[] {
  return blocks.filter(block => {
    const hasTaskTag = block.tags?.some(
      tag => tag?.title?.toLowerCase() === 'task'
    )
    const hasStatus = block.properties?.status !== undefined
    return hasTaskTag || hasStatus
  })
}

/**
 * 过滤叶子节点（没有子任务的块）
 */
function filterLeafTasks(tasks: BlockEntity[]): BlockEntity[] {
  const taskIds = new Set(tasks.map(t => t.uuid))
  
  return tasks.filter(task => {
    const hasChildren = tasks.some(
      other => other.properties?.parent === task.uuid
    )
    return !hasChildren
  })
}
```

### 2.3 叶子节点设置说明

#### 2.3.1 "嵌套层级=1" vs "仅统计叶子节点" 的区别

| 配置项 | 查询范围 | 统计范围 | 说明 |
| :--- | :--- | :--- | :--- |
| **嵌套层级 = 1** | 只查询直接子节点（一层） | 包含所有直接子节点 | 无论是否有子任务，都统计 |
| **仅统计叶子节点 = true** | 查询所有层级（受嵌套层级控制） | 只统计没有子任务的节点 | 有子任务的父节点不统计 |

#### 2.3.2 示例说明

假设有以下任务结构：

```
- 主任务 {{renderer :taskprogress}}
  - 父任务A #task status:: todo
    - 子任务A1 #task status:: done
    - 子任务A2 #task status:: doing
  - 父任务B #task status:: done
  - 任务C #task status:: todo
```

**配置1：嵌套层级=1，仅统计叶子节点=false**

- 查询范围：直接子节点（A、B、C）
- 统计结果：A、B、C 都统计
- 总任务数：3个

**配置2：嵌套层级=2，仅统计叶子节点=true**

- 查询范围：直接子节点 + 嵌套层级2的节点（A、B、C、A1、A2）
- 统计范围：只有 A1、A2、C（因为 A 和 B 有子任务）
- 总任务数：3个

**配置3：嵌套层级=2，仅统计叶子节点=false**

- 查询范围：直接子节点 + 嵌套层级2的节点（A、B、C、A1、A2）
- 统计范围：所有任务都统计
- 总任务数：5个

#### 2.3.3 典型使用场景

| 使用场景 | 推荐配置 |
| :--- | :--- |
| 只想统计直接子任务 | 嵌套层级=1，仅统计叶子节点=false |
| 只想统计最底层的任务 | 嵌套层级=全部，仅统计叶子节点=true |
| 统计所有层级的任务 | 嵌套层级=全部，仅统计叶子节点=false |

## 3. 功能2：任务排除属性

### 3.1 功能背景与设计目标

在实际使用场景中，用户可能希望对特定的任务块进行排除，不将其纳入进度统计。例如，主任务下有多个子任务，其中某些子任务可能是独立的子项目，不应计入主任务的进度统计。

### 3.2 Logseq 属性系统分析

根据 Logseq 官方文档，属性可以设置在两个层面：

**Block 级别（块属性）**

- 直接设置在块上，通过 `properties` 属性存储
- 使用 `Editor.upsertBlockProperty` API 进行设置
- 每个块可以有自己的属性值

**Tag 级别（标签属性/类属性）**

- 设置在标签（Tag）上，标签下的所有块自动继承该属性
- 使用 `Editor.addTagProperty` API 进行设置
- 需要使用 DB Graph 模式

### 3.3 推荐方案：Block 级别属性

考虑到以下因素，推荐使用 **Block 级别属性**：

- **兼容性**：File Graph 和 DB Graph 都支持
- **灵活性**：可以精确控制每个块的排除状态
- **易用性**：用户只需在特定块上添加属性即可

### 3.4 配置项设计

```typescript
// 排除属性配置
export interface TaskExcludeConfig {
  enabled: boolean                      // 是否启用排除功能
  excludeProperty: string               // 排除属性名（默认：exclude-from-progress）
  excludeValue?: string                // 排除属性值（可选，设置了属性即排除）
}
```

**默认配置**

```json
{
  "taskProgress": {
    "excludeConfig": {
      "enabled": true,
      "excludeProperty": "exclude-from-progress",
      "excludeValue": "true"
    }
  }
}
```

### 3.5 用户使用流程

**设置排除属性**

用户在 Logseq 中可以直接设置属性来排除任务：

```
- 主任务 {{renderer :taskprogress}}
  - 子任务1 #task status:: todo
  - 子任务2 #task status:: doing exclude-from-progress:: true  ;; 此任务不计入统计
  - 子任务3 #task status:: done
```

当 `exclude-from-progress:: true` 被设置后，该任务块将不会出现在进度统计中。

### 3.6 查询逻辑修改

```typescript
interface TaskQueryOptions {
  parentBlockId: string
  maxDepth: number
  onlyLeaves: boolean
  excludeConfig: TaskExcludeConfig
}

/**
 * 过滤任务块（包含排除逻辑）
 */
function filterTaskBlocks(
  blocks: BlockEntity[], 
  excludeConfig: TaskExcludeConfig
): BlockEntity[] {
  return blocks.filter(block => {
    // 检查排除属性
    if (excludeConfig.enabled && shouldExclude(block, excludeConfig)) {
      return false
    }
    
    // 检查是否为任务块
    const hasTaskTag = block.tags?.some(
      tag => tag?.title?.toLowerCase() === 'task'
    )
    const hasStatus = block.properties?.status !== undefined
    
    return hasTaskTag || hasStatus
  })
}

/**
 * 判断是否应该排除该块
 */
function shouldExclude(
  block: BlockEntity, 
  config: TaskExcludeConfig
): boolean {
  if (!config.enabled) return false
  
  const propValue = block.properties?.[config.excludeProperty]
  
  // 如果配置了 excludeValue，则需要属性值匹配
  if (config.excludeValue !== undefined) {
    return propValue === config.excludeValue
  }
  
  // 否则只要属性存在就排除
  return propValue !== undefined
}
```

### 3.7 批量设置排除属性功能

```typescript
/**
 * 为指定父块下的所有直接子任务设置排除属性
 */
async function setExcludeForChildTasks(
  parentBlockId: string,
  excludeProperty: string,
  excludeValue: string = 'true'
): Promise<number> {
  // 1. 获取所有直接子块
  const children = await queryDirectChildren(parentBlockId)
  
  // 2. 过滤出任务块
  const taskBlocks = children.filter(block => {
    const hasTaskTag = block.tags?.some(
      tag => tag?.title?.toLowerCase() === 'task'
    )
    const hasStatus = block.properties?.status !== undefined
    return hasTaskTag || hasStatus
  })
  
  // 3. 批量设置排除属性
  let count = 0
  for (const block of taskBlocks) {
    await logseq.Editor.upsertBlockProperty(
      block.uuid,
      excludeProperty,
      excludeValue
    )
    count++
  }
  
  return count
}
```

**使用场景**

用户选中一个父任务块后，可以通过斜杠命令快速将所有子任务设置为排除状态：

```
/Set All Children as Excluded
```

### 3.8 与嵌套层级的结合

排除功能与嵌套层级配置配合使用时：

1. **嵌套查询时进行排除**：在递归查询过程中，每个层级的任务都会检查排除属性
2. **排除后不再递归**：如果一个任务块被排除，其下的所有子任务也会被间接排除

## 4. UI/UX 设计

### 4.1 设置面板 UI 设计

在任务进度设置 Tab 中添加新的配置区域，参考现有的 TaskProgressSettings.tsx 结构：

**设计草图**

```
┌─────────────────────────────────────────────────────────────┐
│  任务进度设置                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ 嵌套层级设置 ─────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  查询深度: [1层（仅直接子节点） ▼]                      │ │
│  │                                                        │ │
│  │  ☑ 仅统计叶子节点                                       │ │
│  │    （不统计有子任务的父级任务）                          │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ 任务排除设置 ─────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  ☑ 启用任务排除功能                                     │ │
│  │                                                        │ │
│  │  排除属性名: [exclude-from-progress    ]                │ │
│  │                                                        │ │
│  │  排除属性值: [true                       ]             │ │
│  │  (可选，留空表示只要设置属性即排除)                      │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 功能说明

#### 4.2.1 嵌套层级设置

| 配置项 | 说明 |
| :--- | :--- |
| 查询深度 | 指定查询的嵌套层级：1层、2层、3层、全部 |
| 仅统计叶子节点 | 开启后，只统计没有子任务的节点 |
| 显示层级指示器 | 是否在进度组件旁显示层级信息（可选） |

**层级与叶子节点的组合效果**

| 查询深度 | 仅统计叶子节点 | 查询范围 | 统计范围 |
| :--- | :--- | :--- | :--- |
| 1层 | OFF | 直接子节点 | 全部直接子节点 |
| 1层 | ON | 直接子节点 | 只有叶子节点 |
| 全部 | OFF | 所有层级 | 全部任务 |
| 全部 | ON | 所有层级 | 只有叶子节点 |

#### 4.2.2 任务排除设置

| 配置项 | 说明 |
| :--- | :--- |
| 启用任务排除功能 | 开启后，设置了指定属性的任务将被排除 |
| 排除属性名 | 用于标记排除任务的属性名 |
| 排除属性值 | 可选，指定要匹配的属性值 |

**使用示例**

在 Logseq 中为任务设置排除属性：

```
- 子任务2 #task status:: doing exclude-from-progress:: true
```

设置后，该任务将不参与进度统计。

### 4.3 进度组件 UI 设计

#### 4.3.1 嵌套层级指示器

在进度组件旁边显示嵌套层级信息，帮助用户理解进度统计的范围：

**设计草图**

```
┌─────────────────────────────────────────┐
│                                         │
│   我的项目 ✓25% 🔍 2层                   │
│   ↑      ↑    ↑                         │
│   进度   进度   层级指示器（可点击查看详情）│
│   组件   数字                             │
│                                         │
└─────────────────────────────────────────┘
```

**说明：**
- **层级指示器 hover 内容**：仅显示层级信息（如"包含 2 层嵌套任务"）
- **Task Progress hover 内容**：显示完整的任务统计（已完成/进行中/待办）
- 两者不重复，层级指示器是补充信息

#### 4.3.2 悬浮提示设计

当用户鼠标悬停在层级指示器上时，显示层级说明：

**设计草图**

```
┌───────────────────────────────────────────────┐
│  🔍 包含 2 层嵌套任务                           │
│                                               │
│  • 查询范围: 第1层和第2层                       │
│  • 是否统计: 所有任务（包含子任务）                 │
│                                               │
└───────────────────────────────────────────────┘
```

### 4.4 排除任务视觉提示

当一个任务块被设置为排除时，在 Logseq 界面中显示提示：

**设计草图**

```
┌─────────────────────────────────────────┐
│                                         │
│  📋 我的项目                              │
│                                         │
│    ✓ 子任务1 #task status:: done       │
│    ✓ 子任务2 #task status:: done       │
│    ⏭️ 独立子项目 #task status:: doing   │
│       exclude-from-progress:: true       │
│                                         │
└─────────────────────────────────────────┘

图例：
  ⏭️ = 此任务不参与进度统计
```

**CSS 样式建议**

```css
.task-block[data-excluded="true"] {
  opacity: 0.7;
  border-left: 2px dashed var(--ls-border-color);
}

.task-block[data-excluded="true"]::before {
  content: "⏭️ ";
  margin-right: 4px;
}
```

## 5. 数据模型设计

### 5.1 扩展类型定义

```typescript
// 嵌套层级类型
export type NestingLevel = 1 | 2 | 3 | 'all'

// 排除属性配置
export interface TaskExcludeConfig {
  enabled: boolean
  excludeProperty: string
  excludeValue?: string
}

// 任务块实体
export interface TaskBlock {
  id: string
  uuid: string
  content: string
  status?: string
  isTask: boolean
  parentId: string | null
  depth: number  // 深度层级
  children: TaskBlock[]  // 子任务列表
  isExcluded?: boolean  // 是否被排除
}

// 任务进度数据（扩展）
export interface TaskProgress {
  blockId: string
  parentBlockId: string
  totalTasks: number
  completedTasks: number
  statusStats: StatusStat[]
  progress: number
  nestingLevel: number  // 使用的嵌套层级
  leafTasksOnly: boolean  // 是否仅统计叶子节点
  excludedCount: number  // 被排除的任务数量
}
```

### 5.2 配置模型

```typescript
// 任务进度设置（扩展）
export interface TaskProgressSettings {
  enabled: boolean
  defaultDisplayType: ProgressDisplayType
  showLabel?: boolean
  labelFormat?: 'fraction' | 'percentage'
  displayOptions?: {
    [key: string]: Record<string, any>
  }
  // 嵌套层级配置
  nestingLevel: NestingLevel
  onlyLeaves?: boolean
  // 排除属性配置
  excludeConfig?: TaskExcludeConfig
}
```

## 6. 实现计划

### 6.1 阶段一：功能1 - 嵌套层级支持

1. **扩展类型定义**
   - 添加 `NestingLevel` 类型

2. **修改查询逻辑**
   - 实现 `queryNestedTasks` 函数
   - 支持指定深度的任务查询

3. **更新设置界面**
   - 添加嵌套层级选择器
   - 添加叶子节点选项

### 6.2 阶段二：功能2 - 任务排除属性

1. **添加排除属性配置**
   - 扩展 `TaskExcludeConfig` 类型
   - 添加默认配置

2. **修改过滤逻辑**
   - 在 `filterTaskBlocks` 中添加排除检查
   - 实现 `shouldExclude` 函数

3. **添加批量设置功能**
   - 实现 `setExcludeForChildTasks` 函数
   - 注册斜杠命令

4. **更新设置界面**
   - 添加排除属性配置区域
   - 添加排除任务视觉提示

### 6.3 阶段三：UI/UX 完善

1. **嵌套层级指示器**
   - 在进度组件旁显示层级信息
   - 悬浮提示显示详细嵌套结构

2. **排除状态显示**
   - 在 Logseq 界面中显示排除标记

## 7. 默认行为

- **默认嵌套层级**：1层（与 V1 行为一致）
- **默认排除设置**：启用，排除属性名 `exclude-from-progress`
- **默认显示层级指示器**：false（不显示）
- **现有用户**：无需修改配置，自动使用 V1 行为

## 8. 需要修改的文件

### 8.1 类型定义

| 文件 | 修改内容 |
| :--- | :--- |
| `src/settings/types.ts` | 添加 `NestingLevel` 类型、`TaskExcludeConfig` 接口，扩展 `TaskProgressSettings` |

### 8.2 设置文件

| 文件 | 修改内容 |
| :--- | :--- |
| `src/settings/defaultSettings.ts` | 添加 V2 相关默认配置 |

### 8.3 核心逻辑

| 文件 | 修改内容 |
| :--- | :--- |
| `src/lib/taskProgress/taskQuery.ts` | 重写 `getDirectTaskChildren` 为 `queryNestedTasks`，支持多层查询和排除逻辑 |

### 8.4 设置面板

| 文件 | 修改内容 |
| :--- | :--- |
| `src/components/SettingsModal/tabs/TaskProgressSettings.tsx` | 添加嵌套层级、排除属性等配置项 |

### 8.5 任务进度组件

| 文件 | 修改内容 |
| :--- | :--- |
| `src/components/TaskProgress/TaskProgress.tsx` | 接收 `nestingLevel`、`showNestingIndicator` 等新参数，集成层级指示器 |
| `src/components/TaskProgress/*` | 其他组件可能需要相应更新 |

## 9. 测试计划

### 8.1 单元测试

```typescript
describe('queryNestedTasks', () => {
  it('should query direct children only when depth is 1', async () => {
    const tasks = await queryNestedTasks({
      parentBlockId: 'parent-1',
      maxDepth: 1,
      onlyLeaves: false
    })
    expect(tasks.length).toBe(2)
  })
  
  it('should query two levels when depth is 2', async () => {
    const tasks = await queryNestedTasks({
      parentBlockId: 'parent-1',
      maxDepth: 2,
      onlyLeaves: false
    })
    expect(tasks.length).toBe(5)
  })
  
  it('should filter leaf tasks when onlyLeaves is true', async () => {
    const tasks = await queryNestedTasks({
      parentBlockId: 'parent-1',
      maxDepth: 2,
      onlyLeaves: true
    })
    // 验证只返回叶子节点
    expect(tasks.every(t => !hasChildren(t))).toBe(true)
  })
})

describe('exclude tasks', () => {
  it('should exclude tasks with exclude property', async () => {
    const tasks = await queryNestedTasks({
      parentBlockId: 'parent-1',
      maxDepth: 1,
      onlyLeaves: false,
      excludeConfig: {
        enabled: true,
        excludeProperty: 'exclude-from-progress',
        excludeValue: 'true'
      }
    })
    // 验证排除了指定的任务
    expect(tasks.every(t => !t.properties?.['exclude-from-progress'])).toBe(true)
  })
})
```

## 9. 参考资料

- [Logseq DB Query Guide](https://github.com/logseq/logseq/blob/master/libs/guides/db_query_guide.md)
- [Logseq Property Guide](https://github.com/logseq/logseq/blob/master/libs/guides/db_properties_guide.md)
- [Logseq Plugin API](https://github.com/logseq/logseq/blob/master/libs/src/LSPlugin.user.ts)
