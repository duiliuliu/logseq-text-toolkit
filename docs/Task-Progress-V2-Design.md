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
| 显示层级指示器 | Toggle | false | 是否在进度组件旁显示层级信息 |

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

## 3. UI/UX 设计

### 3.1 设置面板 UI 设计

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
│  │  ☐ 仅统计叶子节点                                       │ │
│  │    （不统计有子任务的父级任务）                          │ │
│  │                                                        │ │
│  │  ☐ 显示层级指示器                                       │ │
│  │    （在进度组件旁显示嵌套层级信息）                        │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 功能说明

#### 3.2.1 嵌套层级设置

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

### 3.3 进度组件 UI 设计

#### 3.3.1 嵌套层级指示器

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

#### 3.3.2 悬浮提示设计

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

## 4. 数据模型设计

### 4.1 扩展类型定义

```typescript
// 嵌套层级类型
export type NestingLevel = 1 | 2 | 3 | 'all'

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
}
```

### 4.2 配置模型

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
  // V2 嵌套层级配置
  nestingLevel: NestingLevel
  onlyLeaves?: boolean
  showNestingIndicator?: boolean  // 显示层级指示器
}
```

## 5. 实现计划

### 5.1 阶段一：功能1 - 嵌套层级支持

1. **扩展类型定义**
   - 添加 `NestingLevel` 类型

2. **修改查询逻辑**
   - 实现 `queryNestedTasks` 函数
   - 支持指定深度的任务查询

3. **更新设置界面**
   - 添加嵌套层级选择器
   - 添加叶子节点选项
   - 添加层级指示器选项

### 5.2 阶段二：UI/UX 完善

1. **嵌套层级指示器**
   - 在进度组件旁显示层级信息
   - 悬浮提示显示详细嵌套结构

## 6. 默认行为

- **默认嵌套层级**：1层（与 V1 行为一致）
- **默认显示层级指示器**：false（不显示）
- **现有用户**：无需修改配置，自动使用 V1 行为

## 7. 需要修改的文件

### 7.1 类型定义

| 文件 | 修改内容 |
| :--- | :--- |
| `src/settings/types.ts` | 添加 `NestingLevel` 类型，扩展 `TaskProgressSettings` |

### 7.2 设置文件

| 文件 | 修改内容 |
| :--- | :--- |
| `src/settings/defaultSettings.ts` | 添加 V2 相关默认配置 |

### 7.3 核心逻辑

| 文件 | 修改内容 |
| :--- | :--- |
| `src/lib/taskProgress/taskQuery.ts` | 重写 `getDirectTaskChildren` 为 `queryNestedTasks`，支持多层查询 |

### 7.4 设置面板

| 文件 | 修改内容 |
| :--- | :--- |
| `src/components/SettingsModal/tabs/TaskProgressSettings.tsx` | 添加嵌套层级等配置项 |

### 7.5 任务进度组件

| 文件 | 修改内容 |
| :--- | :--- |
| `src/components/TaskProgress/TaskProgress.tsx` | 接收 `nestingLevel`、`showNestingIndicator` 等新参数，集成层级指示器 |
| `src/components/TaskProgress/*` | 其他组件可能需要相应更新 |

### 7.6 注册逻辑

| 文件 | 修改内容 |
| :--- | :--- |
| `src/lib/taskProgress/register.ts` | 修改 `renderProgress` 函数，传递新的配置参数 |

## 8. 逻辑评估：修改的文件

### 8.1 必需修改的核心文件

| 文件 | 影响 | 优先级 | 说明 |
| :--- | :--- | :--- | :--- |
| `src/lib/taskProgress/taskQuery.ts` | 核心逻辑变更 | P0 | 重写查询函数，这是最大的变更点 |
| `src/settings/types.ts` | 类型扩展 | P0 | 添加新的类型定义 |
| `src/settings/defaultSettings.ts` | 默认配置 | P0 | 添加默认值 |
| `src/components/SettingsModal/tabs/TaskProgressSettings.tsx` | UI 变更 | P1 | 添加新的配置项 |
| `src/lib/taskProgress/register.ts` | 参数传递 | P1 | 需要传递新的配置 |
| `src/components/TaskProgress/TaskProgress.tsx` | 组件扩展 | P1 | 添加层级指示器 |

### 8.2 修改评估

| 评估项 | 评估结果 |
| :--- | :--- |
| **向后兼容性** | ✅ 好，默认配置与 V1 一致 |
| **修改范围** | 中等，核心逻辑需要重写，其他是增量 |
| **测试覆盖** | 需要新增测试用例验证嵌套查询 |
| **风险等级** | 低-Medium，主要是查询逻辑变更 |

### 8.3 开发建议

1. **先实现查询逻辑**：先修改 `taskQuery.ts`，确保查询正确
2. **再添加配置 UI**：添加设置面板，修改默认配置
3. **最后完善 UI 增强**：添加层级指示器等视觉元素
4. **保持 V1 行为默认**：所有新增功能默认关闭，用户需要手动开启

## 9. 测试计划

### 9.1 单元测试

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
```

## 10. 参考资料

- [Logseq DB Query Guide](https://github.com/logseq/logseq/blob/master/libs/guides/db_query_guide.md)
- [Logseq Property Guide](https://github.com/logseq/logseq/blob/master/libs/guides/db_properties_guide.md)
- [Logseq Plugin API](https://github.com/logseq/logseq/blob/master/libs/src/LSPlugin.user.ts)
