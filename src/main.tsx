/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 插件入口 - UI组件渲染 & 业务初始化
 */

import { logseqAPI } from './logseq'
import { getDocument } from './logseq/utils'
import { renderComponent, clearAllRoots } from './lib/render'
import { configureLogger, initCommentApp, initSelectToolbar, initSettingsModal, initTaskProgress, registerLogseqButton, settingToggle } from './initializer'
import { initI18n } from './translations/i18n'
import logger from './lib/logger'
import TestApp from './test/testAPP'
import { loadAllCSS } from './lib/cssRegistry'

const cleanupFunctions: Array<() => void> = []

export function cleanup(): void {
  clearAllRoots()
  cleanupFunctions.forEach(fn => {
    try {
      fn()
    } catch (error) {
      logger.error('[Main] Cleanup error:', error)
    }
  })
  cleanupFunctions.length = 0
}

export async function initializePlugin(): Promise<void> {
  try {
    logger.info('[initializePlugin] Starting plugin initialization...')

    await loadAllCSS()
    logger.info('[initializePlugin] CSS resources loaded')

    await initI18n()
    logger.info('[initializePlugin] I18n initialized')

    configureLogger()
    logger.info('[initializePlugin] Logger configured')

    logger.info('[initializePlugin] Plugin initialized successfully')
  } catch (error) {
    logger.error('[initializePlugin] Initialization failed:', error)
    throw error
  }
}

export async function initializeComponent(): Promise<void> {
  logseqAPI.provideModel({ settingToggle })

  await initTaskProgress()
  logger.info('[initializeComponent] TaskProgress ready')

  await initSettingsModal()
  registerLogseqButton()
  logger.info('[initializeComponent] SettingsModal ready')

  await initSelectToolbar()
  logger.info('[initializeComponent] SelectToolbar ready')

  await initCommentApp()
  logger.info('[initializeComponent] CommentApp ready')

  cleanupFunctions.push(() => logger.info('[Main] Cleaning up plugin...'))
  logger.info('[initializeComponent] Component initialized successfully')
}


export async function main(): Promise<void> {
  await initializePlugin()
  await initializeComponent()
}

if (import.meta.env.MODE === 'test') {
  const rootElement = getDocument().getElementById('root')
  renderComponent(rootElement, TestApp, {}, { wrapWithProvider: true })
}

logseqAPI.ready(async () => {
  try {
    await main()
  } catch (error) {
    logger.error('[Main] Fatal error:', error)
  }
}) 
