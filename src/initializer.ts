/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 插件初始化管理器
 * 负责统一管理所有初始化流程，避免循环依赖
 */

import { getSettings } from './settings/index'
import logger, { updateLoggerConfig } from './lib/logger/index'
import { initI18n } from './translations/i18n'
import { logseqAPI } from './logseq/index'
import { registerTaskProgress, setTaskProgressComponent } from './lib/taskProgress/register'
import TaskProgress from './components/TaskProgress/TaskProgress'
import { 
  settingsModalCSS, 
  modalCSS, 
  toolbarCSS, 
  inlineCommentCSS, 
  cssConfigCSS, 
  taskProgressCSS 
} from './styles/index'

let isInitialized = false
let cleanupFunctions: Array<() => void> = []

const loadCSS = async () => {
  try {
    const cssFiles = [
      { name: 'settingsModal.css', content: settingsModalCSS },
      { name: 'modal.css', content: modalCSS },
      { name: 'toolbar.css', content: toolbarCSS },
      { name: 'inlineComment.css', content: inlineCommentCSS },
      { name: 'customsToolbarItems.css', content: cssConfigCSS },
      { name: 'taskProgress.css', content: taskProgressCSS }
    ]

    for (const cssFile of cssFiles) {
      try {
        const response = await fetch(`./${cssFile.name}`)
        if (response.ok) {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('text/css')) {
            const cssContent = await response.text()
            if (cssContent.trim()) {
              logseqAPI.provideStyle(cssContent)
              logger.info(`Loaded CSS file from root: ${cssFile.name}`)
            } else {
              logger.info(`CSS file is empty in root, using built-in CSS: ${cssFile.name}`)
              if (cssFile.content) {
                logseqAPI.provideStyle(cssFile.content)
                logger.info(`Loaded built-in CSS for ${cssFile.name}`)
              }
            }
          } else {
            logger.info(`Response is not CSS, using built-in CSS: ${cssFile.name}`)
            if (cssFile.content) {
              logseqAPI.provideStyle(cssFile.content)
              logger.info(`Loaded built-in CSS for ${cssFile.name}`)
            }
          }
        } else {
          logger.info(`CSS file not found in root, using built-in CSS: ${cssFile.name}`)
          if (cssFile.content) {
            logseqAPI.provideStyle(cssFile.content)
            logger.info(`Loaded built-in CSS for ${cssFile.name}`)
          }
        }
      } catch (error) {
        logger.warn(`Error loading CSS file from root ${cssFile.name}:`, error)
        if (cssFile.content) {
          logseqAPI.provideStyle(cssFile.content)
          logger.info(`Loaded built-in CSS for ${cssFile.name} (fallback)`)
        }
      }
    }
  } catch (error) {
    logger.error('Error in loadCSS:', error)
  }
}

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

const registerTaskProgressFeature = () => {
  setTaskProgressComponent(TaskProgress)
  registerTaskProgress()
}

export const initializePlugin = async (): Promise<void> => {
  try {
    logger.info('Starting Text Toolkit Plugin initialization...')
    
    await loadCSS()
    logger.info('CSS loading completed')
    
    await initI18n()
    logger.info('I18n initialized successfully')
    
    configureLogger()
    logger.info('Logger configured with settings')
    
    registerTaskProgressFeature()
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
