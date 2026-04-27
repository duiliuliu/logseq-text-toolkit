import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './main.css'
import App from './App.tsx'
import TestApp from './test/testAPP.tsx'
import SettingsModal from './components/SettingsModal'
import SelectToolbar from './components/SelectToolbar'
import { SettingsProvider } from './hooks/useSettings.tsx'
import { logseqAPI } from './logseq/index.ts'
import { toolbarItems as defaultToolbarItems } from './test/testData.ts'
import defaultSettings from './config/defaultSettings.ts'
import { initI18n } from './translations/i18n.ts'

const TOOLBAR_ID = 'text-toolkit-toolbar'
const SETTINGS_ID = 'text-toolkit-settings'

const renderComponent = (container, Component, props = {}) => {
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

const showSettingUI = async () => {
  console.log('Showing settings UI')
  logseqAPI.provideUI({
    key: SETTINGS_ID,
    path: '#app-container',
    template: `<div id="${SETTINGS_ID}"></div>`,
  })

  setTimeout(() => {
    const container = document.getElementById(SETTINGS_ID)
    if (container) {
      renderComponent(container, SettingsModal, {
        isOpen: true,
        onClose: () => {
          logseqAPI.provideUI({
            key: SETTINGS_ID,
            path: '#app-container',
            template: '',
          })
        },
        theme: defaultSettings.theme,
      })
    }
  }, 0)
}

const showSelectToolbar = async () => {
  console.log('Showing Select Toolbar')

  if (defaultSettings.toolbar.enabled) {
    logseqAPI.provideUI({
      key: TOOLBAR_ID,
      path: '#app-container',
      template: `<div id="${TOOLBAR_ID}"></div>`,
    })

    setTimeout(() => {
      const toolbarContainer = document.getElementById(TOOLBAR_ID)
      const mainContentContainer = document.getElementById('main-content-container')
      if (toolbarContainer) {
        renderComponent(toolbarContainer, SelectToolbar, {
          targetElement: mainContentContainer,
          items: defaultToolbarItems,
          theme: defaultSettings.theme,
          showBorder: defaultSettings.toolbar.showBorder,
          width: defaultSettings.toolbar.width,
          height: defaultSettings.toolbar.height,
          hoverDelay: defaultSettings.toolbar.hoverDelay,
          sponsorEnabled: defaultSettings.toolbar.sponsorEnabled,
        })
      }
    }, 0)
  }
}

const main = async () => {
  try {
    console.log('Initializing Text Toolkit Plugin')
    await logseqAPI.ready()
    console.log('Logseq API ready')

    // 初始化国际化
    await initI18n()
    console.log('I18n initialized')

    logseqAPI.provideModel({ showSettingUI })

    logseqAPI.App.registerUIItem('toolbar', {
      key: 'text-toolkit-settings-btn',
      template: `
        <a style="font-weight: bold" data-on-click="showSettingUI" data-rect>
          ⚙️
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
  const rootElement = document.getElementById('root')
  renderComponent(rootElement, TestApp)
  logseqAPI.ready().then(main).catch(console.error)
} else {
  // 在正式模式下，渲染 App 组件
  const rootElement = document.getElementById('root')
  renderComponent(rootElement, App)
  logseqAPI.ready().then(main).catch(console.error)
}
