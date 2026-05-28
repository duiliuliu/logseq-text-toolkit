# Text Toolkit 整体架构文档

## 1. 概述

本文档描述了 Text Toolkit Logseq 插件的完整技术架构，包括项目整体架构、模块架构和设计规范。

### 1.1 项目组成

Text Toolkit 是一个功能丰富的 Logseq 插件，提供以下核心功能模块：

| 模块 | 说明 | 状态 |
| :--- | :--- | :--- |
| Toolbar | 工具栏功能 | ✅ 已实现 |
| Comment | 内联评论功能 | ✅ 已实现 |
| TaskProgress | 任务进度追踪 | ✅ 已实现 |
| Heatmap | 数据热力图 | ✅ 已实现 |
| Summary | 总结报告生成 | ✅ 已实现 |
| BlockView | Block 视图渲染器 | ✅ 已实现 |

---

## 2. 项目整体架构

### 2.1 目录结构

```
Text Toolkit Plugin (项目根目录)
├── src/
│   ├── components/                     # React 组件
│   │   ├── BlockView/                (已实现 - Block视图渲染)
│   │   │   ├── index.ts
│   │   │   ├── mindMapView.css
│   │   │   ├── galleryView.css
│   │   │   ├── boardView.css
│   │   │   ├── tableView.css
│   │   │   └── listView.css
│   │   ├── Comment/                   (已实现 - 评论功能)
│   │   ├── CustomSelect/              (已实现)
│   │   ├── Heatmap/                   (已实现 - 热力图组件)
│   │   │   ├── Heatmap.tsx
│   │   │   ├── YearView.tsx
│   │   │   ├── MonthView.tsx
│   │   │   ├── WeekView.tsx
│   │   │   ├── HeatmapCell.tsx
│   │   │   ├── Statistics.tsx
│   │   │   └── heatmap.css
│   │   ├── Modal/                     (已实现)
│   │   ├── SelectToolbar/             (已实现 - 选择工具栏)
│   │   ├── SettingsModal/             (已实现 - 设置面板)
│   │   │   └── tabs/
│   │   │       ├── GeneralSettings.tsx
│   │   │       ├── ToolbarSettings.tsx
│   │   │       ├── AdvancedSettings.tsx
│   │   │       ├── TaskProgressSettings.tsx
│   │   │       ├── HeatmapSettings.tsx
│   │   │       ├── BlockViewSettings.tsx
│   │   │       └── SummarySettings.tsx
│   │   ├── Summary/                   (已实现 - 总结报告组件)
│   │   ├── TaskProgress/              (已实现 - 任务进度组件)
│   │   │   ├── TaskProgress.tsx
│   │   │   ├── MiniCircleProgress.tsx
│   │   │   ├── DotMatrixProgress.tsx
│   │   │   ├── StatusCursorProgress.tsx
│   │   │   ├── ProgressCapsule.tsx
│   │   │   ├── StepProgress.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Fireworks.tsx
│   │   │   └── taskProgress.css
│   │   ├── Toast/                     (已实现)
│   │   ├── Toolbar/                   (已实现 - 工具栏)
│   │   ├── ToolbarItem/               (已实现)
│   │   └── ui/                        (已实现 - UI 组件库)
│   │
│   ├── lib/                           # 核心业务逻辑
│   │   ├── logger/                    (已实现 - 日志模块)
│   │   │   ├── logger.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── textReplace/               (已实现 - 文本替换)
│   │   │   └── utils.ts
│   │   ├── toolbar/                   (已实现 - 工具栏逻辑)
│   │   │   ├── ToolbarManager.ts
│   │   │   ├── ActionExecutor.ts
│   │   │   ├── ExecutorRegistry.ts
│   │   │   ├── EventBus.ts
│   │   │   ├── ConfigParser.ts
│   │   │   ├── types.ts
│   │   │   └── executors/
│   │   │       ├── TextProcessorExecutor.ts
│   │   │       ├── CommentExecutor.ts
│   │   │       └── ExternalPluginExecutor.ts
│   │   ├── taskProgress/              (已实现 - 任务进度逻辑)
│   │   ├── heatmap/                   (已实现 - 热力图逻辑)
│   │   │   ├── register.ts
│   │   │   ├── query.ts
│   │   │   ├── colorCalculator.ts
│   │   │   ├── pageUtils.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── blockView/                 (已实现 - Block视图逻辑)
│   │   │   ├── register.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── summary/                   (已实现 - 总结逻辑)
│   │   │   ├── register.ts
│   │   │   ├── types.ts
│   │   │   ├── DataAnalyzer.ts
│   │   │   ├── PageGenerator.ts
│   │   │   ├── query.ts
│   │   │   └── templates/
│   │   │       ├── gtdWorkReview.ts
│   │   │       ├── minimalDashboard.ts
│   │   │       ├── okrReview.ts
│   │   │       ├── bulletJournal.ts
│   │   │       └── studySummary.ts
│   │   ├── render/                    (已实现 - 渲染器工具)
│   │   │   ├── rendererArgs.ts
│   │   │   ├── utils.tsx
│   │   │   └── index.tsx
│   │   ├── cssRegistry/               (已实现 - CSS 管理)
│   │   │   └── index.ts
│   │   └── dateUtils/                 (已实现 - 日期工具)
│   │       └── index.ts
│   │
│   ├── logseq/                        # Logseq API 封装
│   │   ├── index.ts                   (API 入口)
│   │   ├── editor.ts                  (Editor API)
│   │   ├── app.ts                     (App API)
│   │   ├── ui.ts                      (UI API)
│   │   ├── logger.ts                   (Logger API)
│   │   ├── utils.ts                   (工具函数)
│   │   └── proxy.ts                   (代理配置)
│   │
│   ├── settings/                      # 设置管理
│   │   ├── index.ts
│   │   ├── types.ts                   (类型定义)
│   │   ├── defaultSettings.ts
│   │   ├── defaultSettings.json
│   │   └── useSettings.tsx            (设置上下文)
│   │
│   ├── translations/                  # 国际化
│   │   ├── translations.ts
│   │   ├── i18n.ts
│   │   ├── zh-CN.json
│   │   ├── en.json
│   │   └── ja.json
│   │
│   ├── test/                          # 测试模块 (开发用)
│   │   ├── testAPP.tsx
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── App.tsx                        (主应用组件)
│   ├── main.tsx                       (入口文件)
│   └── main.css                       (全局样式)
│
├── docs/                              # 文档目录
│   ├── Architecture-Overview.md       (本文档 - 整体架构)
│   ├── Task-Progress-Tracking-Design.md
│   ├── Heatmap-Design.md
│   ├── Toolbar-Configuration-Design.md
│   ├── optimise/                     (优化文档)
│   │   ├── 优化方案总结.md
│   │   └── 代码分析报告.md
│   └── CHANGELOG_*.md
│
├── vitest.config.ts                   (测试配置)
├── package.json
├── tsconfig.json
├── vite.config.js
└── manifest.json
```

### 2.2 模块状态标识

- ✅ 已实现：现有功能模块
- ⏳ 设计中：正在设计中的模块
- ❌ 未实现：计划但尚未实现的模块

---

## 3. 核心架构图

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          Text Toolkit Plugin                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                              main.tsx (入口)                               │   │
│  │  ┌───────────────────────────────────────────────────────────────────┐ │   │
│  │  │  1. 加载 CSS (lib/cssRegistry)                                   │ │   │
│  │  │  2. 初始化 i18n (translations/)                                  │ │   │
│  │  │  3. 加载设置 (settings/)                                          │ │   │
│  │  │  4. 注册工具栏模块 (lib/toolbar)                                   │ │   │
│  │  │  5. 注册任务进度模块 (lib/taskProgress)                            │ │   │
│  │  │  6. 注册热力图模块 (lib/heatmap)                                   │ │   │
│  │  │  7. 注册总结模块 (lib/summary)                                     │ │   │
│  │  │  8. 注册 BlockView 模块 (lib/blockView)                            │ │   │
│  │  └───────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Toolbar Module (✅ 已实现)                            │   │
│  │  ┌────────────────────┐ ┌────────────────────┐ ┌──────────────────┐   │   │
│  │  │ ToolbarManager     │ │ ActionExecutor     │ │ ExecutorRegistry  │   │   │
│  │  │ 工具栏管理器        │ │ 动作执行器          │ │ 执行器注册表      │   │   │
│  │  └────────────────────┘ └────────────────────┘ └──────────────────┘   │   │
│  │  ┌────────────────────┐ ┌────────────────────┐                         │   │
│  │  │ ConfigParser       │ │ EventBus           │                         │   │
│  │  │ 配置解析器          │ │ 事件总线            │                         │   │   │
│  │  └────────────────────┘ └────────────────────┘                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    TaskProgress Module (✅ 已实现)                           │   │
│  │  ┌────────────────────┐ ┌────────────────────┐                         │   │
│  │  │ TaskQuery         │ │ StatsCalculator     │                         │   │
│  │  │ 任务查询服务        │ │ 统计计算服务        │                         │   │
│  │  └────────────────────┘ └────────────────────┘                         │   │
│  │  ┌────────────────────────────────────────────────────────────────┐    │   │
│  │  │ UI Components: MiniCircle | DotMatrix | StatusCursor | Capsule    │    │   │
│  │  │                  Step | Fireworks | Tooltip                     │    │   │
│  │  └────────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       Heatmap Module (✅ 已实现)                             │   │
│  │  ┌────────────────────┐ ┌────────────────────┐ ┌──────────────────┐   │   │
│  │  │ HeatmapQuery       │ │ ColorCalculator    │ │ PageUtils       │   │   │
│  │  │ 数据查询            │ │ 颜色计算            │ │ 页面工具         │   │   │
│  │  └────────────────────┘ └────────────────────┘ └──────────────────┘   │   │
│  │  ┌────────────────────────────────────────────────────────────────┐    │   │
│  │  │ UI Components: YearView | MonthView | WeekView | HeatmapCell    │    │   │
│  │  │                  Statistics                                     │    │   │
│  │  └────────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       Summary Module (✅ 已实现)                             │   │
│  │  ┌────────────────────┐ ┌────────────────────┐ ┌──────────────────┐   │   │
│  │  │ DataAnalyzer      │ │ PageGenerator     │ │ Query           │   │   │
│  │  │ 数据分析器         │ │ 页面生成器         │ │ 查询服务         │   │   │
│  │  └────────────────────┘ └────────────────────┘ └──────────────────┘   │   │
│  │  ┌────────────────────────────────────────────────────────────────┐    │   │
│  │  │ Templates: GTDWorkReview | MinimalDashboard | OKRReview        │    │   │
│  │  │           BulletJournal | StudySummary                          │    │   │
│  │  └────────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       BlockView Module (✅ 已实现)                          │   │
│  │  ┌────────────────────┐ ┌────────────────────┐                         │   │
│  │  │ BlockViewManager   │ │ ViewRegistry        │                         │   │
│  │  │ 视图管理器         │ │ 视图注册表          │                         │   │
│  │  └────────────────────┘ └────────────────────┘                         │   │
│  │  ┌────────────────────────────────────────────────────────────────┐    │   │
│  │  │ View Types: List | Table | Gallery | Board | MindMap           │    │   │
│  │  └────────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                           Logseq API Wrapper                                     │
│  ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────────────┐ │
│  │ Editor API         │ │ App API           │ │ DB API                    │ │
│  │ - getBlock()       │ │ - queryElement()  │ │ - datascriptQuery()      │ │
│  │ - getCurrentBlock()│ │ - provideUI()     │ │ - getBlockProperties()    │ │
│  │ - insertAtEditing()│ │ - provideStyle() │ │                           │ │
│  └────────────────────┘ └────────────────────┘ └────────────────────────────┘ │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                          Settings Layer                                  │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │   │
│  │  │ SettingsContext | useSettings() | defaultSettings.json           │  │   │
│  │  └──────────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 测试架构

### 4.1 测试文件结构

```
src/
├── lib/
│   ├── textReplace/
│   │   └── utils.test.ts           # 文本替换测试
│   ├── render/
│   │   └── rendererArgs.test.ts    # 渲染参数测试
│   ├── dateUtils/
│   │   └── dateUtils.test.ts      # 日期工具测试
│   ├── logger/
│   │   └── logger.test.ts         # 日志模块测试
│   ├── toolbar/
│   │   ├── EventBus.test.ts       # 事件总线测试
│   │   └── ConfigParser.test.ts    # 配置解析测试
│   ├── heatmap/
│   │   └── colorCalculator.test.ts  # 颜色计算测试
│   └── cssRegistry/
│       └── cssRegistry.test.ts     # CSS注册测试
```

### 4.2 测试框架配置

**配置文件**: `vitest.config.ts`

**测试命令**:
```bash
npm run test           # 运行所有测试
npm run test:watch     # 监听模式
npm run test:ui        # 可视化测试界面
npm run test:coverage  # 覆盖率报告
```

### 4.3 测试覆盖情况

| 模块 | 测试文件 | 状态 |
|------|---------|------|
| textReplace | [utils.test.ts](file:///workspace/src/lib/textReplace/utils.test.ts) | ✅ 完整 |
| render | [rendererArgs.test.ts](file:///workspace/src/lib/render/rendererArgs.test.ts) | ✅ 完整 |
| dateUtils | [dateUtils.test.ts](file:///workspace/src/lib/dateUtils/dateUtils.test.ts) | ✅ 完整 |
| logger | [logger.test.ts](file:///workspace/src/lib/logger/logger.test.ts) | ✅ 完整 |
| toolbar | [EventBus.test.ts](file:///workspace/src/lib/toolbar/EventBus.test.ts) | ✅ 完整 |
| toolbar | [ConfigParser.test.ts](file:///workspace/src/lib/toolbar/ConfigParser.test.ts) | ✅ 完整 |
| heatmap | [colorCalculator.test.ts](file:///workspace/src/lib/heatmap/colorCalculator.test.ts) | ✅ 完整 |
| cssRegistry | [cssRegistry.test.ts](file:///workspace/src/lib/cssRegistry/cssRegistry.test.ts) | ✅ 完整 |

---

## 5. 模块详细架构

### 5.1 Toolbar 模块架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      Toolbar 模块架构                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 应用层 (Application Layer)                                │   │
│  │ ┌──────────────────────────────────────────────────────┐ │   │
│  │ │ Toolbar Components                                    │ │   │
│  │ │ ┌────────────────┐ ┌────────────────┐               │ │   │
│  │ │ │ Toolbar        │ │ ToolbarItem    │               │ │   │
│  │ │ │ (工具栏主组件)  │ │ (工具栏项)      │               │ │   │
│  │ │ └────────────────┘ └────────────────┘               │ │   │
│  │ │ ┌────────────────┐ ┌────────────────┐               │ │   │
│  │ │ │ SelectToolbar  │ │ CustomSelect   │               │ │   │
│  │ │ └────────────────┘ └────────────────┘               │ │   │
│  │ └──────────────────────────────────────────────────────┘ │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         │                                        │
├─────────────────────────┼───────────────────────────────────────┤
│ 业务逻辑层 (Business Logic Layer)                               │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ ToolbarManager                                              │  │
│ │ ┌──────────────────────┐ ┌──────────────────────┐        │  │
│ │ │ ActionExecutor       │ │ ExecutorRegistry    │        │  │
│ │ │ (动作执行器)           │ │ (执行器注册表)        │        │  │
│ │ └──────────────────────┘ └──────────────────────┘        │  │
│ │ ┌──────────────────────┐ ┌──────────────────────┐        │  │
│ │ │ ConfigParser        │ │ EventBus            │        │  │
│ │ │ (配置解析器)          │ │ (事件总线)            │        │  │
│ │ └──────────────────────┘ └──────────────────────┘        │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ 执行器类型                                                  │   │
│ │ ┌──────────────────┐ ┌──────────────────┐ ┌────────────┐  │   │
│ │ │ TextProcessor    │ │ CommentExecutor  │ │ External   │  │   │
│ │ │ (文本处理器)      │ │ (评论执行器)      │ │ (外部插件) │  │   │
│ │ └──────────────────┘ └──────────────────┘ └────────────┘  │   │
│ └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 BlockView 模块架构

```
┌─────────────────────────────────────────────────────────────────┐
│                     BlockView 模块架构                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 视图层 (View Layer)                                       │   │
│  │ ┌────────────────────────────────────────────────────┐ │   │
│  │ │ ViewSwitcher Bar (视图切换工具条)                      │ │   │
│  │ │ [List] [Table] [Gallery] [Board] [MindMap]         │ │   │
│  │ └────────────────────────────────────────────────────┘ │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         │                                        │
├─────────────────────────┼───────────────────────────────────────┤
│ 业务逻辑层 (Business Logic Layer)                               │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ BlockViewManager                                          │  │
│ │ ┌──────────────────────┐ ┌──────────────────────┐        │  │
│ │ │ ViewRegistry         │ │ MacroRenderer       │        │  │
│ │ │ (视图注册表)           │ │ (宏命令渲染器)         │        │  │
│ │ └──────────────────────┘ └──────────────────────┘        │  │
│ └────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│ 视图类型                                                      │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ List   - 默认块列表视图                                     │  │
│ │ Table  - 表格视图（支持列宽调整）                           │  │
│ │ Gallery - 卡片画廊视图                                     │  │
│ │ Board  - 看板视图                                         │  │
│ │ MindMap - 思维导图视图                                    │  │
│ └────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│ CSS 样式隔离                                                  │
│ ┌────────────────────────────────────────────────────────────┐  │
│ │ 显式 Root Class 策略 (ltt-[view]-root)                    │  │
│ │ - 不使用 :has() 选择器                                    │  │
│ │ - 样式完全隔离，不影响页面其他部分                         │  │
│ └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. API 设计

### 6.1 Logseq API Wrapper

**文件位置**: [src/logseq/index.ts](file:///workspace/src/logseq/index.ts)

### 6.2 模块注册接口

```typescript
// TaskProgress 注册
export function registerTaskProgress(): void;

// Heatmap 注册
export function registerHeatmap(): void;

// Toolbar 注册
export function registerToolbar(): void;

// Summary 注册
export function registerSummary(): void;

// BlockView 注册
export function registerBlockView(): void;
```

---

## 7. 设计原则

### 7.1 组件设计原则

1. **单一职责**: 每个组件只负责一个功能
2. **可复用性**: 组件应具有通用性，可在不同场景复用
3. **可测试性**: 组件应易于单元测试
4. **样式隔离**: 使用 CSS Modules 或样式前缀避免样式冲突

### 7.2 模块设计原则

1. **松耦合**: 模块之间通过接口通信，减少直接依赖
2. **可扩展**: 预留扩展点，便于后续功能添加
3. **配置化**: 功能通过配置控制，减少硬编码

### 7.3 测试原则

1. **单元测试**: 每个独立模块应有完整的单元测试
2. **覆盖率目标**:
   - 核心模块 (textReplace, rendererArgs): ≥ 90%
   - 工具模块 (logger, dateUtils, EventBus): ≥ 80%
   - 业务模块 (heatmap, blockView, toolbar): ≥ 70%

---

## 8. 相关文档

| 文档 | 说明 |
| :--- | :--- |
| [Task-Progress-Tracking-Design.md](file:///workspace/docs/Task-Progress-Tracking-Design.md) | 任务进度追踪模块详细设计 |
| [Heatmap-Design.md](file:///workspace/docs/Heatmap-Design.md) | 热力图组件详细设计 |
| [Toolbar-Configuration-Design.md](file:///workspace/docs/Toolbar-Configuration-Design.md) | 工具栏配置设计 |
| [优化方案总结.md](file:///workspace/docs/optimise/优化方案总结.md) | 优化方案和已完成改进 |
| [代码分析报告.md](file:///workspace/docs/optimise/代码分析报告.md) | 代码质量和性能分析 |

---

## 9. 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.1 | 2026-05-28 | 添加完整测试框架，更新架构文档 |
| v1.0 | 2026-05-14 | 初始架构文档 |

---

*文档版本: v1.1*
*最后更新: 2026-05-28*
