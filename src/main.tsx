/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 插件入口 - 主初始化流程编排
 */

import { logseqAPI } from './logseq'
import { getDocument } from './logseq/utils'
import { renderComponent, clearAllRoots } from './lib/render'
import TestApp from './test/testAPP'
import logger from './lib/logger'
import { initI18n } from './translations/i18n'
import { loadAllCSS } from './lib/cssRegistry'
import {
  configureLogger,
  initCommentApp,
  initSelectToolbar,
  initSettingsModal,
  initTaskProgress,
  initHeatmap,
  initSummary,
  initBlockView,
  registerLogseqButton,
  settingToggle,
  registerAllCSS,
} from './initializer';

const cleanupFunctions: Array<() => void> = []

/* ============================================================================
   清理函数
   ============================================================================ */

/**
 * 清理插件资源
 * 卸载所有 React 根节点并执行注册的清理函数
 */
export function cleanup(): void {
  clearAllRoots()
  cleanupFunctions.forEach(fn => {
    try {
      fn()
    } catch (error) {
      logger.error('🧹 Main: Cleanup error', error)
    }
  })
  cleanupFunctions.length = 0
}

/* ============================================================================
   基础资源初始化
   ============================================================================ */

/**
 * 初始化插件基础资源
 * - 注册 CSS 样式
 * - 初始化国际化
 * - 配置日志系统
 */
export async function initializePlugin(): Promise<void> {
  try {
    logger.info('🚀 Plugin: Starting initialization...')

    registerAllCSS()
    await loadAllCSS()
    logger.info('🎨 Plugin: CSS registered')

    await initI18n()
    logger.info('🌐 Plugin: I18n initialized')

    configureLogger()
    logger.info('⚙️ Plugin: Logger configured')

    logger.info('✅ Plugin: Initialized successfully')
  } catch (error) {
    logger.error('❌ Plugin: Initialization failed', error)
    throw error
  }
}

/* ============================================================================
   组件初始化
   ============================================================================ */

/**
 * 初始化所有 UI 组件
 * - 注册日志模型
 * - TaskProgress 宏
 * - SettingsModal 设置弹窗
 * - SelectToolbar 工具栏
 * - CommentApp 评论功能
 */
export async function initializeComponent(): Promise<void> {
  logseqAPI.provideModel({ settingToggle })

  await initTaskProgress()
  logger.info('📊 Plugin: TaskProgress ready')

  await initHeatmap()
  logger.info('🌡️ Plugin: Heatmap ready')

  await initSettingsModal()
  registerLogseqButton()
  logger.info('⚙️ Plugin: SettingsModal ready')

  await initSelectToolbar()
  logger.info('🛠️ Plugin: SelectToolbar ready')

  await initCommentApp()
  logger.info('💬 Plugin: CommentApp ready')

  await initSummary()
  logger.info('📋 Plugin: Summary ready')

  await initBlockView()
  logger.info('📊 Plugin: BlockView ready')

  cleanupFunctions.push(() => logger.info('🧹 Plugin: Cleaning up...'))
  logger.info('✅ Plugin: Components initialized')
}

/* ============================================================================
   主入口
   ============================================================================ */

/**
 * 插件主入口函数
 * 依次执行基础资源初始化和组件初始化
 */
export async function main(): Promise<void> {
  await initializePlugin()
  await initializeComponent()
}

/* ============================================================================
   启动入口
   ============================================================================ */

/** 测试模式渲染 TestApp */
if (import.meta.env.MODE === 'test') {
  const rootElement = getDocument().getElementById('root')
  renderComponent(rootElement, TestApp)
}

/** Logseq 插件就绪后执行主流程 */
logseqAPI.ready(async () => {
  try {
    await main()
  } catch (error) {
    logger.error('💥 Plugin: Fatal error', error)
  }
})
