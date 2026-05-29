# Text Toolkit 功能扩展设计方案汇总

## 项目背景

基于 Logseq SDK 的 `onInputSelectionEnd` 函数分析，为 Text Toolkit 项目设计两个重要的功能扩展：

1. **SelectToolbar 性能优化**：利用 SDK 事件提升文本选择工具栏的性能和准确性
2. **Milestone 里程碑组件**：实现阶段性的进度展示组件

## 一、SelectToolbar SDK 优化方案

### 1.1 核心问题

现有 SelectToolbar 实现使用原生 `mouseup` 事件监听，存在以下问题：
- 性能开销大：需要在整个文档层级添加监听器
- 位置计算复杂：手动解析 DOM 结构
- 跨编辑器兼容性差
- 缺少语义化的位置信息

### 1.2 SDK 事件优势

```typescript
logseq.Editor.onInputSelectionEnd(({ caret, point, start, end, text }) => {
  // 直接获取：
  // - text: 选中文本
  // - start/end: 字符偏移位置
  // - caret: 光标信息 (left, top, height, rect)
  // - point: 鼠标位置
})
```

### 1.3 优化架构

```
┌─────────────────────────────────────────┐
│        输入层（双模式支持）               │
│  原生事件模式 ←→ SDK 事件模式            │
└────────────────┬────────────────────────┘
                 ▼
┌─────────────────────────────────────────┐
│     事件适配层 (SelectionEventAdapter)    │
│     统一事件格式 → SelectedData           │
└────────────────┬────────────────────────┘
                 ▼
┌─────────────────────────────────────────┐
│     业务逻辑层 (ToolbarManager)          │
└─────────────────────────────────────────┘
```

### 1.4 关键实现

**新增文件**：
- `src/lib/toolbar/SelectionEventAdapter.ts` - 事件适配器

**主要功能**：
1. **事件格式转换**：SDK 事件 ↔ 原生事件 → 统一格式
2. **上下文补充**：before/after 文本、块信息
3. **条件显示**：基于选中文本的动态工具栏项显示
4. **位置缓存**：避免重复计算

### 1.5 性能优化

```typescript
// 防抖处理
const debouncedSDKHandler = debounce(handleSDKSelection, 50);

// 条件缓存
const conditionCache = new Map<string, boolean>();
```

### 1.6 预估时间

| 阶段 | 任务 | 时间 |
|------|------|------|
| 阶段一 | 创建 SelectionEventAdapter | 0.5 天 |
| 阶段二 | 修改 SelectToolbar 组件 | 1 天 |
| 阶段三 | 添加条件显示配置支持 | 0.5 天 |
| 阶段四 | 性能优化和测试 | 1.5 天 |
| **总计** | | **3.5 天** |

---

## 二、Milestone 里程碑组件方案

### 2.1 模块定位

Milestone 是一个用于展示项目进度、面试流程等阶段性进展的 UI 组件，提供 5 种预设的展示样式。

### 2.2 核心能力

#### 2.2.1 属性枚举获取

**API 调用示例**：

```bash
curl 'http://127.0.0.1:12315/api' \
-H 'Authorization: Bearer sw6ur06m7' \
--data-raw '{
  "method": "logseq.DB.datascriptQuery",
  "args": ["[:find (pull ?val [* {:block/refs [:block/title]}]) 
             :where [_ :user.property/-ae_Y5gsx ?val]]"]
}'
```

**实现功能**：
- 获取用户自定义属性的所有枚举值
- 统计每个枚举值的使用次数
- 关联块信息收集

#### 2.2.2 宏命令过滤

**使用格式**：

```markdown
{{renderer :milestone :interview :style=capsule :company=安克 :tag=面试}}
```

**过滤能力**：
- 按属性值过滤：`:company=安克`
- 按标签过滤：`:tag=面试`
- 多重过滤组合

**Datascript 查询**：

```clojure
[:find (pull ?b [*])
 :where
 [?b :user.property/company ?val]
 [?val :block/title "安克"]
 [?b :block/tags ?t]
 [?t :block/title "面试"]]
```

#### 2.2.3 5 种展示样式

| 样式 | 名称 | 特点 |
|------|------|------|
| **Style 1** | 胶囊进度条 | 水平胶囊节点，状态符号显示 |
| **Style 2** | 数字徽标 | 编号节点 + 进度百分比 + 总体进度条 |
| **Style 3** | 极简轨道 | 最小化圆点线条，适合时间线 |
| **Style 4** | 卡片浮层 | 上下交替卡片，适合对比展示 |
| **Style 5** | 状态徽章 | 紧凑横排徽章，适合紧凑布局 |

### 2.3 UI 展示示例

#### Style 1: 胶囊进度条

```
投递简历    HR 筛选    技术一面    技术二面      终    面      Offer
   ●━━━━━━━━━●━━━━━━━━━●━━━━━━━━━◐ ━━━━━━━━ ○ ━━━━━━━━ ○
  2/01 通过  2/04 通过  2/10 通过   进行中       待定         待定
```

#### Style 2: 数字徽标 + 进度

```
  01           02           03           04           05
  ●            ●            ◐            ○            ○
需求分析      系统设计      开发阶段      测试验收      上线发布
 已完成        已完成       进行中 65%    待开始        待开始
──────────────────────────────────────────────────────────
████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 40%
```

#### Style 3: 极简轨道

```
━━━●━━━━━━━━━━━●━━━━━━━━━━━●━━━━━━━━━━━◌━━━━━━━━━━━◌━━━
  Q1           Q2           Q3           Q4          Q1'26
 启动期        成长期        扩张期       巩固期       上市
```

#### Style 4: 卡片浮层

```
   [需求评审]              [开发完成]              [正式上线]
      ▲                      ▲                      ▲
━━━━━●━━━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━●━━━━━
                  ▼                      ▼
             [设计完稿]              [测试通过]
             2025.03.10            2025.05.01
```

#### Style 5: 状态徽章

```
[✓ 已完成] ──── [✓ 已完成] ──── [→ 进行中] ──── [· 待开始] ──── [· 待开始]
  投递           筛选             面试              背调             录用
```

### 2.4 模块架构

```
src/
├── components/Milestone/
│   ├── index.ts
│   ├── Milestone.tsx                    # 主容器
│   ├── styles/
│   │   ├── CapsuleMilestone.tsx         # Style 1
│   │   ├── BadgeMilestone.tsx           # Style 2
│   │   ├── TrackMilestone.tsx           # Style 3
│   │   ├── CardMilestone.tsx             # Style 4
│   │   └── CompactMilestone.tsx         # Style 5
│   └── milestone.css
│
└── lib/milestone/
    ├── index.ts
    ├── register.ts                      # 宏注册
    ├── query.ts                         # 数据查询
    ├── propertyEnum.ts                  # 属性枚举
    ├── statusCalculator.ts              # 状态计算
    └── types.ts                         # 类型定义
```

### 2.5 预估时间

| 阶段 | 任务 | 时间 |
|------|------|------|
| 阶段一 | 类型定义和常量 | 0.5 天 |
| 阶段二 | 属性枚举获取 | 1 天 |
| 阶段三 | 数据查询逻辑 | 1.5 天 |
| 阶段四 | 状态计算器 | 0.5 天 |
| 阶段五 | UI 组件 (5种样式) | 3 天 |
| 阶段六 | 宏命令注册 | 0.5 天 |
| 阶段七 | 设置面板和国际化 | 1 天 |
| **总计** | | **8 天** |

---

## 三、总体实施计划

### 3.1 推荐实施顺序

```
第 1-4 周：SelectToolbar SDK 优化
├─ Week 1: SelectionEventAdapter 实现
├─ Week 2: SelectToolbar 组件改造
├─ Week 3: 条件显示功能
└─ Week 4: 测试和优化

第 5-12 周：Milestone 组件开发
├─ Week 5-6: 核心逻辑 (属性枚举、查询)
├─ Week 7-8: 基础 UI 组件
├─ Week 9-10: 5 种展示样式
├─ Week 11: 宏命令和配置
└─ Week 12: 测试和文档
```

### 3.2 技术依赖

**SelectToolbar SDK 优化**：
- 依赖现有 ToolbarManager 架构
- 依赖 Logseq SDK Editor API
- 向后兼容现有配置

**Milestone 组件**：
- 依赖 PropertyEnumService（新增）
- 依赖 MilestoneQuery（新增）
- 复用 TaskProgress 的状态计算模式
- 复用 Heatmap 的组件结构

---

## 四、关键文件清单

### 4.1 SelectToolbar SDK 优化

**新增文件**：
- `src/lib/toolbar/SelectionEventAdapter.ts`

**修改文件**：
- `src/components/SelectToolbar/index.tsx`
- `src/components/Toolbar/types.ts`
- `src/settings/defaultSettings.json`

**文档**：
- `docs/plans/SelectToolbar-SDK-Optimization.md`

### 4.2 Milestone 组件

**新增文件**：

```
src/
├── components/Milestone/
│   ├── index.ts
│   ├── Milestone.tsx
│   ├── MilestoneContainer.tsx
│   ├── styles/
│   │   ├── CapsuleMilestone.tsx
│   │   ├── BadgeMilestone.tsx
│   │   ├── TrackMilestone.tsx
│   │   ├── CardMilestone.tsx
│   │   └── CompactMilestone.tsx
│   ├── components/
│   │   ├── MilestoneNode.tsx
│   │   ├── MilestoneLine.tsx
│   │   ├── MilestoneTooltip.tsx
│   │   └── MilestoneProgress.tsx
│   └── milestone.css
│
└── lib/milestone/
    ├── index.ts
    ├── register.ts
    ├── query.ts
    ├── propertyEnum.ts
    ├── statusCalculator.ts
    ├── types.ts
    └── constants.ts
```

**设置和国际化**：
- `src/components/SettingsModal/tabs/MilestoneSettings.tsx`
- `src/translations/milestone.json`

**文档**：
- `docs/plans/Milestone-Design.md`

---

## 五、收益分析

### 5.1 SelectToolbar SDK 优化

| 收益点 | 说明 |
|--------|------|
| **性能提升** | SDK 事件比原生事件更高效，减少不必要的 DOM 查询 |
| **准确性提升** | SDK 提供精确的 start/end 位置信息 |
| **维护性提升** | 统一的适配层简化后续维护 |
| **功能扩展** | 支持基于选中文本的条件显示 |

### 5.2 Milestone 组件

| 收益点 | 说明 |
|--------|------|
| **数据可视化** | 将抽象的属性数据转换为直观的进度展示 |
| **灵活性** | 5 种样式满足不同场景需求 |
| **用户友好** | 支持宏命令快速嵌入 |
| **可扩展性** | 易于添加新的展示样式 |

---

## 六、总结

本设计方案为 Text Toolkit 项目提供了两个重要功能扩展：

1. **SelectToolbar SDK 优化**：通过利用 Logseq SDK 事件，显著提升文本选择工具栏的性能和准确性
2. **Milestone 组件**：提供强大的阶段性进度展示能力，支持属性枚举获取和灵活的过滤机制

两个功能都遵循了现有项目的架构模式，保证了代码的一致性和可维护性。
