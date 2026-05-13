# Block 视图渲染器设计方案

**版本**: v1.0
**日期**: 2026-05-13
**状态**: 设计中
**分支**: feature/block-view-renderer

---

## 1. 概述

Block 视图渲染器是一个创新的 Logseq 插件扩展功能，允许用户在同一页面内以多种视图（List、Table、Gallery、Board 等）展示和管理 block 内容，同时保持原生编辑体验。

### 1.1 核心价值

- **统一编辑体验**：在任意视图下都能保持 Logseq 原生的编辑能力
- **灵活的视图切换**：一键在不同视图间切换，数据结构不变
- **可扩展架构**：支持无限扩展新的视图类型
- **零污染**：视图样式完全隔离，不影响页面其他部分

### 1.2 功能列表

| 功能 | 说明 | 优先级 |
| :--- | :--- | :--- |
| 视图选择器 | Micro 风格的视图切换 UI | P0 |
| List 视图 | 默认的块列表视图 | P0 |
| Table 视图 | 表格形式的块展示 | P0 |
| Gallery 视图 | 卡片画廊视图 | P1 |
| Board 视图 | 看板视图 | P2 |

---

## 2. 问题分析

### 2.1 传统 `:has()` 选择器的缺陷

在 Logseq 等 Tree Editor 中使用 CSS `:has()` 选择器会遇到严重问题：

```css
.ls-block:has(.ltt-table)
```

当 `.ltt-table` 出现在深层级时：

```
level0
  level1
    level2
      ltt-table
```

`:has()` 会向上冒泡匹配：

- ✅ level2 block（正确）
- ❌ level1 block（错误 - 应该不匹配）
- ❌ level0 block（错误 - 应该不匹配）

导致：

- Grid 布局错位
- Sticky 定位错位
- Flatten children 污染
- Resize 句柄错位

### 2.2 正确方案：显式 Root Class

参考 Notion、Tana、Anytype 等产品的标准做法：

```css
/* ❌ 错误 - 会向上污染 */
.ls-block:has(.ltt-table)

/* ✅ 正确 - 显式标记 root */
.ltt-table-root
```

### 2.3 JS Root 标记机制

```javascript
(() => {
  function markRoots() {
    document
      .querySelectorAll('.ltt-table')
      .forEach(el => {
        const root = el.closest('.ls-block');
        if (!root) return;
        root.classList.add('ltt-table-root');
      });
  }
  
  markRoots();
  
  new MutationObserver(markRoots)
    .observe(document.body, {
      childList: true,
      subtree: true
    });
})();
```

---

## 3. 系统架构

### 3.1 整体架构图

```
┌─────────────────────────────────────────┐
│  Block View Renderer                    │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ View Selector (Micro UI)       │    │
│  │ [List] [Table] [Gallery] [...] │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ View Container                  │    │
│  │                                 │    │
│  │ ┌───────────────────────────┐  │    │
│  │ │ View Instance            │  │    │
│  │ │ (Scoped Styles)          │  │    │
│  │ └───────────────────────────┘  │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### 3.2 文件结构

```
src/
├── components/
│   └── BlockView/                      # 新增 Block 视图组件
│       ├── index.tsx                  # 主入口
│       ├── BlockViewRenderer.tsx       # 视图渲染器
│       ├── ViewSelector.tsx           # 视图选择器
│       ├── ViewContainer.tsx          # 视图容器
│       ├── views/
│       │   ├── ListView.tsx          # List 视图
│       │   ├── TableView.tsx         # Table 视图
│       │   ├── GalleryView.tsx       # Gallery 视图
│       │   └── BoardView.tsx         # Board 视图
│       └── blockView.css             # 主样式
│
├── lib/
│   └── blockView/                     # 核心逻辑
│       ├── ViewManager.ts             # 视图管理器
│       ├── ViewRegistry.ts            # 视图注册表
│       ├── ViewTypes.ts               # 类型定义
│       ├── RootMarker.ts              # Root 标记工具
│       └── css/
│           ├── listView.css           # List 样式
│           ├── tableView.css          # Table 样式
│           ├── galleryView.css        # Gallery 样式
│           └── boardView.css          # Board 样式
│
└── styles/
    └── blockView.css                  # CSS 注册入口
```

---

## 4. 核心设计

### 4.1 视图类型定义

```typescript
// src/lib/blockView/ViewTypes.ts

export type ViewType = 
  | 'list'      // 默认列表视图
  | 'table'     // 表格视图
  | 'gallery'   // 画廊视图
  | 'board';    // 看板视图

export interface ViewConfig {
  id: ViewType;
  name: string;
  icon: string;
  description: string;
  cssClass: string;
}

export interface BlockViewState {
  viewType: ViewType;
  rootBlockId: string;
  options: Record<string, any>;
}
```

### 4.2 视图注册表

```typescript
// src/lib/blockView/ViewRegistry.ts

import { ViewConfig, ViewType } from './ViewTypes';

export const VIEW_REGISTRY: Record<ViewType, ViewConfig> = {
  'list': {
    id: 'list',
    name: '列表',
    icon: '📋',
    description: '默认块列表视图',
    cssClass: 'ltt-list-view',
  },
  'table': {
    id: 'table',
    name: '表格',
    icon: '📊',
    description: '表格形式展示块',
    cssClass: 'ltt-table',
  },
  'gallery': {
    id: 'gallery',
    name: '画廊',
    icon: '🖼️',
    description: '卡片画廊展示',
    cssClass: 'ltt-gallery',
  },
  'board': {
    id: 'board',
    name: '看板',
    icon: '📌',
    description: '看板形式管理块',
    cssClass: 'ltt-board',
  },
};

export function getViewConfig(type: ViewType): ViewConfig | undefined {
  return VIEW_REGISTRY[type];
}

export function getAllViewConfigs(): ViewConfig[] {
  return Object.values(VIEW_REGISTRY);
}
```

### 4.3 视图管理器

```typescript
// src/lib/blockView/ViewManager.ts

import { ViewType, BlockViewState } from './ViewTypes';
import { VIEW_REGISTRY } from './ViewRegistry';
import { markViewRoot } from './RootMarker';
import logger from '../logger';

export class ViewManager {
  private static instance: ViewManager;
  
  private constructor() {}
  
  public static getInstance(): ViewManager {
    if (!ViewManager.instance) {
      ViewManager.instance = new ViewManager();
    }
    return ViewManager.instance;
  }
  
  /**
   * 切换 block 的视图类型
   */
  public async switchView(blockId: string, viewType: ViewType): Promise<void> {
    logger.info('[ViewManager] 切换视图', { blockId, viewType });
    
    const block = await this.getBlockElement(blockId);
    if (!block) {
      logger.error('[ViewManager] Block 不存在', { blockId });
      return;
    }
    
    // 移除旧视图样式
    this.removeAllViewClasses(block);
    
    // 添加新视图样式
    const config = VIEW_REGISTRY[viewType];
    block.classList.add(config.cssClass);
    block.classList.add(`${config.cssClass}-root`);
    
    // 标记 root
    markViewRoot(block, viewType);
    
    logger.info('[ViewManager] 视图切换成功', { blockId, viewType });
  }
  
  /**
   * 获取当前 block 的视图类型
   */
  public getCurrentView(blockId: string): ViewType | null {
    const block = this.getBlockElement(blockId);
    if (!block) return null;
    
    for (const [type, config] of Object.entries(VIEW_REGISTRY)) {
      if (block.classList.contains(config.cssClass)) {
        return type as ViewType;
      }
    }
    
    return null;
  }
  
  /**
   * 移除所有视图类
   */
  private removeAllViewClasses(block: Element): void {
    const classesToRemove: string[] = [];
    
    for (const config of Object.values(VIEW_REGISTRY)) {
      classesToRemove.push(config.cssClass);
      classesToRemove.push(`${config.cssClass}-root`);
    }
    
    block.classList.remove(...classesToRemove);
  }
  
  /**
   * 获取 block 元素
   */
  private async getBlockElement(blockId: string): Promise<Element | null> {
    // 简化实现，实际需要根据 Logseq API 获取
    return document.querySelector(`[data-block-id="${blockId}"]`);
  }
}
```

### 4.4 Root 标记工具

```typescript
// src/lib/blockView/RootMarker.ts

import { ViewType, VIEW_REGISTRY } from './ViewRegistry';
import logger from '../logger';

/**
 * 标记 block 为视图 root
 */
export function markViewRoot(block: Element, viewType: ViewType): void {
  const config = VIEW_REGISTRY[viewType];
  
  // 添加 root class
  block.classList.add(`${config.cssClass}-root`);
  
  // 移除其他视图的 root class
  for (const [type, cfg] of Object.entries(VIEW_REGISTRY)) {
    if (type !== viewType) {
      block.classList.remove(`${cfg.cssClass}-root`);
    }
  }
  
  logger.debug('[RootMarker] 标记视图 root', { 
    blockId: block.getAttribute('data-block-id'),
    viewType 
  });
}

/**
 * 初始化所有视图 root
 */
export function initializeViewRoots(): void {
  logger.debug('[RootMarker] 初始化视图 roots');
  
  for (const [type, config] of Object.entries(VIEW_REGISTRY)) {
    document.querySelectorAll(`.${config.cssClass}`).forEach(el => {
      const root = el.closest('.ls-block');
      if (root && !root.classList.contains(`${config.cssClass}-root`)) {
        root.classList.add(`${config.cssClass}-root`);
      }
    });
  }
}

/**
 * MutationObserver 监听器
 */
export function createViewRootObserver(): MutationObserver {
  return new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node instanceof Element) {
            // 检查新添加的元素
            for (const [type, config] of Object.entries(VIEW_REGISTRY)) {
              const viewElements = node.querySelectorAll(`.${config.cssClass}`);
              viewElements.forEach(el => {
                const root = el.closest('.ls-block');
                if (root && !root.classList.contains(`${config.cssClass}-root`)) {
                  root.classList.add(`${config.cssClass}-root`);
                }
              });
            }
          }
        });
      }
    }
  });
}
```

---

## 5. UI 组件设计

### 5.1 视图选择器 (ViewSelector)

```tsx
// src/components/BlockView/ViewSelector.tsx

import React from 'react';
import { ViewType, ViewConfig } from '../../lib/blockView/ViewTypes';
import { VIEW_REGISTRY, getAllViewConfigs } from '../../lib/blockView/ViewRegistry';
import { ViewManager } from '../../lib/blockView/ViewManager';
import './blockView.css';

interface ViewSelectorProps {
  blockId: string;
  currentView: ViewType;
  onViewChange: (viewType: ViewType) => void;
}

export const ViewSelector: React.FC<ViewSelectorProps> = ({
  blockId,
  currentView,
  onViewChange,
}) => {
  const views = getAllViewConfigs();
  
  const handleViewClick = (viewType: ViewType) => {
    if (viewType !== currentView) {
      onViewChange(viewType);
    }
  };
  
  return (
    <div className="ltt-view-selector">
      <div className="ltt-view-selector-content">
        {views.map((view) => (
          <button
            key={view.id}
            className={`ltt-view-btn ${currentView === view.id ? 'active' : ''}`}
            onClick={() => handleViewClick(view.id)}
            title={view.description}
          >
            <span className="ltt-view-icon">{view.icon}</span>
            <span className="ltt-view-name">{view.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
```

### 5.2 视图容器 (ViewContainer)

```tsx
// src/components/BlockView/ViewContainer.tsx

import React, { useState, useEffect } from 'react';
import { ViewType } from '../../lib/blockView/ViewTypes';
import { ViewManager } from '../../lib/blockView/ViewManager';
import { ViewSelector } from './ViewSelector';
import { ListView } from './views/ListView';
import { TableView } from './views/TableView';
import { GalleryView } from './views/GalleryView';
import { BoardView } from './views/BoardView';
import './blockView.css';

interface ViewContainerProps {
  blockId: string;
  children: React.ReactNode;
}

export const ViewContainer: React.FC<ViewContainerProps> = ({
  blockId,
  children,
}) => {
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const viewManager = ViewManager.getInstance();
  
  useEffect(() => {
    const savedView = viewManager.getCurrentView(blockId);
    if (savedView) {
      setCurrentView(savedView);
    }
  }, [blockId]);
  
  const handleViewChange = async (viewType: ViewType) => {
    await viewManager.switchView(blockId, viewType);
    setCurrentView(viewType);
  };
  
  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return <ListView blockId={blockId}>{children}</ListView>;
      case 'table':
        return <TableView blockId={blockId}>{children}</TableView>;
      case 'gallery':
        return <GalleryView blockId={blockId}>{children}</GalleryView>;
      case 'board':
        return <BoardView blockId={blockId}>{children}</BoardView>;
      default:
        return <ListView blockId={blockId}>{children}</ListView>;
    }
  };
  
  return (
    <div className="ltt-view-container">
      <ViewSelector
        blockId={blockId}
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      <div className="ltt-view-content">
        {renderCurrentView()}
      </div>
    </div>
  );
};
```

---

## 6. CSS 架构

### 6.1 CSS 选择器策略

采用 **显式 Root Class** 策略，完全避免 `:has()` 污染：

```css
/* ❌ 错误 - :has() 会向上冒泡 */
.ls-block:has(.ltt-table)

/* ✅ 正确 - 显式 root class */
.ltt-table-root {
  /* Table root 样式 */
}

.ltt-table-root > .block-children-container {
  /* Table container */
}

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
  /* Table row */
}

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
  /* Table cell */
}
```

### 6.2 样式隔离原则

1. **Root 隔离**：每个视图的根 block 都有独立的 root class
2. **选择器作用域**：所有选择器都从 root class 开始
3. **不污染祖先**：样式不会影响 root 的祖先元素
4. **不污染兄弟**：样式不会影响 root 的兄弟元素
5. **只影响后代**：样式只会影响 root 下的后代元素

### 6.3 Table 视图 CSS（核心实现）

```css
/* src/lib/blockView/css/tableView.css */

/* =========================================================
   TABLE VIEW - 核心实现
   使用 .ltt-table-root 策略，避免 :has() 污染
========================================================= */

/* =========================================================
   ROOT TOKENS
========================================================= */

.ltt-table-root {
  --ltt-border: rgba(0,0,0,.065);
  --ltt-border-strong: rgba(0,0,0,.1);
  --ltt-hover: rgba(0,0,0,.022);
  --ltt-header-bg: linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.035));
  --ltt-cell-bg: rgba(255,255,255,.55);
  --ltt-radius: 14px;
  --ltt-shadow: 0 1px 2px rgba(0,0,0,.03), 0 8px 24px rgba(0,0,0,.035);
  --ltt-header-shadow: inset -1px 0 0 rgba(255,255,255,.25);
  --ltt-col-1-width: 260px;
  
  margin: 26px 32px !important;
}

/* =========================================================
   DARK MODE
========================================================= */

.dark .ltt-table-root {
  --ltt-border: rgba(255,255,255,.075);
  --ltt-border-strong: rgba(255,255,255,.12);
  --ltt-hover: rgba(255,255,255,.03);
  --ltt-header-bg: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.045));
  --ltt-cell-bg: rgba(255,255,255,.015);
  --ltt-shadow: 0 1px 2px rgba(0,0,0,.35), 0 10px 30px rgba(0,0,0,.28);
  --ltt-header-shadow: inset -1px 0 0 rgba(255,255,255,.05);
}

/* =========================================================
   TABLE SHELL
========================================================= */

.ltt-table-root > .block-children-container {
  border: 1px solid var(--ltt-border);
  border-radius: var(--ltt-radius);
  overflow-x: auto;
  overflow-y: hidden;
  background: linear-gradient(180deg, rgba(255,255,255,.02), transparent);
  backdrop-filter: blur(10px);
  box-shadow: var(--ltt-shadow);
  position: relative;
  padding: 0 !important;
}

/* =========================================================
   ROW (第一层子 block)
========================================================= */

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
  display: grid !important;
  grid-template-columns: var(--ltt-col-1-width) repeat(999, minmax(220px,1fr));
  align-items: stretch;
  min-width: fit-content;
  position: relative;
  transition: background .12s ease;
}

/* row separator */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: var(--ltt-border);
  pointer-events: none;
}

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block:last-child::after {
  display: none;
}

/* hover */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block:hover {
  background: var(--ltt-hover);
}

/* =========================================================
   FIRST COLUMN (第一列表头)
========================================================= */

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container {
  display: block !important;
  min-height: 58px;
  padding: 14px 18px !important;
  margin: 0 !important;
  position: sticky;
  left: 0;
  z-index: 20;
  width: var(--ltt-col-1-width);
  min-width: var(--ltt-col-1-width);
  background: var(--ltt-header-bg);
  border-right: 1px solid var(--ltt-border);
  box-shadow: var(--ltt-header-shadow);
  font-weight: 600;
  backdrop-filter: blur(18px);
  overflow: visible;
}

/* =========================================================
   CELL (除第一列外的其他列)
========================================================= */

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
  display: block !important;
  min-height: 58px;
  padding: 14px 22px !important;
  margin: 0 !important;
  border-right: 1px solid var(--ltt-border);
  background: var(--ltt-cell-bg);
  box-sizing: border-box;
  overflow: visible;
  transition: background .12s ease;
}

/* last column */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block:last-child {
  border-right: none;
}

/* hover */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block:hover {
  background: rgba(127,127,127,.03);
}

/* =========================================================
   CELL CONTENT
========================================================= */

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block .block-content-wrapper {
  width: 100% !important;
  overflow: visible !important;
}

/* =========================================================
   BULLETS
========================================================= */

/* hide row bullets */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container .block-control-wrap {
  display: none !important;
}

/* restore bullets in cells */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block .block-control-wrap {
  display: flex !important;
  opacity: .72;
  transition: opacity .12s ease;
}

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block:hover .block-control-wrap {
  opacity: 1;
}

/* =========================================================
   MOBILE RESPONSIVE
========================================================= */

@media (max-width: 900px) {
  .ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
    grid-template-columns: 1fr;
  }
  
  .ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container {
    position: relative;
    width: 100%;
    min-width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--ltt-border);
  }
  
  .ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
    border-right: none;
    border-bottom: 1px solid var(--ltt-border);
    min-width: 100%;
  }
  
  .ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block:last-child {
    border-bottom: none;
  }
}
```

### 6.4 List 视图 CSS

```css
/* src/lib/blockView/css/listView.css */

/* =========================================================
   LIST VIEW - 继承默认样式，仅做微调
========================================================= */

.ltt-list-view-root {
  /* List 视图保持默认样式 */
  /* 仅添加视图切换动画 */
  transition: all 0.3s ease;
}

/* 视图切换动画 */
.ltt-list-view-root {
  animation: listViewFadeIn 0.3s ease;
}

@keyframes listViewFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 6.5 Gallery 视图 CSS

```css
/* src/lib/blockView/css/galleryView.css */

/* =========================================================
   GALLERY VIEW - 卡片画廊视图
========================================================= */

.ltt-gallery-root > .block-children-container > .block-children > .blocks-list-wrap {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px !important;
}

.ltt-gallery-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
  display: flex !important;
  flex-direction: column;
  background: var(--ls-secondary-background-color);
  border: 1px solid var(--ls-border-color);
  border-radius: 12px;
  padding: 16px !important;
  margin: 0 !important;
  transition: all 0.2s ease;
}

.ltt-gallery-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.ltt-gallery-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container {
  display: block !important;
  margin-bottom: 12px !important;
}

.ltt-gallery-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container {
  flex: 1;
  padding-left: 1.2em !important;
}
```

### 6.6 Board 视图 CSS

```css
/* src/lib/blockView/css/boardView.css */

/* =========================================================
   BOARD VIEW - 看板视图
========================================================= */

.ltt-board-root > .block-children-container > .block-children > .blocks-list-wrap {
  display: flex !important;
  gap: 20px;
  padding: 20px !important;
  overflow-x: auto;
}

.ltt-board-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
  display: flex !important;
  flex-direction: column;
  min-width: 300px;
  max-width: 300px;
  background: var(--ls-secondary-background-color);
  border-radius: 12px;
  padding: 12px !important;
  margin: 0 !important;
}

.ltt-board-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container {
  display: block !important;
  margin-bottom: 8px !important;
  font-weight: 600;
}

.ltt-board-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container {
  display: flex !important;
  flex-direction: column;
  gap: 8px;
  padding-left: 0 !important;
}

.ltt-board-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
  background: var(--ls-primary-background-color);
  border: 1px solid var(--ls-border-color);
  border-radius: 8px;
  padding: 12px !important;
  margin: 0 !important;
}
```

---

## 7. 视图选择器样式

### 7.1 ViewSelector CSS

```css
/* src/components/BlockView/blockView.css */

/* =========================================================
   VIEW SELECTOR - Micro 风格
========================================================= */

.ltt-view-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--ls-secondary-background-color);
  border-radius: 8px;
  border: 1px solid var(--ls-border-color);
}

.ltt-view-selector-content {
  display: flex;
  gap: 4px;
}

.ltt-view-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--ls-secondary-text-color);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ltt-view-btn:hover {
  background: var(--ls-hover-color);
  color: var(--ls-primary-text-color);
}

.ltt-view-btn.active {
  background: var(--ls-primary-color);
  color: white;
  font-weight: 600;
}

.ltt-view-icon {
  font-size: 14px;
}

.ltt-view-name {
  font-size: 13px;
}

/* =========================================================
   VIEW CONTAINER
========================================================= */

.ltt-view-container {
  margin: 16px 0;
}

.ltt-view-content {
  margin-top: 12px;
}
```

---

## 8. 集成方案

### 8.1 插件初始化

```typescript
// src/initializer.ts

import { initializeViewRoots, createViewRootObserver } from './lib/blockView/RootMarker';

export async function initializePlugin() {
  // ... 其他初始化
  
  // Block View 初始化
  initializeViewRoots();
  
  // 启动 MutationObserver
  const observer = createViewRootObserver();
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // 注册 CSS
  registerCSS([
    'blockView.css',
    'listView.css',
    'tableView.css',
    'galleryView.css',
    'boardView.css',
  ]);
}
```

### 8.2 斜杠命令集成

```typescript
// 注册斜杠命令
logseq.Editor.registerSlashCommand('view-table', async (block) => {
  await ViewManager.getInstance().switchView(block.uuid, 'table');
});

logseq.Editor.registerSlashCommand('view-gallery', async (block) => {
  await ViewManager.getInstance().switchView(block.uuid, 'gallery');
});

logseq.Editor.registerSlashCommand('view-board', async (block) => {
  await ViewManager.getInstance().switchView(block.uuid, 'board');
});

logseq.Editor.registerSlashCommand('view-list', async (block) => {
  await ViewManager.getInstance().switchView(block.uuid, 'list');
});
```

### 8.3 右键菜单集成

```typescript
// 右键菜单添加视图切换选项
logseq.App.registerContextMenuItem(
  '切换视图',
  [
    { label: '📋 列表视图', action: 'view-list' },
    { label: '📊 表格视图', action: 'view-table' },
    { label: '🖼️ 画廊视图', action: 'view-gallery' },
    { label: '📌 看板视图', action: 'view-board' },
  ]
);
```

---

## 9. 实现计划

### 阶段一：核心框架 (P0)
- [ ] ViewTypes 类型定义
- [ ] ViewRegistry 视图注册表
- [ ] RootMarker 工具
- [ ] ViewManager 管理器
- [ ] 基础 CSS 架构

### 阶段二：Table 视图 (P0)
- [ ] TableView 组件
- [ ] tableView.css 实现
- [ ] 完整功能测试

### 阶段三：视图选择器 (P0)
- [ ] ViewSelector 组件
- [ ] ViewContainer 组件
- [ ] 样式完善

### 阶段四：List 视图 (P1)
- [ ] ListView 组件
- [ ] listView.css 实现

### 阶段五：Gallery 视图 (P1)
- [ ] GalleryView 组件
- [ ] galleryView.css 实现

### 阶段六：Board 视图 (P2)
- [ ] BoardView 组件
- [ ] boardView.css 实现

### 阶段七：集成与优化 (P1)
- [ ] 斜杠命令集成
- [ ] 右键菜单集成
- [ ] 性能优化
- [ ] 文档完善

---

## 10. 测试计划

### 10.1 功能测试

| 测试项 | 说明 | 优先级 |
| :--- | :--- | :--- |
| 视图切换 | 点击切换不同视图 | P0 |
| Table 列对齐 | 多列表格列对齐 | P0 |
| Sticky 定位 | 横向滚动时第一列固定 | P0 |
| 编辑体验 | 各视图下的编辑操作 | P0 |
| 样式隔离 | 不影响页面其他部分 | P0 |

### 10.2 兼容性测试

| 环境 | 测试项 | 优先级 |
| :--- | :--- | :--- |
| 深色模式 | Dark mode 样式 | P0 |
| 移动端 | Responsive 布局 | P1 |
| 层级嵌套 | 不同深度 block | P0 |
| 长内容 | 内容溢出处理 | P1 |

---

## 11. 风险评估

| 风险 | 可能性 | 影响 | 缓解措施 |
| :--- | :--- | :--- | :--- |
| Logseq DOM 结构变更 | 低 | 高 | 保持 CSS 选择器灵活 |
| 性能问题 | 中 | 中 | 使用 CSS 变量，减少 JS 计算 |
| 样式冲突 | 低 | 中 | 使用唯一前缀 `ltt-` |
| :has() 兼容性 | 高 | 高 | 已采用显式 root class 策略 |

---

## 12. 附录

### A. CSS 变量表

| 变量 | 默认值 | 说明 |
| :--- | :--- | :--- |
| `--ltt-border` | rgba(0,0,0,.065) | 边框颜色 |
| `--ltt-border-strong` | rgba(0,0,0,.1) | 强边框 |
| `--ltt-hover` | rgba(0,0,0,.022) | 悬停背景 |
| `--ltt-header-bg` | gradient | 表头背景 |
| `--ltt-cell-bg` | rgba(255,255,255,.55) | 单元格背景 |
| `--ltt-radius` | 14px | 圆角 |
| `--ltt-shadow` | shadow | 阴影 |
| `--ltt-col-1-width` | 260px | 第一列宽度 |

### B. 术语表

| 术语 | 说明 |
| :--- | :--- |
| Root Class | 视图根元素的 class |
| View Root | 包含 `.ltt-[view]-root` class 的 block |
| Row | Table 中的第一层子 block |
| Cell | Table 中的第二层子 block |

---

**文档结束**
