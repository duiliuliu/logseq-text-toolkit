import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Initialize Logseq plugin
    const initPlugin = async () => {
      try {
        await logseq.ready()
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
      <h1>Text Toolkit Plugin</h1>
      {isReady ? (
        <p>Plugin is ready and running in Logseq</p>
      ) : (
        <p>Initializing plugin...</p>
      )}
    </div>
  )
}

export default App