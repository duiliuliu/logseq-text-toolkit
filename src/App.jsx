import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [isReady, setIsReady] = useState(false)
  const [isTestMode, setIsTestMode] = useState(false)

  useEffect(() => {
    // 检测是否在测试模式
    const checkTestMode = () => {
      // 检查是否在测试页面
      return window.location.pathname.includes('test.html') || 
             window.location.search.includes('test=true')
    }

    const isTest = checkTestMode()
    setIsTestMode(isTest)

    // Initialize Logseq plugin
    const initPlugin = async () => {
      try {
        // 在测试模式下，logseq 已经被 mock
        if (!isTest) {
          await logseq.ready()
        }
        console.log('Logseq plugin ready')
        setIsReady(true)
        
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
        
      } catch (error) {
        console.error('Failed to initialize plugin:', error)
      }
    }
    
    initPlugin()
    
    // Cleanup
    return () => {
      logseq.App.off('selectionChange')
    }
  }, [])

  return (
    <div className="App">
      {isTestMode ? (
        <div>
          <h1>Text Toolkit Plugin - Test Mode</h1>
          <p>测试模式已启用，使用 mock 数据和测试页面</p>
        </div>
      ) : (
        <div>
          <h1>Text Toolkit Plugin</h1>
          {isReady ? (
            <p>Plugin is ready and running in Logseq</p>
          ) : (
            <p>Initializing plugin...</p>
          )}
        </div>
      )}
    </div>
  )
}

export default App