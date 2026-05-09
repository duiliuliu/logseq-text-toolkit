/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 插件初始化 - 基础资源加载
 */

import { updateLoggerConfig } from './lib/logger'
import { t } from './translations/i18n'
import { getSettings } from './settings'
import CommentApp from './components/Comment/CommentApp'
import SelectToolbar from './components/SelectToolbar'
import SettingsModal from './components/SettingsModal'
import { renderComponent } from './lib/render'
import { registerTaskProgress } from './lib/taskProgress'
import logseqAPI from './logseq'
import { getDocument } from './logseq/utils'


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

export async function initCommentApp(): Promise<void> {
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

export async function initSelectToolbar(): Promise<void> {
  const settings = getSettings()
  if (!settings.toolbar) return

  logseqAPI.provideUI({
    key: ID.TOOLBAR,
    path: '#app-container',
    template: `<div id="${ID.TOOLBAR}"></div>`,
  })
  setTimeout(renderSelectToolbar, 1)
}

export function registerLogseqButton(): void {
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

export async function initTaskProgress(): Promise<void> {
  registerTaskProgress()
}

export async function initSettingsModal(): Promise<void> {
  logseqAPI.provideUI({
    key: ID.SETTINGS,
    path: '#app-container',
    template: `<div id="${ID.SETTINGS}"></div>`,
  })
  setTimeout(renderSettingsModal, 1)
}


