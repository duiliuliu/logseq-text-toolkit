/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 插件入口文件
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import TestApp from './test/testAPP'
import SettingsModal from './components/SettingsModal'
import SelectToolbar from './components/SelectToolbar'
import CommentApp from './components/Comment/CommentApp'
import TaskProgress from './components/TaskProgress/TaskProgress'
import { SettingsProvider } from './settings/useSettings'
import { logseqAPI } from './logseq/index'
import { getSettings } from './settings/index'
import { getDocument } from './logseq/utils'
import logger from './lib/logger/index'
import { initializePlugin, cleanupPlugin } from './initializer'
import { t } from './translations/i18n'

const TOOLBAR_ID = 'text-toolkit-toolbar'
const SETTINGS_ID = 'text-toolkit-settings'
const COMMENT_APP_ID = 'text-toolkit-comment-app'

interface RenderComponentProps {
  [key: string]: any
}

// 为每个容器维护独立的 root 实例
const roots = new Map<HTMLElement, any>()

const renderComponent = (container: HTMLElement | null, Component: React.ComponentType<any>, props: RenderComponentProps = {}) => {
  if (container) {
    // 如果已经创建过 root，就不再 create，直接 render
    if (!roots.has(container)) {
      roots.set(container, ReactDOM.createRoot(container))
    }
    const root = roots.get(container)!
    root.render(
      <React.StrictMode>
        <SettingsProvider>
          <Component {...props} />
        </SettingsProvider>
      </React.StrictMode>
    )
  }
}

// 初始化设置 UI
const initializeSettingUI = async () => {
  const settings = getSettings()
  const buttonTooltip = t('toolbar.buttonTooltip', settings?.language)
  
  logseqAPI.provideModel({ settingToggle })
  
  const container = getDocument().getElementById(SETTINGS_ID)
  if (container) {
    renderComponent(container, SettingsModal)
  }
  
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
    // 使用统一的初始化管理器
    await initializePlugin();

    // 初始化设置 UI
    initializeSettingUI()

    // 显示其他 UI
    await showSelectToolbar()
    await showCommentApp()
    
  } catch (error) {
    logger.error('Failed to initialize Text Toolkit Plugin:', error)
  }
}

// 切换设置界面
const settingToggle = () => {
  const container = getDocument().getElementById(SETTINGS_ID)
  if (container && container.style.display !== 'none') {
    container.style.display = 'none'
  } else {
    if (container) {
      container.style.display = 'block'
      if (!container.hasAttribute('data-rendered')) {
        renderComponent(container, SettingsModal)
        container.setAttribute('data-rendered', 'true')
      }
    }
  }
}

// 显示设置 UI
const showSettingUI = async () => {
  try {
    const container = getDocument().getElementById(SETTINGS_ID)
    if (container) {
      renderComponent(container, SettingsModal)
    }
  } catch (error) {
    logger.error('Error showing settings UI:', error)
  }
}

// 显示工具栏
const showSelectToolbar = async () => {
  try {
    const container = getDocument().getElementById(TOOLBAR_ID)
    if (container) {
      renderComponent(container, SelectToolbar)
    }
  } catch (error) {
    logger.error('Error showing toolbar:', error)
  }
}

// 显示评论应用
const showCommentApp = async () => {
  try {
    const container = getDocument().getElementById(COMMENT_APP_ID)
    if (container) {
      renderComponent(container, CommentApp)
    }
  } catch (error) {
    logger.error('Error showing comment app:', error)
  }
}

if (import.meta.env.MODE === 'test') {
  const rootElement = getDocument().getElementById('root')
  renderComponent(rootElement, TestApp)
  logseqAPI.ready(main).catch((err) => {
    logger.error('Plugin ready error:', err);
  })
} else { 
  logseqAPI.ready(main).catch((err) => {
    logger.error('Plugin ready error:', err);
  })
}

// 导出清理函数供需要时使用
export { cleanupPlugin };
