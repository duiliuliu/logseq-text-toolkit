# Tabular View 表格视图插件设计方案

## 一、概述

本插件为 Logseq 提供轻量级的表格视图展示功能。支持两种实现方案：

### 核心特点

1. **两种实现模式：**
   - **Experiments API 模式（推荐）** - 使用官方 `logseq.Experiments.registerBlockRenderer`，更强大
   - **纯 CSS 模式（向后兼容）** - 使用属性选择器，兼容性更好

2. **两种标签模式：**
   - Tags 模式: `#tabular` - 更友好
   - Properties 模式: `#.tabular` - logseq13-missing-commands 兼容

3. **多种表格模式：**
   - 标准表格
   - 紧凑表格
   - 无表头表格
   - 支持深色/浅色主题

---

## 二、技术实现方案对比

### 方案 A: Experiments API 模式（推荐）

**使用 `logseq.Experiments.registerBlockRenderer` API**

| 特点 | 描述 |
|------|------|
| **渲染方式** | 完全替换块主体，用 React 自定义渲染 |
| **数据获取** | 通过 `includeChildren: true` 获得完整的子块树形结构 |
| **条件判断** | `when` 函数决定何时应用此渲染器 |
| **用户体验** | 支持切换回原生大纲视图 |

**核心代码示例：**

```typescript
// 1. 注册渲染器
logseq.Experiments.registerBlockRenderer('tabular-view', {
  // 触发条件：内容包含 #tabular 标签
  when: ({ properties, content }) => {
    return (content?.includes('#tabular') || 
            content?.includes('#.tabular') ||
            properties?.view === 'tabular')
  },
  includeChildren: true, // 包括子块数据
  priority: 20,
  
  // 2. 自定义渲染函数
  render: renderTableView
})

// 3. React 渲染函数
function renderTableView(props) {
  const React = logseq.Experiments.React
  const { children = [] } = props
  
  // 构建表格 UI
  return React.createElement(...)
}
```

---

### 方案 B: 纯 CSS 模式（向后兼容）

**使用 CSS 属性选择器和 Flexbox 布局**

| 特点 | 描述 |
|------|------|
| **渲染方式** | 通过 CSS 改变布局，不修改 DOM 结构 |
| **数据获取** | 不直接获取，纯视觉布局 |
| **条件判断** | 通过 `data-refs-self` 属性选择器匹配 |
| **兼容性** | 最好，完全不依赖实验 API |

**核心选择器示例：**

```css
/* 使用 #tabular 标签 (TAG 模式) */
.ls-block[data-refs-self*='"tabular"'] > .block-children-container > .block-children {
  display: flex;
  flex-direction: column;
}

/* 使用 #.tabular 标签 (PROPERTY 模式) */
.ls-block[data-refs-self*='".tabular"'] > .block-children-container > .block-children {
  display: flex;
  flex-direction: column;
}
```

---

## 三、标签和使用方式

### 3.1 标签列表

| Tags 模式 | Properties 模式 | 功能 |
|----------|----------------|------|
| `#tabular` | `#.tabular` | 标准表格视图 |
| `#tabular-compact` | `#.tabular-compact` | 紧凑表格视图 |
| `#tabular0` | `#.tabular0` | 无表头表格视图 |

### 3.2 使用示例

```
项目管理 #tabular

- 设计文档
  - 状态: 已完成
  - 负责人: 张三
  - 截止日期: 2024-01-15
  
- 开发代码
  - 状态: 进行中
  - 负责人: 李四
  - 截止日期: 2024-02-01
  
- 测试用例
  - 状态: 待开始
  - 负责人: 王五
  - 截止日期: 2024-02-15
```

子块 → 表格行，孙块 → 列单元格

---

## 四、文件说明

| 文件路径 | 说明 |
|---------|------|
| [src/lib/tabularView/register.ts](file:///workspace/src/lib/tabularView/register.ts) | 注册逻辑（两种方案）|
| [src/styles/tabularView.css](file:///workspace/src/styles/tabularView.css) | CSS 样式 |
| [src/styles/index.ts](file:///workspace/src/styles/index.ts) | 样式导出 |
| [src/main.tsx](file:///workspace/src/main.tsx) | 主入口 |

---

## 五、核心实现原理

### Experiments API 流程

```
1. 用户输入块内容 (#tabular 标签)
2. Logseq 检测到标签
3. 检查注册的 block renderer（when 条件）
4. 条件匹配 → 使用 render 函数渲染
5. 获得子块树形结构（includeChildren）
6. 渲染自定义表格 UI
```

### 纯 CSS 流程

```
1. 用户输入块内容
2. 块的 data-refs-self 属性包含 "tabular"
3. CSS 选择器匹配成功
4. 通过 flexbox 改变布局为表格状
```

---

## 六、关键 API 说明

### `registerBlockRenderer`

```typescript
logseq.Experiments.registerBlockRenderer(
  key: string,
  opts: {
    when?: (props: { blockId, properties, content, children }) => boolean
    includeChildren?: boolean
    priority?: number
    render: (props: { blockId, properties, content, children }) => ReactElement
  }
)
```

| 参数 | 说明 |
|------|------|
| `when` | 同步的条件判断函数 |
| `includeChildren` | 是否传入子块树形结构 |
| `priority` | 优先级，最高者生效 |
| `render` | React 渲染函数 |

### `logseq.Experiments.React`

获取 Logseq 宿主的 React 实例，避免重复打包。

---

## 七、触发方式

| 方式 | 操作 |
|------|------|
| 斜杠命令 | `/` → "Insert Tabular View" 等 |
| 右键菜单 | 右键点击块 → "Toggle Tabular View" 等 |
| 快捷键 | `mod + shift + T` |

---

## 八、最佳实践

1. **优先稳定 API**，只在必要时使用实验功能
2. **使用宿主 React**，不要重复打包
3. **条件保持同步**，`when` 不异步操作
4. **用 `before` 预加载依赖**
5. **渲染保持轻量**，避免影响性能
6. **防错处理**，对用户输入做防御性检查
7. **文档说明实验性**，让用户理解风险

---

## 九、参考来源

- [logseq13-missing-commands](https://github.com/stdword/logseq13-missing-commands)
- [Logseq Experiments API Guide](https://github.com/logseq/logseq/blob/master/libs/guides/experiments_api_guide.md)
- [Starter Guide](https://github.com/logseq/logseq/blob/master/libs/guides/starter_guide.md)
- [Plugin Documentation](https://plugins-doc.logseq.com/)
