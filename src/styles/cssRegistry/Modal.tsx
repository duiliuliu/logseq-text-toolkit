/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * Modal CSS 注册
 */

import modalCSSRaw from '../../components/Modal/modal.css?raw'
import { registerCSS } from './index'

export function registerModalCSS(): void {
  registerCSS('modal', {
    type: 'inline',
    content: modalCSSRaw
  })
}
