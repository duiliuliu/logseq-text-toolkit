# Block View Renderer 设计方案

**版本**: v2.0
**日期**: 2026-05-14
**状态**: 设计中
**分支**: trae/solo-agent-14EEAQ

---

## 1. 概述

Block 视图渲染器允许用户以多种视图（List、Table、Gallery、Board）展示 block 内容，保持原生编辑体验。

### 功能列表

| 功能 | 说明 | 优先级 |
| :--- | :--- | :--- |
| 视图切换Bar | Block上方显示视图选择器 | P0 |
| List 视图 | 默认块列表视图 | P0 |
| Table 视图 | 表格形式，支持列宽调整 | P0 |
| Gallery 视图 | 卡片画廊视图 | P1 |
| Board 视图 | 看板视图 | P2 |

---

## 2. 核心设计

### 2.1 视图切换 Bar

在 block 上方显示紧凑的视图切换工具条，不影响编辑体验：

```
┌─────────────────────────────────┐
│ [📋 List] [📊 Table] [🖼 Gallery] │
└─────────────────────────────────┘
```

#### SVG 图标定义

```typescript
const VIEW_ICONS: Record<ViewType, string> = {
  list: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round">
    <path d="M3 3.5h8"/><path d="M3 7h8"/><path d="M3 10.5h8"/>
    <circle cx="1.5" cy="3.5" r=".5" fill="currentColor" stroke="none"/>
    <circle cx="1.5" cy="7" r=".5" fill="currentColor" stroke="none"/>
    <circle cx="1.5" cy="10.5" r=".5" fill="currentColor" stroke="none"/>
  </svg>`,
  
  table: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1.5" y="2" width="11" height="10" rx="2"/>
    <path d="M5 2v10"/><path d="M1.5 5.5h11"/>
  </svg>`,
  
  gallery: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1.5" y="2" width="4" height="4" rx="1"/>
    <rect x="8.5" y="2" width="4" height="4" rx="1"/>
    <rect x="1.5" y="8" width="4" height="4" rx="1"/>
    <rect x="8.5" y="8" width="4" height="4" rx="1"/>
  </svg>`,
  
  board: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1.5" y="2" width="3" height="10" rx="1"/>
    <rect x="5.5" y="2" width="3" height="7" rx="1"/>
    <rect x="9.5" y="2" width="3" height="8" rx="1"/>
  </svg>`
};
```

#### 视图切换 Bar 样式

```css
.ltt-view-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  margin-bottom: 8px;
  background: var(--ls-secondary-background-color);
  border: 1px solid var(--ls-border-color);
  border-radius: 8px;
  font-size: 12px;
  width: fit-content;
}

.ltt-view-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--ls-secondary-text-color);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.ltt-view-btn:hover {
  background: var(--ls-hover-color);
  color: var(--ls-primary-text-color);
}

.ltt-view-btn.active {
  background: var(--ls-primary-color);
  color: white;
  font-weight: 500;
}

.ltt-view-btn svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
```

### 2.2 视图切换核心逻辑

点击视图按钮后执行以下操作：

```typescript
async function switchView(blockId: string, viewType: ViewType): Promise<void> {
  // 1. 构造元素ID
  const elementId = `ls-block-${blockId}`;
  
  // 2. 获取 DOM 元素（使用 utils.ts）
  const doc = getDocument();
  const blockElement = doc.querySelector(`[data-block-id="${blockId}"]`);
  
  if (!blockElement) return;
  
  // 3. 移除旧视图样式类
  const VIEW_CLASSES = ['ltt-list-root', 'ltt-table-root', 'ltt-gallery-root', 'ltt-board-root'];
  blockElement.classList.remove(...VIEW_CLASSES);
  
  // 4. 添加新视图样式类
  const newClass = `ltt-${viewType}-root`;
  if (!blockElement.classList.contains(newClass)) {
    blockElement.classList.add(newClass);
  }
  
  // 5. 更新 block property
  await logseqAPI.Editor.upsertBlockProperty(blockId, 'ltt-view', viewType);
}
```

### 2.3 视图类型定义

```typescript
// src/lib/blockView/ViewTypes.ts

export type ViewType = 'list' | 'table' | 'gallery' | 'board';

export interface ViewConfig {
  id: ViewType;
  name: string;
  icon: string;
  cssClass: string;
}

export const VIEW_REGISTRY: Record<ViewType, ViewConfig> = {
  'list': {
    id: 'list',
    name: 'List',
    icon: VIEW_ICONS.list,
    cssClass: 'ltt-list-root',
  },
  'table': {
    id: 'table',
    name: 'Table',
    icon: VIEW_ICONS.table,
    cssClass: 'ltt-table-root',
  },
  'gallery': {
    id: 'gallery',
    name: 'Gallery',
    icon: VIEW_ICONS.gallery,
    cssClass: 'ltt-gallery-root',
  },
  'board': {
    id: 'board',
    name: 'Board',
    icon: VIEW_ICONS.board,
    cssClass: 'ltt-board-root',
  },
};
```

---

## 3. 宏命令注册

### 3.1 注册入口

参考 taskprogress 和 heatmap 的注册模式：

```typescript
// src/lib/blockView/register.ts

import { logseqAPI } from '../../logseq';
import { getDocument } from '../../logseq/utils';
import { VIEW_REGISTRY, ViewType } from './ViewTypes';
import logger from '../logger';

const MACRO_PREFIX = ':blockview';
const PLUGIN_ID = 'text-toolkit-blockview';

export function registerBlockView(): void {
  // 注册宏渲染器
  logseqAPI.App.onMacroRendererSlotted(async ({ payload, slot }) => {
    const args = payload.arguments || [];
    const type = args[0]?.content || '';
    
    if (!type.startsWith(MACRO_PREFIX)) return;
    
    const blockId = payload.uuid;
    logger.debug('[BlockView] Macro triggered', { blockId, type });
    
    await renderViewBar(blockId, slot);
  });
  
  // 注册斜杠命令
  logseqAPI.Editor.registerSlashCommand(
    '[Text Toolkit] Insert Block View',
    async () => {
      const block = await logseqAPI.Editor.getCurrentBlock();
      if (block?.uuid) {
        await logseqAPI.Editor.insertAtEditingCursor(
          `{{renderer ${MACRO_PREFIX}}}`
        );
      }
    }
  );
  
  logger.info('✅ BlockView: Registered successfully');
}
```

### 3.2 渲染视图切换 Bar

```typescript
async function renderViewBar(blockId: string, slot: string): Promise<void> {
  const doc = getDocument();
  const containerId = `${PLUGIN_ID}__${slot}`;
  
  // 获取当前视图类型（从 block property 读取）
  const currentView = await getCurrentViewType(blockId);
  
  // 生成视图 Bar HTML
  const viewBarHtml = `
    <div class="ltt-view-bar" data-block-id="${blockId}">
      ${Object.values(VIEW_REGISTRY).map(view => `
        <button 
          class="ltt-view-btn ${view.id === currentView ? 'active' : ''}"
          data-view="${view.id}"
          title="${view.name}"
        >
          ${view.icon}
          <span>${view.name}</span>
        </button>
      `).join('')}
    </div>
  `;
  
  // 渲染到 slot
  logseqAPI.provideUI({
    key: containerId,
    slot,
    reset: true,
    template: `<div id="${containerId}">${viewBarHtml}</div>`,
  });
  
  // 绑定点击事件
  setTimeout(() => {
    const container = doc.getElementById(containerId);
    if (container) {
      bindViewEvents(container, blockId);
    }
  }, 1);
}

async function getCurrentViewType(blockId: string): Promise<ViewType> {
  try {
    const block = await logseqAPI.Editor.getBlock(blockId);
    const properties = block?.properties || {};
    return (properties['ltt-view'] as ViewType) || 'list';
  } catch {
    return 'list';
  }
}

function bindViewEvents(container: HTMLElement, blockId: string): void {
  const buttons = container.querySelectorAll('.ltt-view-btn');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const viewType = btn.getAttribute('data-view') as ViewType;
      if (!viewType) return;
      
      // 更新 UI 状态
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // 切换视图
      await switchView(blockId, viewType);
    });
  });
}
```

### 3.3 视图切换核心逻辑

```typescript
async function switchView(blockId: string, viewType: ViewType): Promise<void> {
  const doc = getDocument();
  
  // 查找 block 元素
  const blockElement = doc.querySelector(`[data-block-id="${blockId}"]`);
  if (!blockElement) {
    logger.warn('[BlockView] Block element not found', { blockId });
    return;
  }
  
  // 定义所有视图 class
  const VIEW_CLASSES = [
    'ltt-list-root',
    'ltt-table-root', 
    'ltt-gallery-root',
    'ltt-board-root'
  ];
  
  // 移除所有旧视图样式
  blockElement.classList.remove(...VIEW_CLASSES);
  
  // 添加新视图样式
  const newClass = `ltt-${viewType}-root`;
  if (!blockElement.classList.contains(newClass)) {
    blockElement.classList.add(newClass);
  }
  
  // 更新 block property 记录视图类型
  try {
    await logseqAPI.Editor.upsertBlockProperty(blockId, 'ltt-view', viewType);
    logger.debug('[BlockView] View switched', { blockId, viewType });
  } catch (err) {
    logger.error('[BlockView] Failed to update property', err);
  }
}
```

---

## 4. CSS 架构

### 4.1 显式 Root Class 策略

```css
/* 正确 - 显式 root class，不向上污染 */
.ltt-table-root {
  /* Table 样式 */
}

.ltt-table-root > .block-children-container {
  /* Container 样式 */
}

/* 所有选择器从 root 开始 */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
  /* Row 样式 */
}
```

### 4.2 Table 视图 CSS

```css
/* src/lib/blockView/css/tableView.css */

.ltt-table-root {
  --ltt-border: rgba(0,0,0,.065);
  --ltt-border-strong: rgba(0,0,0,.1);
  --ltt-hover: rgba(0,0,0,.022);
  --ltt-header-bg: linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.035));
  --ltt-cell-bg: rgba(255,255,255,.55);
  --ltt-radius: 14px;
  --ltt-shadow: 0 1px 2px rgba(0,0,0,.03), 0 8px 24px rgba(0,0,0,.035);
  --ltt-col-1-width: 260px;
  margin: 26px 32px !important;
}

.dark .ltt-table-root {
  --ltt-border: rgba(255,255,255,.075);
  --ltt-border-strong: rgba(255,255,255,.12);
  --ltt-hover: rgba(255,255,255,.03);
  --ltt-header-bg: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.045));
  --ltt-cell-bg: rgba(255,255,255,.015);
  --ltt-shadow: 0 1px 2px rgba(0,0,0,.35), 0 10px 30px rgba(0,0,0,.28);
}

.ltt-table-root > .block-children-container {
  border: 1px solid var(--ltt-border);
  border-radius: var(--ltt-radius);
  overflow-x: auto;
  background: var(--ltt-cell-bg);
  box-shadow: var(--ltt-shadow);
  padding: 0 !important;
}

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
  display: grid !important;
  grid-template-columns: var(--ltt-col-1-width) repeat(999, minmax(220px,1fr));
  position: relative;
}

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container {
  position: sticky;
  left: 0;
  z-index: 20;
  width: var(--ltt-col-1-width);
  min-width: var(--ltt-col-1-width);
  background: var(--ltt-header-bg);
  border-right: 2px solid var(--ltt-border-strong);
  font-weight: 600;
  padding: 14px 18px !important;
}

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
  border-right: 1px solid var(--ltt-border);
  background: var(--ltt-cell-bg);
  padding: 14px 22px !important;
}

/* 隐藏 header 行 bullets */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container .block-control-wrap {
  display: none !important;
}

/* 恢复 cell 行 bullets */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block .block-control-wrap {
  display: flex !important;
  opacity: .72;
}
```

### 4.3 Gallery 视图 CSS

```css
.ltt-gallery-root > .block-children-container > .block-children > .blocks-list-wrap {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px !important;
}

.ltt-gallery-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
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
```

### 4.4 Board 视图 CSS

```css
.ltt-board-root > .block-children-container > .block-children > .blocks-list-wrap {
  display: flex !important;
  gap: 20px;
  padding: 20px !important;
  overflow-x: auto;
}

.ltt-board-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
  min-width: 300px;
  max-width: 300px;
  background: var(--ls-secondary-background-color);
  border-radius: 12px;
  padding: 12px !important;
  margin: 0 !important;
}
```

---

## 5. 文件结构

```
src/
├── lib/
│   └── blockView/
│       ├── index.ts              # 入口
│       ├── register.ts           # 宏命令注册
│       ├── ViewTypes.ts          # 类型定义
│       ├── ViewManager.ts        # 视图管理器
│       └── css/
│           ├── tableView.css
│           ├── galleryView.css
│           └── boardView.css
│
└── styles/
    └── blockView.css             # 视图 Bar 样式
```

---

## 6. 实现计划

### P0
- [ ] 宏命令注册 (`{{renderer :blockview}}`)
- [ ] 视图切换 Bar UI
- [ ] List 视图（默认）
- [ ] Table 视图 CSS
- [ ] 视图切换逻辑

### P1
- [ ] Gallery 视图
- [ ] Table 列宽调整
- [ ] Micro 宏命令参数支持

### P2
- [ ] Board 视图
- [ ] Settings 配置面板

---

## 7. API 参考

### Logseq API

```typescript
// 宏渲染器
logseqAPI.App.onMacroRendererSlotted(handler)

// 获取 block
logseqAPI.Editor.getBlock(blockId)

// 更新 property
logseqAPI.Editor.upsertBlockProperty(blockId, key, value)

// 工具函数
import { getDocument, getWindow } from '../../logseq/utils'
```

---

**文档结束**
