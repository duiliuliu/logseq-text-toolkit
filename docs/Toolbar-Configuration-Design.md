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

#### 执行器系统
- 实现了 `ActionExecutor` 类，支持：
  - 注册不同类型的执行器
  - 管理自定义功能
  - 提供统一的执行接口

#### 执行器实现
- **Comment 执行器**：处理评论相关功能
- **TextProcessor 执行器**：处理文本替换和正则替换
- **ExternalPlugin 执行器**：调用外部插件功能

#### 功能注册
- 提供 `registerExecutor` 方法，允许动态注册新功能
- 支持 `invoke` 类型扩展
- 实现了 `ExecutorRegistry` 类，集中管理所有执行器的注册

### 2.5 代码组织建议

#### 目录结构
```
src/
├── components/
│   ├── Toolbar/
│   │   ├── index.tsx          # 主工具栏组件
│   │   ├── types.ts           # 类型定义
│   │   ├── ToolbarLogic.ts    # 工具栏逻辑
│   │   ├── textProcessor.ts   # 文本处理
│   │   └── toolbar.css        # 样式
│   ├── SelectToolbar/
│   │   ├── index.tsx          # 选择工具栏
│   │   └── selectToolbar.css  # 样式
│   └── Comment/
│       ├── CommentApp.tsx     # 评论应用
│       ├── CommentModal.tsx   # 评论模态框
│       └── types.ts           # 评论类型定义
├── settings/
│   ├── defaultSettings.json   # 默认配置
│   └── useSettings.tsx        # 配置 hook
└── lib/
    ├── toolbar/
    │   ├── types.ts           # 核心类型
    │   ├── EventBus.ts        # 事件总线
    │   ├── ConfigParser.ts    # 配置解析器
    │   ├── ActionExecutor.ts  # 功能执行器
    │   ├── ToolbarManager.ts  # 工具栏管理器
    │   ├── ExecutorRegistry.ts # 执行器注册器
    │   └── executors/         # 执行器实现
    │       ├── CommentExecutor.ts       # 评论执行器
    │       ├── TextProcessorExecutor.ts # 文本处理执行器
    │       └── ExternalPluginExecutor.ts # 外部插件执行器
    ├── textReplace/
    │   └── utils.ts           # 文本替换工具
    ├── logger/
    │   └── logger.ts          # 日志系统
    └── logseq/
        ├── index.ts            # Logseq API 封装
        └── utils.ts           # Logseq 工具函数
```

## 3. 实现细节

### 3.1 核心类设计

#### ToolbarManager
- **职责**：管理整个工具栏系统
- **方法**：
  - `initialize(config)`：初始化配置，注册执行器
  - `registerAction(id, handler)`：注册新功能
  - `registerClickFuncAction(clickFunc, handler)`：注册点击函数执行器
  - `executeAction(item, selectedData)`：执行功能
  - `getToolbarItems()`：获取处理后的工具栏项目
  - `isReady()`：检查是否已初始化
  - `setLanguage(language)`：设置语言
  - `reset()`：重置状态

#### ConfigParser
- **职责**：解析和验证配置
- **方法**：
  - `parse(config)`：解析配置
  - `validate(config)`：验证配置结构
  - `getItem(id)`：获取指定项目
  - `getItems()`：获取所有项目
  - `buildItemMap(items)`：构建项目映射

#### EventBus
- **职责**：处理组件间通信
- **方法**：
  - `on(event, handler)`：订阅事件
  - `emit(event, data)`：发布事件
  - `off(event, handler)`：取消订阅
  - `clear()`：清除所有事件监听器

#### ActionExecutor
- **职责**：执行工具栏功能
- **方法**：
  - `execute(item, selectedData)`：执行功能
  - `registerExecutor(mode, executor)`：注册模式执行器
  - `registerClickFuncExecutor(clickFunc, executor)`：注册点击函数执行器
  - `setLanguage(language)`：设置语言
  - `registerDefaultExecutors()`：注册默认执行器

#### ExecutorRegistry
- **职责**：集中管理执行器注册
- **方法**：
  - `registerExecutors()`：注册所有执行器

### 3.2 组件设计

#### SelectToolbar
- **职责**：处理文本选择和工具栏定位
- **Props**：
  - `targetElement`：目标元素
  - `items`：工具栏项目
  - `theme`：主题
  - `showBorder`：是否显示边框
  - `width`：宽度
  - `height`：高度
  - `hoverDelay`：悬停延迟
  - `sponsorEnabled`：是否启用赞助商
- **内部状态**：
  - `selectedData`：选中数据
  - `toolbarPosition`：工具栏位置
  - `showToolbar`：是否显示工具栏

#### Toolbar
- **职责**：渲染工具栏 UI
- **Props**：
  - `items`：工具栏项目
  - `theme`：主题
  - `showBorder`：是否显示边框
  - `width`：宽度
  - `height`：高度
  - `selectedData`：选中数据
  - `hoverDelay`：悬停延迟
  - `onItemClick`：项目点击回调（可选，优先使用 EventBus）
  - `sponsorEnabled`：是否启用赞助商
  - `language`：语言
- **内部状态**：
  - `hoveredItem`： hover 项目
  - `mouseOverGroup`：悬停的分组
  - `moreExpanded`：是否展开更多项目

### 3.3 执行器实现

#### Comment 执行器
- **功能**：处理评论相关功能
- **支持的 invoke 类型**：`comment`、`inlineComment`、`invokeInlineComment`
- **实现**：
  - 发布评论调用事件 `ltt-invoke:comment`
  - 传递选中数据和模板参数

#### TextProcessor 执行器
- **功能**：处理文本替换和正则替换
- **支持的 invoke 类型**：`replace`、`regexReplace`
- **实现**：
  - `replace`：普通文本替换
  - `regexReplace`：正则表达式替换
  - 调用 `updateBlockContent` 更新块内容

#### ExternalPlugin 执行器
- **功能**：调用外部插件功能
- **支持的 invoke 类型**：`invokeExternalPlugin`
- **实现**：
  - 解析插件命令 `pluginId.command`
  - 检查插件是否安装且启用
  - 调用 `logseq.App.invokeExternalPlugin`
  - 处理返回结果

### 3.4 配置示例

#### 基本配置
```json
{
  "id": "wrap-bold",
  "label": "Bold",
  "icon": "<svg>...</svg>",
  "invoke": "replace",
  "invokeParams": "**${selectedText}**",
  "binding": "mod+b"
}
```

#### 评论配置
```json
{
  "id": "wrap-inline-comment",
  "label": "Inline Comment",
  "icon": "<svg>...</svg>",
  "invoke": "invokeInlineComment",
  "invokeParams": "[:span.inline-comment {:data-comment ${comment}} ${selectedText}]"
}
```

#### 外部插件配置
```json
{
  "id": "invoke-external-plugin",
  "label": "External Plugin",
  "icon": "<svg>...</svg>",
  "invoke": "invokeExternalPlugin",
  "invokeParams": "pluginId.command"
}
```

### 3.5 数据流设计

1. **配置加载**：
   - 从 `defaultSettings.json` 加载配置
   - `ConfigParser` 解析和验证配置
   - `ToolbarManager` 初始化，注册执行器

2. **事件流程**：
   - 用户选择文本 → `SelectToolbar` 触发 `ltt-selectionChange` 事件
   - `SelectToolbar` 计算工具栏位置并显示
   - 用户点击工具栏项目 → `Toolbar` 调用 `handleItemClick`
   - `SelectToolbar` 调用 `toolbarManager.executeAction`
   - `ToolbarManager` 执行对应功能
   - 功能执行完成 → 触发 `ltt-textProcessed` 事件
   - 相关组件响应事件

3. **执行器流程**：
   - `ToolbarManager` 调用 `actionExecutor.execute`
   - `ActionExecutor` 根据 `item.invoke` 找到对应的执行器
   - 执行器执行具体功能
   - 返回处理结果

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
