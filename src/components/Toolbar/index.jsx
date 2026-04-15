import React, { useState } from 'react'
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'
import './toolbar.css'

function Toolbar({ items }) {
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
            label: value.label || key
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
  
  // 处理 more 展开逻辑
  const mainItems = isMoreExpanded 
    ? visibleItems.concat(hiddenItems)
    : visibleItems.slice(0, 3)
  const moreItems = visibleItems.slice(3).concat(hiddenItems)

  const handleMoreClick = () => {
    setIsMoreExpanded(!isMoreExpanded)
  }

  return (
    <div className="toolbar-container">
      <ButtonGroup className="overflow-x-auto scrollbar-hide">
        {mainItems.map((item, index) => (
          item.isGroup ? (
            <div 
              key={item.id} 
              className="relative"
              onMouseEnter={() => {
                setHoveredItem(item)
                setMouseOverGroup(item.id)
              }}
              onMouseLeave={() => {
                setHoveredItem(null)
                setMouseOverGroup(null)
              }}
            >
              <Button variant="ghost" size="icon" className="relative">
                <div className="toolbar-item-icon">📂</div>
              </Button>
              {hoveredItem && hoveredItem.id === item.id && hoveredItem.label && (
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
                      {hoveredItem && hoveredItem.id === subItem.id && hoveredItem.label && (
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
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Button variant="ghost" size="icon" className="relative">
                <div className="toolbar-item-icon">
                  {item.icon ? (
                    <div dangerouslySetInnerHTML={{ __html: item.icon }} />
                  ) : (
                    '📝'
                  )}
                </div>
                {hoveredItem && hoveredItem.id === item.id && hoveredItem.label && (
                  <div className="toolbar-tooltip">
                    {hoveredItem.label}
                  </div>
                )}
              </Button>
            </div>
          )
        ))}
        {!isMoreExpanded && moreItems.length > 0 && (
          <div
            onMouseEnter={() => {
              setHoveredItem({ label: 'More', id: 'more' })
            }}
            onMouseLeave={() => {
              setHoveredItem(null)
            }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={handleMoreClick}
            >
              <div className="toolbar-item-icon">⋮</div>
              {hoveredItem && hoveredItem.id === 'more' && hoveredItem.label && (
                <div className="toolbar-tooltip">
                  {hoveredItem.label}
                </div>
              )}
            </Button>
          </div>
        )}
        {isMoreExpanded && (
          <div
            onMouseEnter={() => {
              setHoveredItem({ label: 'Less', id: 'less' })
            }}
            onMouseLeave={() => {
              setHoveredItem(null)
            }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={handleMoreClick}
            >
              <div className="toolbar-item-icon">−</div>
              {hoveredItem && hoveredItem.id === 'less' && hoveredItem.label && (
                <div className="toolbar-tooltip">
                  {hoveredItem.label}
                </div>
              )}
            </Button>
          </div>
        )}
      </ButtonGroup>
    </div>
  )
}

export default Toolbar
