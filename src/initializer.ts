/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 插件初始化管理器
 */

import { logseqAPI } from './logseq'
import { getSettings } from './settings'
import { getDocument } from './logseq/utils'
import { renderComponent, clearAllRoots } from './lib/render'
import logger, { updateLoggerConfig } from './lib/logger'
import { initI18n, t } from './translations/i18n'
import { loadAllCSS } from './lib/cssRegistry'
import { registerTaskProgress } from './lib/taskProgress/register'
import SettingsModal from './components/SettingsModal'
import SelectToolbar from './components/SelectToolbar'
import CommentApp from './components/Comment/CommentApp'

const ID = {
  TOOLBAR: 'text-toolkit-toolbar',
  SETTINGS: 'text-toolkit-settings',
  COMMENT: 'text-toolkit-comment-app',
  BUTTON: 'ltt-settings-button',
} as const

let settingsModalOpen = false
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

function renderSettingsModal(): void {
  const container = getDocument().getElementById(ID.SETTINGS)
  if (!container) return

  const currentSettings = getSettings()
  renderComponent(container, SettingsModal, {
    isOpen: settingsModalOpen,
    onClose: () => {
      settingsModalOpen = false
      renderSettingsModal()
    },
    theme: currentSettings.theme,
  })
}

async function showSettingUI(): Promise<void> {
  logseqAPI.provideUI({
    key: ID.SETTINGS,
    path: '#app-container',
    template: `<div id="${ID.SETTINGS}"></div>`,
  })
  setTimeout(renderSettingsModal, 1)
}

export async function settingToggle(): Promise<void> {
  settingsModalOpen = !settingsModalOpen
  showSettingUI()
}

function renderCommentApp(): void {
  const container = getDocument().getElementById(ID.COMMENT)
  if (!container) return
  renderComponent(container, CommentApp)
}

async function showCommentApp(): Promise<void> {
  logseqAPI.provideUI({
    key: ID.COMMENT,
    path: '#app-container',
    template: `<div id="${ID.COMMENT}"></div>`,
  })
  setTimeout(renderCommentApp, 1)
}

function renderSelectToolbar(): void {
  const toolbarContainer = getDocument().getElementById(ID.TOOLBAR)
  const mainContentContainer = getDocument().getElementById('main-content-container')
  if (!toolbarContainer || !mainContentContainer) return

  const currentSettings = getSettings()
  renderComponent(toolbarContainer, SelectToolbar, {
    targetElement: mainContentContainer,
    items: currentSettings.ToolbarItems || [],
  })
}

async function showSelectToolbar(): Promise<void> {
  const settings = getSettings()
  if (!settings.toolbar) return

  logseqAPI.provideUI({
    key: ID.TOOLBAR,
    path: '#app-container',
    template: `<div id="${ID.TOOLBAR}"></div>`,
  })
  setTimeout(renderSelectToolbar, 1)
}

function registerLogseqButton(): void {
  const settings = getSettings()
  const buttonTooltip = t('toolbar.buttonTooltip', settings?.language)

  logseqAPI.App.registerUIItem('toolbar', {
    key: ID.BUTTON,
    template: `
      <a class="button" id="${ID.BUTTON}"
         data-on-click="settingToggle"
         data-rect
         title="${buttonTooltip}">
        <i class="ti ti-text-wrap"></i>
      </a>
    `,
  })
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

export async function initializeComponent(): Promise<void> {
  try {
    logger.info('[Initializer] Starting component initialization...')

    registerTaskProgress()
    logger.info('[Initializer] TaskProgress registered')

    logseqAPI.provideModel({ settingToggle })

    await showSettingUI()
    logger.info('[Initializer] Settings UI ready')

    registerLogseqButton()
    logger.info('[Initializer] Toolbar button registered')

    await showSelectToolbar()
    logger.info('[Initializer] SelectToolbar ready')

    await showCommentApp()
    logger.info('[Initializer] CommentApp ready')

    cleanupFunctions.push(() => {
      logger.info('[Initializer] Cleaning up plugin...')
    })

    logger.info('[Initializer] Component initialized successfully')
  } catch (error) {
    logger.error('[Initializer] Component initialization failed:', error)
    throw error
  }
}

export async function main(): Promise<void> {
  await initializePlugin()
  await initializeComponent()
}

export const cleanup = (): void => {
  clearAllRoots()
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

export default main
