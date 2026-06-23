/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * 渲染模块导出
 */

export {
  renderComponent,
  unmountComponent,
  clearAllRoots,
  hasRoot,
  type RenderOptions
} from './utils'

export {
  registerRendererArgModel,
  splitRendererArgs,
  parseRendererArgs,
  createRendererArgUpdater,
  type RendererArgModel,
} from './rendererArgs'

export {
  registerConfigSchema,
  getRegisteredSchema,
  getAllRegisteredPrefixes,
  isPrefixRegistered,
  registerRendererWithConfigSchema,
  resolveConfigFromTokens,
  resolveConfigFromTokensArray,
  validateConfigSchema,
  inferSchemaFromArgs,
  type ConfigSchema,
  type ConfigSchemaType,
  type ConfigSchemaWithPositional,
  type ResolveOptions,
  type ValidationResult,
} from './configResolver'
