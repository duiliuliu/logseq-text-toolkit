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

    // 处理滚动事件，更新toolbar位置
    const handleScroll = () => {
      if (showToolbar && window.getSelection().toString().length > 0) {
        const selection = window.getSelection()
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        setToolbarPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        })
      }
    }

    document.addEventListener('mouseup', handleSelection)
    window.addEventListener('scroll', handleScroll)
    return () => {
      document.removeEventListener('mouseup', handleSelection)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [showToolbar])

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
      
      <div className="content-section" ref={contentRef}>
        <h2>Select Text Below</h2>
        <p>Select any text in this paragraph to see the toolbar appear. The toolbar will show up above the selected text, and you can click on any toolbar item to see the element name, function, and selected text printed in the console.</p>
        <p>This is another paragraph with more text to select. Try selecting different parts of this text to see how the toolbar follows your selection.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
        <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
        <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>
        <p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>
        <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.</p>
        <p>Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.</p>
        <p>Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.</p>
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
            selectedData={{ text: selectedText, timestamp: new Date().toISOString() }}
          />
        </div>
      )}
    </div>
  )
}

export default TestApp