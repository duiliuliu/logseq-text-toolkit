import React, { useEffect, useState } from 'react'
import '../index.css'
import '../main.css'

// 导入mock logseq
import './mock.js'

function TestApp() {
  const [isReady, setIsReady] = useState(false)

  // 初始化 mock logseq
  useEffect(() => {
    const initLogseqPlugin = async () => {
      try {
        await window.logseq.ready()
        console.log('Mock Logseq plugin ready')
        setIsReady(true)
      } catch (error) {
        console.error('Failed to initialize mock plugin:', error)
        setIsReady(false)
      }
    }

    initLogseqPlugin()
  }, [])

  return (
    <div className="App">
      <h1>Text Toolkit Plugin (Test Mode)</h1>
      <p>Welcome to Text Toolkit Test Mode!</p>
      <p>{isReady ? 'Plugin is ready and running' : 'Initializing plugin...'}</p>
    </div>
  )
}

export default TestApp