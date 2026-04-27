# 工具栏配置化与扩展设计方案

## 1. 需求分析

### 核心需求
- 工具栏元素根据 `defaultSettings.json` 配置化
- 支持后续功能扩展
- 优化 `onTextProcessed` 和 `onItemClick` 等参数传递，避免重复
- 保持组件职责清晰，便于维护

### 扩展需求
- 支持更多类型的工具栏项目（按钮、下拉菜单、分隔线等）
- 支持自定义功能模式（funcmode）
- 支持国际化
- 支持主题适配

## 2. 技术方案设计

### 2.1 组件架构设计

#### 现有架构
- **SelectToolbar**：负责文本选择、工具栏定位、显示/隐藏
- **Toolbar**：负责渲染工具栏项目、处理点击事件

#### 优化架构
1. **核心组件**：
   - **ToolbarManager**：核心管理器，负责配置解析、事件分发
   - **SelectToolbar**：处理文本选择和工具栏定位
   - **Toolbar**：渲染工具栏 UI
   - **ToolbarItem**：单个工具栏项目组件
   - **ToolbarGroup**：工具栏分组组件

2. **职责分离**：
   - **配置层**：处理配置解析和验证
   - **逻辑层**：处理事件分发和功能执行
   - **UI层**：负责渲染和交互

### 2.2 配置系统设计

#### 配置结构优化
```json
{
  "ToolbarItems": [
    {
      "id": "group-custom",
      "label": "Format",
      "type": "group",
      "icon": "<svg>...</svg>",
      "subItems": [
        {
          "id": "wrap-bold",
          "label": "Bold",
          "type": "button",
          "icon": "<svg>...</svg>",
          "funcmode": "replace",
          "clickfunc": "**${selectedText}**",
          "binding": "mod+b"
        }
      ]
    }
  ]
}
```

#### 配置解析器
- 实现 `ConfigParser` 类，负责：
  - 验证配置结构
  - 处理默认值
  - 提供配置访问接口

### 2.3 事件处理机制

#### 事件总线设计
- 实现 `EventBus` 类，用于组件间通信
- 支持事件订阅/发布模式
- 避免 props 深层传递

#### 功能执行器
- 实现 `ActionExecutor` 类，负责：
  - 处理不同 `funcmode` 的执行逻辑
  - 管理自定义功能注册
  - 提供统一的执行接口

### 2.4 扩展机制

#### 插件系统
- 实现 `PluginSystem` 类，支持：
  - 注册新功能
  - 扩展工具栏项目类型
  - 自定义事件处理

#### 功能注册
- 提供 `registerAction` 方法，允许动态注册新功能
- 支持 `funcmode` 扩展

### 2.5 代码组织建议

#### 目录结构
```
src/
├── components/
│   ├── Toolbar/
│   │   ├── index.tsx          # 主工具栏组件
│   │   ├── ToolbarItem.tsx    # 单个工具栏项目
│   │   ├── ToolbarGroup.tsx   # 工具栏分组
│   │   ├── types.ts           # 类型定义
│   │   └── toolbar.css        # 样式
│   ├── SelectToolbar/
│   │   ├── index.tsx          # 选择工具栏
│   │   └── selectToolbar.css  # 样式
│   └── ToolbarManager/
│       ├── index.tsx          # 工具栏管理器
│       ├── ConfigParser.ts    # 配置解析器
│       ├── EventBus.ts        # 事件总线
│       └── ActionExecutor.ts  # 功能执行器
├── settings/
│   ├── defaultSettings.json   # 默认配置
│   └── useSettings.tsx        # 配置 hook
└── lib/
    └── toolbar/
        ├── types.ts           # 核心类型
        └── utils.ts           # 工具函数
```

## 3. 实现细节

### 3.1 核心类设计

#### ToolbarManager
- **职责**：管理整个工具栏系统
- **方法**：
  - `initialize(config)`：初始化配置
  - `registerAction(id, handler)`：注册新功能
  - `executeAction(item, selectedData)`：执行功能
  - `getToolbarItems()`：获取处理后的工具栏项目

#### ConfigParser
- **职责**：解析和验证配置
- **方法**：
  - `parse(config)`：解析配置
  - `validate(config)`：验证配置结构
  - `getItem(id)`：获取指定项目

#### EventBus
- **职责**：处理组件间通信
- **方法**：
  - `on(event, handler)`：订阅事件
  - `emit(event, data)`：发布事件
  - `off(event, handler)`：取消订阅

#### ActionExecutor
- **职责**：执行工具栏功能
- **方法**：
  - `execute(item, selectedData)`：执行功能
  - `registerExecutor(mode, executor)`：注册模式执行器

### 3.2 组件设计

#### SelectToolbar
- **职责**：处理文本选择和工具栏定位
- **Props**：
  - `targetElement`：目标元素
  - `onSelectionChange`：选择变化回调
- **内部状态**：
  - `selectedData`：选中数据
  - `toolbarPosition`：工具栏位置
  - `showToolbar`：是否显示工具栏

#### Toolbar
- **职责**：渲染工具栏 UI
- **Props**：
  - `items`：工具栏项目
  - `theme`：主题
  - `onItemClick`：项目点击回调（可选，优先使用 EventBus）
- **内部状态**：
  - `hoveredItem`： hover 项目
  - `expandedGroups`：展开的分组

### 3.3 数据流设计

1. **配置加载**：
   - 从 `defaultSettings.json` 加载配置
   - `ConfigParser` 解析和验证配置
   - `ToolbarManager` 初始化

2. **事件流程**：
   - 用户选择文本 → `SelectToolbar` 触发 `selectionChange` 事件
   - `ToolbarManager` 接收事件 → 计算工具栏位置
   - `SelectToolbar` 显示工具栏
   - 用户点击工具栏项目 → `Toolbar` 触发 `itemClick` 事件
   - `ToolbarManager` 接收事件 → 执行对应功能
   - 功能执行完成 → 触发 `textProcessed` 事件
   - 相关组件响应事件

## 4. 优势与收益

### 4.1 优势
- **配置化**：通过 JSON 配置工具栏，无需修改代码
- **可扩展**：支持插件系统，方便添加新功能
- **职责清晰**：组件职责分离，便于维护
- **性能优化**：避免 props 深层传递，使用事件总线
- **类型安全**：完善的 TypeScript 类型定义

### 4.2 收益
- **开发效率**：新功能只需添加配置和注册功能
- **维护成本**：代码结构清晰，易于理解和修改
- **用户体验**：响应速度快，交互流畅
- **扩展性**：可轻松添加新的工具栏项目和功能

## 5. 实现路径

1. **阶段一**：核心架构搭建
   - 实现 `ToolbarManager`、`ConfigParser`、`EventBus`、`ActionExecutor`
   - 重构 `Toolbar` 和 `SelectToolbar` 组件

2. **阶段二**：功能实现
   - 实现配置解析和验证
   - 实现事件总线和功能执行器
   - 集成现有功能

3. **阶段三**：扩展机制
   - 实现插件系统
   - 支持自定义功能注册
   - 完善类型定义

4. **阶段四**：优化与测试
   - 性能优化
   - 兼容性测试
   - 文档完善

## 6. 技术栈

- **前端框架**：React 18+
- **类型系统**：TypeScript
- **状态管理**：React Hooks + 事件总线
- **样式**：CSS Modules / styled-components
- **构建工具**：Vite
