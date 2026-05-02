# Tabular View 表格视图插件设计方案

## 一、概述

本插件为 Logseq 提供轻量级的表格视图展示功能。通过纯 CSS（极少量 JS）实现块结构的表格化展示，不影响 Logseq 的正常编辑功能。

### 核心特点

- **纯 CSS 驱动**：利用 Logseq 的 `[data-refs-self]` 属性选择器实现样式应用
- **零侵入编辑**：所有样式仅作用于视觉展示，不影响块编辑功能
- **多种触发方式**：支持斜杠命令、块右键菜单、快捷键触发
- **多种表格模式**：支持标准表格、紧凑表格、无表头表格、居中对齐、右对齐

## 二、技术实现

### 2.1 文件结构

```
src/
├── lib/
│   └── tabularView/
│       └── register.ts          # 注册逻辑（斜杠命令、右键菜单、快捷键）
└── styles/
    ├── index.ts                 # 导出 CSS
    └── tabularView.css          # 表格视图样式
```

### 2.2 触发方式

#### 方式一：斜杠命令

用户在任意块中输入 `/` 触发斜杠命令菜单，可选择：

| 命令 | 功能 | 插入标签 |
|------|------|----------|
| `Insert Tabular View` | 插入标准表格视图 | `#.tabular` |
| `Insert Compact Table` | 插入紧凑表格 | `#.tabular-compact` |
| `Insert Data Table (No Header)` | 插入无表头数据表 | `#.tabular0` |
| `Toggle Tabular View` | 切换表格视图开关 | - |

#### 方式二：块右键菜单

在目标块上右键点击，可选择：

| 菜单项 | 功能 |
|--------|------|
| `Toggle Tabular View` | 切换该块的表格视图 |
| `Apply: Compact Table` | 应用紧凑表格样式 |
| `Apply: No Header Table` | 应用无表头表格样式 |

#### 方式三：快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + Shift + T` | 切换当前块/选中块的表格视图 |

### 2.3 CSS 选择器策略

基于 Logseq 的 `[data-refs-self]` 属性实现样式隔离：

```css
/* 表格容器 - 匹配带有 #.tabular 标签的块 */
.ls-block[data-refs-self*='".tabular"']

/* 表格行 - 直接子块 */
.ls-block[data-refs-self*='".tabular"'] > .block-children-container > .block-children > .ls-block

/* 单元格 - 主容器 */
.ls-block[data-refs-self*='".tabular"'] > .block-children-container > .block-children > .ls-block > .block-main-container
```

### 2.4 布局实现

使用 CSS Flexbox 实现表格布局：

```css
/* 表格行容器 - 垂直排列 */
.block-children {
  display: flex;
  flex-direction: column;
}

/* 表格行 - 水平排列 */
.ls-block {
  display: flex;
  flex-direction: row;
  width: 100%;
}

/* 单元格 - 固定宽度 */
.block-main-container {
  min-width: 150px;
  max-width: 250px;
  flex-shrink: 0;
  border-right: 1px solid var(--tabular-border-color);
}
```

## 三、标签说明

### 3.1 基础标签

| 标签 | 功能 | CSS 选择器 |
|------|------|-----------|
| `#.tabular` | 标准表格视图 | `[data-refs-self*='".tabular"']` |
| `#.tabular-compact` | 紧凑表格（更小字号和间距） | `[data-refs-self*='".tabular-compact"']` |
| `#.tabular0` | 无表头表格（隐藏第一行标签） | `[data-refs-self*='".tabular0"']` |

### 3.2 对齐标签

| 标签 | 功能 |
|------|------|
| `#.tabular-center` | 单元格内容居中对齐 |
| `#.tabular-right` | 单元格内容右对齐 |

## 四、使用示例

### 4.1 基本使用

```
#.tabular 项目任务

  - 设计文档
    - 状态 :: 已完成
    - 负责人 :: 张三
  - 开发代码
    - 状态 :: 进行中
    - 负责人 :: 李四
  - 测试用例
    - 状态 :: 待开始
    - 负责人 :: 王五
```

### 4.2 紧凑模式

```
#.tabular-compact 紧凑数据表

  - 项目A :: 100% :: 完成
  - 项目B :: 50% :: 进行中
  - 项目C :: 0% :: 未开始
```

### 4.3 无表头模式

```
#.tabular0 数据列表

  - 数据项1 :: 值A
  - 数据项2 :: 值B
  - 数据项3 :: 值C
```

## 五、CSS 样式详解

### 5.1 主题适配

```css
:root {
  --tabular-border-color: var(--ls-guideline-color);
  --tabular-header-bg: var(--ls-secondary-background-color);
  --tabular-row-hover: var(--ls-hover-background-color);
  --tabular-selected-bg: var(--ls-active-secondary-color);
}

[data-theme='dark'] {
  --tabular-border-color: #3c3c3c;
  --tabular-header-bg: #252525;
  --tabular-row-hover: #2a2a2a;
  --tabular-selected-bg: #264f78;
}
```

### 5.2 编辑状态处理

```css
/* 编辑中的块保持正常编辑体验 */
.ls-block:has(.editor-wrapper.is-editing) {
  background-color: transparent !important;
  border: 2px solid var(--ls-primary-color) !important;
  z-index: 100;
}

/* 编辑器 textarea 样式 */
.ls-block .editor-wrapper textarea {
  min-width: var(--tabular-col-min-width);
  font-family: inherit;
  border: 1px solid var(--ls-border-color);
  border-radius: 4px;
}
```

### 5.3 嵌套表格支持

```css
/* 子表格（嵌套块） */
.ls-block .ls-block[data-refs-self*='".tabular"'] > .block-children-container > .block-children {
  border-left: 1px solid var(--tabular-border-color);
}
```

## 六、注册逻辑

### 6.1 斜杠命令注册

```typescript
logseqAPI.Editor.registerSlashCommand(
  'Insert Tabular View',
  async () => {
    const block = await logseqAPI.Editor.getCurrentBlock()
    if (block?.uuid) {
      await logseqAPI.Editor.insertAtEditingCursor(`\n${TABULAR_TAG}\n`)
    }
  }
)
```

### 6.2 右键菜单注册

```typescript
logseqAPI.Editor.registerBlockContextMenuItem(
  'Toggle Tabular View',
  async ({ uuid }) => {
    const block = await logseqAPI.Editor.getBlock(uuid)
    // 切换标签逻辑
  }
)
```

### 6.3 快捷键注册

```typescript
logseqAPI.App.registerCommandShortcut(
  { binding: 'mod+shift+t', mode: 'non-editing' },
  async () => {
    // 切换表格视图
  }
)
```

## 七、主题适配

### 7.1 浅色主题（默认）

- 边框颜色：`var(--ls-guideline-color)` 或 `#e0e0e0`
- 表头背景：`var(--ls-secondary-background-color)` 或 `#f5f5f5`
- 悬停背景：`var(--ls-hover-background-color)` 或 `#f0f0f0`

### 7.2 深色主题

Logseq 会自动添加 `data-theme='dark'` 属性，CSS 变量覆盖实现深色适配：

```css
[data-theme='dark'] {
  --tabular-border-color: #3c3c3c;
  --tabular-header-bg: #252525;
  --tabular-row-hover: #2a2a2a;
  --tabular-selected-bg: #264f78;
}
```

## 八、已知限制

1. **列宽固定**：当前使用固定列宽，不支持拖拽调整
2. **不支持合并单元格**：CSS 实现无法支持 rowspan/colspan
3. **编辑时布局变化**：编辑状态下某些布局样式会弱化以保证编辑体验
4. **需要子块**：表格视图依赖子块结构，空块不会显示表格效果

## 九、未来优化方向

1. **拖拽调整列宽**：通过 JS 实现可交互的列宽调整
2. **动态列宽**：根据内容自动计算列宽
3. **斑马纹样式**：奇偶行交替背景色
4. **固定表头**：滚动时表头固定可见
5. **排序功能**：点击表头排序数据行

## 十、相关文件

| 文件 | 说明 |
|------|------|
| [src/lib/tabularView/register.ts](file:///workspace/src/lib/tabularView/register.ts) | 注册逻辑 |
| [src/styles/tabularView.css](file:///workspace/src/styles/tabularView.css) | CSS 样式 |
| [src/styles/index.ts](file:///workspace/src/styles/index.ts) | 样式导出 |
| [src/main.tsx](file:///workspace/src/main.tsx) | 主入口（已集成） |
