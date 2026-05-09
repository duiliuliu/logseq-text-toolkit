/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * Comment CSS 注册
 */

import inlineCommentCSSRaw from '../../components/Comment/inlineComment.css?raw'
import { registerCSS } from './index'

export function registerCommentCSS(): void {
  registerCSS('inlineComment', {
    type: 'inline',
    content: inlineCommentCSSRaw
  })
}
