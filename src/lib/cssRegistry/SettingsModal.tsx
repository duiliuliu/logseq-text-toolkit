/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * SettingsModal CSS 注册
 */

import settingsModalCSSRaw from '../../components/SettingsModal/settingsModal.css?raw'
import { registerCSS } from './index'

export function registerSettingsModalCSS(): void {
  registerCSS('settingsModal', {
    type: 'inline',
    content: settingsModalCSSRaw
  })
}
