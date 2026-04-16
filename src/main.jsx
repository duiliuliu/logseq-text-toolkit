import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './main.css'
import App from './App.jsx'
import TestApp from './test/testAPP.jsx'
import SettingsModal from './components/SettingsModal'
import SelectToolbar from './components/SelectToolbar'
import { SettingsProvider } from './hooks/useSettings.jsx'
import { logseqAPI } from './hooks/logseq/index.js'
import { toolbarItems as defaultToolbarItems } from './test/testData.js'
import defaultSettings from './config/defaultSettings.js'

// 常量定义
const TOOLBAR_ID = 'text-toolkit-toolbar'
const SETTINGS_ID = 'text-toolkit-settings'

// renderAPP函数
export const renderAPP = (containerId, Component) => {
  const container = document.getElementById(containerId)
  if (container) {
    ReactDOM.createRoot(container).render(
      <React.StrictMode>
        <SettingsProvider>
          <Component />
        </SettingsProvider>
      </React.StrictMode>
    )
  }
}

// 展示设置弹窗的函数
const showSettingUI = async (e) => {
  console.log('Showing settings UI')
  // 提供UI
  logseqAPI.provideUI({
    key: SETTINGS_ID,
    path: "#app-container",
    template: `<div id="${SETTINGS_ID}"></div>`,
  })
  
  // 等待DOM生成，然后渲染Settings组件
  setTimeout(() => {
    const container = document.getElementById(SETTINGS_ID)
    if (container) {
      ReactDOM.createRoot(container).render(
        <React.StrictMode>
          <SettingsProvider>
            <SettingsModal 
              isOpen={true}
              onClose={() => {
                // 关闭时清除UI
                logseqAPI.provideUI({
                  key: SETTINGS_ID,
                  path: "#app-container",
                  template: '',
                })
              }}
              theme={defaultSettings.theme}
            />
          </SettingsProvider>
        </React.StrictMode>
      )
    }
  }, 0)
}

// 展示SelectToolbar的函数
const showSelectToolbar = async () => {
  console.log('Showing Select Toolbar')
  
  if (defaultSettings.toolbar.enabled) {
    // 提供UI
    logseqAPI.provideUI({
      key: TOOLBAR_ID,
      path: "#app-container",
      template: `<div id="${TOOLBAR_ID}"></div>`,
    })
    
    // 等待DOM生成，然后渲染Toolbar
    setTimeout(async () => {
      const toolbarContainer = document.getElementById(TOOLBAR_ID)
      if (toolbarContainer) {
        // 获取mainContentContainer
        const mainContentContainer = document.getElementById('main-content-container')
        
        // 渲染SelectToolbar
        ReactDOM.createRoot(toolbarContainer).render(
          <React.StrictMode>
            <SettingsProvider>
              <SelectToolbar 
                targetElement={mainContentContainer}
                items={defaultToolbarItems}
                theme={defaultSettings.theme}
                showBorder={defaultSettings.toolbar.showBorder}
                width={defaultSettings.toolbar.width}
                height={defaultSettings.toolbar.height}
                hoverDelay={defaultSettings.toolbar.hoverDelay}
                sponsorEnabled={defaultSettings.toolbar.sponsorEnabled}
              />
            </SettingsProvider>
          </React.StrictMode>
        )
      }
    }, 0)
  }
}

// 主要执行函数
const main = async () => {
  try {
    console.log('Initializing Text Toolkit Plugin')
    await logseqAPI.ready()
    console.log('Logseq API ready')
    
    // 提供模型
    logseqAPI.provideModel({
      showSettingUI: showSettingUI
    })
    
    // 注册顶部Toolbar按钮
    logseqAPI.App.registerUIItem('toolbar', {
      key: 'text-toolkit-settings-btn',
      template: `
        <a 
           style="font-weight: bold"
           data-on-click="showSettingUI" 
           data-rect
        >
          ⚙️
        </a>
      `,
    })
    
    // 展示SelectToolbar
    await showSelectToolbar()
    
    console.log('Text Toolkit Plugin initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Text Toolkit Plugin:', error)
  }
}

// 根据启动模式选择应用
const AppComponent = import.meta.env.MODE === 'test' ? TestApp : App

// 渲染应用
if (import.meta.env.MODE === 'test') {
  // 测试模式
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <SettingsProvider>
        <AppComponent />
      </SettingsProvider>
    </React.StrictMode>
  )
} else {
  // 正式模式，渲染基础APP
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <SettingsProvider>
        <AppComponent />
      </SettingsProvider>
    </React.StrictMode>
  )
  
  // 执行主要逻辑
  logseqAPI.ready().then(main).catch(console.error)
}
