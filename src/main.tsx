/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 插件入口文件
 */

import { logseqAPI } from './logseq'
import { getDocument } from './logseq/utils'
import { renderComponent } from './lib/render'
import { main } from './initializer'
import logger from './lib/logger'
import TestApp from './test/testAPP'

if (import.meta.env.MODE === 'test') {
  const rootElement = getDocument().getElementById('root')
  renderComponent(rootElement, TestApp, {}, { wrapWithProvider: false })
}

logseqAPI.ready(async () => {
  try {
    await main()
  } catch (error) {
    logger.error('[Main] Fatal error:', error)
  }
})
