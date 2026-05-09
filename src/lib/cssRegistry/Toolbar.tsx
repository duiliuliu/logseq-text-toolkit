/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * Toolbar CSS 注册
 */

import toolbarCSSRaw from '../../components/Toolbar/toolbar.css?raw'
import { registerCSS } from './index'

export function registerToolbarCSS(): void {
  registerCSS('toolbar', {
    type: 'inline',
    content: toolbarCSSRaw
  })
}
