/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 测试应用入口
 */

import '../main.css'
import './testApp.css'
import React, { useState, useEffect } from 'react'
import TestLayout from './components/TestLayout/index.tsx'
import TextSelectionDemo from './components/TextSelectionDemo/index.tsx'
import HiccupRenderer from './components/HiccupRenderer/index.tsx'
import TaskProgressDemo from './components/TaskProgressDemo/index.tsx'
import ToastContainer from '../components/Toast/Toast.tsx'
import testConfig from './testConfig.ts'

const TestApp: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const leftContent = (
    <div className="left-panel">
      <h3>{testConfig.leftPanel.title}</h3>
      {testConfig.leftPanel.sections.map((section, index) => (
        <div key={index} className="panel-section">
          <h4>{section.title}</h4>
          <ul>
            {section.items.map((item) => (
              <li key={item.id}>{item.label}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )

  const rightContent = (
    <div className="right-panel">
      <h3>{testConfig.rightPanel.title}</h3>
      <div className="actions">
        {testConfig.rightPanel.actions.map((action) => (
          <button key={action.id} className="action-btn">
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )

  const centerContent = (
    <div className="center-content">
      <TextSelectionDemo />
      
      <div className="hiccup-renderer-container">
        <HiccupRenderer />
      </div>
      
      <div className="block-demo-container" style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Block 渲染演示</h3>
        
        <div className="block" style={{ marginBottom: '12px' }}>
          <div id="task-parent-block">My Project Tasks {{renderer :taskprogress}}</div>
          <div className="block-list" style={{ marginLeft: '20px' }}>
            <div className="block" style={{ padding: '8px', marginBottom: '4px', backgroundColor: '#fff', borderRadius: '4px' }}
              data-block-id="task-child-1"
              data-properties={JSON.stringify({ status: 'done', task_tracking: true })}>
              <span style={{ color: '#10b981' }}>✓</span> Design the UI
            </div>
            <div className="block" style={{ padding: '8px', marginBottom: '4px', backgroundColor: '#fff', borderRadius: '4px' }}
              data-block-id="task-child-2"
              data-properties={JSON.stringify({ status: 'doing', task_tracking: true })}>
              <span style={{ color: '#3b82f6' }}>○</span> Implement the logic
            </div>
            <div className="block" style={{ padding: '8px', marginBottom: '4px', backgroundColor: '#fff', borderRadius: '4px' }}
              data-block-id="task-child-3"
              data-properties={JSON.stringify({ status: 'todo', task_tracking: true })}>
              <span style={{ color: '#f59e0b' }}>●</span> Write documentation
            </div>
            <div className="block" style={{ padding: '8px', marginBottom: '4px', backgroundColor: '#fff', borderRadius: '4px' }}
              data-block-id="task-child-4"
              data-properties={JSON.stringify({ status: 'waiting', task_tracking: true })}>
              <span style={{ color: '#8b5cf6' }}>◐</span> Write tests
            </div>
          </div>
        </div>
      </div>
      
      <TaskProgressDemo />
    </div>
  )

  return (
    <div id="app-container" className={`app ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      <div id="toolbar" className="toolbar-banner">
        <div className="toolbar-banner-content">
          <span className="toolbar-banner-text">工具栏演示</span>
          <div className="toolbar-banner-actions">
            <button className="toolbar-banner-btn" title="粗体">
              <span className="toolbar-icon">B</span>
            </button>
            <button className="toolbar-banner-btn" title="斜体">
              <span className="toolbar-icon">I</span>
            </button>
            <button className="toolbar-banner-btn" title="下划线">
              <span className="toolbar-icon">U</span>
            </button>
          </div>
        </div>
      </div>
      
      <div id="head" className="top-toolbar">
        <div className="toolbar-content">
          <h1>Text Toolkit Plugin (Test Mode)</h1>
        </div>
      </div>
      
      <TestLayout 
        leftContent={leftContent}
        centerContent={centerContent}
        rightContent={rightContent}
      />
      
      <ToastContainer />
    </div>
  )
}

export default TestApp
