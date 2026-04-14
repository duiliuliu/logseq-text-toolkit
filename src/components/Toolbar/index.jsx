import React, { useState } from 'react'
import './toolbar.css'

function Toolbar({ items }) {
  const [hoveredItem, setHoveredItem] = useState(null)
  const [expandedGroup, setExpandedGroup] = useState(null)
  const [mouseOverGroup, setMouseOverGroup] = useState(null)

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
  // 分离显示和隐藏的项目
  const visibleItems = toolbarItems.filter(item => !item.hidden)
  const hiddenItems = toolbarItems.filter(item => item.hidden)
  // 主工具栏只显示前3个项目，剩下的放在more菜单中
  const mainItems = visibleItems.slice(0, 3)
  const moreItems = visibleItems.slice(3).concat(hiddenItems)

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
                        setMouseOverGroup(item.id)
                      }}
                      onMouseLeave={() => {
                        setHoveredItem(null)
                        setMouseOverGroup(null)
                      }}
                    >
                      <div className="toolbar-item-icon">📂</div>
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
        <div 
          className="toolbar-main-item toolbar-group"
          onMouseEnter={() => {
            setHoveredItem({ label: 'More' })
            setMouseOverGroup('more')
          }}
          onMouseLeave={() => {
            setHoveredItem(null)
            setMouseOverGroup(null)
          }}
        >
          <div className="toolbar-item-icon">⋮</div>
          {mouseOverGroup === 'more' && (
            <div 
              className="toolbar-group-dropdown"
              onMouseEnter={() => setMouseOverGroup('more')}
              onMouseLeave={() => setMouseOverGroup(null)}
            >
              {moreItems.map((item, index) => (
                item.isGroup ? (
                  <div 
                    key={item.id}
                    className="toolbar-group-item"
                    onMouseEnter={() => {
                      setHoveredItem(item)
                      setMouseOverGroup(`more-${item.id}`)
                    }}
                    onMouseLeave={() => {
                      setHoveredItem({ label: 'More' })
                      setMouseOverGroup('more')
                    }}
                  >
                    <div className="toolbar-item-icon">📂</div>
                    <div className="toolbar-item-label">{item.label}</div>
                    {mouseOverGroup === `more-${item.id}` && (
                      <div 
                        className="toolbar-group-dropdown-horizontal"
                        onMouseEnter={() => setMouseOverGroup(`more-${item.id}`)}
                        onMouseLeave={() => setMouseOverGroup('more')}
                      >
                        {item.items.map((subItem, subIndex) => (
                          <div 
                            key={subItem.id}
                            className="toolbar-group-item-horizontal"
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
                    className="toolbar-group-item"
                    onMouseEnter={() => setHoveredItem(item)}
                    onMouseLeave={() => setHoveredItem({ label: 'More' })}
                  >
                    <div className="toolbar-item-icon">
                      {item.icon ? (
                        <div dangerouslySetInnerHTML={{ __html: item.icon }} />
                      ) : (
                        '📝'
                      )}
                    </div>
                    <div className="toolbar-item-label">{item.label}</div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
      {hoveredItem && !hoveredItem.isGroup && (
        <div className="toolbar-tooltip">
          {hoveredItem.label}
        </div>
      )}
    </div>
  )
}

export default Toolbar