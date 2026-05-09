/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * CSS 注册统一入口
 * 注册所有 CSS 资源
 */

import { registerSettingsModalCSS } from './SettingsModal'
import { registerModalCSS } from './Modal'
import { registerToolbarCSS } from './Toolbar'
import { registerCommentCSS } from './Comment'
import { registerCustomToolbarCSS } from './CustomToolbar'
import { registerTaskProgressCSS } from './TaskProgress'

export function registerAllCSS(): void {
  registerSettingsModalCSS()
  registerModalCSS()
  registerToolbarCSS()
  registerCommentCSS()
  registerCustomToolbarCSS()
  registerTaskProgressCSS()
}
