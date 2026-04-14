import React, { useState } from 'react'
import './toolbar.css'

function Toolbar({ items }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="toolbar-container">
      <div 
        className="toolbar-main"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="toolbar-icon">⚙️</div>
      </div>
      {isOpen && (
        <div className="toolbar-dropdown">
          {items.map((item, index) => (
            <div key={index} className="toolbar-item">
              <div className="toolbar-item-icon">
                {item.icon ? (
                  <div dangerouslySetInnerHTML={{ __html: item.icon }} />
                ) : (
                  '📝'
                )}
              </div>
              <div className="toolbar-item-label">{item.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Toolbar