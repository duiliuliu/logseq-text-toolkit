# Tabular View - Logseq Experiments API 设计方案

## 📋 概述

本方案基于 Logseq Experiments API 的 `registerBlockRenderer` 实现表格视图功能。使用宿主 React，完全自定义块渲染。

### 核心特性

- ✨ **纯 Experiments API 实现** - 使用官方支持的 API
- 📝 **标签支持两种模式** - `#tabular` (Tags) 和 `#.tabular` (Properties)
- 🎯 **三种表格模式** - 标准、紧凑、无表头
- 🎨 **主题兼容** - 自动适配深色/浅色主题
- 🔄 **原生切换** - 用户可以切换回原生视图

---

## 🏗️ 架构设计

### 文件结构

```
src/
├── lib/
│   └── tabularView/
│       └── register.ts          # 核心注册逻辑（已创建）
├── styles/
│   └── tabularView.css          # 表格样式（已创建）
└── test/
    └── components/
        └── TabularViewDemo/     # 测试组件（已创建）
docs/
└── Tabular-View-Design.md       # 本文档
```

### 核心流程

```
1. 用户输入块内容（包含 #tabular）
   ↓
2. Logseq 检测到标签，检查注册的 block renderer
   ↓
3. 执行 when() 条件判断
   ↓
4. 条件满足，调用 render() 函数
   ↓
5. 获得完整子块树形结构（includeChildren: true）
   ↓
6. 使用宿主 React 构建自定义表格 UI
   ↓
7. 用户可以切换回原生视图
```

---

## 🔧 核心 API 使用

### registerBlockRenderer

主要 API 调用位置：[register.ts:42-73](file:///workspace/src/lib/tabularView/register.ts#L42-L73)

```typescript
logseq.Experiments.registerBlockRenderer(
  'tabular-view',
  {
    // 1. 触发条件
    when: ({ properties, content }) => {
      return (
        content?.includes('#tabular') || 
        content?.includes('#.tabular') ||
        properties?.view === 'tabular'
      )
    },
    
    // 2. 获取子块数据
    includeChildren: true,
    
    // 3. 优先级设置
    priority: 20,
    
    // 4. 自定义渲染函数
    render: renderTableView
  }
)
```

### React 渲染函数

渲染实现位置：[register.ts:85-163](file:///workspace/src/lib/tabularView/register.ts#L85-L163)

```typescript
function renderTableView(props) {
  const React = logseq.Experiments.React // 使用宿主 React
  
  const { children = [] } = props // 获得子块数据
  
  // 构建表格 UI
  return React.createElement(...)
}
```

---

## 📝 使用方式

### 1. 斜杠命令触发

输入 `/` 然后选择：

- `Insert Tabular View` - 插入标准表格
- `Insert Tabular View (Compact)` - 插入紧凑表格

### 2. 快捷键触发

- `Mod + Shift + T` - 切换当前块的表格视图

### 3. 右键菜单触发

在块上右键点击，选择 `Toggle Tabular View`

---

## 📊 三种表格模式

### 模式 1: 标准表格 - `#tabular`

```
项目管理 #tabular

- 设计文档
  - 状态: 已完成
  - 负责人: 张三
  - 截止: 2024-01-15

- 开发代码
  - 状态: 进行中
  - 负责人: 李四
  - 截止: 2024-02-01
```

### 模式 2: 紧凑表格 - `#tabular-compact`

```
数据监控 #tabular-compact

- Server-01
  - CPU: 45%
  - Mem: 68%

- Server-02
  - CPU: 78%
  - Mem: 82%
```

### 模式 3: 无表头表格 - `#tabular0`

```
快速统计 #tabular0

- 总用户: 15,420
- 日活跃: 4,321
- 月付费: 2,105
```

---

## 🎨 样式设计

### CSS 架构

样式文件位置：[tabularView.css](file:///workspace/src/styles/tabularView.css)

```css
/* 1. 变量定义（主题适配） */
:root {
  --tabular-border-color: var(--ls-guideline-color, #e0e0e0);
  /* ... */
}

/* 2. Experiments API 模式样式 */
.tabular-container { /* ... */ }
.tabular-row { /* ... */ }
.tabular-cell { /* ... */ }

/* 3. 兼容性 CSS 模式（可选） */
.ls-block[data-refs-self*='".tabular"'] { /* ... */ }
```

### 响应式设计

- 支持深色/浅色主题自动切换
- 使用 CSS 变量适配 Logseq 主题系统
- 悬停效果、边框样式符合 Logseq UI

---

## 💡 数据结构说明

### 子块树形结构

当设置 `includeChildren: true` 时，`render()` 函数会收到这样的数据：

```typescript
{
  blockId: "xxx",
  content: "标题 #tabular",
  children: [
    {
      content: "行标题",
      children: [
        { content: "列数据 1" },
        { content: "列数据 2" },
        { content: "列数据 3" }
      ]
    }
  ]
}
```

---

## 🔌 与现有系统集成

### 注册点

在 [main.tsx](file:///workspace/src/main.tsx) 中已集成：

```typescript
// 注册表格视图功能
registerTabularView()
```

### 样式导出

在 [styles/index.ts](file:///workspace/src/styles/index.ts) 中已导出：

```typescript
export { default as tabularViewCSS } from './tabularView.css?raw'
```

---

## 🧪 测试

### 演示组件

测试组件位置：[TabularViewDemo/index.tsx](file:///workspace/src/test/components/TabularViewDemo/index.tsx)

该组件提供不依赖 Logseq 环境的演示。

### 本地测试建议

1. 启动 Logseq（版本 >= 0.9）
2. 加载插件开发模式
3. 尝试输入带 `#tabular` 的块
4. 验证表格渲染、切换功能

---

## 📚 参考资源

- [Logseq Experiments API Guide](https://github.com/logseq/logseq/blob/master/libs/guides/experiments_api_guide.md)
- [logseq13-missing-commands 参考实现](https://github.com/stdword/logseq13-missing-commands/blob/main/src/css/tabular_view.css)

---

## ⚠️ 注意事项

1. **实验性 API** - `logseq.Experiments` 可能变更
2. **版本兼容** - 需要 Logseq 较新版本（>= 0.9）
3. **优先级设置** - `priority: 20` 可能需要调整
4. **性能优化** - 大型块树可能影响渲染

---

## 📋 完整文件索引

| 文件 | 路径 | 状态 |
|------|------|------|
| 注册逻辑 | [src/lib/tabularView/register.ts](file:///workspace/src/lib/tabularView/register.ts) | ✅ 已创建 |
| CSS 样式 | [src/styles/tabularView.css](file:///workspace/src/styles/tabularView.css) | ✅ 已创建 |
| 测试组件 | [src/test/components/TabularViewDemo/index.tsx](file:///workspace/src/test/components/TabularViewDemo/index.tsx) | ✅ 已创建 |
| 演示 CSS | [src/test/components/TabularViewDemo/tabularViewDemo.css](file:///workspace/src/test/components/TabularViewDemo/tabularViewDemo.css) | ✅ 已创建 |
| 设计文档 | [docs/Tabular-View-Design.md](file:///workspace/docs/Tabular-View-Design.md) | ✅ 本文档 |

---

**设计完成!** 这就是完整的 Logseq Experiments API 表格视图方案。
