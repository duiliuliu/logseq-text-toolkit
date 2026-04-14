import React, { useState, useEffect } from 'react'
import './App.css'
import Toolbar from './components/Toolbar'
import { getToolbarVisible, getSelectedText } from './utils/state'
import { executeCommand } from './utils/commands'

function App() {
  const [toolbarVisible, setToolbarVisible] = useState(false)
  const [selectedText, setSelectedText] = useState('')

  // 工具栏项目
  const toolbarItems = [
    {
      id: 'bold',
      label: '加粗',
      icon: 'B'
    },
    {
      id: 'highlight',
      label: '高亮',
      icon: 'H'
    },
    {
      id: 'file-link',
      label: '文件链接',
      icon: 'L'
    }
  ]

  // 监听状态变化
  useEffect(() => {
    const interval = setInterval(() => {
      setToolbarVisible(getToolbarVisible())
      setSelectedText(getSelectedText())
    }, 100)

    return () => clearInterval(interval)
  }, [])

  // 处理工具栏项目点击
  const handleToolbarItemClick = async (commandId) => {
    await executeCommand(commandId)
  }

  return (
    <div className="App">
      {toolbarVisible && selectedText && (
        <Toolbar 
          items={toolbarItems} 
          onItemClick={handleToolbarItemClick} 
        />
      )}
    </div>
  )
}

export default App