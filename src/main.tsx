
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './main.css'
import TestApp from './test/testAPP.tsx'
import SettingsModal from './components/SettingsModal'
import SelectToolbar from './components/SelectToolbar'
import { SettingsProvider } from './settings/useSettings.tsx'
import { logseqAPI } from './logseq/index.ts'
import { toolbarItems as defaultToolbarItems } from './test/testData.ts'
import { getSettings } from './settings/index.ts'
import { getDocument } from './logseq/utils.ts'

const TOOLBAR_ID = 'text-toolkit-toolbar'
const SETTINGS_ID = 'text-toolkit-settings'

interface RenderComponentProps {
  [key: string]: any
}

const renderComponent = (container: HTMLElement | null, Component: React.ComponentType<any>, props: RenderComponentProps = {}) => {
  if (container) {
    ReactDOM.createRoot(container).render(
      <React.StrictMode>
        <SettingsProvider>
          <Component {...props} />
        </SettingsProvider>
      </React.StrictMode>
    )
  }
}

// 存储设置面板的显示状态
let settingsModalOpen = false;

const showSettingUI = async () => {
  console.log('Showing settings UI with isOpen:', settingsModalOpen)
  
  // 提供设置模态框样式
  logseqAPI.provideStyle(`
    /* Settings modal styles */
    .ltt-settings-container {
      max-height: 70vh;
      overflow-y: auto;
      padding-right: 8px;
    }

    /* 自定义滚动条样式 */
    .ltt-settings-container::-webkit-scrollbar {
      width: 6px;
    }

    .ltt-settings-container::-webkit-scrollbar-track {
      background: transparent;
    }

    .ltt-settings-container::-webkit-scrollbar-thumb {
      background: var(--ls-border-color-plugin, #ccc);
      border-radius: 3px;
      opacity: 0.5;
    }

    .ltt-settings-container::-webkit-scrollbar-thumb:hover {
      opacity: 0.8;
    }

    [data-theme="dark"] .ltt-settings-container::-webkit-scrollbar-thumb {
      background: var(--ls-border-color-plugin, #555);
    }

    .ltt-settings-loading,
    .ltt-settings-error {
      padding: 40px 20px;
      text-align: center;
      color: var(--ls-primary-text-color-plugin, #666);
    }

    .ltt-settings-header {
      margin-bottom: 16px;
    }

    .ltt-settings-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--ls-border-color-plugin, #e0e0e0);
      padding-bottom: 8px;
      flex-wrap: nowrap;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .ltt-settings-tabs::-webkit-scrollbar {
      display: none;
    }

    .ltt-settings-tab {
      padding: 8px 16px;
      border: 1px solid var(--ls-border-color-plugin, #e0e0e0);
      border-radius: 6px 6px 0 0;
      background-color: var(--ls-secondary-background-color-plugin, #f5f5f5);
      color: var(--ls-primary-text-color-plugin, #666);
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
      border-bottom: none;
      white-space: nowrap;
    }

    .ltt-settings-tab:hover {
      background-color: var(--ls-secondary-background-color-plugin, #e0e0e0);
      color: var(--ls-primary-text-color-plugin, #333);
    }

    .ltt-settings-tab.active {
      background-color: var(--ls-primary-background-color-plugin, #fff);
      color: var(--ls-primary-text-color-plugin, #333);
      border-color: var(--ls-border-color-plugin, #e0e0e0);
      border-bottom: 1px solid var(--ls-primary-background-color-plugin, #fff);
      margin-bottom: -1px;
    }

    .ltt-settings-content {
      min-height: 300px;
    }

    .ltt-settings-tab-content {
      padding: 0;
    }

    .ltt-tab-section-description-small {
      margin: 0 0 16px 0;
      font-size: 12px;
      color: var(--ls-secondary-text-color-plugin, #999);
      line-height: 1.4;
      text-align: left;
      opacity: 0.8;
    }

    .ltt-setting-item {
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      justify-content: flex-start !important;
      flex-wrap: nowrap !important;
      gap: 12px !important;
      width: 100% !important;
      margin-bottom: 16px !important;
      box-sizing: border-box !important;
      position: relative;
    }

    .ltt-setting-item > label {
      flex-shrink: 0 !important;
      white-space: nowrap !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      width: 120px;
      color: var(--ls-primary-text-color-plugin, #333);
      text-align: left;
    }

    .ltt-setting-item > select {
      flex: 0 0 auto !important;
      min-width: 120px !important;
      padding: 2px 4px !important;
      border-radius: 6px !important;
      font-size: 12px !important;
      height: 24px;
      background-color: #f5f5f5 !important;
      box-sizing: border-box !important;
    }

    .ltt-setting-item input[type="checkbox"] {
      width: 28px;
      height: 18px;
      cursor: pointer;
      margin-top: 0;
    }

    .ltt-setting-item {
      justify-content: space-between !important;
    }

    /* Switch开关样式 */
    .ltt-switch {
      position: relative;
      display: inline-block;
      width: 36px;
      height: 20px;
    }

    .ltt-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .ltt-switch-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 20px;
    }

    .ltt-switch-slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }

    input:checked + .ltt-switch-slider {
      background-color: #000;
    }

    input:checked + .ltt-switch-slider:before {
      transform: translateX(16px);
    }

    .ltt-switch-slider:hover {
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
    }

    .ltt-setting-item input[type="text"],
    .ltt-setting-item input[type="number"] {
      flex: 0 0 auto !important;
      min-width: 120px !important;
      padding: 8px 12px !important;
      border: 1px solid var(--ls-border-color-plugin, #ccc);
      border-radius: 6px !important;
      font-size: 14px !important;
      background-color: #f5f5f5;
      color: var(--ls-primary-text-color-plugin, #333);
      white-space: nowrap;
      transition: all 0.2s ease;
      box-sizing: border-box !important;
    }

    .ltt-setting-item input[type="text"]:focus,
    .ltt-setting-item input[type="number"]:focus,
    .ltt-setting-item select:focus {
      border-color: #000;
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
      outline: none;
    }

    /* 确保工具栏配置没有横向滚动 */
    #ltt-toolbar-settings .ltt-settings-tab-content {
      overflow-x: hidden;
      max-width: 100%;
    }

    #ltt-toolbar-settings .ltt-setting-item {
      flex-wrap: wrap;
    }

    #ltt-toolbar-settings .ltt-json-editor {
      max-width: 100%;
      overflow-x: auto;
      width: 100%;
    }

    /* JSON编辑器样式 */
    .ltt-setting-item-json {
      align-items: flex-start;
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 8px !important;
    }

    .ltt-setting-item-json label {
      padding-top: 0;
      width: 100% !important;
      text-align: left !important;
      margin-bottom: 4px;
    }

    .ltt-json-editor {
      flex: 1;
      position: relative;
      width: 100%;
    }

    .ltt-json-editor textarea {
      width: 100%;
      min-height: 240px;
      padding: 16px;
      border: 1px solid var(--ls-border-color-plugin, #e2e8f0);
      border-radius: 8px;
      font-size: 14px;
      font-family: monospace;
      background-color: var(--ls-primary-background-color-plugin, #fff);
      color: var(--ls-primary-text-color-plugin, #1e293b);
      resize: vertical;
      line-height: 1.5;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    .ltt-json-editor textarea:focus {
      border-color: var(--ls-accent-color-plugin, #3b82f6);
      box-shadow: 0 0 0 3px var(--ls-focus-color-plugin, #dbeafe);
      outline: none;
    }

    .ltt-json-error {
      margin-top: 8px;
      font-size: 12px;
      color: #ef4444;
      margin-bottom: 12px;
    }

    .ltt-json-hint {
      margin-bottom: 12px;
      padding: 0;
      background: none;
      border-radius: 0;
      border: none;
      box-shadow: none;
    }

    .ltt-json-hint ul {
      margin: 0;
      padding-left: 16px;
      color: var(--ls-secondary-text-color-plugin, #94a3b8);
    }

    .ltt-json-hint li {
      margin-bottom: 4px;
      font-size: 11px;
      line-height: 1.5;
    }

    .ltt-json-hint li strong {
      color: var(--ls-secondary-text-color-plugin, #94a3b8);
      font-weight: 500;
    }

    .ltt-settings-actions {
      margin-top: 60px;
      display: flex;
      justify-content: flex-end;
      padding-right: 8px;
      padding-bottom: 8px;
    }

    .ltt-settings-btn {
      padding: 6px 14px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 500;
    }

    .ltt-settings-btn-save {
      background-color: #000;
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      position: relative;
      overflow: hidden;
    }

    .ltt-settings-btn-save::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(to right, rgba(255,255,255,0.3), rgba(255,255,255,0));
    }

    .ltt-settings-btn-save::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.3));
    }

    .ltt-settings-btn-save:hover:not(:disabled) {
      background-color: #333;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
      transform: translateY(1px);
    }

    .ltt-settings-btn-save:active:not(:disabled) {
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      transform: translateY(2px);
    }

    .ltt-settings-btn-save:disabled {
      background-color: var(--ls-secondary-background-color-plugin, #ccc);
      cursor: not-allowed;
    }

    .ltt-settings-placeholder {
      text-align: center;
      padding: 60px 20px;
      color: var(--ls-primary-text-color-plugin, #999);
    }

    .ltt-settings-placeholder p {
      margin: 8px 0;
    }

    /* Dark mode */
    [data-theme="dark"] .ltt-settings-tabs {
      border-bottom-color: var(--ls-border-color-plugin, #444);
    }

    [data-theme="dark"] .ltt-settings-tab {
      background-color: var(--ls-secondary-background-color-plugin, #333);
      color: var(--ls-primary-text-color-plugin, #aaa);
      border-color: var(--ls-border-color-plugin, #444);
    }

    [data-theme="dark"] .ltt-settings-tab:hover {
      background-color: var(--ls-secondary-background-color-plugin, #444);
      color: var(--ls-primary-text-color-plugin, #e0e0e0);
    }

    [data-theme="dark"] .ltt-settings-tab.active {
      background-color: var(--ls-primary-background-color-plugin, #2d2d2d);
      color: var(--ls-primary-text-color-plugin, #e0e0e0);
      border-color: var(--ls-border-color-plugin, #444);
      border-bottom-color: var(--ls-primary-background-color-plugin, #2d2d2d);
    }

    [data-theme="dark"] .ltt-tab-section-description-small {
      color: var(--ls-primary-text-color-plugin, #aaa);
    }

    [data-theme="dark"] .ltt-setting-item label {
      color: var(--ls-primary-text-color-plugin, #e0e0e0);
    }

    [data-theme="dark"] .ltt-setting-item input[type="text"],
    [data-theme="dark"] .ltt-setting-item input[type="number"],
    [data-theme="dark"] .ltt-setting-item select,
    [data-theme="dark"] .ltt-json-editor textarea {
      border-color: var(--ls-border-color-plugin, #555);
      background-color: var(--ls-primary-background-color-plugin, #2d2d2d);
      color: var(--ls-primary-text-color-plugin, #e0e0e0);
    }

    [data-theme="dark"] .ltt-settings-placeholder {
      color: var(--ls-primary-text-color-plugin, #666);
    }

    /* 确保工具栏图标在不同主题下都可见 */
    [data-theme="dark"] .ltt-toolbar-icon {
      filter: brightness(1.5);
    }

    /* 响应式调整 */
    @media (max-width: 768px) {
      .ltt-settings-tab {
        font-size: 12px;
        padding: 6px 12px;
      }
      
      .ltt-setting-item {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
      
      .ltt-setting-item label {
        width: auto;
        padding-top: 0;
      }
    }

    /* 设置项组样式 */
    .ltt-setting-item-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .ltt-setting-item-group .ltt-setting-item {
      margin-bottom: 0 !important;
    }

    /* 深色主题下的设置项组样式 */
    [data-theme="dark"] .ltt-setting-item-group {
      background-color: #2a2a2a;
      border-color: #444;
    }
  `)
  
  // 提供模态框基础样式
  logseqAPI.provideStyle(`
    /* Modal styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    }

    .modal-container {
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      width: 100%;
      max-width: 90vw;
      max-height: 90vh;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid;
    }

    .modal-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .modal-close:hover {
      background-color: var(--ls-secondary-background-color-plugin, #f0f0f0);
    }

    .modal-content {
      padding: 20px;
      overflow-y: auto;
      flex: 1;
    }

    /* Theme-specific styles */
    .modal-light {
      background-color: var(--ls-primary-background-color-plugin, #fff);
    }

    .modal-light .modal-header {
      border-bottom-color: var(--ls-border-color-plugin, #e0e0e0);
    }

    .modal-light .modal-title {
      color: var(--ls-primary-text-color-plugin, #333);
    }

    .modal-light .modal-close {
      color: var(--ls-primary-text-color-plugin, #666);
    }

    .modal-light .modal-close:hover {
      background-color: var(--ls-secondary-background-color-plugin, #f0f0f0);
      color: var(--ls-primary-text-color-plugin, #333);
    }

    .modal-dark {
      background-color: var(--ls-primary-background-color-plugin, #2d2d2d);
    }

    .modal-dark .modal-header {
      border-bottom-color: var(--ls-border-color-plugin, #444);
    }

    .modal-dark .modal-title {
      color: var(--ls-primary-text-color-plugin, #e0e0e0);
    }

    .modal-dark .modal-close {
      color: var(--ls-primary-text-color-plugin, #aaa);
    }

    .modal-dark .modal-close:hover {
      background-color: var(--ls-secondary-background-color-plugin, #444);
      color: var(--ls-primary-text-color-plugin, #e0e0e0);
    }
  `)
  
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
        isOpen: settingsModalOpen, // 根据 settingsModalOpen 的值决定是否显示
        onClose: () => {
          settingsModalOpen = false;
          showSettingUI(); // 关闭后重新渲染以更新状态
        },
        theme: currentSettings.theme,
      })
    } else {
      console.error('Settings container not found!')
    }
  }, 1)
}

const settingToggle = async () => {
  console.log('Toggling settings modal')
  settingsModalOpen = !settingsModalOpen;
  showSettingUI();
}

const showSelectToolbar = async () => {
  console.log('Showing Select Toolbar')

  // 打印当前设置数据
  const currentSettings = getSettings()
  console.log('Current settings:', currentSettings)

  // 提供工具栏样式
  logseqAPI.provideStyle(`
    /* Toolbar styles */
    .ltt-toolbar {
      position: absolute;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px;
      background-color: var(--ls-primary-background-color-plugin, #fff);
      border: 1px solid var(--ls-border-color-plugin, #e0e0e0);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      max-width: 300px;
      max-height: 400px;
      overflow-y: auto;
    }

    .ltt-toolbar-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 8px;
    }

    .ltt-toolbar-group:last-child {
      margin-bottom: 0;
    }

    .ltt-toolbar-group-title {
      font-size: 11px;
      font-weight: 500;
      color: var(--ls-secondary-text-color-plugin, #666);
      margin: 0 4px 4px 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .ltt-toolbar-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border: none;
      background: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
      font-size: 14px;
      color: var(--ls-primary-text-color-plugin, #333);
    }

    .ltt-toolbar-item:hover {
      background-color: var(--ls-secondary-background-color-plugin, #f0f0f0);
    }

    .ltt-toolbar-item.active {
      background-color: var(--ls-secondary-background-color-plugin, #e0e0e0);
    }

    .ltt-toolbar-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }

    .ltt-toolbar-item-text {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ltt-toolbar-divider {
      height: 1px;
      background-color: var(--ls-border-color-plugin, #e0e0e0);
      margin: 4px 0;
    }

    /* Dark mode */
    [data-theme="dark"] .ltt-toolbar {
      background-color: var(--ls-primary-background-color-plugin, #2d2d2d);
      border-color: var(--ls-border-color-plugin, #444);
    }

    [data-theme="dark"] .ltt-toolbar-group-title {
      color: var(--ls-secondary-text-color-plugin, #999);
    }

    [data-theme="dark"] .ltt-toolbar-item {
      color: var(--ls-primary-text-color-plugin, #e0e0e0);
    }

    [data-theme="dark"] .ltt-toolbar-item:hover {
      background-color: var(--ls-secondary-background-color-plugin, #333);
    }

    [data-theme="dark"] .ltt-toolbar-item.active {
      background-color: var(--ls-secondary-background-color-plugin, #444);
    }

    [data-theme="dark"] .ltt-toolbar-divider {
      background-color: var(--ls-border-color-plugin, #444);
    }

    /* Scrollbar styling */
    .ltt-toolbar::-webkit-scrollbar {
      width: 6px;
    }

    .ltt-toolbar::-webkit-scrollbar-track {
      background: transparent;
    }

    .ltt-toolbar::-webkit-scrollbar-thumb {
      background: var(--ls-border-color-plugin, #ccc);
      border-radius: 3px;
      opacity: 0.5;
    }

    .ltt-toolbar::-webkit-scrollbar-thumb:hover {
      opacity: 0.8;
    }

    [data-theme="dark"] .ltt-toolbar::-webkit-scrollbar-thumb {
      background: var(--ls-border-color-plugin, #555);
    }
  `)

  // currentSettings already declared above
  if (currentSettings.toolbar.enabled) {
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
        renderComponent(toolbarContainer, SelectToolbar, {
          targetElement: mainContentContainer,
          items: currentSettings.toolbar.items,
        })
      }
    }, 1)
  }
}

const main = async () => {
  try {
    console.log('Initializing Text Toolkit Plugin')
    console.log('Logseq API ready')

    // 先提供设置切换函数
    console.log('About to call provideModel with settingToggle:', typeof settingToggle)
    logseqAPI.provideModel({ settingToggle })

    // 初始渲染设置组件（默认隐藏）
    await showSettingUI()

    logseqAPI.App.registerUIItem('toolbar', {
      key: 'text-toolkit-settings-btn',
      template: `
        <a class="button" id="ltt-settings-button"
        data-on-click="settingToggle"
        data-rect>
         <i class="ti ti-settings"></i> 
        </a>
      `,
    })

    await showSelectToolbar()
    console.log('Text Toolkit Plugin initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Text Toolkit Plugin:', error)
  }
}

if (import.meta.env.MODE === 'test') {
  const rootElement = getDocument().getElementById('root')
  renderComponent(rootElement, TestApp)
  logseqAPI.ready(main).catch(console.error)
} else { 
  logseqAPI.ready(main).catch(console.error)
}
