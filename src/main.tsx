/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 插件入口 - UI组件渲染 & 业务初始化
 */

import { logseqAPI } from './logseq'
import { getSettings } from './settings'
import { getDocument } from './logseq/utils'
import { renderComponent, clearAllRoots } from './lib/render'
import { initializePlugin, isPluginInitialized } from './initializer'
import { t } from './translations/i18n'
import logger from './lib/logger'
import { registerTaskProgress } from './lib/taskProgress/register'
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
const cleanupFunctions: Array<() => void> = []

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

export async function settingToggle(): Promise<void> {
  settingsModalOpen = !settingsModalOpen
  logseqAPI.provideUI({
    key: ID.SETTINGS,
    path: '#app-container',
    template: `<div id="${ID.SETTINGS}"></div>`,
  })
  setTimeout(renderSettingsModal, 1)
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

async function initializeTaskProgress(): Promise<void> {
  registerTaskProgress()
  logger.info('[Main] TaskProgress registered')
}

async function initializeSettingsModal(): Promise<void> {
  logseqAPI.provideUI({
    key: ID.SETTINGS,
    path: '#app-container',
    template: `<div id="${ID.SETTINGS}"></div>`,
  })
  setTimeout(renderSettingsModal, 1)
  logger.info('[Main] SettingsModal ready')
}

async function initializeSelectToolbar(): Promise<void> {
  await showSelectToolbar()
  logger.info('[Main] SelectToolbar ready')
}

async function initializeCommentApp(): Promise<void> {
  await showCommentApp()
  logger.info('[Main] CommentApp ready')
}

export async function initializeComponent(): Promise<void> {
  registerTaskProgress()
  logseqAPI.provideModel({ settingToggle })
  await initializeSettingsModal()
  registerLogseqButton()
  await initializeSelectToolbar()
  await initializeCommentApp()
  cleanupFunctions.push(() => logger.info('[Main] Cleaning up plugin...'))
  logger.info('[Main] Component initialized successfully')
}

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

export async function main(): Promise<void> {
  await initializePlugin()
  await initializeComponent()
}

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
