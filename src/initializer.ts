/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 插件初始化管理器
 * 负责统一管理所有初始化流程
 */

import { getSettings } from './settings/index'
import logger, { updateLoggerConfig } from './lib/logger/index'
import { initI18n } from './translations/i18n'
import { registerTaskProgress } from './lib/taskProgress/register'
import { loadAllCSS } from './styles/cssRegistry'

let isInitialized = false
let cleanupFunctions: Array<() => void> = []

const configureLogger = () => {
  try {
    const settings = getSettings()
    updateLoggerConfig({
      enabled: true,
      level: settings.developerMode ? 'DEBUG' : 'INFO'
    })
  } catch (error) {
    updateLoggerConfig({
      enabled: true,
      level: 'INFO'
    })
  }
}

export const initializePlugin = async (): Promise<void> => {
  try {
    logger.info('Starting Text Toolkit Plugin initialization...')
    
    await loadAllCSS()
    logger.info('CSS loading completed')
    
    await initI18n()
    logger.info('I18n initialized successfully')
    
    configureLogger()
    logger.info('Logger configured with settings')
    
    registerTaskProgress()
    logger.info('Task progress registered successfully')
    
    cleanupFunctions.push(() => {
      logger.info('Cleaning up Text Toolkit Plugin...')
    })
    
    isInitialized = true
    logger.info('Text Toolkit Plugin initialized successfully!')
    
  } catch (error) {
    logger.error('Failed to initialize Text Toolkit Plugin:', error)
    throw error
  }
}

export const cleanupPlugin = (): void => {
  cleanupFunctions.forEach(fn => {
    try {
      fn()
    } catch (error) {
      logger.error('Error during cleanup:', error)
    }
  })
  cleanupFunctions = []
  isInitialized = false
}

export const isPluginInitialized = (): boolean => {
  return isInitialized
}

export default initializePlugin
