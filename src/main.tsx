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

// 获取正确的document对象
const getDocument = (): Document => {
  // 检测是否在测试模式
  const isTestMode = import.meta.env.MODE === 'test';
  
  if (!isTestMode && typeof window !== 'undefined' && window.parent !== window) {
    // 在iframe中且非测试模式，使用parent.document
    return window.parent.document;
  } else {
    // 测试模式或不在iframe中，使用当前document
    return document;
  }
}

// 获取正确的window对象
const getWindow = (): Window => {
  // 检测是否在测试模式
  const isTestMode = import.meta.env.MODE === 'test';
  
  if (!isTestMode && typeof window !== 'undefined' && window.parent !== window) {
    // 在iframe中且非测试模式，使用parent.window
    return window.parent;
  } else {
    // 测试模式或不在iframe中，使用当前window
    return window;
  }
}

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

const showSettingUI = async () => {
  console.log('Showing settings UI')
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
        isOpen: true,
        onClose: () => {
          logseqAPI.provideUI({
            key: SETTINGS_ID,
            path: '#app-container',
            template: '',
          })
        },
        theme: currentSettings.theme,
      })
    }
  }, 50)
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
          theme: currentSettings.theme,
          showBorder: currentSettings.toolbar.showBorder,
          width: currentSettings.toolbar.width,
          height: currentSettings.toolbar.height,
          hoverDelay: currentSettings.toolbar.hoverDelay,
          sponsorEnabled: currentSettings.toolbar.sponsorEnabled,
        })
      }
    }, 50)
  }
}

const main = async () => {
  try {
    console.log('Initializing Text Toolkit Plugin')
    await logseqAPI.ready()
    console.log('Logseq API ready')

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
  const rootElement = getDocument().getElementById('root')
  renderComponent(rootElement, TestApp)
  logseqAPI.ready().then(main).catch(console.error)
} else {
  // 在正式模式下，渲染 App 组件
  const rootElement = getDocument().getElementById('root')
  renderComponent(rootElement, App)
  logseqAPI.ready().then(main).catch(console.error)
}
