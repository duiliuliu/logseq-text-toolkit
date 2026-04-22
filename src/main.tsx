
import React from 'react'
import ReactDOM from 'react-dom/client'
import './main.css'
import TestApp from './test/testAPP.tsx'
import SettingsModal from './components/SettingsModal'
import SelectToolbar from './components/SelectToolbar'
import { SettingsProvider } from './settings/useSettings.tsx'
import { logseqAPI } from './logseq/index.ts'
import { toolbarItems as defaultToolbarItems } from './test/testData.ts'
import { getSettings } from './settings/index.ts'
import { getDocument } from './logseq/utils.ts'
import { settingsModalCSS, modalCSS, toolbarCSS, cssConfigCSS } from './styles/index.ts'

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
  logseqAPI.provideStyle(settingsModalCSS)
  
  // 提供模态框基础样式
  logseqAPI.provideStyle(modalCSS)
  
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

  // 提供工具栏样式
  logseqAPI.provideStyle(toolbarCSS)

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
        // 使用ToolbarItems作为工具栏配置
        const toolbarItems = currentSettings.ToolbarItems || []
        console.log('Toolbar items:', toolbarItems)
        
        // 实现logseq定位方法
        const getCursorPosition = async () => {
          try {
            const curPos = await logseqAPI.Editor.getEditingCursorPosition()
            return curPos
          } catch (error) {
            console.error('Error getting cursor position:', error)
            return null
          }
        }
        
        renderComponent(toolbarContainer, SelectToolbar, {
          targetElement: mainContentContainer,
          items: toolbarItems,
          positioningMethod: 'logseq',
          getCursorPosition: getCursorPosition
        })
      }
    }, 1)
  }
}

const main = async () => {
  try {
    console.log('Initializing Text Toolkit Plugin')
    console.log('Logseq API ready')

    // 提供CSS配置
    logseqAPI.provideStyle(cssConfigCSS)

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
