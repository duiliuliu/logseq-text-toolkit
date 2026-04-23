import { useState } from 'react'
import './testLayout.css'

interface TestLayoutProps {
  leftContent: React.ReactNode;
  centerContent: React.ReactNode;
  rightContent: React.ReactNode;
}

function TestLayout({ leftContent, centerContent, rightContent }: TestLayoutProps) {
  const [leftCollapsed, setLeftCollapsed] = useState(true)
  const [rightCollapsed, setRightCollapsed] = useState(true)

  return (
    <div id="main-container" className="test-layout">
      <div id="left-sidebar" className={`test-layout__left ${leftCollapsed ? 'collapsed' : ''}`}>
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
        <div id="main-content-container" className="test-layout__content">
          {centerContent}
        </div>
      </div>
      <div id="right-sidebar" className={`test-layout__right ${rightCollapsed ? 'collapsed' : ''}`}>
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
