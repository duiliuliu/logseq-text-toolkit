import React, { useEffect, useState } from 'react'
import './App.css'
import Toolbar from './components/Toolbar/index.jsx'
import { toolbarItems } from './test/testData.js'

function App() {
  const [isReady, setIsReady] = useState(false)

  // 初始化 Logseq 插件
  useEffect(() => {
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
        
        // Add event listeners
        logseq.App.on('selectionChange', (e) => {
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
      
      <div className="toolbar-section">
        <h2>Light Theme (with border)</h2>
        <Toolbar items={toolbarItems} theme="light" showBorder={true} />
      </div>
      
      <div className="toolbar-section">
        <h2>Dark Theme (without border)</h2>
        <Toolbar items={toolbarItems} theme="dark" showBorder={false} />
      </div>
    </div>
  )
}

export default App