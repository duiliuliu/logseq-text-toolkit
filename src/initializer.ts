/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 插件初始化 - 基础资源加载 & UI组件初始化函数
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

/* ============================================================================
   常量定义
   ============================================================================ */

const ID = {
  TOOLBAR: 'text-toolkit-toolbar',
  SETTINGS: 'text-toolkit-settings',
  COMMENT: 'text-toolkit-comment-app',
  BUTTON: 'ltt-settings-button',
} as const

/* ============================================================================
   日志配置
   ============================================================================ */

/**
 * 配置日志系统
 * 根据开发者模式设置日志级别
 */
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

/* ============================================================================
   CSS 注册
   ============================================================================ */

import toolbarCSSRaw from './components/Toolbar/toolbar.css?raw'
import settingsModalCSSRaw from './components/SettingsModal/settingsModal.css?raw'
import modalCSSRaw from './components/Modal/modal.css?raw'
import inlineCommentCSSRaw from './components/Comment/inlineComment.css?raw'
import customsToolbarItemsCSSRaw from './lib/cssRegistry/customsToolbarItems.css?raw'
import taskProgressCSSRaw from './components/TaskProgress/taskProgress.css?raw'

/**
 * 注册工具栏样式
 */
export function registerToolbarCSS(): void {
  logseqAPI.provideStyle(toolbarCSSRaw)
}

/**
 * 注册设置弹窗样式
 */
export function registerSettingsModalCSS(): void {
  logseqAPI.provideStyle(settingsModalCSSRaw)
}

/**
 * 注册通用弹窗样式
 */
export function registerModalCSS(): void {
  logseqAPI.provideStyle(modalCSSRaw)
}

/**
 * 注册评论功能样式
 */
export function registerCommentCSS(): void {
  logseqAPI.provideStyle(inlineCommentCSSRaw)
}

/**
 * 注册自定义工具栏样式
 */
export function registerCustomToolbarCSS(): void {
  logseqAPI.provideStyle(customsToolbarItemsCSSRaw)
}

/**
 * 注册任务进度样式
 */
export function registerTaskProgressCSS(): void {
  logseqAPI.provideStyle(taskProgressCSSRaw)
}

/**
 * 注册所有 CSS 样式
 */
export function registerAllCSS(): void {
  registerToolbarCSS()
  registerSettingsModalCSS()
  registerModalCSS()
  registerCommentCSS()
  registerCustomToolbarCSS()
  registerTaskProgressCSS()
}

/* ============================================================================
   SettingsModal 组件
   ============================================================================ */

let settingsModalOpen = false

/**
 * 渲染 SettingsModal 组件到 DOM
 */
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

/**
 * SettingsModal 初始化
 * 提供 UI 容器并渲染设置弹窗
 */
export async function initSettingsModal(): Promise<void> {
  logseqAPI.provideUI({
    key: ID.SETTINGS,
    path: '#app-container',
    template: `<div id="${ID.SETTINGS}"></div>`,
  })
  setTimeout(renderSettingsModal, 1)
}

/**
 * 设置弹窗切换函数
 * 由 logseq 工具栏按钮触发
 */
export async function settingToggle(): Promise<void> {
  settingsModalOpen = !settingsModalOpen
  logseqAPI.provideUI({
    key: ID.SETTINGS,
    path: '#app-container',
    template: `<div id="${ID.SETTINGS}"></div>`,
  })
  setTimeout(renderSettingsModal, 1)
}

/**
 * 注册 Logseq 工具栏按钮
 */
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

/* ============================================================================
   SelectToolbar 组件
   ============================================================================ */

/**
 * 渲染 SelectToolbar 组件到 DOM
 */
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

/**
 * SelectToolbar 初始化
 * 仅在 toolbar 设置启用时渲染
 */
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

/* ============================================================================
   CommentApp 组件
   ============================================================================ */

/**
 * 渲染 CommentApp 组件到 DOM
 */
function renderCommentApp(): void {
  const container = getDocument().getElementById(ID.COMMENT)
  if (!container) return
  renderComponent(container, CommentApp)
}

/**
 * CommentApp 初始化
 */
export async function initCommentApp(): Promise<void> {
  logseqAPI.provideUI({
    key: ID.COMMENT,
    path: '#app-container',
    template: `<div id="${ID.COMMENT}"></div>`,
  })
  setTimeout(renderCommentApp, 1)
}

/* ============================================================================
   TaskProgress 宏注册
   ============================================================================ */

/**
 * TaskProgress 初始化
 * 注册任务进度宏渲染器和斜杠命令
 */
export async function initTaskProgress(): Promise<void> {
  registerTaskProgress()
}
