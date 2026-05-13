# Block Table View 增强方案

**版本**: v2.0
**日期**: 2026-05-13
**状态**: 设计完成
**分支**: trae/solo-agent-14EEAQ

---

## 1. 概述

本方案在 [Block-View-Renderer-Design.md](./Block-View-Renderer-Design.md) 基础上，重点增强 **Table 视图** 的功能：

1. **列宽手动调整** - 每个列都支持拖拽调整宽度
2. **样式自定义** - 支持 Micro 宏命令和 Settings 全局设置
3. **美化增强** - 更加精致的视觉效果

---

## 2. 核心功能

### 2.1 列宽调整功能

#### 功能说明
- 每个列右侧都有 resize 拖拽手柄（悬停时显示）
- 拖拽时实时调整所有行的对应列宽
- 最小列宽限制（180px）
- 调整后的宽度持久化保存到 localStorage

#### 核心实现代码

**核心 Resize Handler（生产级别实现）：**

```javascript
(() => {
  if (window.__LTT_RESIZE_READY__) return;
  window.__LTT_RESIZE_READY__ = true;

  const MIN_WIDTH = 180;

  function ensureHandles(root) {
    const headers = root.querySelectorAll(
      '.ls-block[level="1"] > .block-main-container'
    );

    headers.forEach((header, index) => {
      if (header.querySelector('.ltt-resize-handle')) return;

      const handle = document.createElement('div');
      handle.className = 'ltt-resize-handle';
      handle.dataset.colIndex = index;
      header.appendChild(handle);
    });
  }

  function setColumnWidth(root, colIndex, width) {
    const rows = root.querySelectorAll('.ls-block[level="1"]');

    rows.forEach(row => {
      const cols = row.children;
      const target = cols[colIndex];
      if (!target) return;

      target.style.width = `${width}px`;
      target.style.minWidth = `${width}px`;
      target.style.maxWidth = `${width}px`;
      target.style.flex = 'none';
    });

    if (colIndex === 0) {
      root.style.setProperty('--ltt-col-1-width', `${width}px`);
    }
  }

  function init(root) {
    ensureHandles(root);

    root.addEventListener('pointerdown', (e) => {
      const handle = e.target.closest('.ltt-resize-handle');
      if (!handle) return;

      e.preventDefault();
      e.stopPropagation();

      const colIndex = Number(handle.dataset.colIndex);
      const header = handle.parentElement;
      const startX = e.clientX;
      const startWidth = header.getBoundingClientRect().width;

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      function move(ev) {
        const width = Math.max(MIN_WIDTH, startWidth + (ev.clientX - startX));
        setColumnWidth(root, colIndex, width);
      }

      function up() {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
      }

      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
    });
  }

  function boot() {
    document.querySelectorAll('.ltt-table-root').forEach(init);
  }

  boot();

  new MutationObserver(boot).observe(document.body, {
    childList: true,
    subtree: true
  });
})();
```

#### 列宽持久化扩展

```javascript
function saveColumnWidths(root) {
  const blockId = root.dataset.blockId;
  if (!blockId) return;

  const widths = [];
  const firstRow = root.querySelector('.ls-block[level="1"]');

  if (firstRow) {
    Array.from(firstRow.children).forEach(col => {
      widths.push(col.style.width || col.offsetWidth);
    });
  }

  localStorage.setItem(`ltt-col-widths-${blockId}`, JSON.stringify(widths));
}

function loadColumnWidths(root) {
  const blockId = root.dataset.blockId;
  if (!blockId) return;

  const saved = localStorage.getItem(`ltt-col-widths-${blockId}`);
  if (!saved) return;

  try {
    const widths = JSON.parse(saved);
    widths.forEach((width, index) => {
      setColumnWidth(root, index, parseInt(width));
    });
  } catch (e) {
    console.warn('Failed to load column widths:', e);
  }
}
```

#### 双击重置列宽

```javascript
root.addEventListener('dblclick', (e) => {
  const handle = e.target.closest('.ltt-resize-handle');
  if (!handle) return;

  const colIndex = Number(handle.dataset.colIndex);
  const defaultWidth = colIndex === 0 ? 260 : 180;
  setColumnWidth(root, colIndex, defaultWidth);
  saveColumnWidths(root);
});
```

---

## 3. 样式自定义功能

### 3.1 Micro 宏命令支持

#### 宏命令格式

```
{{table :header-bg "#f0f9ff" :border-color "#e0e7ff" :text-color "#1e293b" :radius "8px"}}
```

#### 支持的参数

| 参数 | 说明 | 默认值 | 示例 |
| :--- | :--- | :--- | :--- |
| `:header-bg` | 表头背景色 | `#f8fafc` | `#f0f9ff` |
| `:header-text` | 表头文字颜色 | inherit | `#1e40af` |
| `:border-color` | 边框颜色 | `#e2e8f0` | `#e0e7ff` |
| `:border-radius` | 圆角大小 | `12px` | `8px` |
| `:cell-bg` | 单元格背景 | `#ffffff` | `#fafafa` |
| `:text-color` | 文字颜色 | inherit | `#1e293b` |
| `:hover-bg` | 悬停背景 | `#f1f5f9` | `#f0f9ff` |
| `:shadow` | 阴影效果 | subtle | `0 4px 12px rgba(0,0,0,0.1)` |
| `:stripe` | 斑马纹 | false | true |

#### 完整示例

```markdown
{{table 
  :header-bg "#1e293b" 
  :header-text "#ffffff"
  :border-color "#334155" 
  :border-radius "12px"
  :cell-bg "#0f172a"
  :text-color "#e2e8f0"
  :hover-bg "#1e293b"
  :shadow "0 8px 32px rgba(0,0,0,0.3)"
  :stripe true
}}

任务名称 | 负责人 | 状态 | 优先级
任务 A | 张三 | 进行中 | 高
任务 B | 李四 | 已完成 | 中
任务 C | 王五 | 待处理 | 低
```

### 3.2 预设主题

提供多个预设主题，可通过宏命令快速切换：

```markdown
{{table :theme "notion"}}
{{table :theme "linear"}}
{{table :theme "dark"}}
{{table :theme "gradient"}}
```

#### Notion 风格
```css
--ltt-header-bg: #f7f6f3;
--ltt-header-text: #37352f;
--ltt-border: #e9e9e7;
--ltt-cell-bg: #ffffff;
--ltt-text: #37352f;
--ltt-radius: 6px;
```

#### Linear 风格
```css
--ltt-header-bg: linear-gradient(135deg, #5e6ad2, #7c3aed);
--ltt-header-text: #ffffff;
--ltt-border: #e2e8f0;
--ltt-cell-bg: #ffffff;
--ltt-text: #1a1a1a;
--ltt-radius: 8px;
```

#### Dark 风格
```css
--ltt-header-bg: #1e1e1e;
--ltt-header-text: #ffffff;
--ltt-border: #333333;
--ltt-cell-bg: #252525;
--ltt-text: #e0e0e0;
--ltt-radius: 8px;
```

### 3.3 Settings 全局设置

在插件设置面板中添加 Table 视图配置：

```typescript
interface TableSettings {
  defaultHeaderBg: string;
  defaultBorderColor: string;
  defaultTextColor: string;
  defaultRadius: string;
  enableResize: boolean;
  minColumnWidth: number;
  showStripe: boolean;
  enableTheme: 'auto' | 'light' | 'dark';
}
```

---

## 4. 美化增强

### 4.1 高级视觉效果

#### 玻璃态效果（Glassmorphism）
```css
.ltt-table-root.ltt-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dark .ltt-table-root.ltt-glass {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

#### 渐变边框
```css
.ltt-table-root.ltt-gradient-border {
  position: relative;
}

.ltt-table-root.ltt-gradient-border::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: inherit;
  z-index: -1;
}
```

#### 微光效果
```css
.ltt-table-root.ltt-glow {
  box-shadow: 
    0 0 20px rgba(102, 126, 234, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.08);
}
```

### 4.2 动画效果

#### 单元格悬停动画
```css
.ltt-table-cell {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.ltt-table-cell:hover {
  background: var(--ltt-hover-bg);
  transform: scale(1.01);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
```

#### 列拖拽动画
```css
.ltt-resize-handle {
  transition: opacity 0.15s ease, background 0.15s ease;
}

.ltt-resize-handle:hover,
.ltt-resize-handle:active {
  background: linear-gradient(
    180deg,
    rgba(59, 130, 246, 0.4),
    rgba(59, 130, 246, 0.2)
  );
}
```

#### 表格加载动画
```css
.ltt-table-root.ltt-loading {
  animation: tablePulse 1.5s ease-in-out infinite;
}

@keyframes tablePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

### 4.3 高级排版

#### 列对齐选项
```css
.ltt-table-cell.ltt-align-left { text-align: left; }
.ltt-table-cell.ltt-align-center { text-align: center; justify-content: center; }
.ltt-table-cell.ltt-align-right { text-align: right; justify-content: flex-end; }
.ltt-table-cell.ltt-valign-top { vertical-align: top; padding-top: 12px; }
.ltt-table-cell.ltt-valign-middle { vertical-align: middle; }
.ltt-table-cell.ltt-valign-bottom { vertical-align: bottom; padding-bottom: 12px; }
```

#### 字体样式
```css
.ltt-table-cell.ltt-font-bold { font-weight: 700; }
.ltt-table-cell.ltt-font-italic { font-style: italic; }
.ltt-table-cell.ltt-font-small { font-size: 12px; }
.ltt-table-cell.ltt-font-large { font-size: 16px; }
```

---

## 5. CSS 架构（增强版）

### 5.1 完整 CSS 变量表

```css
/* =========================================================
   TABLE VIEW - 增强版 CSS 变量
========================================================= */

.ltt-table-root {
  /* 基础颜色 */
  --ltt-header-bg: #f8fafc;
  --ltt-header-text: inherit;
  --ltt-border: #e2e8f0;
  --ltt-border-strong: #cbd5e1;
  --ltt-cell-bg: #ffffff;
  --ltt-cell-alt-bg: #f8fafc;
  --ltt-text: inherit;
  --ltt-hover-bg: #f1f5f9;
  
  /* 圆角与阴影 */
  --ltt-radius: 12px;
  --ltt-radius-sm: 6px;
  --ltt-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05);
  --ltt-shadow-lg: 0 4px 6px rgba(0,0,0,0.1), 0 12px 40px rgba(0,0,0,0.1);
  
  /* 列宽 */
  --ltt-col-1-width: 260px;
  --ltt-col-min-width: 180px;
  --ltt-col-max-width: 600px;
  
  /* 间距 */
  --ltt-cell-padding: 14px 18px;
  --ltt-header-padding: 16px 18px;
  
  /* 动画 */
  --ltt-transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --ltt-spring: 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 5.2 Resize Handle 样式

```css
/* =========================================================
   RESIZE HANDLE - 列宽调整手柄
========================================================= */

.ltt-resize-handle {
  position: absolute;
  top: 0;
  right: -4px;
  width: 8px;
  height: 100%;
  cursor: col-resize;
  z-index: 50;
  opacity: 0;
  transition: opacity var(--ltt-transition);
  background: linear-gradient(
    180deg,
    rgba(59, 130, 246, 0.3),
    rgba(59, 130, 246, 0.1)
  );
  border-radius: 0 4px 4px 0;
}

.ltt-table-row:hover .ltt-resize-handle {
  opacity: 1;
}

.ltt-resize-handle:hover,
.ltt-resize-handle:active {
  opacity: 1;
  background: linear-gradient(
    180deg,
    rgba(59, 130, 246, 0.6),
    rgba(59, 130, 246, 0.4)
  );
}

/* 拖拽时显示的指示线 */
.ltt-table-root.ltt-resizing {
  cursor: col-resize;
  user-select: none;
}

.ltt-table-root.ltt-resizing::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(59, 130, 246, 0.5);
  pointer-events: none;
  z-index: 100;
}
```

### 5.3 完整 Table CSS

```css
/* =========================================================
   ENHANCED TABLE VIEW - 完整实现
========================================================= */

/* =========================================================
   ROOT
========================================================= */

.ltt-table-root {
  display: flex !important;
  align-items: flex-start;
  opacity: 0.92;
  transform: scale(0.98);
  padding-left: 1.45em !important;
  transition: opacity var(--ltt-transition);
  
  margin: 24px 32px !important;
  
  position: relative;
}

/* =========================================================
   DARK MODE TOKENS
========================================================= */

.dark .ltt-table-root {
  --ltt-header-bg: #1e293b;
  --ltt-header-text: #f1f5f9;
  --ltt-border: #334155;
  --ltt-border-strong: #475569;
  --ltt-cell-bg: #0f172a;
  --ltt-cell-alt-bg: #1e293b;
  --ltt-text: #e2e8f0;
  --ltt-hover-bg: #334155;
  
  --ltt-shadow: 0 1px 3px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3);
  --ltt-shadow-lg: 0 4px 6px rgba(0,0,0,0.4), 0 12px 40px rgba(0,0,0,0.4);
}

/* =========================================================
   TABLE CONTAINER
========================================================= */

.ltt-table-root > .block-children-container {
  border: 1px solid var(--ltt-border);
  border-radius: var(--ltt-radius);
  overflow: hidden;
  background: var(--ltt-cell-bg);
  box-shadow: var(--ltt-shadow);
  position: relative;
  padding: 0 !important;
  width: 100%;
}

/* =========================================================
   TABLE ROW
========================================================= */

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
  display: grid !important;
  grid-template-columns: var(--ltt-col-1-width) repeat(999, minmax(var(--ltt-col-min-width), 1fr));
  align-items: stretch;
  min-width: 0;
  position: relative;
  transition: background var(--ltt-transition);
}

/* Row separator */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: var(--ltt-border);
}

/* Last row no border */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block:last-child::after {
  display: none;
}

/* Hover effect */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block:hover {
  background: var(--ltt-hover-bg);
}

/* Row index (optional) */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block.ltt-row-even {
  background: var(--ltt-cell-alt-bg);
}

/* =========================================================
   TABLE CELL
========================================================= */

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container,
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
  display: flex !important;
  align-items: center;
  min-height: 56px;
  padding: var(--ltt-cell-padding) !important;
  margin: 0 !important;
  border-right: 1px solid var(--ltt-border);
  background: var(--ltt-cell-bg);
  box-sizing: border-box;
  overflow: visible;
  transition: all var(--ltt-transition);
}

/* First column (header) */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container {
  position: sticky;
  left: 0;
  z-index: 20;
  width: var(--ltt-col-1-width);
  min-width: var(--ltt-col-1-width);
  background: var(--ltt-header-bg);
  color: var(--ltt-header-text);
  font-weight: 600;
  border-right: 2px solid var(--ltt-border-strong);
  backdrop-filter: blur(8px);
}

/* Cell content wrapper */
.ltt-table-root .block-content-wrapper {
  width: 100% !important;
  overflow: visible !important;
}

/* Last column */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container:last-child,
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block:last-child {
  border-right: none;
}

/* Cell hover */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block:hover > .block-main-container,
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block:hover > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
  background: var(--ltt-hover-bg);
}

/* =========================================================
   RESIZE HANDLE
========================================================= */

.ltt-table-root .ltt-resize-handle {
  position: absolute;
  top: 0;
  right: -4px;
  width: 8px;
  height: 100%;
  cursor: col-resize;
  z-index: 50;
  opacity: 0;
  transition: opacity var(--ltt-transition);
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.1));
  border-radius: 0 4px 4px 0;
}

.ltt-table-root .ltt-table-row:hover .ltt-resize-handle {
  opacity: 1;
}

.ltt-table-root .ltt-resize-handle:hover,
.ltt-table-root .ltt-resize-handle:active {
  opacity: 1;
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.6), rgba(59, 130, 246, 0.4));
}

/* =========================================================
   BULLETS
========================================================= */

/* Hide bullets in header */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container .block-control-wrap {
  display: none !important;
}

/* Show bullets in cells */
.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block .block-control-wrap {
  display: flex !important;
  opacity: 0.6;
  transition: opacity var(--ltt-transition);
}

.ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block:hover > .block-children-container > .block-children > .blocks-list-wrap > .ls-block .block-control-wrap {
  opacity: 1;
}

/* =========================================================
   TREE LINE
========================================================= */

.ltt-table-root .block-children-left-border {
  display: block !important;
  opacity: 0.15;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 900px) {
  .ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
    grid-template-columns: 1fr !important;
  }
  
  .ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-main-container {
    position: relative !important;
    width: 100% !important;
    min-width: 100% !important;
    border-right: none !important;
    border-bottom: 2px solid var(--ltt-border-strong) !important;
  }
  
  .ltt-table-root > .block-children-container > .block-children > .blocks-list-wrap > .ls-block > .block-children-container > .block-children > .blocks-list-wrap > .ls-block {
    border-right: none !important;
    border-bottom: 1px solid var(--ltt-border) !important;
  }
  
  .ltt-table-root .ltt-resize-handle {
    display: none !important;
  }
}

/* =========================================================
   SPECIAL EFFECTS
========================================================= */

/* Glass effect */
.ltt-table-root.ltt-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.dark .ltt-table-root.ltt-glass {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Glow effect */
.ltt-table-root.ltt-glow {
  box-shadow: var(--ltt-shadow-lg), 0 0 30px rgba(102, 126, 234, 0.15);
}

/* Stripe effect */
.ltt-table-root.ltt-stripe > .block-children-container > .block-children > .blocks-list-wrap > .ls-block:nth-child(odd) {
  background: var(--ltt-cell-alt-bg);
}
```

---

## 6. 实现计划

### 阶段一：核心功能 (P0)
- [ ] Resize Handle 实现
- [ ] 列宽拖拽功能
- [ ] 宽度持久化

### 阶段二：样式自定义 (P0)
- [ ] Micro 宏命令解析
- [ ] 主题预设系统
- [ ] Settings 配置面板

### 阶段三：美化增强 (P1)
- [ ] 玻璃态效果
- [ ] 渐变边框
- [ ] 动画效果

### 阶段四：测试优化 (P1)
- [ ] 功能测试
- [ ] 兼容性测试
- [ ] 性能优化

---

## 7. API 参考

### 7.1 JavaScript API

```typescript
// 切换视图
window.LTTBlockView.switchView(blockId, 'table');

// 设置表格样式
window.LTTBlockView.setTableStyle(blockId, {
  headerBg: '#1e293b',
  borderColor: '#334155',
  textColor: '#ffffff',
  radius: '12px'
});

// 应用预设主题
window.LTTBlockView.applyTheme(blockId, 'dark');

// 重置为默认样式
window.LTTBlockView.resetStyle(blockId);

// 获取当前列宽
window.LTTBlockView.getColumnWidths(blockId);

// 设置列宽
window.LTTBlockView.setColumnWidths(blockId, [260, 200, 150, 180]);
```

---

**文档结束**
