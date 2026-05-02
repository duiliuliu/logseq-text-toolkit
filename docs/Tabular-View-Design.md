# Tabular View 表格视图插件设计方案

## 一、概述

本插件为 Logseq 提供轻量级的表格视图展示功能。通过纯 CSS（极少量 JS）实现块结构的表格化展示，不影响 Logseq 的正常编辑功能。

### 核心特点

- **纯 CSS 驱动**：利用 Logseq 的 `data-refs-self` 属性选择器实现样式应用
- **零侵入编辑**：所有样式仅作用于视觉展示，不影响块编辑功能
- **两种标签模式**：
  - Tags 模式：使用 `#tabular` (更友好)
  - Properties 模式：使用 `#.tabular` (logseq13-missing-commands 兼容)
- **多种触发方式**：支持斜杠命令、块右键菜单、快捷键触发
- **多种表格模式**：支持标准表格、紧凑表格、无表头表格、居中对齐、右对齐

## 二、技术原理

### 2.1 logseq13-missing-commands 的实现

根据参考代码，logseq13-missing-commands 使用 `#.tabular` 这种 Property 标签模式：

```css
.ls-block[data-refs-self*='".tabular"'] > .block-children-container > .block-children
```

这里的 `#.tabular` 在 Logseq 中会作为一个 Property 被存储，最终在 DOM 的 `data-refs-self` 属性中以 `".tabular"` 这种格式出现。

### 2.2 Tags vs Properties 的区别

在 Logseq 中有两种方式标记：

| 模式 | 标签格式 | data-refs-self 中的值 | CSS 选择器 |
|------|---------|----------------------|-----------|
| Tags 模式 | `#tabular` | `"tabular"` | `[data-refs-self*='"tabular"']` |
| Properties 模式 | `#.tabular` | `".tabular"` | `[data-refs-self*='".tabular"']` |

两种方式在视觉上有区别，但在 `data-refs-self` 属性中都存在，因此可以用不同的 CSS 选择器分别匹配。

### 2.3 本插件的支持

本插件同时支持两种模式：
- **Tags 模式**（默认）：`#tabular`（更友好，无需点号）
- **Properties 模式**：`#.tabular`（logseq13-missing-commands 兼容）

两者可以混用，完全向后兼容。

## 三、使用方式

### 3.1 触发方式

| 方式 | 操作 |
|------|------|
| 斜杠命令 | 输入 `/`，选择对应的表格视图命令 |
| 块右键菜单 | 右键点击块，选择表格视图相关选项 |
| 快捷键 | `mod + shift + T` 切换表格视图 |

### 3.2 标签列表

| Tags 模式 | Properties 模式 | 功能 |
|----------|----------------|------|
| `#tabular` | `#.tabular` | 标准表格视图 |
| `#tabular-compact` | `#.tabular-compact` | 紧凑表格视图 |
| `#tabular0` | `#.tabular0` | 无表头表格视图 |
| `#tabular-center` | `#.tabular-center` | 居中对齐表格 |
| `#tabular-right` | `#.tabular-right` | 右对齐表格 |

### 3.3 基本使用

在 Logseq 中，你可以这样组织块结构：

```
项目管理 #tabular

  - 设计文档
    - 状态:: 已完成
    - 负责人:: 张三
    - 截止日期:: 2024-01-15
  - 开发代码
    - 状态:: 进行中
    - 负责人:: 李四
    - 截止日期:: 2024-02-01
  - 测试用例
    - 状态:: 待开始
    - 负责人:: 王五
    - 截止日期:: 2024-02-15
```

子块会被渲染成表格行，孙块会被渲染成列单元格。

### 3.4 无表头模式

如果不需要显示表头标签，可以使用 `#tabular0`：

```
纯数据 #tabular0

  - 数据项1:: 值A
  - 数据项2:: 值B
  - 数据项3:: 值C
```

## 四、文件说明

| 文件路径 | 说明 |
|---------|------|
| [src/styles/tabularView.css](file:///workspace/src/styles/tabularView.css) | 表格视图 CSS 样式 |
| [src/lib/tabularView/register.ts](file:///workspace/src/lib/tabularView/register.ts) | 注册逻辑 |
| [src/styles/index.ts](file:///workspace/src/styles/index.ts) | 样式导出（已更新） |
| [src/main.tsx](file:///workspace/src/main.tsx) | 主入口（已集成） |

## 五、CSS 样式要点

### 5.1 选择器设计

每个样式规则都同时支持两种标签模式：

```css
/* 同时匹配 #.tabular 和 #tabular */
.ls-block[data-refs-self*='".tabular"'] > .block-children-container > .block-children,
.ls-block[data-refs-self*='"tabular"'] > .block-children-container > .block-children {
  /* 样式 */
}
```

### 5.2 布局实现

使用 Flexbox 实现表格布局：

```css
/* 表格行容器 */
.block-children {
  display: flex;
  flex-direction: column;
}

/* 表格行 */
.ls-block {
  display: flex;
  flex-direction: row;
  width: 100%;
}

/* 单元格 */
.block-main-container {
  min-width: 150px;
  max-width: 250px;
  flex-shrink: 0;
  border-right: 1px solid var(--tabular-border-color);
}
```

### 5.3 主题适配

通过 CSS 变量和 `[data-theme='dark']` 属性实现主题适配：

```css
:root {
  --tabular-border-color: var(--ls-guideline-color, #e0e0e0);
  --tabular-header-bg: var(--ls-secondary-background-color, #f5f5f5);
}

[data-theme='dark'] {
  --tabular-border-color: #3c3c3c;
  --tabular-header-bg: #252525;
}
```

### 5.4 编辑状态处理

当编辑块时，弱化表格样式以保持正常编辑体验：

```css
.ls-block:has(.editor-wrapper.is-editing) {
  background-color: transparent !important;
  border: 2px solid var(--ls-primary-color) !important;
  z-index: 100;
}
```

## 六、注册逻辑

### 6.1 斜杠命令

| 命令 | 功能 |
|------|------|
| Insert Tabular View | 插入标准表格视图（使用 `#tabular`） |
| Insert Tabular View (Property) | 插入标准表格视图（使用 `#.tabular`） |
| Insert Compact Table | 插入紧凑表格 |
| Insert Data Table (No Header) | 插入无表头表格 |
| Toggle Tabular View | 切换表格视图 |

### 6.2 右键菜单

| 菜单项 | 功能 |
|--------|------|
| Toggle Tabular View | 切换该块的表格视图 |
| Apply: Compact Table | 应用紧凑表格样式 |
| Apply: No Header Table | 应用无表头表格样式 |

### 6.3 快捷键

| 快捷键 | 功能 |
|--------|------|
| `mod + shift + T` | 切换表格视图 |

## 七、已知限制

1. **列宽固定**：当前使用固定列宽，不支持拖拽调整
2. **不支持合并单元格**：CSS 实现无法支持 rowspan/colspan
3. **编辑时布局变化**：编辑状态下某些布局样式会弱化以保证编辑体验

## 八、参考来源

- logseq13-missing-commands：https://github.com/stdword/logseq13-missing-commands
- Logseq 官方文档：https://docs.logseq.com
