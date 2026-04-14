import React, { useState } from 'react'
import './toolbar.css'

function Toolbar({ items }) {
  const [hoveredItem, setHoveredItem] = useState(null)

  return (
    <div className="toolbar-container">
      <div className="toolbar-main">
        {items.slice(0, 4).map((item, index) => (
          <div 
            key={index} 
            className="toolbar-main-item"
            onMouseEnter={() => setHoveredItem(item)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="toolbar-item-icon">
              {item.icon ? (
                <div dangerouslySetInnerHTML={{ __html: item.icon }} />
              ) : (
                '📝'
              )}
            </div>
          </div>
        ))}
        <div className="toolbar-more">
          <div className="toolbar-more-icon">⋮</div>
        </div>
      </div>
      {hoveredItem && (
        <div className="toolbar-tooltip">
          {hoveredItem.label}
        </div>
      )}
      <div className="toolbar-expanded">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="toolbar-expanded-item"
            onMouseEnter={() => setHoveredItem(item)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="toolbar-item-icon">
              {item.icon ? (
                <div dangerouslySetInnerHTML={{ __html: item.icon }} />
              ) : (
                '📝'
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Toolbar