/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 插件初始化管理器
 * 负责基础资源加载和全局配置
 * 复杂初始化逻辑由各模块自行抽象 Init 函数
 */

import logger, { updateLoggerConfig } from './lib/logger'
import { initI18n } from './translations/i18n'
import { loadAllCSS } from './lib/cssRegistry'
import { registerTaskProgress } from './lib/taskProgress/register'
import { getSettings } from './settings'

let isInitialized = false
const cleanupFunctions: Array<() => void> = []

function configureLogger(): void {
  try {
    const settings = getSettings()
    updateLoggerConfig({
      enabled: true,
      level: settings.developerMode ? 'DEBUG' : 'INFO'
    })
  } catch {
    updateLoggerConfig({
      enabled: true,
      level: 'INFO'
    })
  }
}

export const initializePlugin = async (): Promise<void> => {
  try {
    logger.info('[Initializer] Starting plugin initialization...')
    
    await loadAllCSS()
    logger.info('[Initializer] CSS resources loaded')
    
    await initI18n()
    logger.info('[Initializer] I18n initialized')
    
    configureLogger()
    logger.info('[Initializer] Logger configured')
    
    registerTaskProgress()
    logger.info('[Initializer] TaskProgress registered')
    
    cleanupFunctions.push(() => {
      logger.info('[Initializer] Cleaning up plugin...')
    })
    
    isInitialized = true
    logger.info('[Initializer] Plugin initialized successfully')
  } catch (error) {
    logger.error('[Initializer] Initialization failed:', error)
    throw error
  }
}

export const cleanupPlugin = (): void => {
  cleanupFunctions.forEach(fn => {
    try {
      fn()
    } catch (error) {
      logger.error('[Initializer] Cleanup error:', error)
    }
  })
  cleanupFunctions.length = 0
  isInitialized = false
}

export const isPluginInitialized = (): boolean => isInitialized

export default initializePlugin
