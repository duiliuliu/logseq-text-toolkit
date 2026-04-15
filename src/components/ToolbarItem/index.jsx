import React from 'react'
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

export const renderIcon = (icon) => {
  if (!icon) return '📝'
  
  if (typeof icon === 'string' && iconMap[icon]) {
    const IconComponent = iconMap[icon]
    return <IconComponent size={18} />
  }
  
  if (typeof icon === 'function') {
    const IconComponent = icon
    return <IconComponent size={18} />
  }
  
  if (typeof icon === 'string' && icon.includes('<svg')) {
    return <div dangerouslySetInnerHTML={{ __html: icon }} />
  }
  
  return icon
}

const ToolbarItem = ({ 
  item, 
  isGroup, 
  isExpanded, 
  hoveredItem, 
  mouseOverGroup, 
  hoverDelay, 
  showBorder, 
  selectedData, 
  onTextProcessed,
  onHover,
  onGroupHover,
  onGroupLeave,
  onItemClick,
  onSubItemClick
}) => {
  if (isGroup) {
    return (
      <div 
        className="toolbar-main-item toolbar-group"
        onMouseEnter={() => onGroupHover(item)}
        onMouseLeave={onGroupLeave}
      >
        <div className="toolbar-item-icon">📂</div>
        {hoveredItem?.id === item.id && item.label && (
          <div className="toolbar-tooltip">
            {hoveredItem.label}
          </div>
        )}
        {mouseOverGroup === item.id && (
          <div 
            className={`toolbar-group-dropdown ${!showBorder ? 'no-border' : ''}`}
            onMouseEnter={() => onGroupHover(item)}
            onMouseLeave={onGroupLeave}
          >
            {item.items.map((subItem) => (
              <div 
                key={subItem.id}
                className="toolbar-group-item"
                onMouseEnter={() => onHover(subItem)}
                onMouseLeave={() => onHover(item)}
                onClick={() => onSubItemClick(subItem)}
              >
                <div className="toolbar-item-icon">
                  {renderIcon(subItem.icon)}
                </div>
                {hoveredItem?.id === subItem.id && subItem.label && (
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
        className="toolbar-main-item"
        onMouseEnter={() => onHover(item)}
        onMouseLeave={() => onHover(null)}
        onClick={() => onItemClick(item)}
      >
        <div className="toolbar-item-icon">
          {renderIcon(item.icon)}
        </div>
        {hoveredItem?.id === item.id && item.label && (
          <div className="toolbar-tooltip">
            {hoveredItem.label}
          </div>
        )}
      </div>
    )
  }
}

export default ToolbarItem
