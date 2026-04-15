import React, { useEffect, useState, useRef } from 'react'
import '../index.css'
import '../main.css'
import Toolbar from '../components/Toolbar'
import { toolbarItems as testData } from './testData.js'

// 导入mock logseq
import './mock.js'

function TestApp() {
  const [isReady, setIsReady] = useState(false)
  const [theme, setTheme] = useState('light')
  const [selectedText, setSelectedText] = useState('')
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })
  const [showToolbar, setShowToolbar] = useState(false)
  const textAreaRef = useRef(null)

  // 初始化 mock logseq
  useEffect(() => {
    const initLogseqPlugin = async () => {
      try {
        console.log('Welcome to Text Toolkit Test Mode!')
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

  const handleSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim()
      setSelectedText(selectedText)
      
      // 计算 toolbar 位置
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setToolbarPosition({
        top: rect.top - 50, // 显示在选中文字上方
        left: rect.left + rect.width / 2 - 100 // 居中显示
      })
      setShowToolbar(true)
    } else {
      setShowToolbar(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mouseup', handleSelection)
    return () => {
      document.removeEventListener('mouseup', handleSelection)
    }
  }, [])

  return (
    <div className="App">
      <h1>Text Toolkit Plugin (Test Mode)</h1>
      <p>Welcome to Text Toolkit Test Mode!</p>
      <p>{isReady ? 'Plugin is ready and running' : 'Initializing plugin...'}</p>
      
      <div className="theme-switcher">
        <label>Choose theme: </label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      
      <div className="text-area-container">
        <p ref={textAreaRef}>
          请选择这段文字来测试 Toolbar 功能。当你选择文字时，Toolbar 会显示在选中文字的上方。
          然后你可以点击 Toolbar 中的任何元素，控制台会打印出元素名称、功能和选中的文字。
        </p>
      </div>
      
      {showToolbar && (
        <div 
          className="floating-toolbar"
          style={{
            position: 'fixed',
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`,
            zIndex: 10000
          }}
        >
          <Toolbar items={testData} theme={theme} selectedText={selectedText} />
        </div>
      )}
    </div>
  )
}

export default TestApp