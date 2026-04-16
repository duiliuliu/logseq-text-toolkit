import React, { useEffect, useState } from 'react'
import './App.css'
import { logseqAPI } from './hooks/logseq/index.js'

// 仅在测试模式下导入测试数据
let Toolbar = null
let toolbarItems = null
if (import.meta.env.MODE === 'test') {
  Toolbar = require('./components/Toolbar/index.jsx').default
  toolbarItems = require('./test/testData.js').toolbarItems
}

function App() {
  const [isReady, setIsReady] = useState(false)

  // 初始化 Logseq 插件
  useEffect(() => {
    const initLogseqPlugin = async () => {
      try {
        await logseqAPI.ready()
        console.log('Logseq plugin ready')
        
        // Register plugin commands
        logseqAPI.App.registerCommand({
          id: 'toggle-toolbar',
          label: 'Toggle Text Toolkit',
          key: 't',
          keyModifiers: ['ctrl'],
          handler: () => {
            console.log('Toggle toolbar')
          }
        })
        
        // Add event listeners
        logseqAPI.App.on('selectionChange', (e) => {
          console.log('Selection changed:', e)
        })
        
        setIsReady(true)
      } catch (error) {
        console.error('Failed to initialize plugin:', error)
        setIsReady(false)
      }
    }

    initLogseqPlugin()
  }, [])

  return (
    <div className="App">
      <h1>Text Toolkit Plugin</h1>
      <p>Welcome to Text Toolkit!</p>
      <p>{isReady ? 'Plugin is ready and running' : 'Initializing plugin...'}</p>
      
      {/* 仅在测试模式下展示测试数据 */}
      {import.meta.env.MODE === 'test' && Toolbar && toolbarItems && (
        <>
          <div className="toolbar-section">
            <h2>Light Theme (with border)</h2>
            <Toolbar items={toolbarItems} theme="light" showBorder={true} />
          </div>
          
          <div className="toolbar-section">
            <h2>Dark Theme (without border)</h2>
            <Toolbar items={toolbarItems} theme="dark" showBorder={false} />
          </div>
        </>
      )}
    </div>
  )
}

export default App