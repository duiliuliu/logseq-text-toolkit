# Logseq Summary 模块设计方案

**版本**: v1.0  
**日期**: 2026-05-12  
**状态**: 设计中

---

## 1. 概述

### 1.1 项目背景

Text Toolkit 是一个功能丰富的 Logseq 插件，已实现 Toolbar、Comment、Task Progress、Heatmap 等模块。本设计方案旨在新增 **Summary（总结）** 模块，提供周度/月度/年度/自定义总结功能，帮助用户回顾和分析 Logseq 数据。

### 1.2 核心需求

| 需求编号 | 需求描述 | 优先级 |
|---------|---------|-------|
| REQ-001 | 支持周度、月度、年度、自定义时间范围总结 | P0 |
| REQ-002 | 对 Blocks、Tasks、Pages、Properties 等数据进行统计和基本分析 | P0 |
| REQ-003 | 集成多种总结方法论模版（GTD、OKR、晨间日记等） | P1 |
| REQ-004 | 支持配置 AI API 进行智能分析和建议 | P1 |
| REQ-005 | 输出 Logseq 原生 Markdown 页面，支持 CSS 布局调整 | P0 |
| REQ-006 | 可嵌入 Heatmap 等现有组件增强可视化 | P1 |

### 1.3 设计原则

1. **简洁性优先**：尽量用纯 Markdown，仅在关键节点用 Hiccup 注入 class
2. **内容沉淀**：总结以 Logseq 页面形式存在，可编辑、可搜索、可引用
3. **渐进式实现**：分阶段实现，先做核心功能，再迭代扩展
4. **架构一致**：与现有 Heatmap、Task Progress 模块保持一致的代码风格

---

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Summary 模块架构                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  用户交互层                                                  │   │
│  │  - 斜杠命令: /Generate Summary                              │   │
│  │  - 工具栏按钮 (可选)                                         │   │
│  │  - 配置弹窗: 选择模版、设置参数、时间范围                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  核心业务逻辑层                                               │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │   │
│  │  │ SummaryManager  │  │ TemplateEngine  │  │ DataAnalyzer │  │   │
│  │  │  协调器         │  │  模版引擎       │  │  数据分析器  │  │   │
│  │  └─────────────────┘  └─────────────────┘  └──────────────┘  │   │
│  │  ┌─────────────────┐  ┌─────────────────┐                     │   │
│  │  │ AIClient        │  │ PageGenerator   │                     │   │
│  │  │  AI API 客户端  │  │  页面生成器     │                     │   │
│  │  └─────────────────┘  └─────────────────┘                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  数据访问层                                                  │   │
│  │  ┌───────────────────────────────────────────────────────┐  │   │
│  │  │ QueryService: Logseq 数据查询服务                      │  │   │
│  │  │  - BlockQuery: 块数据查询                              │  │   │
│  │  │  - TaskQuery: 任务数据查询                             │  │   │
│  │  │  - PageQuery: 页面数据查询                             │  │   │
│  │  └───────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  输出层                                                      │   │
│  │  - Markdown 页面生成 (含少量 Hiccup)                        │   │
│  │  - CSS 样式注入 (通过 CSSRegistry)                          │   │
│  │  - 嵌入 Heatmap 等现有组件                                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 文件结构

```
src/
├── components/
│   └── Summary/                          # 新增
│       ├── index.ts
│       ├── SummaryModal.tsx             # 配置弹窗
│       ├── TemplateSelector.tsx         # 模版选择器
│       └── summary.css                  # 报告页面样式
│
├── lib/
│   └── summary/                         # 新增
│       ├── index.ts
│       ├── register.ts                   # 注册斜杠命令
│       ├── types.ts                      # 类型定义
│       ├── TemplateEngine.ts            # 模版引擎
│       ├── DataAnalyzer.ts              # 数据分析器
│       ├── QueryService.ts             # 数据查询服务
│       ├── AIClient.ts                 # AI 客户端
│       ├── PageGenerator.ts            # 页面生成器
│       └── templates/                  # 预置模版
│           ├── gtdWorkReview.ts         # GTD 工作回顾
│           ├── minimalDashboard.ts      # 极简数据看板
│           ├── okrProgress.ts           # OKR 进度报告
│           ├── morningJournal.ts        # 晨间日记
│           └── studyTracker.ts          # 学习成长追踪
│
└── settings/
    ├── defaultSettings.ts              # 扩展: 添加 Summary 相关设置
    └── types.ts                        # 扩展: 添加 Summary 类型定义
```

---

## 3. 数据模型

### 3.1 核心类型定义

**文件**: `src/lib/summary/types.ts`

```typescript
// 总结类型
export type SummaryType = 'weekly' | 'monthly' | 'yearly' | 'custom';

// 模版类型
export type TemplateType = 
  | 'gtd-work-review'
  | 'minimal-dashboard'
  | 'okr-progress'
  | 'morning-journal'
  | 'study-tracker';

// 时间范围
export interface DateRange {
  start: Date;
  end: Date;
}

// 统计数据 - Blocks
export interface BlockStats {
  total: number;
  created: number;
  modified: number;
  avgContentLength: number;
  tags: Record<string, number>;
}

// 统计数据 - Tasks
export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  overdue: number;
  completionRate: number;
  byPriority: Record<string, number>;
}

// 统计数据 - Pages
export interface PageStats {
  total: number;
  newPages: number;
  modifiedPages: number;
  byTag: Record<string, number>;
  byProperty: Record<string, Record<string, number>>;
}

// 综合统计数据
export interface SummaryData {
  dateRange: DateRange;
  blocks: BlockStats;
  tasks: TaskStats;
  pages: PageStats;
}

// 模版配置
export interface TemplateConfig {
  type: TemplateType;
  name: string;
  description: string;
  supportedTypes: SummaryType[];
  params: Record<string, any>;
}

// AI 配置
export interface AIConfig {
  enabled: boolean;
  provider: 'openai' | 'claude' | 'custom';
  apiKey: string;
  apiUrl?: string;
  model?: string;
  promptTemplate?: string;
}

// Summary 设置
export interface SummarySettings {
  enabled: boolean;
  defaultTemplate: TemplateType;
  defaultType: SummaryType;
  dateFormat: string;
  ai: AIConfig;
  pageNameTemplate: string;
}
```

---

## 4. 数据层级结构与插入逻辑

### 4.1 内存数据组织

在内存中按父子关系组织 BlockNode 树结构：

```typescript
interface BlockNode {
  content: string;      // 块内容（含 Hiccup 标签）
  children?: BlockNode[]; // 子块数组
}

// 示例数据结构
const summaryTree: BlockNode[] = [
  {
    content: '[:div.summary-page]',
    children: [
      { content: '# 📊 周度总结 - 2026年第19周' },
      {
        content: '## 📈 数据概览',
        children: [
          {
            content: '[:div.summary-kpi-section]',
            children: [
              { content: '### 核心指标' },
              { content: '- 创建块数: 156' },
              { content: '- 完成任务: 28 / 35' },
              { content: '- 活跃天数: 6 / 7' },
              { content: '- 新增页面: 12' },
            ]
          }
        ]
      },
      // ... 其他块
    ]
  }
];
```

### 4.2 Logseq API 逐块插入逻辑

使用 Logseq Editor API 按层级逐个创建 block：

```typescript
async function insertBlockTree(
  pageName: string,
  blocks: BlockNode[],
  parentId?: string
): Promise<void> {
  for (const block of blocks) {
    // 创建当前块
    const createdBlock = await logseq.Editor.createBlock(
      parentId || pageName,  // parent: 页面名或父块 UUID
      block.content,          // content: 块内容
      { sibling: !!parentId } // sibling: true=作为同级块，false=作为子块
    );
    
    // 递归插入子块
    if (block.children?.length) {
      await insertBlockTree(pageName, block.children, createdBlock.uuid);
    }
  }
}
```

### 4.3 输出格式（含层级说明）

**说明：level 仅用于文档说明层级关系，实际输出不包含 level**

```
[:div.summary-page]     (level 0)
# 📊 周度总结 - 2026年第19周     (level 1)

## 📈 数据概览     (level 1)

[:div.summary-kpi-section]     (level 2)
  ### 核心指标     (level 3)
  - 创建块数: 156     (level 4)
  - 完成任务: 28 / 35     (level 4)
  - 活跃天数: 6 / 7     (level 4)
  - 新增页面: 12     (level 4)

## 📈 活跃度热力图     (level 1)

[:div.summary-heatmap-section]     (level 2)
  {{renderer :heatmap :week :tag=work}}     (level 3)


[:div.summary-two-columns]     (level 1)
  ## ✅ 任务回顾     (level 2)
  
  ### 完成任务清单     (level 3)
  - [x] 完成项目A设计     (level 4)
  - [x] 代码评审     (level 4)
  - [x] 团队周会     (level 4)
  
  ### 任务统计     (level 3)
  | 状态 | 数量 |     (level 4)
  |------|------|     (level 4)
  | 完成 | 28 |     (level 4)
  | 进行中 | 5 |     (level 4)
  | 待办 | 2 |     (level 4)

  ## 📝 内容分析     (level 2)
  
  ### 热门标签     (level 3)
  - #工作 (45)     (level 4)
  - #学习 (28)     (level 4)
  - #项目A (22)     (level 4)
  
  ### 页面分布     (level 3)
  - 工作笔记: 8页     (level 4)
  - 学习笔记: 4页     (level 4)
  - 会议记录: 3页     (level 4)

## 🤖 AI 分析建议     (level 1)

> [AI 生成的分析内容...]     (level 2)
```

### 4.4 插入顺序

```
1. 创建页面 '周度总结-2026-19'
   ↓
2. 插入 '[:div.summary-page]' (level 0)
   ↓
3. 插入 '# 📊 周度总结...' (level 1, sibling)
   ↓
4. 插入 '## 📈 数据概览' (level 1, sibling)
   ↓
5. 插入 '[:div.summary-kpi-section]' (level 2, child)
   ↓
6. 插入 '### 核心指标' (level 3, child)
   ↓
7. 插入 '- 创建块数: 156' (level 4, sibling)
   ↓
8. 插入 '- 完成任务: 28 / 35' (level 4, sibling)
   ... 继续插入剩余块
```

---

## 5. CSS 样式设计

### 5.1 样式文件

**文件**: `src/components/Summary/summary.css`

```css
/* 页面容器 */
.summary-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

/* KPI 指标区域 - 使用 grid 布局 */
/* 结构: .summary-kpi-section > .ls-block > ul */
.summary-kpi-section > div > ul {
  display: grid !important;
  grid-template-columns: repeat(4, 1fr) !important;
  gap: 16px !important;
  list-style: none !important;
  padding: 0 !important;
  margin: 24px 0 !important;
}

.summary-kpi-section > div > ul > li {
  background: var(--ls-secondary-background-color) !important;
  padding: 20px !important;
  border-radius: 12px !important;
  text-align: center !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
  transition: transform 0.2s ease !important;
}

.summary-kpi-section > div > ul > li:hover {
  transform: translateY(-4px) !important;
}

/* 热力图区域 */
.summary-heatmap-section {
  margin: 24px 0 !important;
  padding: 16px !important;
  background: var(--ls-secondary-background-color) !important;
  border-radius: 12px !important;
}

/* 两列布局 */
/* 结构: .summary-two-columns > .ls-block (第一列), .ls-block (第二列) */
.summary-two-columns {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 32px !important;
  margin: 24px 0 !important;
}

.summary-two-columns > div {
  background: var(--ls-secondary-background-color) !important;
  padding: 20px !important;
  border-radius: 12px !important;
}

/* 暗色主题适配 */
.dark .summary-kpi-section > div > ul > li,
.dark .summary-heatmap-section,
.dark .summary-two-columns > div {
  background: rgba(45, 52, 73, 0.8) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
}
```

### 5.2 CSS 选择器策略说明

| 选择器模式 | 说明 | 示例 |
|-----------|------|------|
| `.summary-section > div` | 选择直接子节点（ls-block） | `.summary-kpi-section > div` |
| `.summary-section > div > ul` | 选择子节点下的列表 | `.summary-kpi-section > div > ul` |
| `.summary-section > div:nth-child(1)` | 选择第 N 个子块 | 两列布局选择第一列 |
| `:where()` | 降低选择器优先级，方便用户覆盖 | `:where(.summary-kpi-section) > div > ul` |

---

## 6. 预置模版设计

### 6.1 模版列表

| 模版名称 | 适用场景 | 理论模型 | 优先级 |
|---------|---------|---------|-------|
| GTD 工作回顾 | 周/月度工作 | Getting Things Done | P0 |
| 极简数据看板 | 任何场景 | 极简主义 | P0 |
| OKR 进度报告 | 季度/年度 | OKR | P1 |
| 晨间日记/晚间复盘 | 日/周度 | 晨间日记法 | P1 |
| 学习成长追踪 | 周/月度学习 | 学习金字塔 | P1 |

### 6.2 模版接口

**文件**: `src/lib/summary/templates/index.ts`

```typescript
// Block 节点类型
interface BlockNode {
  content: string;      // 块内容（含 Hiccup 标签）
  children?: BlockNode[]; // 子块数组
}

// 模版接口
export interface SummaryTemplate {
  id: TemplateType;
  name: string;
  description: string;
  supportedTypes: SummaryType[];
  
  // 返回 BlockNode 树结构，供 PageGenerator 逐块插入
  render(data: SummaryData, params: Record<string, any>): BlockNode[];
}

// 模版工厂
export const TemplateRegistry: Record<TemplateType, SummaryTemplate> = {
  'gtd-work-review': GTDWorkReviewTemplate,
  'minimal-dashboard': MinimalDashboardTemplate,
  // ... 其他模版
};
```

---

## 7. 实现阶段规划

### Phase 1: 核心功能（MVP）

**目标**: 最小可用产品，验证核心价值

- [ ] 基础架构搭建
- [ ] 数据查询服务（Block、Task、Page）
- [ ] 2 个预置模版（GTD 工作回顾、极简数据看板）
- [ ] Markdown 报告生成器
- [ ] 基础 CSS 样式
- [ ] 配置弹窗
- [ ] 斜杠命令注册
- [ ] CSSRegistry 集成

### Phase 2: 功能扩展

**目标**: 丰富功能，提升用户体验

- [ ] Heatmap 组件嵌入
- [ ] 更多预置模版（OKR、学习追踪等）
- [ ] 自定义时间范围
- [ ] 标签/属性过滤
- [ ] 页面名称模版自定义

### Phase 3: AI 集成

**目标**: 智能分析

- [ ] AI API 客户端
- [ ] 提示词模版系统
- [ ] AI 分析建议生成
- [ ] 设置面板集成

---

## 8. 与现有模块的集成

### 8.1 Heatmap 集成

直接复用现有 Heatmap 模块，通过 renderer 宏嵌入：

```markdown
{{renderer :heatmap :week :tag=work}}
```

### 8.2 CSSRegistry 集成

使用现有 CSSRegistry 机制注入 summary.css：

```typescript
// src/lib/summary/register.ts
import { registerCSS } from '../cssRegistry';
import summaryCSS from '../../components/Summary/summary.css?raw';

export function registerSummaryCSS() {
  registerCSS('summary', {
    type: 'inline',
    content: summaryCSS
  });
}
```

---

## 9. 配置与设置

### 9.1 设置面板扩展

在现有设置面板中新增 Summary 标签页：

| 设置项 | 说明 | 默认值 |
|-------|------|-------|
| 默认模版 | 新创建总结时使用的模版 | gtd-work-review |
| 默认总结类型 | 周度/月度/年度 | weekly |
| 日期格式 | 页面标题日期格式 | YYYY年第WW周 |
| 页面名称模版 | 生成页面的名称格式 | 总结/{date} |
| AI 配置 | API Key、Provider 等 | - |

---

## 10. 用户交互流程

```
用户输入 /Generate Summary
    ↓
打开配置弹窗
    ↓
选择: 模版类型 + 时间范围 + 过滤条件
    ↓
点击「生成」
    ↓
查询数据 → 分析数据 → 渲染模版 → 生成 Markdown
    ↓
创建新的 Logseq 页面，插入内容
    ↓
(可选) 调用 AI 生成分析建议
    ↓
完成！
```

---

## 11. 技术风险与应对

| 风险 | 影响 | 概率 | 应对策略 |
|-----|------|------|---------|
| Logseq Hiccup 语法限制 | 中 | 中 | 保持 Hiccup 使用最小化，仅用于 class 注入 |
| 大数据量查询性能 | 高 | 中 | 分页查询、缓存机制、性能优化 |
| AI API 调用失败 | 低 | 高 | 降级方案：仅生成统计数据，不依赖 AI |
| CSS 样式冲突 | 中 | 中 | 使用特定前缀选择器，高优先级 !important |

---

## 12. 相关文档

- [Architecture-Overview.md](../Architecture-Overview.md) - 整体架构
- [Heatmap-Design.md](../Heatmap-Design.md) - Heatmap 模块设计
- [DEVELOPMENT.md](../DEVELOPMENT.md) - 开发指南

---

**文档结束**

---

## 附录：布局草图（文本版）

### A. Markdown 源码结构（含缩进）

```
[:div.summary-page]
# 📊 周度总结 - 2026年第19周

## 📈 数据概览

[:div.summary-kpi-section]
  ### 核心指标
  - 创建块数: 156
  - 完成任务: 28 / 35
  - 活跃天数: 6 / 7
  - 新增页面: 12

## 📈 活跃度热力图

[:div.summary-heatmap-section]
  {{renderer :heatmap :week :tag=work}}

[:div.summary-two-columns]
  ## ✅ 任务回顾
  ...
  
  ## 📝 内容分析
  ...
```

### B. 渲染后可视化效果

```
┌─────────────────────────────────────────────────────────────────────┐
│  📊 周度总结 - 2026年第19周 (5月5日-5月11日)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 创建块数  │  │ 完成任务  │  │ 活跃天数  │  │ 新增页面  │          │
│  │   156    │  │  28/35   │  │   6/7    │  │   12     │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│  (summary-kpi-section)                                              │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  📈 活跃度热力图                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  [Heatmap 组件]                                              │  │
│  └─────────────────────────────────────────────────────────────┘  │
│  (summary-heatmap-section)                                          │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  [summary-two-columns] (grid 布局)                                  │
│  ┌─────────────────────────────┬───────────────────────────────┐  │
│  │  ✅ 任务回顾                │  📝 内容分析                  │  │
│  │  ┌───────────────────────┐  │  ┌─────────────────────────┐  │  │
│  │  │ • 完成: 28            │  │  │ 🔥 热门标签              │  │  │
│  │  │ • 进行中: 5           │  │  │  #工作 (45)             │  │  │
│  │  │ • 待办: 2             │  │  │  #学习 (28)             │  │  │
│  │  └───────────────────────┘  │  └─────────────────────────┘  │  │
│  │  📋 任务清单                │  📚 页面分布                 │  │
│  │  [列表...]                 │  ...                          │  │
│  └─────────────────────────────┴───────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│  🤖 AI 分析建议                                                     │
│  > [AI 生成的分析内容...]                                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```
