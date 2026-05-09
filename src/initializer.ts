/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 插件初始化 - 基础资源加载
 */

import logger, { updateLoggerConfig } from './lib/logger'
import { initI18n } from './translations/i18n'
import { loadAllCSS } from './lib/cssRegistry'
import { getSettings } from './settings'

let isInitialized = false

export function configureLogger(): void {
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

export async function initializePlugin(): Promise<void> {
  try {
    logger.info('[Initializer] Starting plugin initialization...')
    
    await loadAllCSS()
    logger.info('[Initializer] CSS resources loaded')
    
    await initI18n()
    logger.info('[Initializer] I18n initialized')
    
    configureLogger()
    logger.info('[Initializer] Logger configured')
    
    isInitialized = true
    logger.info('[Initializer] Plugin initialized successfully')
  } catch (error) {
    logger.error('[Initializer] Initialization failed:', error)
    throw error
  }
}

export const isPluginInitialized = (): boolean => isInitialized
