import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './main.css'
import App from './App.tsx'
import TestApp from './test/testAPP.tsx'
import SettingsModal from './components/SettingsModal'
import SelectToolbar from './components/SelectToolbar'
import { SettingsProvider } from './config/useSettings.tsx'
import { logseqAPI } from './logseq/index.ts'
import { toolbarItems as defaultToolbarItems } from './test/testData.ts'
import { getSettings } from './logseq/mock/settings.ts'
import { getDocument, getWindow } from './logseq/utils.ts'

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
  await showSettingUI();
}

const showSelectToolbar = async () => {
  console.log('Showing Select Toolbar')

  const currentSettings = getSettings()
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
        renderComponent(toolbarContainer, SelectToolbar, {
          targetElement: mainContentContainer,
          items: defaultToolbarItems,
        })
      }
    }, 1)
  }
}

const main = async () => {
  try {
    console.log('Initializing Text Toolkit Plugin')
    await logseqAPI.ready()
    console.log('Logseq API ready')

    // 先提供设置切换函数
    console.log('About to call provideModel with settingToggle:', typeof settingToggle)
    logseqAPI.provideModel({ settingToggle })

    // 初始渲染设置组件（默认隐藏）
    await showSettingUI()

    logseqAPI.App.registerUIItem('toolbar', {
      key: 'text-toolkit-settings-btn',
      template: `
        <button style="font-weight: bold; background: none; border: none; cursor: pointer; font-size: 16px;" data-on-click="settingToggle" data-rect>
          ⚙️
        </button>
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
  logseqAPI.ready().then(main).catch(console.error)
} else {
  // 在正式模式下，渲染 App 组件
  const rootElement = getDocument().getElementById('root')
  renderComponent(rootElement, App)
  logseqAPI.ready().then(main).catch(console.error)
}
