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
import Heatmap from './components/Heatmap/Heatmap'
import { renderComponent } from './lib/render'
import { registerTaskProgress } from './lib/taskProgress/register'
import { registerHeatmap, setHeatmapComponent } from './lib/heatmap/register'
import { registerBlockView } from './lib/blockView/register'
import { registerCSS } from './lib/cssRegistry'
import {
  initSummaryModal,
  registerSummaryCommands,
} from './lib/summary/register'
import logseqAPI from './logseq'
import { getDocument } from './logseq/utils'

import toolbarCSSRaw from './components/Toolbar/toolbar.css?raw'
import settingsModalCSSRaw from './components/SettingsModal/settingsModal.css?raw'
import modalCSSRaw from './components/Modal/modal.css?raw'
import inlineCommentCSSRaw from './components/Comment/inlineComment.css?raw'
import customsToolbarItemsCSSRaw from './components/SelectToolbar/customsToolbarItems.css?raw'
import taskProgressCSSRaw from './components/TaskProgress/taskProgress.css?raw'
import customSelectCSSRaw from './components/CustomSelect/customSelect.css?raw'
import heatmapCSSRaw from './components/Heatmap/heatmap.css?raw'
import summaryCSSRaw from './components/Summary/summary.css?raw'
import blockViewCSSRaw from './components/BlockView/blockView.css?raw'
import tableViewCSSRaw from './components/BlockView/tableView.css?raw'
import galleryViewCSSRaw from './components/BlockView/galleryView.css?raw'
import boardViewCSSRaw from './components/BlockView/boardView.css?raw'
import mindMapViewCSSRaw from './components/BlockView/mindMapView.css?raw'
import listViewCssRaw from './components/BlockView/listView.css?raw'
import mainCSSRaw from './main.css?raw'


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

/**
 * 注册所有 CSS 样式
 * 使用 both 类型：优先加载外部 CSS（用户自定义），降级使用内置 CSS
 */
export function registerAllCSS(): void {
  registerCSS('main', {
    type: 'both',
    inlineContent: mainCSSRaw,
    externalPath: 'main.css'
  })

  registerCSS('toolbar', {
    type: 'both',
    inlineContent: toolbarCSSRaw,
    externalPath: 'toolbar.css'
  })

  registerCSS('settingsModal', {
    type: 'both',
    inlineContent: settingsModalCSSRaw,
    externalPath: 'settingsModal.css'
  })

  registerCSS('modal', {
    type: 'both',
    inlineContent: modalCSSRaw,
    externalPath: 'modal.css'
  })

  registerCSS('inlineComment', {
    type: 'both',
    inlineContent: inlineCommentCSSRaw,
    externalPath: 'inlineComment.css'
  })

  registerCSS('customToolbarItems', {
    type: 'both',
    inlineContent: customsToolbarItemsCSSRaw,
    externalPath: 'customsToolbarItems.css'
  })

  registerCSS('taskProgress', {
    type: 'both',
    inlineContent: taskProgressCSSRaw,
    externalPath: 'taskProgress.css'
  })

  registerCSS('customSelect', {
    type: 'both',
    inlineContent: customSelectCSSRaw,
    externalPath: 'customSelect.css'
  })

  registerCSS('heatmap', {
    type: 'both',
    inlineContent: heatmapCSSRaw,
    externalPath: 'heatmap.css'
  })

  registerCSS('summary', {
    type: 'both',
    inlineContent: summaryCSSRaw,
    externalPath: 'summary.css'
  })

  registerCSS('blockView', {
    type: 'both',
    inlineContent: blockViewCSSRaw,
    externalPath: 'blockView.css'
  })

  registerCSS('tableView', {
    type: 'both',
    inlineContent: tableViewCSSRaw,
    externalPath: 'tableView.css'
  })

  registerCSS('galleryView', {
    type: 'both',
    inlineContent: galleryViewCSSRaw,
    externalPath: 'galleryView.css'
  })

  registerCSS('boardView', {
    type: 'both',
    inlineContent: boardViewCSSRaw,
    externalPath: 'boardView.css'
  })

  registerCSS('mindMapView', {
    type: 'both',
    inlineContent: mindMapViewCSSRaw,
    externalPath: 'mindMapView.css'
  })

  registerCSS('listView', {
    type: 'both',
    inlineContent: listViewCssRaw,
    externalPath: 'listView.css'
  })
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

/* ============================================================================
   Heatmap 组件
   ============================================================================ */

/**
 * Heatmap 初始化
 * 注册热力图宏渲染器和斜杠命令
 */
export async function initHeatmap(): Promise<void> {
  setHeatmapComponent(Heatmap)
  registerHeatmap()
}

/* ============================================================================
   Summary 组件
   ============================================================================ */

/**
 * Summary 初始化
 * 注册总结模块的弹窗和斜杠命令
 */
export async function initSummary(): Promise<void> {
  await initSummaryModal()
  registerSummaryCommands()
}

/* ============================================================================
   BlockView 组件
   ============================================================================ */

/**
 * BlockView 初始化
 * 注册块视图宏渲染器和斜杠命令
 */
export async function initBlockView(): Promise<void> {
  registerBlockView()
}
