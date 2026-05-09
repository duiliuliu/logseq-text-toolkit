/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * TaskProgress CSS 注册
 */

import taskProgressCSSRaw from '../../components/TaskProgress/taskProgress.css?raw'
import { registerCSS } from './index'

export function registerTaskProgressCSS(): void {
  registerCSS('taskProgress', {
    type: 'inline',
    content: taskProgressCSSRaw
  })
}
