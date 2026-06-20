/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * 渲染模块导出
 *
 * 组件结构：
 *   ┌───────────────────────────────────────────────────────┐
 *   │  lib/render/                                           │
 *   │  ├── utils.tsx         通用 React 渲染（LRU + 上限）  │
 *   │  ├── rendererArgs.ts   宏参数拆分与更新（纯函数）      │
 *   │  ├── macroSchema.ts    🔸 统一宏参数解析框架 (P1.1)   │
 *   │  └── index.tsx         模块入口（即此文件）             │
 *   └───────────────────────────────────────────────────────┘
 *
 * 🔸 macroSchema 用法：
 *     1. 在模块内声明参数 Schema（类型、枚举、默认值、验证器）
 *     2. 调用 resolveConfigFromTokens(schemas, macroArgs, template, defaults)
 *     3. 得到类型安全的最终配置
 */

export {
  renderComponent,
  unmountComponent,
  clearAllRoots,
  hasRoot,
  getRootCount,
  type RenderOptions,
} from './utils'

export {
  registerRendererArgModel,
  splitRendererArgs,
  parseRendererArgs,
  createRendererArgUpdater,
  type RendererArgModel,
} from './rendererArgs'

export {
  // 核心解析 API
  resolveConfig,
  resolveConfigFromTokens,
  parseMacroArgumentsFromLogseq,
  validateConfig,
  registerMacroSchema,

  // Schema 构造器
  booleanSchema,
  enumSchema,
  stringListSchema,
  jsonSchema,
  stringSchema,

  // 类型
  type MacroParamSchema,
  type MacroParamType,
  type MacroParseContext,
  type MacroArguments,
  type ParseWarning,
  type MacroRegistrationOptions,
} from './macroSchema'
