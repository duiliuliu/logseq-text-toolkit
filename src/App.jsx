import React, { useState, useEffect } from 'react'
import './App.css'

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
    
    // Add event listeners
    logseq.App.on('selectionChange', (e) => {
      console.log('Selection changed:', e)
    })
    
    return true
  } catch (error) {
    console.error('Failed to initialize plugin:', error)
    return false
  }
}

function App() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // 初始化 Logseq 插件
    const initPlugin = async () => {
      const ready = await initLogseqPlugin()
      setIsReady(ready)
    }
    
    initPlugin()
    
    // Cleanup
    return () => {
      logseq.App.off('selectionChange')
    }
  }, [])

  return (
    <div className="App">
      <h1>Text Toolkit Plugin</h1>
      {isReady ? (
        <p>Plugin is ready and running</p>
      ) : (
        <p>Initializing plugin...</p>
      )}
    </div>
  )
}

export default App