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
import {
  configureLogger,
  initCommentApp,
  initSelectToolbar,
  initSettingsModal,
  initTaskProgress,
  registerLogseqButton,
  settingToggle,
  registerCommentCSS,
  registerCustomToolbarCSS,
  registerModalCSS,
  registerSettingsModalCSS,
  registerTaskProgressCSS,
  registerToolbarCSS,
  registerCustomSelectCSS,
} from './initializer'

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
      logger.error('[Main] Cleanup error:', error)
    }
  })
  cleanupFunctions.length = 0
}

/* ============================================================================
   基础资源初始化
   ============================================================================ */

/**
 * 注册所有 CSS 样式
 */
function registerAllCSS(): void {
  registerToolbarCSS()
  registerSettingsModalCSS()
  registerModalCSS()
  registerCommentCSS()
  registerCustomToolbarCSS()
  registerTaskProgressCSS()
  registerCustomSelectCSS()
}

/**
 * 初始化插件基础资源
 * - 注册 CSS 样式
 * - 初始化国际化
 * - 配置日志系统
 */
export async function initializePlugin(): Promise<void> {
  try {
    logger.info('[initializePlugin] Starting plugin initialization...')

    registerAllCSS()
    logger.info('[initializePlugin] CSS registered')

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
    logger.error('[Main] Fatal error:', error)
  }
})
