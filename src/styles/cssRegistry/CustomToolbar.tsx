/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * CustomToolbar CSS 注册
 */

import cssConfigCSSRaw from '../../styles/customsToolbarItems.css?raw'
import { registerCSS } from './index'

export function registerCustomToolbarCSS(): void {
  registerCSS('customToolbarItems', {
    type: 'inline',
    content: cssConfigCSSRaw
  })
}
