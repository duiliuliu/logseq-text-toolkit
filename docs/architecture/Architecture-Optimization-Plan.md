# 架构优化方案

## 1. 当前架构分析

### 1.1 现有架构
- **核心模块**:
  - `lib/toolbar/`: 工具栏管理相关模块
  - `lib/textReplace/`: 文本替换相关功能
  - `components/`: React 组件
  - `settings/`: 设置管理
  - `logseq/`: Logseq 相关接口
  - `translations/`: 国际化

### 1.2 存在的问题
1. **模块职责混合**: 部分模块职责不清晰，功能交叉
2. **依赖关系复杂**: 组件间依赖关系复杂，难以维护
3. **配置管理分散**: 配置信息分散在多个文件中
4. **代码组织混乱**: 部分代码组织不合理，文件结构不清晰
5. **扩展性受限**: 现有架构扩展性较差，难以添加新功能
6. **可测试性差**: 代码耦合度高，难以进行单元测试

## 2. 优化目标

- **模块化**: 清晰的模块划分，职责单一
- **低耦合**: 减少模块间的直接依赖
- **高内聚**: 相关功能集中在同一模块
- **可扩展**: 易于添加新功能和模块
- **可测试**: 便于单元测试和集成测试
- **可维护**: 代码结构清晰，易于理解和维护

## 3. 核心改进措施

### 3.1 模块职责划分

#### 3.1.1 核心模块重构
- **`core/`**: 核心功能模块
  - `executors/`: 执行器模块
  - `services/`: 服务模块
  - `utils/`: 工具函数
  - `types/`: 类型定义

- **`features/`**: 功能模块
  - `toolbar/`: 工具栏功能
  - `text-process/`: 文本处理功能
  - `comment/`: 评论功能
  - `settings/`: 设置功能

- **`ui/`**: 界面组件
  - `components/`: 通用组件
  - `layouts/`: 布局组件
  - `hooks/`: 自定义钩子

- **`infra/`**: 基础设施
  - `logseq/`: Logseq 集成
  - `i18n/`: 国际化
  - `config/`: 配置管理
  - `logger/`: 日志系统

### 3.2 依赖注入

- **服务容器**: 创建服务容器，管理依赖关系
- **依赖注入**: 使用依赖注入模式，减少硬编码依赖
- **接口抽象**: 定义接口，实现依赖倒置

### 3.3 配置管理

- **集中配置**: 集中管理所有配置项
- **环境变量**: 支持不同环境的配置
- **配置验证**: 配置项的验证和默认值
- **动态配置**: 支持运行时配置更新

### 3.4 代码组织

- **文件结构优化**: 按功能和职责组织文件
- **命名规范**: 统一命名规范
- **代码风格**: 统一代码风格
- **文档完善**: 添加详细的代码注释和文档

### 3.5 扩展性

- **插件系统**: 实现插件系统，支持第三方扩展
- **事件系统**: 完善事件系统，支持松耦合通信
- **可插拔组件**: 实现可插拔的组件系统

### 3.6 可测试性

- **单元测试**: 为核心功能添加单元测试
- **集成测试**: 为关键流程添加集成测试
- **测试工具**: 提供测试工具和辅助函数
- **测试覆盖率**: 提高测试覆盖率

## 4. 技术实现

### 4.1 目录结构

```
src/
├── core/                # 核心功能
│   ├── executors/       # 执行器
│   │   ├── index.ts
│   │   ├── CommentExecutor.ts
│   │   ├── TextProcessorExecutor.ts
│   │   └── ExternalPluginExecutor.ts
│   ├── services/        # 服务
│   │   ├── index.ts
│   │   ├── ToolbarService.ts
│   │   ├── TextProcessingService.ts
│   │   └── CommentService.ts
│   ├── utils/           # 工具函数
│   │   ├── index.ts
│   │   ├── textReplace.ts
│   │   └── validation.ts
│   └── types/           # 类型定义
│       ├── index.ts
│       ├── toolbar.ts
│       ├── text.ts
│       └── comment.ts
├── features/            # 功能模块
│   ├── toolbar/         # 工具栏
│   │   ├── components/  # 组件
│   │   ├── hooks/       # 钩子
│   │   └── index.ts
│   ├── text-process/     # 文本处理
│   │   ├── components/  # 组件
│   │   ├── hooks/       # 钩子
│   │   └── index.ts
│   ├── comment/         # 评论
│   │   ├── components/  # 组件
│   │   ├── hooks/       # 钩子
│   │   └── index.ts
│   └── settings/        # 设置
│       ├── components/  # 组件
│       ├── hooks/       # 钩子
│       └── index.ts
├── ui/                  # 界面组件
│   ├── components/      # 通用组件
│   │   ├── Button/
│   │   ├── Modal/
│   │   └── index.ts
│   ├── layouts/         # 布局组件
│   │   ├── MainLayout/
│   │   └── index.ts
│   └── hooks/           # 自定义钩子
│       ├── useClickOutside.ts
│       ├── useDebounce.ts
│       └── index.ts
├── infra/               # 基础设施
│   ├── logseq/          # Logseq 集成
│   │   ├── api.ts
│   │   ├── mock.ts
│   │   └── index.ts
│   ├── i18n/            # 国际化
│   │   ├── index.ts
│   │   ├── context.ts
│   │   └── languages/
│   ├── config/          # 配置管理
│   │   ├── index.ts
│   │   ├── default.ts
│   │   └── validator.ts
│   └── logger/          # 日志系统
│       ├── index.ts
│       └── logger.ts
├── app/                 # 应用
│   ├── App.tsx
│   ├── main.tsx
│   └── routes.ts
└── index.html
```

### 4.2 服务容器实现

#### 4.2.1 服务容器 (`core/services/container.ts`)

```typescript
import { ToolbarService } from './ToolbarService';
import { TextProcessingService } from './TextProcessingService';
import { CommentService } from './CommentService';

interface ServiceContainer {
  toolbarService: ToolbarService;
  textProcessingService: TextProcessingService;
  commentService: CommentService;
}

class ServiceContainerImpl implements ServiceContainer {
  private static instance: ServiceContainerImpl;
  private _toolbarService: ToolbarService | null = null;
  private _textProcessingService: TextProcessingService | null = null;
  private _commentService: CommentService | null = null;

  private constructor() {}

  public static getInstance(): ServiceContainerImpl {
    if (!ServiceContainerImpl.instance) {
      ServiceContainerImpl.instance = new ServiceContainerImpl();
    }
    return ServiceContainerImpl.instance;
  }

  public get toolbarService(): ToolbarService {
    if (!this._toolbarService) {
      this._toolbarService = new ToolbarService();
    }
    return this._toolbarService;
  }

  public get textProcessingService(): TextProcessingService {
    if (!this._textProcessingService) {
      this._textProcessingService = new TextProcessingService();
    }
    return this._textProcessingService;
  }

  public get commentService(): CommentService {
    if (!this._commentService) {
      this._commentService = new CommentService();
    }
    return this._commentService;
  }

  public reset(): void {
    this._toolbarService = null;
    this._textProcessingService = null;
    this._commentService = null;
  }
}

export const serviceContainer = ServiceContainerImpl.getInstance();
export type { ServiceContainer };
```

#### 4.2.2 服务基类 (`core/services/BaseService.ts`)

```typescript
import { serviceContainer } from './container';

export abstract class BaseService {
  protected get services() {
    return serviceContainer;
  }

  protected abstract initialize(): void;
  protected abstract reset(): void;
}
```

### 4.3 配置管理实现

#### 4.3.1 配置管理 (`infra/config/index.ts`)

```typescript
import { defaultConfig } from './default';
import { validateConfig } from './validator';

export interface Config {
  toolbar: {
    enabled: boolean;
    items: Array<any>;
  };
  language: string;
  theme: 'light' | 'dark' | 'system';
  hoverDelay: number;
  [key: string]: any;
}

class ConfigManager {
  private static instance: ConfigManager;
  private _config: Config;

  private constructor() {
    this._config = { ...defaultConfig };
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public get config(): Config {
    return { ...this._config };
  }

  public updateConfig(newConfig: Partial<Config>): boolean {
    const mergedConfig = { ...this._config, ...newConfig };
    const validation = validateConfig(mergedConfig);

    if (validation.isValid) {
      this._config = mergedConfig;
      return true;
    }

    return false;
  }

  public reset(): void {
    this._config = { ...defaultConfig };
  }
}

export const configManager = ConfigManager.getInstance();
export default configManager;
```

### 4.4 事件系统实现

#### 4.4.1 事件系统 (`core/services/EventService.ts`)

```typescript
export type EventType = string;

export interface EventData {
  [key: string]: any;
}

export type EventHandler<T extends EventData> = (data: T) => void;

class EventService {
  private static instance: EventService;
  private eventHandlers: Map<EventType, Set<EventHandler<any>>> = new Map();

  private constructor() {}

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  public on<T extends EventData>(event: EventType, handler: EventHandler<T>): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(handler);
  }

  public off<T extends EventData>(event: EventType, handler: EventHandler<T>): void {
    this.eventHandlers.get(event)?.delete(handler);
  }

  public emit<T extends EventData>(event: EventType, data: T): void {
    this.eventHandlers.get(event)?.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error handling event ${event}:`, error);
      }
    });
  }

  public clear(): void {
    this.eventHandlers.clear();
  }
}

export const eventService = EventService.getInstance();
export default eventService;
```

### 4.5 插件系统实现

#### 4.5.1 插件系统 (`core/services/PluginService.ts`)

```typescript
import { eventService } from './EventService';

export interface Plugin {
  id: string;
  name: string;
  version: string;
  initialize: () => void;
  destroy: () => void;
  [key: string]: any;
}

class PluginService {
  private static instance: PluginService;
  private plugins: Map<string, Plugin> = new Map();

  private constructor() {}

  public static getInstance(): PluginService {
    if (!PluginService.instance) {
      PluginService.instance = new PluginService();
    }
    return PluginService.instance;
  }

  public registerPlugin(plugin: Plugin): boolean {
    if (this.plugins.has(plugin.id)) {
      return false;
    }

    try {
      plugin.initialize();
      this.plugins.set(plugin.id, plugin);
      eventService.emit('plugin:registered', { plugin });
      return true;
    } catch (error) {
      console.error(`Failed to register plugin ${plugin.id}:`, error);
      return false;
    }
  }

  public unregisterPlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return false;
    }

    try {
      plugin.destroy();
      this.plugins.delete(pluginId);
      eventService.emit('plugin:unregistered', { pluginId });
      return true;
    } catch (error) {
      console.error(`Failed to unregister plugin ${pluginId}:`, error);
      return false;
    }
  }

  public getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  public getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  public clear(): void {
    this.plugins.forEach(plugin => {
      try {
        plugin.destroy();
      } catch (error) {
        console.error(`Error destroying plugin ${plugin.id}:`, error);
      }
    });
    this.plugins.clear();
  }
}

export const pluginService = PluginService.getInstance();
export default pluginService;
```

## 5. 实施计划

### 5.1 阶段一：核心架构搭建
1. 创建服务容器和核心服务
2. 实现配置管理系统
3. 构建事件系统
4. 搭建插件系统

### 5.2 阶段二：模块重构
1. 重构核心模块
2. 优化文件结构
3. 实现依赖注入
4. 完善类型定义

### 5.3 阶段三：功能迁移
1. 迁移工具栏功能
2. 迁移文本处理功能
3. 迁移评论功能
4. 迁移设置功能

### 5.4 阶段四：测试与完善
1. 添加单元测试
2. 添加集成测试
3. 优化性能
4. 完善文档

## 6. 预期效果

- **模块清晰**: 明确的模块划分和职责
- **依赖简化**: 减少模块间的直接依赖
- **扩展容易**: 易于添加新功能和模块
- **测试方便**: 便于进行单元测试和集成测试
- **维护性强**: 代码结构清晰，易于理解和维护
- **性能优化**: 减少不必要的计算和渲染

## 7. 风险评估

### 7.1 潜在风险
1. **重构风险**: 大规模重构可能引入新的问题
2. **兼容性问题**: 旧代码可能与新架构不兼容
3. **性能影响**: 新架构可能带来性能开销
4. **开发成本**: 重构需要大量的开发时间和资源

### 7.2 缓解措施
1. **渐进式重构**: 逐步重构，避免一次性大规模修改
2. **测试覆盖**: 增加测试覆盖率，确保重构后功能正常
3. **性能测试**: 进行性能测试，确保新架构性能不劣于旧架构
4. **代码审查**: 严格的代码审查，确保代码质量
5. **回退机制**: 保留旧代码，以便在必要时回退

## 8. 结论

通过实施这个架构优化方案，可以显著提高代码的可维护性、可扩展性和可测试性，为后续的功能开发和维护打下坚实的基础。方案采用模块化设计、依赖注入、集中配置管理等现代软件工程实践，确保了架构的灵活性和可扩展性。虽然重构需要一定的时间和资源投入，但从长期来看，将大大降低维护成本和开发难度。