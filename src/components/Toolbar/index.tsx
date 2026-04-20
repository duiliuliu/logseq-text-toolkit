import React, { useState, useRef } from 'react'
import './toolbar.css'
import { Bold, Italic, Underline, Strikethrough, Highlighter, Type, X, Menu } from 'lucide-react'
import { SelectedData } from '../../utils/textProcessor.ts'
import { ToolbarItem, ToolbarGroup } from './types.ts'
import { parseItems, handleItemClick, filterToolbarItems, IconName } from './ToolbarLogic.ts'

interface ToolbarProps {
  items: Record<string, any>
  theme?: 'light' | 'dark'
  showBorder?: boolean
  width?: string
  height?: string
  selectedData?: SelectedData
  hoverDelay?: number
  onTextProcessed?: (processedText: string) => void
  sponsorEnabled?: boolean
}

const iconMap: Record<IconName, React.ElementType> = {
  bold: Bold,
  italic: Italic,
  underline: Underline,
  strikethrough: Strikethrough,
  highlighter: Highlighter,
  type: Type,
  x: X,
  menu: Menu
}

function Toolbar({ items, theme = 'light', showBorder = true, width = '110px', height = '24px', selectedData = { text: '' }, hoverDelay = 500, onTextProcessed, sponsorEnabled = false }: ToolbarProps) {
  const [hoveredItem, setHoveredItem] = useState<ToolbarItem | ToolbarGroup | null>(null)
  const [mouseOverGroup, setMouseOverGroup] = useState<string | null>(null)
  const [moreExpanded, setMoreExpanded] = useState(false)
  const hoverTimerRef = useRef<number | null>(null)

  const renderIcon = (icon: any) => {
    if (!icon) return '📝'
    
    // 处理字符串类型的图标名称
    if (typeof icon === 'string' && iconMap[icon as IconName]) {
      const IconComponent = iconMap[icon as IconName]
      return <IconComponent size={18} className="text-toolkit-icon" />
    }
    
    // 处理 lucide-react 图标
    if (typeof icon === 'function') {
      const IconComponent = icon
      return <IconComponent size={18} className="text-toolkit-icon" />
    }
    
    // 处理 SVG 字符串
    if (typeof icon === 'string' && icon.includes('<svg')) {
      return <div className="text-toolkit-icon" dangerouslySetInnerHTML={{ __html: icon }} />
    }
    
    // 处理其他情况
    return <span className="text-toolkit-icon">{icon}</span>
  }

  const renderItem = (item: ToolbarItem | ToolbarGroup) => {
    if ('isGroup' in item && item.isGroup) {
      return (
        <div 
          key={item.id} 
          className="text-toolkit-main-item text-toolkit-group"
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onMouseEnter={() => {
            // 清除之前的定时器
            if (hoverTimerRef.current) {
              clearTimeout(hoverTimerRef.current)
            }
            setHoveredItem(item)
            setMouseOverGroup(item.id)
          }}
          onMouseLeave={() => {
            setHoveredItem(null)
            // 设置延时隐藏下拉子元素
            hoverTimerRef.current = setTimeout(() => {
              setMouseOverGroup(null)
            }, hoverDelay)
          }}
        >
          <div className="text-toolkit-item-icon">📂</div>
          {hoveredItem && hoveredItem.id === item.id && item.label && (
            <div className="text-toolkit-tooltip">
              {hoveredItem.label}
            </div>
          )}
          {mouseOverGroup === item.id && (
            <div 
              className={`text-toolkit-group-dropdown ${!showBorder ? 'no-border' : ''}`}
              onMouseEnter={() => {
                // 清除之前的定时器
                if (hoverTimerRef.current) {
                  clearTimeout(hoverTimerRef.current)
                }
                setMouseOverGroup(item.id)
              }}
              onMouseLeave={() => {
                // 设置延时隐藏下拉子元素
                hoverTimerRef.current = setTimeout(() => {
                  setMouseOverGroup(null)
                }, hoverDelay)
              }}
            >
              {Object.values(item.items).map((subItem) => (
                <div 
                  key={subItem.id}
                  className="text-toolkit-group-item"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onMouseEnter={() => setHoveredItem(subItem)}
                  onMouseLeave={() => setHoveredItem(item)}
                  onClick={() => handleItemClick(subItem, selectedData, onTextProcessed)}
                >
                  <div className="text-toolkit-item-icon">
                    {renderIcon(subItem.icon)}
                  </div>
                  {hoveredItem && hoveredItem.id === subItem.id && subItem.label && (
                    <div className="text-toolkit-tooltip text-toolkit-tooltip-sub">
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
      const toolbarItem = item as ToolbarItem;
      return (
        <div 
          key={toolbarItem.id} 
          className="text-toolkit-main-item"
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onMouseEnter={() => setHoveredItem(toolbarItem)}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => handleItemClick(toolbarItem, selectedData, onTextProcessed)}
        >
          <div className="text-toolkit-item-icon">
            {renderIcon(toolbarItem.icon)}
          </div>
          {hoveredItem && hoveredItem.id === toolbarItem.id && toolbarItem.label && (
            <div className="text-toolkit-tooltip">
              {hoveredItem.label}
            </div>
          )}
        </div>
      )
    }
  }

  const toolbarItems = parseItems(items)
  const { mainItems, moreItems, hasMoreItems } = filterToolbarItems(toolbarItems)

  const toggleMore = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setMoreExpanded(!moreExpanded)
  }

  return (
    <div className={`text-toolkit-container text-toolkit-${theme} ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      {sponsorEnabled && (
        <div className="text-toolkit-sponsor" style={{ width: width, height }}>
          <iframe 
            src="https://duiliuliu.github.io/sponsor-page/?no-text=1" 
            title="Sponsor Page"
            className="text-toolkit-sponsor-iframe"
            frameBorder="0"
            scrolling="no"
            style={{ minWidth: '100%', minHeight: '100%' }}
          />
        </div>
      )}
      <div className="text-toolkit-main" style={{ width: width, height }}>
        {mainItems.map(renderItem)}
        {moreExpanded && moreItems.map(renderItem)}
        {hasMoreItems && (
          <div 
            className="text-toolkit-main-item text-toolkit-more"
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onClick={toggleMore}
            onMouseEnter={() => setHoveredItem({ label: moreExpanded ? 'Collapse' : 'More', id: 'more', funcmode: 'console', clickfunc: 'more' })}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="text-toolkit-item-icon">{moreExpanded ? '−' : '⋮'}</div>
            {hoveredItem && hoveredItem.id === 'more' && hoveredItem.label && (
              <div className="text-toolkit-tooltip">
                {hoveredItem.label}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Toolbar