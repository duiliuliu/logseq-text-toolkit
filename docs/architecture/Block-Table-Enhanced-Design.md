# Block Table View 增强方案

**版本**: v3.1
**日期**: 2026-05-14
**状态**: 实现完成
**分支**: trae/solo-agent-14EEAQ

---

## 1. 概述

本方案在 [Block-View-Renderer-Design.md](./Block-View-Renderer-Design.md) 基础上，重点增强 **Table 视图** 的功能：

1. **列宽手动调整** - 每个列都支持拖拽调整宽度，调整后保存到宏命令参数
2. **样式自定义** - 支持宏命令和 Settings 全局设置（宏命令优先级 > Settings）
3. **预设主题与自定义主题** - 简化参数，提供预设主题，自定义参数归为自定义主题
4. **动态列** - 列完全动态，由宏命令和用户输入决定，无需预定义

---

## 2. 宏命令设计

### 2.1 宏命令格式

Table 视图通过 `:blockview` 宏命令的参数来配置：

```markdown
{{renderer :blockview table}}
{{renderer :blockview table, theme=notion}}
{{renderer :blockview table, theme=notion, colWidths={"content":300,"page":120,"marker":80}}}
```

### 2.2 参数说明

| 参数 | 类型 | 说明 | 默认值 |
| :--- | :--- | :--- | :--- |
| `view` | string | 视图类型 | Settings 中的 defaultViewType |
| `theme` | string | 预设主题名称 | Settings 中的 table.defaultTheme |
| `colWidths` | string | 列宽 JSON 对象，键为列标识符 | 自动计算 |

### 2.3 预设主题

| 主题名称 | 说明 |
| :--- | :--- |
| `default` | 默认简约风格 |
| `notion` | Notion 风格 |
| `linear` | Linear 风格 |
| `dark` | 深色主题 |
| `gradient` | 渐变风格 |
| `custom` | 自定义主题（使用 Settings 中的 customTheme） |

### 2.4 示例

#### 基础用法
```markdown
{{renderer :blockview table}}
```

#### 使用预设主题
```markdown
{{renderer :blockview table, theme=notion}}
```

#### 自定义列宽
```markdown
{{renderer :blockview table, colWidths={"content":300,"page":120}}}
```

---

## 3. Settings 配置

### 3.1 Settings 类型定义

```typescript
// src/settings/types.ts

export interface BlockViewSettings {
  enabled: boolean;
  defaultViewType: 'table' | 'list' | 'card' | 'timeline';
  table: {
    defaultTheme: 'default' | 'notion' | 'linear' | 'dark' | 'gradient' | 'custom';
    defaultShowStriped: boolean;
    defaultShowBorder: boolean;
    customTheme?: CustomTableTheme;
  };
}

export interface CustomTableTheme {
  borderColor?: string;
  headerBgColor?: string;
  headerTextColor?: string;
  headerBorderColor?: string;
  headerHeight?: string;
  rowBgColor?: string;
  rowHoverBgColor?: string;
  rowBorderColor?: string;
  cellPadding?: string;
  tableBorderRadius?: string;
}

// 在 Settings 接口中添加
export interface Settings {
  // ... 现有字段
  blockView?: BlockViewSettings;
}
```

### 3.2 BlockViewSettings Tab UI 设计

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        Settings Modal                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  ⚙️ General   🔧 Toolbar   📊 Task Progress   🌡️ Heatmap   📋 Block View   ⚡ Advanced  │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                                       │  │
│  │  📋 Block View                                                                         │  │
│  │  ─────────────────────────────────────────────────────────────────────────────────────   │  │
│  │  配置 Block 视图模块的全局默认行为                                                       │  │
│  │                                                                                       │  │
│  │  ┌───────────────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ 启用 Block View                                 [✓]                              │ │  │
│  │  ────────────────────────────────────────────────────────────────────────────────────   │  │
│  │  │ 默认视图类型                                 [▼ Table       ▾]                    │ │  │
│  │  │     [Table] [List] [Card] [Timeline]                                               │ │  │
│  │  ────────────────────────────────────────────────────────────────────────────────────   │  │
│  │                                                                                       │  │
│  │  ┌───────────────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ 📊 Table Settings                                                                  │ │  │
│  │  ────────────────────────────────────────────────────────────────────────────────────   │  │
│  │  │ 默认主题                                      [▼ Default     ▾]                    │ │  │
│  │  │     [Default] [Notion] [Linear] [Dark] [Gradient] [Custom]                         │ │  │
│  │  ────────────────────────────────────────────────────────────────────────────────────   │  │
│  │  │ 显示斑马纹行                                  [✓]                                  │ │  │
│  │  ────────────────────────────────────────────────────────────────────────────────────   │  │
│  │  │ 显示边框                                      [✓]                                  │ │  │
│  │  ────────────────────────────────────────────────────────────────────────────────────   │  │
│  │                                                                                       │  │
│  │  ┌───────────────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ 🔧 自定义主题配置 (仅当默认主题 = Custom 时)                                       │ │  │
│  │  ────────────────────────────────────────────────────────────────────────────────────   │  │
│  │  │ 边框颜色                [⌬ #e2e8f0]                 圆角大小          [8px]         │ │  │
│  │  ────────────────────────────────────────────────────────────────────────────────────   │  │
│  │  │ 表头背景色              [⌬ #f8fafc]                 表头文字色      [⌬ #374151]    │ │  │
│  │  ────────────────────────────────────────────────────────────────────────────────────   │  │
│  │  │ 行背景色                [⌬ #ffffff]                 行悬停背景色    [⌬ #f1f5f9]    │ │  │
│  │  ────────────────────────────────────────────────────────────────────────────────────   │  │
│  │                                                                                       │  │
│  │                                            [ 💾 保存 Block View 设置 ]                  │  │
│  │                                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Block View 渲染效果图

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐ │
│  │  [📊 Table]  [📜 List]  [📇 Card]  [📅 Timeline]                                       │ │
│  │  ────────────────────────────────────────────────────────────────────────────────────   │ │
│  │                                                                                       │ │
│  │  ┌───────────────────────────────────────────────────────────────────────────────────┐ │ │
│  │  │ 标记  │ 内容                        │ 页面                      │ 更新时间      │ │ │
│  │  │ ───── ┼ ─────────────────────────── ┼ ─────────────────────────── ┼ ───────────── │ │ │
│  │  │ ✓     │ 完成项目计划文档             │ 周度总结 - 2026年第19周   │ 2026-05-12    │ │ │
│  │  │ ○     │ 设计 UI 界面原型             │ 周度总结 - 2026年第19周   │ 2026-05-13    │ │ │
│  │  │ ●     │ 实现核心功能模块             │ 周度总结 - 2026年第19周   │ 2026-05-14    │ │ │
│  │  │ ◐     │ 编写测试用例                 │ 周度总结 - 2026年第19周   │ 2026-05-14    │ │ │
│  │  └───────────────────────────────────────────────────────────────────────────────────┘ │ │
│  │                              ║                                 ║                       │ │
│  │  ──────────────────────────────║──────────────────────────────────║───────────────────   │ │
│  │                              ║      Column  Resizing             ║                       │ │
│  │                              ║                                 ║                       │ │
│  └───────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Column Resizing 示意图

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  Table Column Resizing                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐ │
│  │ 标记    │ 内容                          │ 页面                          │ 更新时间        │ │
│  │ ────────┼───────────────────────────────┼───────────────────────────────┼──────────────── │ │
│  │ ✓       │ 完成项目计划文档               │ 周度总结 - 2026年第19周        │ 2026-05-12     │ │
│  │ ○       │ 设计 UI 界面原型               │ 周度总结 - 2026年第19周        │ 2026-05-13     │ │
│  │         │                               │                               │                 │ │
│  │         │                               │                               │                 │ │
│  └───────────────────────────────────────────────────────────────────────────────────────┘ │
│              │             │             │                                             │
│              │ Drag handle │ Drag handle │ Drag handle                                 │
│              │ (hover)     │ (hover)     │ (hover)                                     │
│              ▼             ▼             ▼                                             │
│         ┌─────┐       ┌─────┐       ┌─────┐                                         │
│         │ ║   │       │ ║   │       │ ║   │                                         │
│         └─────┘       └─────┘       └─────┘                                         │
│           ←→ 调整宽度                                                                   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 列宽调整功能

### 4.1 实现方式

在 React 组件中直接实现列宽调整功能（符合 heatmap 模式）：

```typescript
// 在 BlockView/TableView.tsx 中
const [columnWidths, setColumnWidths] = useState<{[key: string]: number}>(
  config.columnWidths || {}
);

const handleMouseDown = (e: React.MouseEvent, columnKey: string, initialWidth: number) => {
  // 拖拽开始
}

useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    // 实时更新宽度
  }
  
  const handleMouseUp = () => {
    // 保存到宏参数
    if (onColumnWidthChange) {
      onColumnWidthChange(resizingRef.current, columnWidths[resizingRef.current]);
    }
  }
}, []);
```

### 4.2 参数更新机制

使用 `updateBlockViewArgs` 函数（来自 `rendererArgs.ts`）正确更新宏参数：

```typescript
// 更新列宽
const handleColumnWidthChange = useCallback(async (columnKey: string, width: number) => {
  if (onBlockId) {
    const currentBlock = await logseqAPI.Editor.getBlock(onBlockId);
    if (currentBlock?.content) {
      const newWidths = {
        ...columnWidths,
        [columnKey]: width
      };
      const updatedContent = updateBlockViewArgs(currentBlock.content, {
        colWidths: JSON.stringify(newWidths)
      });
      await logseqAPI.Editor.updateBlock(onBlockId, updatedContent);
    }
  }
}, [onBlockId, columnWidths]);
```

---

## 5. 主题系统

### 5.1 预设主题定义

```typescript
// src/lib/blockView/types.ts

export const PRESET_THEMES: Record<Exclude<TableTheme, 'custom'>, CustomTableTheme> = {
  default: {
    borderColor: '#e2e8f0',
    headerBgColor: '#f8fafc',
    headerTextColor: '#374151',
    headerBorderColor: '#cbd5e1',
    headerHeight: '40px',
    rowBgColor: '#ffffff',
    rowHoverBgColor: '#f1f5f9',
    rowBorderColor: '#e2e8f0',
    cellPadding: '8px 12px',
    tableBorderRadius: '8px'
  },
  notion: {
    borderColor: '#e5e7eb',
    headerBgColor: '#ffffff',
    headerTextColor: '#374151',
    headerBorderColor: '#e5e7eb',
    headerHeight: '40px',
    rowBgColor: '#ffffff',
    rowHoverBgColor: '#f9fafb',
    rowBorderColor: '#e5e7eb',
    cellPadding: '8px 12px',
    tableBorderRadius: '6px'
  },
  linear: {
    borderColor: '#e5e7eb',
    headerBgColor: '#f9fafb',
    headerTextColor: '#374151',
    headerBorderColor: '#e5e7eb',
    headerHeight: '36px',
    rowBgColor: '#ffffff',
    rowHoverBgColor: '#f3f4f6',
    rowBorderColor: '#e5e7eb',
    cellPadding: '6px 12px',
    tableBorderRadius: '4px'
  },
  dark: {
    borderColor: '#374151',
    headerBgColor: '#1f2937',
    headerTextColor: '#f9fafb',
    headerBorderColor: '#374151',
    headerHeight: '40px',
    rowBgColor: '#0f172a',
    rowHoverBgColor: '#1f2937',
    rowBorderColor: '#374151',
    cellPadding: '8px 12px',
    tableBorderRadius: '8px'
  },
  gradient: {
    borderColor: '#dbeafe',
    headerBgColor: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    headerTextColor: '#ffffff',
    headerBorderColor: '#2563eb',
    headerHeight: '44px',
    rowBgColor: '#ffffff',
    rowHoverBgColor: '#eff6ff',
    rowBorderColor: '#dbeafe',
    cellPadding: '10px 12px',
    tableBorderRadius: '12px'
  },
};
```

### 5.2 参数优先级

1. **宏命令参数**（最高优先级）
2. **Settings 配置**（默认配置）
3. **默认值**（内置预设）

---

## 6. 实现状态

✅ **完成实现**

### 已实现文件：

1. `src/lib/blockView/types.ts` - 类型定义
2. `src/lib/blockView/query.ts` - 数据查询
3. `src/lib/blockView/register.ts` - 宏命令注册
4. `src/components/BlockView/BlockView.tsx` - 主组件
5. `src/components/BlockView/TableView.tsx` - Table 视图
6. `src/components/BlockView/blockView.css` - 样式
7. `src/components/SettingsModal/tabs/BlockViewSettings.tsx` - 设置面板
8. 更新了 `src/settings/types.ts`, `defaultSettings.json`, `initializer.ts`, `main.tsx`

### 测试应用：

- 创建了 `src/test/components/BlockViewDemo.tsx`
- 添加到 `testAPP.tsx`，用于本地测试和预览

---

**文档结束**
