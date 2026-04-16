import React from 'react'
import './testLayout.css'

function TestLayout({ leftContent, centerContent, rightContent }) {
  return (
    <div className="test-layout">
      <div className="test-layout__left">
        {leftContent}
      </div>
      <div className="test-layout__main">
        <div className="test-layout__content">
          {centerContent}
        </div>
      </div>
      <div className="test-layout__right">
        {rightContent}
      </div>
    </div>
  )
}

export default TestLayout
