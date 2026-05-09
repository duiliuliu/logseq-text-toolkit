/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 插件入口文件
 * 负责 UI 组件渲染编排和业务逻辑初始化
 */

import { logseqAPI } from './logseq'
import { getSettings } from './settings'
import { getDocument } from './logseq/utils'
import { renderComponent, clearAllRoots } from './lib/render'
import { initializePlugin, cleanupPlugin } from './initializer'
import { t } from './translations/i18n'
import logger from './lib/logger'
import TestApp from './test/testAPP'
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

const settingToggle = async (): Promise<void> => {
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

const cleanup = (): void => {
  clearAllRoots()
  cleanupPlugin()
}

const main = async (): Promise<void> => {
  try {
    logger.info('[Main] Starting plugin main...')

    await showSettingUI()
    logger.info('[Main] Settings UI ready')

    registerLogseqButton()
    logger.info('[Main] Toolbar button registered')

    await showSelectToolbar()
    logger.info('[Main] SelectToolbar ready')

    await showCommentApp()
    logger.info('[Main] CommentApp ready')

    logger.info('[Main] Plugin main completed')
  } catch (error) {
    logger.error('[Main] Plugin main error:', error)
  }
}

if (import.meta.env.MODE === 'test') {
  const rootElement = getDocument().getElementById('root')
  renderComponent(rootElement, TestApp, {}, { wrapWithProvider: false })
}

logseqAPI.ready(async () => {
  try {
    await initializePlugin()
    await main()
  } catch (error) {
    logger.error('[Main] Fatal error:', error)
  }
})

export { cleanup }
