import React, { useState } from 'react'
import './toolbar.css'

function Toolbar({ items, theme = 'light' }) {
  const [hoveredItem, setHoveredItem] = useState(null)
  const [mouseOverGroup, setMouseOverGroup] = useState(null)
  const [isMoreExpanded, setIsMoreExpanded] = useState(false)

  const parseItems = (data) => {
    const result = []
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'object' && !value.label) {
        const groupItems = []
        for (const [groupKey, groupValue] of Object.entries(value)) {
          if (groupValue && groupValue.label) {
            groupItems.push({
              id: groupKey,
              ...groupValue
            })
          }
        }
        if (groupItems.length > 0) {
          result.push({
            id: key,
            isGroup: true,
            items: groupItems,
            label: key
          })
        }
      } else if (value && value.label) {
        result.push({
          id: key,
          isGroup: false,
          ...value
        })
      }
    }
    return result
  }

  const toolbarItems = parseItems(items)
  const visibleItems = toolbarItems.filter(item => !item.hidden)
  const hiddenItems = toolbarItems.filter(item => item.hidden)
  const mainItems = visibleItems.slice(0, 3)
  const moreItems = visibleItems.slice(3).concat(hiddenItems)
  
  const allItems = isMoreExpanded ? visibleItems.concat(hiddenItems) : mainItems

  return (
    <div className={`toolbar-container toolbar-${theme}`}>
      <div className="toolbar-main toolbar-scrollable">
        {allItems.map((item, index) => (
          item.isGroup ? (
            <div 
              key={item.id} 
              className="toolbar-main-item toolbar-group"
              onMouseEnter={() => {
                setHoveredItem(item)
                setMouseOverGroup(item.id)
              }}
              onMouseLeave={() => {
                setHoveredItem(null)
                setMouseOverGroup(null)
              }}
            >
              <div className="toolbar-item-icon">📂</div>
              {hoveredItem && hoveredItem.id === item.id && (
                <div className="toolbar-tooltip">
                  {hoveredItem.label}
                </div>
              )}
              {mouseOverGroup === item.id && (
                <div 
                  className="toolbar-group-dropdown"
                  onMouseEnter={() => setMouseOverGroup(item.id)}
                  onMouseLeave={() => setMouseOverGroup(null)}
                >
                  {item.items.map((subItem, subIndex) => (
                    <div 
                      key={subItem.id}
                      className="toolbar-group-item"
                      onMouseEnter={() => setHoveredItem(subItem)}
                      onMouseLeave={() => setHoveredItem(item)}
                    >
                      <div className="toolbar-item-icon">
                        {subItem.icon ? (
                          <div dangerouslySetInnerHTML={{ __html: subItem.icon }} />
                        ) : (
                          '📝'
                        )}
                      </div>
                      {hoveredItem && hoveredItem.id === subItem.id && (
                        <div className="toolbar-tooltip toolbar-tooltip-sub">
                          {hoveredItem.label}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div 
              key={item.id} 
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
              {hoveredItem && hoveredItem.id === item.id && (
                <div className="toolbar-tooltip">
                  {hoveredItem.label}
                </div>
              )}
            </div>
          )
        ))}
        <div 
          className="toolbar-main-item toolbar-group"
          onClick={() => setIsMoreExpanded(!isMoreExpanded)}
          onMouseEnter={() => {
            setHoveredItem({ label: isMoreExpanded ? 'Collapse' : 'More', id: 'more' })
          }}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <div className="toolbar-item-icon">{isMoreExpanded ? '−' : '⋮'}</div>
          {hoveredItem && hoveredItem.id === 'more' && (
            <div className="toolbar-tooltip">
              {hoveredItem.label}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Toolbar
