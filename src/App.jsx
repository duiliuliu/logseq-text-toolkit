import React, { useState, useEffect } from 'react'
import './App.css'
import Toolbar from '@/components/Toolbar'
import { getToolbarVisible, getSelectedText } from '@/utils/state'
import { executeCommand } from '@/utils/commands'

function App() {
  const [toolbarVisible, setToolbarVisible] = useState(true) // 默认显示工具栏
  const [selectedText, setSelectedText] = useState('')

  // 工具栏项目，支持分组
  const toolbarItems = [
    {
      id: 'cloze',
      label: 'Cloze',
      icon: 'C',
      isGroup: true,
      children: [
        {
          id: 'wrap-cloze',
          label: 'Wrap with cloze',
          icon: 'C'
        }
      ]
    },
    {
      id: 'highlight',
      label: 'Highlight',
      icon: 'H',
      isGroup: true,
      children: [
        {
          id: 'wrap-red-hl',
          label: 'Wrap with red highlight',
          icon: 'R'
        },
        {
          id: 'wrap-green-hl',
          label: 'Wrap with green highlight',
          icon: 'G'
        },
        {
          id: 'wrap-blue-hl',
          label: 'Wrap with blue highlight',
          icon: 'B'
        }
      ]
    },
    {
      id: 'text-color',
      label: 'Text Color',
      icon: 'T',
      isGroup: true,
      children: [
        {
          id: 'wrap-red-text',
          label: 'Wrap with red text',
          icon: 'R'
        },
        {
          id: 'wrap-green-text',
          label: 'Wrap with green text',
          icon: 'G'
        },
        {
          id: 'wrap-blue-text',
          label: 'Wrap with blue text',
          icon: 'B'
        }
      ]
    },
    {
      id: 'repl-clear',
      label: 'Remove formatting',
      icon: 'X'
    }
  ]

  // 监听状态变化
  useEffect(() => {
    const interval = setInterval(() => {
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
      {toolbarVisible && (
        <Toolbar 
          items={toolbarItems} 
          onItemClick={handleToolbarItemClick} 
        />
      )}
    </div>
  )
}

export default App