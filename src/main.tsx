/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 插件入口文件
 */

import React from 'react'
import TestApp from './test/testAPP'
import SettingsModal from './components/SettingsModal'
import SelectToolbar from './components/SelectToolbar'
import CommentApp from './components/Comment/CommentApp'
import { logseqAPI } from './logseq/index'
import { getSettings } from './settings/index'
import { getDocument } from './logseq/utils'
import { renderComponent, clearAllRoots } from './lib/render'
import logger from './lib/logger/index'
import { initializePlugin, cleanupPlugin } from './initializer'
import { t } from './translations/i18n'

const TOOLBAR_ID = 'text-toolkit-toolbar'
const SETTINGS_ID = 'text-toolkit-settings'
const COMMENT_APP_ID = 'text-toolkit-comment-app'

let settingsModalOpen = false

const showSettingUI = async () => {
  logseqAPI.provideUI({
    key: SETTINGS_ID,
    path: '#app-container',
    template: `<div id="${SETTINGS_ID}"></div>`,
  })

  setTimeout(() => {
    const container = getDocument().getElementById(SETTINGS_ID)
    if (container) {
      const currentSettings = getSettings()
      renderComponent(container, SettingsModal, {
        isOpen: settingsModalOpen,
        onClose: () => {
          settingsModalOpen = false
          showSettingUI()
        },
        theme: currentSettings.theme,
      })
    }
  }, 1)
}

const settingToggle = async () => {
  settingsModalOpen = !settingsModalOpen
  showSettingUI()
}

const showCommentApp = async () => {
  logseqAPI.provideUI({
    key: COMMENT_APP_ID,
    path: '#app-container',
    template: `<div id="${COMMENT_APP_ID}"></div>`,
  })

  setTimeout(() => {
    const commentContainer = getDocument().getElementById(COMMENT_APP_ID)
    if (commentContainer) {
      renderComponent(commentContainer, CommentApp)
    }
  }, 1)
}

const showSelectToolbar = async () => {
  const currentSettings = getSettings()
  if (currentSettings.toolbar) {
    logseqAPI.provideUI({
      key: TOOLBAR_ID,
      path: '#app-container',
      template: `<div id="${TOOLBAR_ID}"></div>`,
    })

    setTimeout(() => {
      const toolbarContainer = getDocument().getElementById(TOOLBAR_ID)
      const mainContentContainer = getDocument().getElementById('main-content-container')
      if (toolbarContainer && mainContentContainer) {
        const currentSettings = getSettings()
        const toolbarItems = currentSettings.ToolbarItems || []
        
        renderComponent(toolbarContainer, SelectToolbar, {
          targetElement: mainContentContainer,
          items: toolbarItems,
        })
      }
    }, 1)
  }
}

const registerLogseqButton = () => {
  const settings = getSettings()
  const buttonTooltip = t('toolbar.buttonTooltip', settings?.language)
  
  logseqAPI.App.registerUIItem('toolbar', {
    key: 'text-toolkit-settings-btn',
    template: `
      <a class="button" id="ltt-settings-button"
      data-on-click="settingToggle"
      data-rect
      title="${buttonTooltip}">
       <i class="ti ti-text-wrap"></i>
      </a>
    `,
  })
}

const main = async () => {
  try {
    await initializePlugin()
    logseqAPI.provideModel({ settingToggle })
    await showSettingUI()
    registerLogseqButton()
    await showSelectToolbar()
    await showCommentApp()
    
  } catch (error) {
    logger.error('Failed to initialize Text Toolkit Plugin:', error)
  }
}

const cleanup = () => {
  clearAllRoots()
  cleanupPlugin()
}

if (import.meta.env.MODE === 'test') {
  const rootElement = getDocument().getElementById('root')
  renderComponent(rootElement, TestApp, {}, { wrapWithProvider: false })
  logseqAPI.ready(main).catch((err) => {
    logger.error('Plugin ready error:', err)
  })
} else { 
  logseqAPI.ready(main).catch((err) => {
    logger.error('Plugin ready error:', err)
  })
}

export { cleanup }
