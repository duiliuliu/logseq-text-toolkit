# Tooltip 实现对比分析报告

## 概述

本报告对比分析 **Milestone**、**Heatmap**、**TaskProgress** 三个组件的 Tooltip 实现方式，重点分析 Milestone 组件的 Tooltip 遮挡问题。

---

## 1. 三种 Tooltip 实现方式对比

### 1.1 Heatmap：position: fixed 方式

**文件**：`/workspace/src/components/Heatmap/HeatmapCell.tsx`

**核心代码（第27-62行）**：
```typescript
const Tooltip: React.FC<TooltipProps> = ({ data, cellRect, theme = 'light' }) => {
  const style: React.CSSProperties = {
    position: 'fixed',        // ✅ 使用 fixed 定位
    left: cellRect.left,     // ✅ 基于视口定位
    top: cellRect.top - 120,
    transform: 'translateY(calc(-100% - 8px))',
    zIndex: 1000,
    pointerEvents: 'none',  // ✅ 禁用指针事件
  };

  return <div style={style}>...</div>;
};
```

**使用方式（第140-146行）**：
```typescript
{isHovered && cellRect && !isEmpty && (
  <Tooltip
    data={{ date, count: value, percentage, maxValue }}
    cellRect={cellRect}      // ✅ 传递 DOMRect
    theme={theme}
  />
)}
```

**特点**：
- ✅ `position: fixed` 相对于视口定位，不受父容器 overflow 影响
- ✅ 通过 `getBoundingClientRect()` 获取 cell 位置
- ✅ Tooltip 始终显示在 cell 上方
- ⚠️ 需要 state 管理 cellRect
- ⚠️ 可能在视口边缘溢出

---

### 1.2 TaskProgress：纯 CSS hover 方式

**文件**：`/workspace/src/components/TaskProgress/Tooltip.tsx`

**核心代码**：
```typescript
return (
  <div className="task-progress-tooltip-wrapper"> {/* ✅ 相对定位容器 */}
    {children}
    <div className="task-progress-tooltip">  {/* ✅ 绝对定位 tooltip */}
      {/* Tooltip 内容 */}
    </div>
  </div>
);
```

**CSS 样式（taskProgress.css 第81-105行）**：
```css
.task-progress-tooltip-wrapper {
  position: relative;  /* ✅ 相对定位 */
  display: inline-block;
}

.task-progress-tooltip {
  position: absolute;  /* ✅ 绝对定位 */
  z-index: 99999;
  /* 定位在底部 */
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  /* 初始隐藏 */
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
}

/* Hover 时显示 */
.task-progress-tooltip-wrapper:hover .task-progress-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}
```

**特点**：
- ✅ 纯 CSS hover 控制，无需 React state
- ✅ 性能更好，无重渲染
- ✅ 相对父元素定位，不会溢出视口
- ⚠️ 需要父容器 `overflow: visible` 或足够的空间
- ⚠️ 不能精确控制 tooltip 的位置

---

### 1.3 Milestone：React State + position: absolute 方式（❌ 有问题）

**文件**：`/workspace/src/components/Milestone/styles/CompactMilestone.tsx`

**核心代码（第118-132行）**：
```typescript
<div className="ltt-milestone-compact-item">
  {/* ... 主体内容 ... */}
  
  {/* Hover Tooltip */}
  {hoveredItem === item.id && (  // ❌ 条件渲染
    <div className="ltt-milestone-tooltip-compact">  {/* ✅ 绝对定位 */}
      <div className="ltt-milestone-tooltip-label">{item.label}</div>
      {/* ... */}
    </div>
  )}
</div>
```

**CSS 样式（milestone.css 第296-333行）**：
```css
.ltt-milestone-tooltip-compact {
  position: absolute;  /* ✅ 绝对定位 */
  top: 100%;           /* 在元素下方 */
  left: 50%;
  transform: translateX(-50%);
  margin-top: var(--ltt-spacing-sm);
  z-index: 100000;
  /* ... */
}
```

**父容器样式（milestone.css 第855-863行）**：
```css
.ltt-milestone-compact-item {
  position: relative;  /* ✅ 相对定位 */
  z-index: 1;
  /* ... */
}
```

**特点**：
- ✅ 使用 React state 控制显示
- ✅ 绝对定位于父元素
- ❌ **父容器 `.ltt-milestone-container` 有 `overflow-x: hidden`**（第13行）
- ❌ Tooltip 可能被裁剪

---

## 2. 问题根因分析

### 2.1 滚动条不出现的原因

**Milestone 容器 CSS（milestone.css 第5-15行）**：
```css
.ltt-milestone-container {
  /* ... */
  overflow-x: hidden;  /* ❌ 隐藏水平溢出 */
  overflow-y: visible;
  position: relative;
}
```

**子容器（以 compact 为例，milestone.css 第828-839行）**：
```css
.ltt-milestone-compact {
  overflow-x: auto;      /* ✅ 设置了自动滚动 */
  min-width: max-content;  /* ✅ 设置了最小宽度 */
  overflow-y: visible;
}
```

**问题链条**：
1. 子容器 `.ltt-milestone-compact` 设置了 `overflow-x: auto`
2. 但父容器 `.ltt-milestone-container` 设置了 `overflow-x: hidden`
3. **在 CSS 中，子容器的 overflow 属性会被父容器继承或覆盖**
4. 导致滚动条不出现

**实际原因**：
- `overflow-x: hidden` 会裁剪水平方向的内容
- 但**不会**直接阻止滚动条出现
- **真正的问题**是 Logseq 的 block 容器限制了宽度
- 如果子容器无法撑开（因为被限制宽度），就不会出现滚动条

---

### 2.2 Tooltip 遮挡的原因

**问题分析**：

1. **父容器 overflow 设置**：
   ```css
   .ltt-milestone-container {
     overflow-x: hidden;
     overflow-y: visible;
   }
   ```
   - `overflow-x: hidden` **不影响**垂直方向的 tooltip（因为 `overflow-y: visible`）
   - 但如果父容器有其他 overflow 限制，可能会裁剪 tooltip

2. **z-index 问题**：
   - Milestone tooltip: `z-index: 100000`
   - TaskProgress tooltip: `z-index: 99999`
   - Heatmap tooltip: `z-index: 1000`
   - **Milestone 的 z-index 最高**，理论上不会被覆盖
   - **问题可能是 Logseq 的某些元素有更高的 z-index**

3. **定位上下文问题**：
   - Milestone tooltip 使用 `position: absolute`
   - 父元素 `.ltt-milestone-compact-item` 设置了 `position: relative`
   - 这是正确的做法
   - **但如果 Milestone 在 Logseq 的某个 iframe 或 shadow DOM 中，定位可能失效**

4. **空间不足**：
   - Tooltip 显示在元素下方（`top: 100%`）
   - 如果元素在页面底部，下方没有足够空间
   - Tooltip 会被页面边界或相邻元素遮挡

5. **Logseq 环境问题**：
   - Logseq 的 block 容器可能有 `overflow: hidden`
   - 或者有 `position: relative` 的层级限制
   - **导致 tooltip 相对于错误的容器定位**

---

## 3. 对比总结

| 维度 | Heatmap | TaskProgress | Milestone |
|-----|---------|--------------|-----------|
| 定位方式 | `position: fixed` | `position: absolute` | `position: absolute` |
| 显示控制 | React State | CSS :hover | React State |
| 父容器 overflow | 无限制 | 无限制 | `overflow-x: hidden` |
| z-index | 1000 | 99999 | 100000 |
| 视口边缘处理 | ⚠️ 可能溢出 | ✅ 自动调整 | ⚠️ 可能被遮挡 |
| 重渲染 | 有 | 无 | 有 |
| 性能 | 一般 | 优秀 | 一般 |

---

## 4. 推荐解决方案

### 方案一：参考 Heatmap，使用 position: fixed（推荐）

**优点**：
- ✅ 不受父容器 overflow 影响
- ✅ 精确定位在元素上方或下方
- ✅ 避免被裁剪

**实现**：
```typescript
// CompactMilestone.tsx
const [tooltipData, setTooltipData] = useState<{ item: MilestoneItem; rect: DOMRect } | null>(null);

const handleMouseEnter = (e: React.MouseEvent, item: MilestoneItem) => {
  const rect = e.currentTarget.getBoundingClientRect();
  setTooltipData({ item, rect });
};

const handleMouseLeave = () => {
  setTooltipData(null);
};

// 渲染 tooltip（使用 fixed 定位）
{tooltipData && (
  <div
    className="ltt-milestone-tooltip-fixed"
    style={{
      position: 'fixed',
      left: tooltipData.rect.left + tooltipData.rect.width / 2,
      top: tooltipData.rect.bottom + 8,
      transform: 'translateX(-50%)',
      zIndex: 1000000,
    }}
  >
    {/* Tooltip 内容 */}
  </div>
)}
```

---

### 方案二：参考 TaskProgress，优化 CSS（简化方案）

**优点**：
- ✅ 无需 React state
- ✅ 性能更好
- ✅ 保持绝对定位

**修改 CSS**：
```css
.ltt-milestone-container {
  overflow-x: visible !important;  /* ✅ 改为 visible */
  overflow-y: visible;
}

.ltt-milestone-compact-item {
  position: relative;
  overflow: visible;  /* ✅ 添加 */
}

/* 确保 tooltip 不被裁剪 */
.ltt-milestone-tooltip-compact {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100000;
  overflow: visible;  /* ✅ 添加 */
}
```

---

### 方案三：使用 CSS Tooltip，移除 overflow 限制（折中方案）

**修改 milestone.css**：
```css
.ltt-milestone-container {
  /* 移除 overflow-x: hidden */
  overflow-x: visible;
  overflow-y: visible;
}

/* 为需要滚动的子容器单独设置 */
.ltt-milestone-compact,
.ltt-milestone-capsule,
.ltt-milestone-badge .ltt-milestone-grid {
  overflow-x: auto;
  max-width: 100%;
}
```

**修改 CompactMilestone.tsx**：
```typescript
// 改用 CSS hover，移除 React state
return (
  <div className="ltt-milestone-compact-item ltt-has-tooltip">
    {/* 主体内容 */}
    
    {/* Tooltip - 始终渲染，CSS 控制显示 */}
    <div className="ltt-milestone-tooltip-compact">
      <div className="ltt-milestone-tooltip-label">{item.label}</div>
      {/* ... */}
    </div>
  </div>
);
```

**添加 CSS**：
```css
.ltt-milestone-compact-item.ltt-has-tooltip .ltt-milestone-tooltip-compact {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}

.ltt-milestone-compact-item.ltt-has-tooltip:hover .ltt-milestone-tooltip-compact {
  opacity: 1;
  visibility: visible;
}
```

---

## 5. 实施建议

### 短期（快速修复）

**修改 milestone.css**：
```css
/* 第12-14行 */
.ltt-milestone-container {
  overflow-x: visible !important;
  overflow-y: visible;
}
```

**验证**：检查滚动条是否出现，tooltip 是否不再被遮挡

---

### 中期（优化实现）

**参考 TaskProgress**，将 Milestone 的 Tooltip 改为纯 CSS hover 方式：
1. 移除 React state 中的 hoveredItem
2. 使用 CSS :hover 控制 tooltip 显示
3. 优化动画效果

---

### 长期（统一方案）

**参考 Heatmap**，使用 `position: fixed` 方式：
1. 添加 state 管理 tooltipData 和 rect
2. 使用 fixed 定位渲染 tooltip
3. 添加视口边缘检测，避免溢出

---

## 6. Logseq 环境特殊处理

如果上述方案在 Logseq 中仍然有问题，可能需要：

1. **检测环境**：
   ```typescript
   const isInLogseq = window.location.hostname.includes('logseq');
   ```

2. **使用 Portal**：
   ```typescript
   import { createPortal } from 'react-dom';
   
   {createPortal(
     <Tooltip ... />,
     document.body  // ✅ 渲染到 body，不受父容器限制
   )}
   ```

3. **使用 Logseq API**（如果提供）：
   ```typescript
   // 检查是否有 Logseq 特定的 tooltip API
   ```

---

## 7. 总结

| 问题 | 原因 | 推荐方案 |
|-----|------|---------|
| 滚动条不出现 | `overflow-x: hidden` 限制了子容器 | 改为 `overflow-x: visible` |
| Tooltip 遮挡 | 父容器 overflow 裁剪 | 移除 overflow 或改用 fixed 定位 |
| 定位不准确 | 可能受 Logseq 环境限制 | 使用 Portal 或 fixed 定位 |

**推荐实施步骤**：
1. ✅ **立即修复**：将 `overflow-x: hidden` 改为 `overflow-x: visible`
2. 🟡 **后续优化**：参考 TaskProgress 改用纯 CSS hover
3. 🟡 **长期优化**：参考 Heatmap 使用 fixed 定位

---

**文档生成时间**：2026-05-31
