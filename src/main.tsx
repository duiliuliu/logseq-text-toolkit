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

let settingsModalOpen = false;

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
          settingsModalOpen = false;
          showSettingUI();
        },
        theme: currentSettings.theme,
      })
    }
  }, 1)
}

const settingToggle = async () => {
  settingsModalOpen = !settingsModalOpen;
  showSettingUI();
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

// 注册工具栏按钮
const registerLogseqButton = () => {
  logseqAPI.App.registerUIItem('toolbar', {
    key: 'text-toolkit-settings-btn',
    template: `
      <a class="button" id="ltt-settings-button"
      data-on-click="settingToggle"
      data-rect
      title="✨ Text Toolkit Plugin - 让你的笔记更有趣！">
       <i class="ti ti-text-wrap"></i>
      </a>
    `,
  })
}

const main = async () => {
  try {
    // 使用统一的初始化管理器
    await initializePlugin();

    // 注册 UI 模型
    logseqAPI.provideModel({ settingToggle })

    // 显示设置 UI
    await showSettingUI()

    // 注册工具栏按钮
    registerLogseqButton()

    // 显示其他 UI
    await showSelectToolbar()
    await showCommentApp()
    
  } catch (error) {
    logger.error('Failed to initialize Text Toolkit Plugin:', error)
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
