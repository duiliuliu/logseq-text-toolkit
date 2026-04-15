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
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 })
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarWidth, setToolbarWidth] = useState('110px')
  const [toolbarHeight, setToolbarHeight] = useState('24px')
  const contentRef = useRef(null)

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

  // 处理文本选择
  useEffect(() => {
    const handleSelection = (e) => {
      if (e.target.closest('.floating-toolbar') || e.target.closest('.toolbar-container')) {
        return
      }

      const selection = window.getSelection()
      if (selection && selection.toString().length > 0) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        setSelectedText(selection.toString())
        setToolbarPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        })
        setShowToolbar(true)
      } else {
        setShowToolbar(false)
      }
    }

    document.addEventListener('mouseup', handleSelection)
    return () => {
      document.removeEventListener('mouseup', handleSelection)
    }
  }, [])

  return (
    <div className="App" ref={contentRef}>
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
      
      <div className="toolbar-width-control">
        <label>Toolbar width: </label>
        <input 
          type="text" 
          value={toolbarWidth} 
          onChange={(e) => setToolbarWidth(e.target.value)}
          placeholder="e.g., 100px"
        />
      </div>
      
      <div className="toolbar-height-control">
        <label>Toolbar height: </label>
        <input 
          type="text" 
          value={toolbarHeight} 
          onChange={(e) => setToolbarHeight(e.target.value)}
          placeholder="e.g., 48px"
        />
      </div>
      
      <div className="content-section">
        <h2>Select Text Below</h2>
        <p>Select any text in this paragraph to see the toolbar appear. The toolbar will show up above the selected text, and you can click on any toolbar item to see the element name, function, and selected text printed in the console.</p>
        <p>This is another paragraph with more text to select. Try selecting different parts of this text to see how the toolbar follows your selection.</p>
      </div>
      
      {showToolbar && (
        <div 
          className="floating-toolbar"
          style={{
            position: 'fixed',
            left: toolbarPosition.x,
            top: toolbarPosition.y,
            transform: 'translateX(-50%)',
            zIndex: 10000
          }}
        >
          <Toolbar 
            items={testData} 
            theme={theme} 
            showBorder={false}
            width={toolbarWidth}
            height={toolbarHeight}
            selectedText={selectedText}
          />
        </div>
      )}
    </div>
  )
}

export default TestApp