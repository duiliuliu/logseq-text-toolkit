import React, { useState } from 'react'
import './testLayout.css'

function TestLayout({ leftContent, centerContent, rightContent }) {
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)

  return (
    <div className="test-layout">
      <div className={`test-layout__left ${leftCollapsed ? 'collapsed' : ''}`}>
        <div className="panel-header">
          <button 
            className="collapse-btn" 
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            aria-label={leftCollapsed ? '展开左侧面板' : '折叠左侧面板'}
          >
            {leftCollapsed ? '▶' : '◀'}
          </button>
        </div>
        {!leftCollapsed && leftContent}
      </div>
      <div className="test-layout__main">
        <div className="test-layout__content">
          {centerContent}
        </div>
      </div>
      <div className={`test-layout__right ${rightCollapsed ? 'collapsed' : ''}`}>
        <div className="panel-header">
          <button 
            className="collapse-btn" 
            onClick={() => setRightCollapsed(!rightCollapsed)}
            aria-label={rightCollapsed ? '展开右侧面板' : '折叠右侧面板'}
          >
            {rightCollapsed ? '◀' : '▶'}
          </button>
        </div>
        {!rightCollapsed && rightContent}
      </div>
    </div>
  )
}

export default TestLayout
