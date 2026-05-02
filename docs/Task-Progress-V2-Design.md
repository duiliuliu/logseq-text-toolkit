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
| REQ-008 | **新增**：支持通过属性 Key-Value 过滤来精确筛选任务块 | V2 新增 |

### 1.2 功能概述

V2 版本在 V1 基础上进行扩展：

- **核心变更**：从单一的一层嵌套查询，扩展为可配置的嵌套层级查询
- **配置灵活性**：用户可选择只查询直接子节点，或查询所有层级的嵌套任务
- **向后兼容**：保持 V1 的默认行为（一层嵌套），确保现有用户无感知升级

### 1.3 任务识别规则

任务识别条件（满足任一即可）：

- 块包含 `#task` 标签
- 块属性包含 `status`

### 1.4 功能2：属性 KV 过滤机制

#### 1.4.1 背景与使用场景

在实际使用 Logseq 管理任务时，用户经常需要对特定类型的任务进行进度统计。例如：

- **项目维度**：统计"项目 A"下的任务进度，而非所有任务
- **优先级维度**：只关注高优先级（`priority:: high`）的任务
- **负责人维度**：统计分配给某成员的任务完成情况
- **类型维度**：区分不同类型的子任务（如 `type:: bug`、`type:: feature`）

现有的任务识别规则（基于 `#task` 标签或 `status` 属性）无法满足这些精细化的过滤需求。因此，我们需要引入 **属性 Key-Value 过滤机制**，允许用户通过配置任意属性键值对来精确筛选任务块。

#### 1.4.2 Logseq 属性系统分析

Logseq 的属性系统分为两个层级：

| 属性层级 | 存储位置 | 示例 | 特点 |
| :--- | :--- | :--- | :--- |
| **Block 属性** | 块的 `properties` 字段 | `priority:: high` | 直接附加在块上，作用域为当前块 |
| **Tag 级别属性** | Page 的 `properties` 字段 | `icon:: 📚` | 附加在页面级别，继承给该页面的所有块 |

**Block 级别属性示例：**

```markdown
- 任务标题 #task
  priority:: high
  assignee:: zhangsan
  due:: 2024-12-31
```

**Tag 级别属性示例：**

```markdown
- #project/项目A
  icon:: 📁
  color:: blue
```

#### 1.4.3 三种过滤方案对比

| 方案 | 描述 | 优点 | 缺点 |
| :--- | :--- | :--- | :--- |
| **Block 属性过滤** | 仅匹配 Block 自身的属性 | 精确、无歧义、性能好 | 无法利用 Page 级别属性 |
| **Tag 属性继承** | Block 继承所在 Page 的属性 | 可复用页面配置 | 增加复杂性、可能有继承冲突 |
| **混合模式** | Block 属性优先，Tag 属性兜底 | 灵活度高 | 实现复杂、配置项多 |

#### 1.4.4 推荐方案：Block 属性过滤

综合考虑实现复杂度、用户理解成本和实际使用场景，推荐采用 **Block 属性过滤** 方案。

**选择理由：**

1. **精确性**：Block 属性是直接附加在任务块上的，不存在继承歧义
2. **简单性**：用户只需理解"这个任务有没有这个属性"即可
3. **性能**：Datalog 查询直接匹配 Block 属性，无需处理继承逻辑
4. **可预测性**：行为结果符合用户直觉

**使用示例：**

用户配置 `priority:: high`，则只会统计包含 `priority:: high` 属性的任务块：

```markdown
- 项目进度 #task
  - [ ] 高优先级任务 A  #task
        priority:: high   <!-- 会被统计 -->
  - [ ] 普通任务 B       #task
        priority:: low    <!-- 不会被统计 -->
  - [x] 已完成任务 C     #task
        priority:: high   <!-- 会被统计 -->
```

统计结果：进度 = 1 done / 2 total = 50%

## 2. 技术架构设计

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
  maxDepth?: number           // 最大深度限制（当 nestingLevel 为 'all' 时生效）
  excludeParents?: boolean    // 是否排除父级任务节点（只统计叶子节点）
}
```

#### 2.1.2 用户配置界面

在任务进度设置面板中添加嵌套层级选择器：

| 配置项 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| 嵌套层级 | Select | 1 | 可选：1层、2层、3层、全部 |
| 最大深度 | Number | 10 | 当选择"全部"时生效，限制最大递归深度 |
| 仅统计叶子节点 | Toggle | false | true=只统计没有子任务的节点，false=统计所有任务 |

### 2.2 Datalog 查询方案

#### 2.2.1 核心查询思路

Logseq 的 Datalog 查询通过 `:block/parent` 属性建立块之间的父子关系。要查询嵌套子节点，我们需要递归遍历这个关系。

**方案一：使用 Datalog 递归查询**

Datascript/Datalog 支持递归规则（使用 `or-join` 和 `or`），可以定义递归规则来遍历块树：

```datalog
;; 递归查询所有后代块
[:find (pull ?child [*])
 :in $ ?parent-uuid
 :where
 [?parent :block/uuid ?parent-uuid]
 [?child :block/parent+ ?parent]]   ;; 使用 parent+ 表示递归查询
```

**注意**：Logseq Datascript 可能不支持 `parent+` 语法，需要验证或使用替代方案。

**方案二：迭代查询 + 结果聚合（推荐）**

1. **第一阶段**：查询指定层级的所有块
2. **第二阶段**：在客户端进行过滤和聚合

```typescript
// 分层查询示例
async function queryNestedTasks(
  parentBlockId: string, 
  maxDepth: number = 1
): Promise<BlockEntity[]> {
  const allBlocks: BlockEntity[] = []
  
  // 1. 获取直接子块
  const directChildren = await logseq.DB.datascriptQuery(`
    [:find (pull ?b [*])
     :in $ ?parent-uuid
     :where
     [?p :block/uuid ?parent-uuid]
     [?b :block/parent ?p]]
  `, `#uuid "${parentBlockId}"`)
  
  allBlocks.push(...directChildren)
  
  // 2. 递归获取更深层级的块
  if (maxDepth > 1) {
    for (const child of directChildren) {
      const grandchildren = await queryNestedTasks(child.uuid, maxDepth - 1)
      allBlocks.push(...grandchildren)
    }
  }
  
  return allBlocks
}
```

**方案三：单一查询返回完整子树（最优）

使用 Datalog 的递归规则，一次查询获取所有后代：

```datalog
;; 定义递归规则查询所有后代块
[:find (pull ?descendant [*])
 :in $ % ?ancestor-uuid
 :where
 [?ancestor :block/uuid ?ancestor-uuid]
 (descendant-of ?ancestor ?descendant)]

;; 递归规则定义
[[(descendant-of ?ancestor ?descendant)
  [?ancestor :block/children ?descendant]]
 [(descendant-of ?ancestor ?descendant)
  [?ancestor :block/children ?child]
  [?child :block/children ?descendant]]
 [(descendant-of ?ancestor ?descendant)
  [?ancestor :block/children ?child]
  (descendant-of ?child ?descendant)]]
```

**问题**：`block/children` 可能不是 Logseq 的标准属性，需要改用 `:block/parent`。

**方案四：使用 `:block/parent` 的递归查询**

```datalog
;; 递归查询所有祖先块
[:find (pull ?b [*])
 :in $ % ?child-uuid
 :where
 [?b :block/uuid ?child-uuid]
 (ancestor-of ?b ?ancestor)]

;; 递归规则：从子块向上追溯到指定祖先
[[(ancestor-of ?child ?parent)
  [?child :block/parent ?parent]]
 [(ancestor-of ?child ?grandparent)
  [?child :block/parent ?parent]
  [?parent :block/parent ?grandparent]]
 [(ancestor-of ?child ?ancestor)
  [?child :block/parent ?parent]
  (ancestor-of ?parent ?ancestor)]]
```

#### 2.2.2 推荐方案：分层 Datalog 查询

**核心思路**：利用 Logseq 的 `:block/parent` 属性，通过递归规则一次查询获取指定深度的所有子任务。

**查询设计**：

```datalog
;; 查询指定父块下，指定深度内的所有任务块
[:find (pull ?task [*])
 :in $ % ?parent-uuid
 :where
 [?parent :block/uuid ?parent-uuid]
 (task-descendant ?parent ?task ?depth)
 [(<= ?depth 3)]  ;; 限制最大深度为3
 (task? ?task)]

;; 判断是否为任务块
[[(task? ?b)
  [?b :block/tags ?t]
  [?t :block/title "Task"]]
 [(task? ?b)
  [?b :logseq.property/status _]]]

;; 递归规则：获取后代块及其深度
[[(task-descendant ?parent ?child 1)
  [?parent :block/uuid ?parent-uuid]
  [?child :block/parent ?parent]]
 [(task-descendant ?parent ?child ?depth)
  [?parent :block/uuid ?parent-uuid]
  [?parent :block/children ?intermediate]
  [?intermediate :block/children ?child]
  (task-descendant ?parent ?intermediate ?prev-depth)
  [(inc ?prev-depth) ?depth]]]
```

**问题分析**：Logseq 的 Datalog 实现可能不完全支持递归规则的 `inc` 函数和复杂递归。

#### 2.2.3 最终推荐：多次查询 + 客户端聚合

考虑到 Logseq Datalog 的限制，采用更可靠的方案：

```typescript
interface NestedTaskQueryOptions {
  parentBlockId: string
  maxDepth: number           // 1 = 直接子节点, 2 = 两层, 3 = 三层, -1 = 全部
  onlyLeaves: boolean       // true = 只统计叶子节点
}

/**
 * 分层获取嵌套任务
 * @param options 查询配置
 * @returns 任务块列表
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
 * 任务块定义：包含 #task 标签 或 有 status 属性
 */
function filterTaskBlocks(blocks: BlockEntity[]): BlockEntity[] {
  return blocks.filter(block => {
    // 检查 #task 标签
    const hasTaskTag = block.tags?.some(
      tag => tag?.title?.toLowerCase() === 'task'
    )
    
    // 检查 status 属性
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
    // 如果一个任务被其他任务作为父节点，则它不是叶子节点
    const hasChildren = tasks.some(
      other => other.properties?.parent === task.uuid
    )
    return !hasChildren
  })
}
```

### 2.3 性能优化策略

#### 2.3.1 缓存机制

```typescript
interface TaskProgressCache {
  parentBlockId: string
  nestingLevel: number
  tasks: BlockEntity[]
  timestamp: number
  ttl: number  // 缓存生存时间（毫秒）
}

const cache = new Map<string, TaskProgressCache>()
const DEFAULT_TTL = 5000  // 5秒缓存

/**
 * 获取缓存的任务进度
 */
function getCachedProgress(parentBlockId: string, nestingLevel: number): TaskProgress | null {
  const key = `${parentBlockId}:${nestingLevel}`
  const cached = cache.get(key)
  
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return calculateProgressFromTasks(cached.tasks)
  }
  
  return null
}

/**
 * 设置任务进度缓存
 */
function setCachedProgress(
  parentBlockId: string, 
  nestingLevel: number, 
  tasks: BlockEntity[]
): void {
  const key = `${parentBlockId}:${nestingLevel}`
  cache.set(key, {
    parentBlockId,
    nestingLevel,
    tasks,
    timestamp: Date.now(),
    ttl: DEFAULT_TTL
  })
}
```

#### 2.3.2 增量更新

```typescript
// 监听块变化事件
logseq.DB.onBlockChanged((block, txData) => {
  // 找到受影响的父块
  const affectedParents = findAffectedParentBlocks(block)
  
  // 清除相关缓存
  for (const parentId of affectedParents) {
    clearCacheForBlock(parentId)
  }
})
```

### 2.4 用户交互设计

#### 2.4.1 嵌套层级选择器

```tsx
const NestingLevelSelector: React.FC = () => {
  const { settings, updateSettings } = useSettings()
  const nestingLevel = settings.taskProgress?.nestingLevel ?? 1
  const maxDepth = settings.taskProgress?.maxDepth ?? 10
  const onlyLeaves = settings.taskProgress?.onlyLeaves ?? false
  
  return (
    <div className="task-progress-nesting-settings">
      <h3>嵌套层级设置</h3>
      
      <div className="setting-item">
        <label>查询深度</label>
        <select 
          value={nestingLevel}
          onChange={(e) => {
            const value = e.target.value
            updateSettings({
              taskProgress: {
                ...settings.taskProgress,
                nestingLevel: value === 'all' ? 'all' : parseInt(value)
              }
            })
          }}
        >
          <option value="1">1层（仅直接子节点）</option>
          <option value="2">2层</option>
          <option value="3">3层</option>
          <option value="all">全部层级</option>
        </select>
      </div>
      
      {nestingLevel === 'all' && (
        <div className="setting-item">
          <label>最大深度限制</label>
          <input 
            type="number"
            min="1"
            max="100"
            value={maxDepth}
            onChange={(e) => {
              updateSettings({
                taskProgress: {
                  ...settings.taskProgress,
                  maxDepth: parseInt(e.target.value)
                }
              })
            }}
          />
        </div>
      )}
      
      <div className="setting-item">
        <label>
          <input 
            type="checkbox"
            checked={onlyLeaves}
            onChange={(e) => {
              updateSettings({
                taskProgress: {
                  ...settings.taskProgress,
                  onlyLeaves: e.target.checked
                }
              })
            }}
          />
          仅统计叶子节点（不统计有子任务的节点）
        </label>
      </div>
    </div>
  )
}
```

#### 2.4.2 嵌套层级指示器

在进度组件旁边显示嵌套层级信息：

```tsx
const NestingLevelIndicator: React.FC<{ maxDepth: number }> = ({ maxDepth }) => {
  if (maxDepth === 1) return null
  
  return (
    <span className="nesting-indicator" title={`包含 ${maxDepth} 层嵌套任务`}>
      {maxDepth === -1 ? '∞' : maxDepth}
    </span>
  )
}
```

## 3. 数据模型设计

### 3.1 扩展类型定义

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
  depth: number  // 新增：深度层级
  children: TaskBlock[]  // 新增：子任务列表
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

### 3.2 配置模型

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
  // V2 新增配置
  nestingLevel: NestingLevel
  maxDepth?: number
  onlyLeaves?: boolean
}
```

## 4. 实现计划

### 4.1 阶段一：基础扩展

1. **扩展类型定义**
   - 添加 `NestingLevel` 类型
   - 扩展 `TaskProgressSettings` 接口

2. **修改查询逻辑**
   - 实现 `queryNestedTasks` 函数
   - 支持指定深度的任务查询

3. **更新设置界面**
   - 添加嵌套层级选择器
   - 添加最大深度和叶子节点选项

### 4.2 阶段二：性能优化

1. **实现缓存机制**
   - 添加任务进度缓存
   - 实现缓存失效逻辑

2. **优化查询性能**
   - 批量查询优化
   - 异步并行查询

### 4.3 阶段三：UI/UX 增强

1. **嵌套层级指示器**
   - 在进度组件旁显示层级信息
   - 悬浮提示显示详细嵌套结构

2. **实时预览**
   - 设置页面实时预览不同层级的效果

## 5. 向后兼容性

### 5.1 V1 配置迁移

```typescript
function migrateV1ToV2(oldSettings: V1Settings): V2Settings {
  return {
    ...oldSettings,
    // V2 新增配置使用默认值
    nestingLevel: 1,  // 默认为1层，保持V1行为
    maxDepth: 10,
    onlyLeaves: false
  }
}
```

### 5.2 默认行为

- **默认嵌套层级**：1层
- **默认行为**：与 V1 完全一致
- **现有用户**：无需修改配置，自动使用 V1 行为

## 6. 测试计划

### 6.1 单元测试

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

### 6.2 集成测试

1. 测试不同嵌套层级的查询结果
2. 测试缓存机制的正确性
3. 测试配置变更后的行为

## 7. 风险与挑战

### 7.1 性能风险

- **深层嵌套**：当嵌套层级设置为"全部"时，可能查询大量块
- **解决方案**：添加 `maxDepth` 限制，提供性能警告

### 7.2 复杂度风险

- **循环引用**：日志块结构中可能出现循环引用
- **解决方案**：在查询时检测并跳过已访问的块

### 7.3 API 限制

- **Datascript 递归**：`parent+` 语法可能不被支持
- **解决方案**：采用迭代查询方案，绕过此限制

## 8. 属性 KV 过滤实现方案

### 8.1 配置模型设计

```typescript
interface PropertyFilter {
  key: string
  operator: 'eq' | 'neq' | 'contains' | 'exists' | 'not-exists'
  value?: string | string[]
}

interface TaskProgressPropertyFilterConfig {
  enabled: boolean
  filters: PropertyFilter[]
  matchMode: 'all' | 'any'
}

export interface TaskProgressSettings {
  enabled: boolean
  defaultDisplayType: ProgressDisplayType
  showLabel?: boolean
  labelFormat?: 'fraction' | 'percentage'
  displayOptions?: {
    [key: string]: Record<string, any>
  }
  nestingLevel: NestingLevel
  maxDepth?: number
  onlyLeaves?: boolean
  propertyFilter?: TaskProgressPropertyFilterConfig
}
```

**配置说明：**

| 配置项 | 类型 | 说明 |
| :--- | :--- | :--- |
| `enabled` | boolean | 是否启用属性过滤 |
| `filters` | PropertyFilter[] | 过滤条件数组 |
| `matchMode` | 'all' \| 'any' | 匹配模式：all=全部满足，any=任一满足 |
| `key` | string | 属性键名 |
| `operator` | enum | 操作符类型 |
| `value` | string \| string[] | 属性值（可选） |

**操作符说明：**

| 操作符 | 含义 | 示例 |
| :--- | :--- | :--- |
| `eq` | 等于 | `priority eq high` 匹配 `priority:: high` |
| `neq` | 不等于 | `status neq done` 匹配非 done 状态 |
| `contains` | 包含 | `tag contains bug` 匹配 `tags:: bug,fix` |
| `exists` | 存在 | `due exists` 匹配有 due 属性的块 |
| `not-exists` | 不存在 | `priority not-exists` 匹配无 priority 属性的块 |

### 8.2 查询逻辑修改

#### 8.2.1 过滤函数实现

```typescript
function matchesPropertyFilter(
  block: BlockEntity,
  filter: PropertyFilter
): boolean {
  const propertyValue = block.properties?.[filter.key]

  switch (filter.operator) {
    case 'exists':
      return propertyValue !== undefined && propertyValue !== null

    case 'not-exists':
      return propertyValue === undefined || propertyValue === null

    case 'eq':
      if (Array.isArray(propertyValue)) {
        return propertyValue.includes(filter.value as string)
      }
      return propertyValue === filter.value

    case 'neq':
      if (Array.isArray(propertyValue)) {
        return !propertyValue.includes(filter.value as string)
      }
      return propertyValue !== filter.value

    case 'contains':
      const propStr = Array.isArray(propertyValue)
        ? propertyValue.join(',')
        : String(propertyValue ?? '')
      return propStr.includes(filter.value as string)

    default:
      return false
  }
}

function applyPropertyFilters(
  blocks: BlockEntity[],
  config: TaskProgressPropertyFilterConfig
): BlockEntity[] {
  if (!config.enabled || config.filters.length === 0) {
    return blocks
  }

  return blocks.filter(block => {
    const results = config.filters.map(filter =>
      matchesPropertyFilter(block, filter)
    )

    return config.matchMode === 'all'
      ? results.every(Boolean)
      : results.some(Boolean)
  })
}
```

#### 8.2.2 集成到任务查询流程

```typescript
async function queryNestedTasks(
  parentBlockId: string,
  options: {
    maxDepth: number
    onlyLeaves: boolean
    propertyFilter?: TaskProgressPropertyFilterConfig
  }
): Promise<BlockEntity[]> {
  let tasks = await queryNestedTasksInternal(parentBlockId, options.maxDepth)

  tasks = filterTaskBlocks(tasks)

  if (options.onlyLeaves) {
    tasks = filterLeafTasks(tasks)
  }

  if (options.propertyFilter) {
    tasks = applyPropertyFilters(tasks, options.propertyFilter)
  }

  return tasks
}
```

### 8.3 UI 配置界面设计

```tsx
const PropertyFilterSettings: React.FC = () => {
  const { settings, updateSettings } = useSettings()
  const propertyFilter = settings.taskProgress?.propertyFilter ?? {
    enabled: false,
    filters: [],
    matchMode: 'all'
  }

  const addFilter = () => {
    updateSettings({
      taskProgress: {
        ...settings.taskProgress,
        propertyFilter: {
          ...propertyFilter,
          filters: [
            ...propertyFilter.filters,
            { key: '', operator: 'exists', value: '' }
          ]
        }
      }
    })
  }

  const removeFilter = (index: number) => {
    const newFilters = propertyFilter.filters.filter((_, i) => i !== index)
    updateSettings({
      taskProgress: {
        ...settings.taskProgress,
        propertyFilter: {
          ...propertyFilter,
          filters: newFilters
        }
      }
    })
  }

  const updateFilter = (index: number, updates: Partial<PropertyFilter>) => {
    const newFilters = propertyFilter.filters.map((f, i) =>
      i === index ? { ...f, ...updates } : f
    )
    updateSettings({
      taskProgress: {
        ...settings.taskProgress,
        propertyFilter: {
          ...propertyFilter,
          filters: newFilters
        }
      }
    })
  }

  return (
    <div className="property-filter-settings">
      <h3>属性过滤设置</h3>

      <div className="setting-item">
        <label>
          <input
            type="checkbox"
            checked={propertyFilter.enabled}
            onChange={(e) => {
              updateSettings({
                taskProgress: {
                  ...settings.taskProgress,
                  propertyFilter: {
                    ...propertyFilter,
                    enabled: e.target.checked
                  }
                }
              })
            }}
          />
          启用属性过滤
        </label>
      </div>

      {propertyFilter.enabled && (
        <>
          <div className="setting-item">
            <label>匹配模式</label>
            <select
              value={propertyFilter.matchMode}
              onChange={(e) => {
                updateSettings({
                  taskProgress: {
                    ...settings.taskProgress,
                    propertyFilter: {
                      ...propertyFilter,
                      matchMode: e.target.value as 'all' | 'any'
                    }
                  }
                })
              }}
            >
              <option value="all">全部满足（AND）</option>
              <option value="any">任一满足（OR）</option>
            </select>
          </div>

          <div className="filters-list">
            {propertyFilter.filters.map((filter, index) => (
              <div key={index} className="filter-item">
                <input
                  type="text"
                  placeholder="属性键名"
                  value={filter.key}
                  onChange={(e) => updateFilter(index, { key: e.target.value })}
                />
                <select
                  value={filter.operator}
                  onChange={(e) => updateFilter(index, {
                    operator: e.target.value as PropertyFilter['operator']
                  })}
                >
                  <option value="exists">存在</option>
                  <option value="not-exists">不存在</option>
                  <option value="eq">等于</option>
                  <option value="neq">不等于</option>
                  <option value="contains">包含</option>
                </select>
                {!['exists', 'not-exists'].includes(filter.operator) && (
                  <input
                    type="text"
                    placeholder="属性值"
                    value={filter.value as string ?? ''}
                    onChange={(e) => updateFilter(index, { value: e.target.value })}
                  />
                )}
                <button onClick={() => removeFilter(index)}>删除</button>
              </div>
            ))}
          </div>

          <button onClick={addFilter}>添加过滤条件</button>
        </>
      )}
    </div>
  )
}
```

### 8.4 Datalog 查询示例

#### 8.4.1 单属性过滤查询

```datalog
[:find (pull ?b [*])
 :in $ ?parent-uuid
 :where
 [?parent :block/uuid ?parent-uuid]
 [?b :block/parent ?parent]
 [?b :block/properties ?props]
 [(get ?props :priority) ?priority]
 [(= ?priority "high")]]
```

#### 8.4.2 多属性 AND 查询

```datalog
[:find (pull ?b [*])
 :in $ ?parent-uuid
 :where
 [?parent :block/uuid ?parent-uuid]
 [?b :block/parent ?parent]
 [?b :block/properties ?props]
 [(get ?props :priority) ?priority]
 [(= ?priority "high")]
 [(get ?props :type) ?type]
 [(= ?type "bug")]]
```

#### 8.4.3 带 exists 操作符的查询

```datalog
[:find (pull ?b [*])
 :in $ ?parent-uuid
 :where
 [?parent :block/uuid ?parent-uuid]
 [?b :block/parent ?parent]
 [?b :block/properties ?props]
 [(get ?props :due) ?due]
 [(notnil ?due)]]
```

#### 8.4.4 完整 Datalog 查询封装

```typescript
function buildPropertyFilterQuery(
  parentBlockId: string,
  filters: PropertyFilter[],
  matchMode: 'all' | 'any'
): string {
  const baseQuery = `
    [:find (pull ?b [*])
     :in $ ?parent-uuid
     :where
     [?parent :block/uuid ?parent-uuid]
     [?b :block/parent ?parent]
     [?b :block/properties ?props]`

  const filterClauses = filters.map((filter, index) => {
    switch (filter.operator) {
      case 'exists':
        return `[(get ?props :${filter.key}) ?v${index}]\n[(notnil ?v${index})]`
      case 'not-exists':
        return `[(get ?props :${filter.key}) ?v${index}]\n[(nil ?v${index})]`
      case 'eq':
        return `[(get ?props :${filter.key}) ?v${index}]\n[(= ?v${index} "${filter.value}")]`
      case 'neq':
        return `[(get ?props :${filter.key}) ?v${index}]\n[(not= ?v${index} "${filter.value}")]`
      case 'contains':
        return `[(get ?props :${filter.key}) ?v${index}]\n[(clojure.string/includes? ?v${index} "${filter.value}")]`
      default:
        return ''
    }
  })

  return `${baseQuery}\n${filterClauses.join('\n')}]`
}
```

## 9. 参考资料

- [Logseq DB Query Guide](https://github.com/logseq/logseq/blob/master/libs/guides/db_query_guide.md)
- [Logseq Plugin API](https://github.com/logseq/logseq/blob/master/libs/src/LSPlugin.user.ts)
- [Datascript Documentation](https://github.com/tonsky/datascript)
