# Logseq Summary 模块设计方案

**版本**: v1.1  
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
│  │  │ QueryService: Logseq 数据查询服务                      │   │
│  │  │  - BlockQuery: 块数据查询                              │   │
│  │  │  - TaskQuery: 任务数据查询                             │   │
│  │  │  - PageQuery: 页面数据查询                             │   │
│  │  └───────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  输出层                                                      │   │
│  │  - Markdown 页面生成（父子块树                                │   │
│  │  - CSS 样式注入（通过 CSSRegistry type: 'both'             │   │
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
│       ├── register.ts                   # 注册斜杠命令 & CSS
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

// Block 节点类型
export interface BlockNode {
  content: string;      // 块内容
  children?: BlockNode[]; // 子块数组
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

## 4. Logseq 渲染结构分析与输出格式

### 4.1 Logseq HTML 渲染结构（基于示例分析

基于示例结构.html：
```html
<!-- 层级结构:
.ls-block → .block-main-container → .block-content → .block-title-wrap → hiccup div
  └── #block-children-container
       └── .ls-block (子块)
```

关键结构：
```
ls-block [level=0]
  └── .block-main-container
      ├── .block-control-wrap
      └── .flex.flex-col
          └── .block-main-content
              └── .flex.flex-col
                  └── .block-content-or-editor-wrap
                      └── .block-content-or-editor-inner
                          └── .block-row
                              └── .block-content-wrapper
                                  └── .block-content
                                      └── .block-content-inner
                                          └── .block-head-wrap
                                              └── .w-full.inline
                                                  └── .block-title-wrap
                                                      └── [HICUP ELEMENT HERE!]
```

### 4.2 内存块树数据组织

在内存中按父子关系组织 BlockNode 树结构：

```typescript
// 示例数据结构 - 仅头部使用 Hiccup
const summaryTree: BlockNode[] = [
  {
    content: '[:div.ltt-summary-page "📊 周度总结 - 2026年第19周"]',
    children: [
      {
        content: '## 📈 数据概览',
        children: [
          { content: '### 核心指标' },
          { content: '- 创建块数: 156' },
          { content: '- 完成任务: 28 / 35' },
          { content: '- 活跃天数: 6 / 7' },
          { content: '- 新增页面: 12' },
        ]
      },
      {
        content: '## 📈 活跃度热力图',
        children: [
          { content: '{{renderer :heatmap :week :tag=work}}' }
        ]
      },
      {
        content: '## ✅ 任务回顾',
        children: [
          { content: '### 完成任务清单' },
          { content: '- [x] 完成项目A设计' },
          { content: '- [x] 代码评审' },
          { content: '- [x] 团队周会' },
          { content: '### 任务统计' },
          { content: '| 状态 | 数量 |' },
          { content: '|------|------|' },
          { content: '| 完成 | 28 |' },
          { content: '| 进行中 | 5 |' },
          { content: '| 待办 | 2 |' },
        ]
      },
      {
        content: '## 📝 内容分析',
        children: [
          { content: '### 热门标签' },
          { content: '- #工作 (45)' },
          { content: '- #学习 (28)' },
          { content: '- #项目A (22)' },
          { content: '### 页面分布' },
          { content: '- 工作笔记: 8页' },
          { content: '- 学习笔记: 4页' },
          { content: '- 会议记录: 3页' },
        ]
      },
      {
        content: '## 🤖 AI 分析建议',
        children: [
          { content: '> [AI 生成的分析内容...]' },
        ]
      },
    ]
  }
];
```

### 4.3 Logseq API 逐块插入逻辑

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

### 4.4 输出 Markdown 示例（完整结构）

**实际输出到 Logseq 的完整内容结构：**

```markdown
[:div.ltt-summary-page "📊 周度总结 - 2026年第19周"]
  ## 📈 数据概览
    ### 核心指标
      - 创建块数: 156
      - 完成任务: 28 / 35
      - 活跃天数: 6 / 7
      - 新增页面: 12
  ## 📈 活跃度热力图
    {{renderer :heatmap :week :tag=work}}
  ## ✅ 任务回顾
    ### 完成任务清单
      - [x] 完成项目A设计
      - [x] 代码评审
      - [x] 团队周会
    ### 任务统计
      | 状态 | 数量 |
      |------|------|
      | 完成 | 28 |
      | 进行中 | 5 |
      | 待办 | 2 |
  ## 📝 内容分析
    ### 热门标签
      - [[工作]] (45)
      - [[学习]] (28)
      - [[项目A]] (22)
    ### 页面分布
      - 工作笔记: 8页
      - 学习笔记: 4页
      - 会议记录: 3页
  ## 🤖 AI 分析建议
    > [AI 生成的分析内容...]
```

**层级说明：**
- level 0: `[:div.ltt-summary-page "📊 周度总结 - 2026年第19周"]`
- level 1: `## 📈 数据概览`、`## ✅ 任务回顾` 等二级标题
- level 2: `### 核心指标`、`### 完成任务清单` 等三级标题
- level 3: 列表项、表格、renderer 宏等内容块
- level 4: 列表子项（当有更深层级时）

**CSS 样式映射：**
- level 3 块 → 两列布局卡片
- level 4 块 → KPI 指标卡片（当在「核心指标」下时）

### 4.5 插入顺序

```
1. 创建页面 '周度总结-2026-19'
   ↓
2. 插入 '[:div.ltt-summary-page]' (level 0)
   ↓
3. 插入 '# 📊 周度总结...' (level 1, child)
   ↓
4. 插入 '## 📈 数据概览' (level 1, sibling)
   ↓
5. 插入 '[:div.ltt-summary-kpi-section]' (level 2, child)
   ↓
6. 插入 '### 核心指标' (level 3, child)
   ↓
7. 插入 '- 创建块数: 156' (level 4, sibling)
   ↓
8. 继续插入剩余块...
```

---

## 5. CSS 样式设计

### 5.1 样式文件

**文件**: `src/components/Summary/summary.css`

```css
/* 
  Summary 模块样式 - 使用 .ltt-summary-page 限定范围
  选择器策略: .ls-block:has(.ltt-summary-page) .ls-block[level="x"]
  仅影响包含 .ltt-summary-page 的页面
*/

/* KPI 指标卡片样式 (level 4 - 核心指标下的列表项) */
.ls-block:has(.ltt-summary-page) .ls-block[level="4"] {
  background: var(--ls-secondary-background-color, #f8f9fa) !important;
  padding: 24px 16px !important;
  border-radius: 12px !important;
  text-align: center !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  display: inline-block !important;
  width: calc(25% - 16px) !important;
  margin: 8px !important;
  vertical-align: top !important;
  transition: all 0.3s ease !important;
}

.ls-block:has(.ltt-summary-page) .ls-block[level="4"]:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

/* 隐藏 KPI 卡片内的圆点和控制按钮 */
.ls-block:has(.ltt-summary-page) .ls-block[level="4"] .block-control-wrap,
.ls-block:has(.ltt-summary-page) .ls-block[level="4"] .bullet-link-wrap {
  display: none !important;
}

.ls-block:has(.ltt-summary-page) .ls-block[level="4"] .block-content-wrapper {
  padding-left: 0 !important;
}

/* 两列布局卡片样式 (level 3 - 任务回顾/内容分析) */
.ls-block:has(.ltt-summary-page) .ls-block[level="3"] {
  background: var(--ls-secondary-background-color, #ffffff) !important;
  padding: 24px !important;
  border-radius: 12px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  display: inline-block !important;
  width: calc(50% - 16px) !important;
  margin: 8px !important;
  vertical-align: top !important;
  min-height: 200px !important;
}

/* 隐藏 level 3 卡片内的圆点 */
.ls-block:has(.ltt-summary-page) .ls-block[level="3"] .block-control-wrap,
.ls-block:has(.ltt-summary-page) .ls-block[level="3"] .bullet-link-wrap {
  display: none !important;
}

.ls-block:has(.ltt-summary-page) .ls-block[level="3"] .block-content-wrapper {
  padding-left: 0 !important;
}

/* 表格样式 (level 4 下的表格) */
.ls-block:has(.ltt-summary-page) .ls-block[level="4"] table {
  width: 100% !important;
  border-collapse: collapse !important;
}

.ls-block:has(.ltt-summary-page) .ls-block[level="4"] th,
.ls-block:has(.ltt-summary-page) .ls-block[level="4"] td {
  padding: 8px 12px !important;
  text-align: left !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.ls-block:has(.ltt-summary-page) .ls-block[level="4"] th {
  background: rgba(59, 130, 246, 0.08) !important;
  font-weight: 600 !important;
  font-size: 13px !important;
}

/* 暗色主题适配 */
.dark .ls-block:has(.ltt-summary-page) .ls-block[level="4"] {
  background: rgba(45, 52, 73, 0.8) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.dark .ls-block:has(.ltt-summary-page) .ls-block[level="3"] {
  background: rgba(45, 52, 73, 0.8) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.dark .ls-block:has(.ltt-summary-page) .ls-block[level="4"] th {
  background: rgba(96, 165, 250, 0.15) !important;
}

/* 响应式布局 */
@media (max-width: 900px) {
  .ls-block:has(.ltt-summary-page) .ls-block[level="4"] {
    width: calc(50% - 16px) !important;
  }
  
  .ls-block:has(.ltt-summary-page) .ls-block[level="3"] {
    width: calc(100% - 16px) !important;
  }
}

@media (max-width: 500px) {
  .ls-block:has(.ltt-summary-page) .ls-block[level="4"] {
    width: calc(100% - 16px) !important;
  }
}
```

### 5.2 CSS 选择器策略说明

| 选择器模式 | 说明 | 示例 |
|-----------|------|------|
| `.ls-block:has(.ltt-summary-page)` | 选择包含 .ltt-summary-page 的块及其子块 | `.ls-block:has(.ltt-summary-page) .ls-block[level="4"]` |
| `.ls-block[level="x"]` | 根据层级选择块 | `.ls-block[level="4"]` 选择 KPI 卡片 |
| `.dark .ls-block:has(...)` | 暗色主题下的样式 | `.dark .ls-block:has(.ltt-summary-page) .ls-block[level="4"]` |

**选择器优先级策略：**
- 使用 `:has()` 伪类限定范围，仅影响包含 `.ltt-summary-page` 的页面
- 使用 `!important` 确保样式优先级足够高，能覆盖 Logseq 默认样式
- 通过层级选择器 `.ls-block[level="x"]` 精确控制不同层级的块样式

### 5.3 CSSRegistry 集成（type: 'both'

使用现有 CSSRegistry 机制注入 summary.css，type 使用 'both' 模式：

```typescript
// src/lib/summary/register.ts
import summaryCSSRaw from '../../components/Summary/summary.css?raw';

export function registerSummaryCSS() {
  registerCSS('summary', {
    type: 'both',
    inlineContent: summaryCSSRaw,
    externalPath: 'summary.css'
  });
}
```

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

### 6.3 示例模版：GTD 工作回顾

```typescript
// src/lib/summary/templates/gtdWorkReview.ts
export class GTDWorkReviewTemplate implements SummaryTemplate {
  id = 'gtd-work-review';
  name = 'GTD 工作回顾';
  description = '基于 GTD 方法的工作回顾模版';
  supportedTypes = ['weekly', 'monthly'];

  render(data: SummaryData): BlockNode[] {
    return [
      {
        content: `[:div.ltt-summary-page "📊 工作回顾 - ${this.formatDateRange(data.dateRange)}"]`,
        children: [
          { 
            content: '## 📈 数据概览',
            children: [
              { content: '### 核心指标' },
              { content: `- 完成任务: ${data.tasks.completed} / ${data.tasks.total}` },
              { content: `- 创建块数: ${data.blocks.created}` },
              { content: `- 新增页面: ${data.pages.newPages}` },
              { content: `- 任务完成率: ${data.tasks.completionRate}%` },
            ]
          },
          {
            content: '## 📈 工作热力图',
            children: [
              { content: '{{renderer :heatmap :week :tag=work}}' }
            ]
          },
          {
            content: '## ✅ 任务回顾',
            children: [
              { content: '### 完成任务清单' },
              // ... 任务数据
            ]
          },
          {
            content: '## 📝 内容分析',
            children: [
              { content: '### 热门标签' },
              // ... 标签数据
            ]
          },
          {
            content: '## 🤖 AI 分析建议',
            children: [
              // AI 分析内容
            ]
          },
        ]
      }
    ];
  }

  private formatDateRange(range: DateRange): string {
    return `${range.start.toLocaleDateString()} - ${range.end.toLocaleDateString()}`;
  }
}
```

---

## 7. 实现阶段规划

### Phase 1: 核心功能（MVP

**目标**: 最小可用产品，验证核心价值

- [ ] 基础架构搭建
- [ ] 数据查询服务（Block、Task、Page
- [ ] 2 个预置模版（GTD 工作回顾、极简数据看板
- [ ] BlockNode 树结构与逐块插入
- [ ] 基础 CSS 样式
- [ ] 配置弹窗
- [ ] 斜杠命令注册
- [ ] CSSRegistry 集成（type: 'both'

### Phase 2: 功能扩展

**目标**: 丰富功能，提升用户体验

- [ ] Heatmap 组件嵌入
- [ ] 更多预置模版（OKR、学习追踪等
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

```
{{renderer :heatmap :week :tag=work}}
```

### 8.2 initializer.ts 集成

在 `src/initializer.ts` 中添加：

```typescript
import { registerSummary } from './lib/summary/register';

export function registerAllCSS(): void {
  // ... 现有注册
  registerSummaryCSS();
}

export async function initializeComponent(): Promise<void> {
  // ... 现有初始化
  await initSummary();
}
```

### 8.3 main.tsx 集成

在 `src/main.tsx` 中添加：

```typescript
import {
  // ... 现有导入
  initSummary,
} from './initializer';

export async function initializeComponent(): Promise<void> {
  // ... 现有组件初始化
  await initSummary();
  logger.info('📋 Plugin: Summary ready');
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

### 9.2 settings/defaultSettings.ts 扩展

```typescript
// 在现有设置中添加
Summary: {
  enabled: true,
  defaultTemplate: 'gtd-work-review',
  defaultType: 'weekly',
  dateFormat: 'YYYY年第WW周',
  pageNameTemplate: '总结/{date}',
  ai: {
    enabled: false,
    provider: 'openai',
    apiKey: '',
    apiUrl: '',
    model: 'gpt-4',
    promptTemplate: '',
  }
}
```

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
查询数据 → 分析数据 → 渲染模版 → 生成 BlockNode 树
    ↓
创建新的 Logseq 页面，逐块插入内容
    ↓
(可选) 调用 AI 生成分析建议
    ↓
完成！
```

---

## 11. 草稿图设计（渲染后可视化布局

```
┌─────────────────────────────────────────────────────────────────────┐
│  [:div.ltt-summary-page]                                           │
│  📊 周度总结 - 2026年第19周 (5月5日-5月11日)                        │
├─────────────────────────────────────────────────────────────────────┤
│  📈 数据概览                                                        │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 创建块数  │  │ 完成任务  │  │ 活跃天数  │  │ 新增页面  │          │
│  │   156    │  │  28/35   │  │   6/7    │  │   12     │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│  (level 4 块 → KPI 卡片样式)                                         │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  📈 活跃度热力图                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  {{renderer :heatmap :week :tag=work}}                        │  │
│  │  [Heatmap 组件，显示工作相关的热力图]                           │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  ✅ 任务回顾 (level 3 块 → 卡片样式)                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  ### 完成任务清单                                           │  │
│  │  - [x] 完成项目A设计                                        │  │
│  │  - [x] 代码评审                                             │  │
│  │  - [x] 团队周会                                             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  ### 任务统计                                               │  │
│  │  | 状态 | 数量 |                                           │  │
│  │  |------|------|                                           │  │
│  │  | 完成 | 28   |                                           │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  📝 内容分析 (level 3 块 → 卡片样式)                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  ### 热门标签                                               │  │
│  │  - [[工作]] (45)                                           │  │
│  │  - [[学习]] (28)                                           │  │
│  │  - [[项目A]] (22)                                          │  │
│  └─────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  ### 页面分布                                               │  │
│  │  - 工作笔记: 8页                                           │  │
│  │  - 学习笔记: 4页                                           │  │
│  │  - 会议记录: 3页                                           │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  🤖 AI 分析建议                                                     │
│  > [AI 生成的分析与建议，帮助用户提升效率]                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**样式应用说明：**
- `.ltt-summary-page` - 页面级限定，仅影响此页面
- `level 3` 块 → 卡片样式（圆角、阴影、内边距）
- `level 4` 块 → KPI 卡片样式（4列网格布局）
- 表格在 level 4 块内自动应用表格样式

---

## 12. 技术风险与应对

| 风险 | 影响 | 概率 | 应对策略 |
|-----|------|------|---------|
| Logseq Hiccup 语法限制 | 中 | 中 | 保持 Hiccup 使用最小化，仅用于 class 注入 |
| 大数据量查询性能 | 高 | 中 | 分页查询、缓存机制、性能优化 |
| AI API 调用失败 | 低 | 高 | 降级方案：仅生成统计数据，不依赖 AI |
| CSS 样式冲突 | 中 | 中 | 使用特定前缀选择器，高优先级 !important，type: 'both' 支持自定义 |

---

## 13. 相关文档

- [Architecture-Overview.md](../Architecture-Overview.md) - 整体架构
- [Heatmap-Design.md](../Heatmap-Design.md) - Heatmap 模块设计
- [DEVELOPMENT.md](../DEVELOPMENT.md) - 开发指南

---

**文档结束**

---
