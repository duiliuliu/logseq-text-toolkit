# 更新日志 - 2026-04-25 (第二版)

## 主要更新

### 1. 工具栏架构重构 - 配置化与可扩展设计

#### 核心架构组件

- **新增 `lib/toolbar/` 目录**，包含完整的工具栏管理系统
  - `types.ts`: 完整的类型定义，包括事件类型、接口定义
  - `EventBus.ts`: 事件总线实现，支持订阅/发布模式
  - `ConfigParser.ts`: 配置解析器，处理 defaultSettings.json 配置
  - `ActionExecutor.ts`: 功能执行器，管理不同 funcmode 的执行
  - `ToolbarManager.ts`: 工具栏管理器，整合所有核心功能
  - `index.ts`: 统一导出入口

#### 组件重构

- **重构 `SelectToolbar` 组件**
  - 集成工具栏管理器初始化
  - 使用事件总线处理文本选择和处理完成事件
  - 简化组件逻辑，职责更清晰
  - 移除重复的 `onTextProcessed` 回调，使用事件总线替代

- **重构 `Toolbar` 组件**
  - 保留 `onItemClick` 参数，同时支持向后兼容
  - 移除重复的 `onTextProcessed` 参数
  - 简化组件接口

#### 事件系统

实现完整的事件总线，支持以下事件类型：
- `selectionChange`: 文本选择变化事件
- `itemClick`: 工具栏项目点击事件
- `textProcessed`: 文本处理完成事件
- `showToolbar`: 显示工具栏事件
- `hideToolbar`: 隐藏工具栏事件

### 2. 技术架构改进

#### 优点

- **配置化**: 通过 defaultSettings.json 完全配置工具栏，无需修改代码
- **可扩展**: 提供插件系统，支持注册自定义功能
- **职责清晰**: 配置层、逻辑层、UI层职责分离
- **性能优化**: 避免 props 深层传递，使用事件总线
- **类型安全**: 完善的 TypeScript 类型定义

#### 向后兼容

保持现有功能完整，同时支持新架构：
- 保留原有配置格式
- 保留现有 API 接口
- 新增功能通过扩展方式实现

### 3. 文件变更

#### 新增文件

- `src/lib/toolbar/types.ts`: 工具栏核心类型定义
- `src/lib/toolbar/EventBus.ts`: 事件总线实现
- `src/lib/toolbar/ConfigParser.ts`: 配置解析器实现
- `src/lib/toolbar/ActionExecutor.ts`: 功能执行器实现
- `src/lib/toolbar/ToolbarManager.ts`: 工具栏管理器实现
- `src/lib/toolbar/index.ts`: 模块统一导出

#### 修改文件

- `src/components/SelectToolbar/index.tsx`: 重构组件，集成新架构
- `src/components/Toolbar/index.tsx`: 简化组件接口

## 技术栈

- **前端框架**: React 18+
- **类型系统**: TypeScript
- **状态管理**: React Hooks + 事件总线
- **构建工具**: Vite

## 后续计划

1. **完善插件系统**: 实现完整的功能注册和扩展机制
2. **配置验证**: 增强配置解析器的验证和错误提示
3. **性能优化**: 进一步优化组件渲染和事件处理性能
4. **单元测试**: 添加核心模块的单元测试
5. **文档完善**: 编写详细的开发文档和用户指南
