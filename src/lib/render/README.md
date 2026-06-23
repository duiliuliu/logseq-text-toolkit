# Render Module - 宏命令参数解析框架

## 一、架构设计

### 1.1 整体架构

```
┌──────────────────────────────────────────────────────────────────┐
│                        调用层（各模块）                            │
│  Heatmap / Milestone / BlockView / TaskProgress / Summary        │
└─────────────────────────────┬────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│   rendererArgs    │ │   configResolver  │ │ macroTemplate     │
│   (字符串解析)     │ │   (类型+默认值)    │ │   Validator       │
│   - 位置参数映射   │ │   - 三层覆盖       │ │   (格式验证)      │
│   - 参数更新      │ │   - 类型转换       │ │   - 前缀检查      │
│                   │ │   - 枚举校验       │ │   - 参数验证      │
└───────────────────┘ └───────────────────┘ └───────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │   组合使用示例     │
                     │   const rawArgs  │
                     │     = parseRendererArgs(...)
                     │   const config   │
                     │     = resolveConfigFromTokens(
                     │         schemas, rawArgs, settings)
                     └─────────────────┘
```

### 1.2 渐进式演进策略

| 阶段 | 描述 | 优先级 |
|------|------|--------|
| **Phase 1** | 新增独立的 `configResolver.ts` 模块 | 高 |
| **Phase 2** | 在 Heatmap 模块试点使用 | 高 |
| **Phase 3** | 逐步迁移 Milestone、BlockView 等模块 | 中 |
| **Phase 4** | 基于 ConfigSchema 增强模板验证 | 低 |

---

## 二、模块职责

### 2.1 rendererArgs.ts

**职责**：宏命令参数的字符串解析和更新

| 函数 | 功能 |
|------|------|
| `registerRendererArgModel()` | 注册位置参数映射模型 |
| `parseRendererArgs()` | 将 tokens 解析为 key-value 对象 |
| `splitRendererArgs()` | 分割宏命令类型和参数 |
| `createRendererArgUpdater()` | 创建参数更新器 |

**适用场景**：
- 需要解析宏命令参数时
- 需要更新宏命令字符串时

### 2.2 configResolver.ts（新增）

**职责**：类型安全的参数定义和三层覆盖解析

| 函数 | 功能 |
|------|------|
| `registerConfigSchema()` | 注册参数 Schema |
| `resolveConfigFromTokens()` | 解析参数并应用三层覆盖原则 |
| `validateConfigSchema()` | 验证参数类型和枚举值 |

**适用场景**：
- 需要类型安全的参数解析时
- 需要默认值和优先级处理时
- 新模块开发推荐使用

### 2.3 macroTemplateValidator.ts

**职责**：宏命令模板的格式验证

| 函数 | 功能 |
|------|------|
| `validateMacroTemplate()` | 验证模板格式正确性 |
| `extractMacroTemplate()` | 提取模板内容 |
| `getMacroPrefix()` | 获取有效宏前缀 |

**适用场景**：
- 用户设置模板验证
- 斜杠命令模板校验

---

## 三、使用方式

### 3.1 传统方式（保持兼容）

```typescript
import { registerRendererArgModel, parseRendererArgs } from './rendererArgs';

// 注册参数模型
registerRendererArgModel(':heatmap', { positional: ['view', 'displayMode'] });

// 解析参数
const tokens = ['year', 'displayMode=full'];
const args = parseRendererArgs(':heatmap', tokens);
// → { view: 'year', displayMode: 'full' }
```

### 3.2 新方式（推荐）

```typescript
import { registerConfigSchema, resolveConfigFromTokens, ConfigSchema } from './configResolver';

// 定义 Schema
const HEATMAP_SCHEMAS: ConfigSchema[] = [
  { key: 'view', type: 'enum', enumValues: ['year', 'month', 'week'], defaultValue: 'year' },
  { key: 'displayMode', type: 'enum', enumValues: ['full', 'basic', 'minimal'], defaultValue: 'full' },
  { key: 'width', type: 'number', defaultValue: 600 },
  { key: 'inline', type: 'boolean', defaultValue: false },
];

// 注册 Schema（可选，用于全局验证）
registerConfigSchema(':heatmap', HEATMAP_SCHEMAS);

// 解析参数（应用三层覆盖原则）
const config = resolveConfigFromTokens(
  HEATMAP_SCHEMAS,
  { view: 'month', width: '800' },  // 宏参数
  { heatmap: { defaultView: 'year' } }  // Settings 配置
);
// → { view: 'month', displayMode: 'full', width: 800, inline: false }
```

### 3.3 混合方式（渐进迁移）

```typescript
import { parseRendererArgs } from './rendererArgs';
import { resolveConfigFromTokens } from './configResolver';

// 使用 rendererArgs 解析原始参数
const tokens = ['year', 'displayMode=full'];
const rawArgs = parseRendererArgs(':heatmap', tokens);

// 使用 configResolver 进行类型转换和默认值处理
const config = resolveConfigFromTokens(HEATMAP_SCHEMAS, rawArgs, settings);
```

---

## 四、三层覆盖原则

```
宏参数 > Settings配置 > 默认设置
```

### 4.1 优先级说明

| 优先级 | 来源 | 说明 |
|--------|------|------|
| 1 | 宏参数 | 直接在 `{{renderer :heatmap year}}` 中指定 |
| 2 | Settings | 用户在设置页面配置的值 |
| 3 | 默认值 | Schema 中定义的 defaultValue |

### 4.2 示例

```typescript
const SCHEMAS = [
  { key: 'view', type: 'enum', enumValues: ['year', 'month'], defaultValue: 'year' },
];

// 场景1: 无宏参数，使用默认值
resolveConfigFromTokens(SCHEMAS, {}, {});
// → { view: 'year' }

// 场景2: 有 Settings 配置
resolveConfigFromTokens(SCHEMAS, {}, { heatmap: { view: 'month' } });
// → { view: 'month' }

// 场景3: 有宏参数（最高优先级）
resolveConfigFromTokens(SCHEMAS, { view: 'year' }, { heatmap: { view: 'month' } });
// → { view: 'year' }
```

---

## 五、支持的参数类型

| 类型 | 说明 | 输入示例 | 输出示例 |
|------|------|----------|----------|
| `string` | 字符串 | `"hello"` | `"hello"` |
| `boolean` | 布尔值 | `"true"`, `"false"`, `"1"`, `"0"` | `true`, `false` |
| `number` | 数字 | `"100"`, `"3.14"` | `100`, `3.14` |
| `stringList` | 分号分隔列表 | `"a;b;c"` | `["a", "b", "c"]` |
| `enum` | 枚举值 | `"full"` | `"full"` |
| `json` | JSON 对象 | `'{"a":1}'` | `{ a: 1 }` |

---

## 六、迁移指南

### 6.1 从传统方式迁移

```typescript
// 旧代码
const viewType = argMap.view || settings?.heatmap?.defaultViewType || 'year';
const displayMode = argMap.display || settings?.heatmap?.defaultDisplayMode || 'full';
const inline = argMap.inline === 'true' || settings?.heatmap?.inline || false;

// 新代码
const SCHEMAS = [
  { key: 'view', type: 'enum', enumValues: ['year', 'month', 'week'], settingKey: 'heatmap.defaultViewType', defaultValue: 'year' },
  { key: 'display', type: 'enum', enumValues: ['full', 'basic'], settingKey: 'heatmap.defaultDisplayMode', defaultValue: 'full' },
  { key: 'inline', type: 'boolean', settingKey: 'heatmap.inline', defaultValue: false },
];

const config = resolveConfigFromTokens(SCHEMAS, argMap, settings);
// config.view, config.display, config.inline
```

### 6.2 迁移检查清单

- [ ] 定义完整的 Schema 数组
- [ ] 使用 `resolveConfigFromTokens` 替代手动解析
- [ ] 移除重复的类型转换代码
- [ ] 更新单元测试