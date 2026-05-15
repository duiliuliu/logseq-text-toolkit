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
