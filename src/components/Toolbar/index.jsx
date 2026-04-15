import React, { useState } from 'react'
import './toolbar.css'
import { Bold, Italic, Underline, Strikethrough, Highlighter, Type, X, Menu } from 'lucide-react'

const iconMap = {
  bold: Bold,
  italic: Italic,
  underline: Underline,
  strikethrough: Strikethrough,
  highlighter: Highlighter,
  type: Type,
  x: X,
  menu: Menu
}

function Toolbar({ items, theme = 'light', showBorder = true, width = 'auto', selectedText = '' }) {
  const [hoveredItem, setHoveredItem] = useState(null)
  const [mouseOverGroup, setMouseOverGroup] = useState(null)
  const [moreExpanded, setMoreExpanded] = useState(false)

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

  const renderIcon = (icon) => {
    if (!icon) return '📝'
    
    // 处理字符串类型的图标名称
    if (typeof icon === 'string' && iconMap[icon]) {
      const IconComponent = iconMap[icon]
      return <IconComponent size={18} />
    }
    
    // 处理 lucide-react 图标
    if (typeof icon === 'function') {
      const IconComponent = icon
      return <IconComponent size={18} />
    }
    
    // 处理 SVG 字符串
    if (typeof icon === 'string' && icon.includes('<svg')) {
      return <div dangerouslySetInnerHTML={{ __html: icon }} />
    }
    
    // 处理其他情况
    return icon
  }

  const handleItemClick = (item) => {
    if (item.clickfunc) {
      console.log(`Clicked: ${item.clickfunc} (mode: ${item.funcmode})`)
      if (selectedText) {
        console.log(`Selected text: ${selectedText}`)
      }
    }
  }

  const renderItem = (item) => {
    if (item.isGroup) {
      return (
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
          {hoveredItem && hoveredItem.id === item.id && item.label && (
            <div className="toolbar-tooltip">
              {hoveredItem.label}
            </div>
          )}
          {mouseOverGroup === item.id && (
            <div 
              className={`toolbar-group-dropdown ${!showBorder ? 'no-border' : ''}`}
              onMouseEnter={() => setMouseOverGroup(item.id)}
              onMouseLeave={() => setMouseOverGroup(null)}
            >
              {item.items.map((subItem) => (
                <div 
                  key={subItem.id}
                  className="toolbar-group-item"
                  onMouseEnter={() => setHoveredItem(subItem)}
                  onMouseLeave={() => setHoveredItem(item)}
                  onClick={() => handleItemClick(subItem)}
                >
                  <div className="toolbar-item-icon">
                    {renderIcon(subItem.icon)}
                  </div>
                  {hoveredItem && hoveredItem.id === subItem.id && subItem.label && (
                    <div className="toolbar-tooltip toolbar-tooltip-sub">
                      {hoveredItem.label}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    } else {
      return (
        <div 
          key={item.id} 
          className="toolbar-main-item"
          onMouseEnter={() => setHoveredItem(item)}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => handleItemClick(item)}
        >
          <div className="toolbar-item-icon">
            {renderIcon(item.icon)}
          </div>
          {hoveredItem && hoveredItem.id === item.id && item.label && (
            <div className="toolbar-tooltip">
              {hoveredItem.label}
            </div>
          )}
        </div>
      )
    }
  }

  const toolbarItems = parseItems(items)
  const visibleItems = toolbarItems.filter(item => !item.hidden)
  const hiddenItems = toolbarItems.filter(item => item.hidden)
  const mainItems = visibleItems.slice(0, 3)
  const moreItems = visibleItems.slice(3).concat(hiddenItems)

  const toggleMore = () => {
    setMoreExpanded(!moreExpanded)
  }

  return (
    <div className={`toolbar-container toolbar-${theme} ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      <div className="toolbar-main" style={{ width }}>
        {mainItems.map(renderItem)}
        {moreExpanded && moreItems.map(renderItem)}
        <div 
          className="toolbar-main-item toolbar-more"
          onClick={toggleMore}
          onMouseEnter={() => setHoveredItem({ label: moreExpanded ? 'Collapse' : 'More', id: 'more' })}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <div className="toolbar-item-icon">{moreExpanded ? '−' : '⋮'}</div>
          {hoveredItem && hoveredItem.id === 'more' && hoveredItem.label && (
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
