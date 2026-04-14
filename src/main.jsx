import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './main.css'
import { registerCommands } from './utils/commands'
import { listenForSelectionChanges } from './utils/state'

// 初始化 Logseq 插件
const initLogseqPlugin = async () => {
  try {
    await logseq.ready()
    console.log('Logseq plugin ready')
    
    // Register plugin commands
    logseq.App.registerCommand({
      id: 'toggle-toolbar',
      label: 'Toggle Text Toolkit',
      key: 't',
      keyModifiers: ['ctrl'],
      handler: () => {
        console.log('Toggle toolbar')
      }
    })
    
    // Register text toolkit commands
    registerCommands()
    
    // Listen for selection changes
    listenForSelectionChanges()
    
    return true
  } catch (error) {
    console.error('Failed to initialize plugin:', error)
    return false
  }
}

// 初始化插件并渲染应用
const initializeApp = async () => {
  await initLogseqPlugin()
  
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

// 启动应用
initializeApp()