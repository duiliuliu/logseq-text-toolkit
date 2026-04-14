import React, { useState } from 'react'
import './toolbar.css'

function Toolbar({ items }) {
  const [hoveredItem, setHoveredItem] = useState(null)
  const [expandedGroup, setExpandedGroup] = useState(null)

  const parseItems = (data) => {
    const result = []
    for (const [key, value] of Object.entries(data)) {
      if (key === 'disabled' || key === 'toolbar') continue
      
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
            label: key.replace('group-', '')
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
  const mainItems = toolbarItems.slice(0, 4)

  return (
    <div className="toolbar-container">
      <div className="toolbar-main">
        {mainItems.map((item, index) => (
          item.isGroup ? (
            <div 
              key={item.id} 
              className="toolbar-main-item toolbar-group"
              onMouseEnter={() => {
                setHoveredItem(item)
                setExpandedGroup(item.id)
              }}
              onMouseLeave={() => {
                setHoveredItem(null)
                setExpandedGroup(null)
              }}
            >
              <div className="toolbar-item-icon">📂</div>
              {expandedGroup === item.id && (
                <div className="toolbar-group-dropdown">
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
                      <div className="toolbar-item-label">{subItem.label}</div>
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
            </div>
          )
        ))}
        <div className="toolbar-more">
          <div className="toolbar-more-icon">⋮</div>
        </div>
      </div>
      {hoveredItem && !hoveredItem.isGroup && (
        <div className="toolbar-tooltip">
          {hoveredItem.label}
        </div>
      )}
      <div className="toolbar-expanded">
        {toolbarItems.map((item, index) => (
          item.isGroup ? (
            <div 
              key={item.id} 
              className="toolbar-expanded-item toolbar-group"
              onMouseEnter={() => {
                setHoveredItem(item)
                setExpandedGroup(item.id)
              }}
              onMouseLeave={() => {
                setHoveredItem(null)
                setExpandedGroup(null)
              }}
            >
              <div className="toolbar-item-icon">📂</div>
              {expandedGroup === item.id && (
                <div className="toolbar-group-dropdown">
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
                      <div className="toolbar-item-label">{subItem.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div 
              key={item.id} 
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
          )
        ))}
      </div>
    </div>
  )
}

export default Toolbar