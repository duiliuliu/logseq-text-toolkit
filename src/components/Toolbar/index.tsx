import React, { useState, useRef } from 'react'
import './toolbar.css'
import { Bold, Italic, Underline, Strikethrough, Highlighter, Type, X, Menu } from 'lucide-react'
import { SelectedData } from './textProcessor.ts'
import { ToolbarItem, ToolbarGroup } from './types.ts'
import { parseItems, handleItemClick, filterToolbarItems, IconName } from './ToolbarLogic.ts'

interface ToolbarProps {
  items: Array<ToolbarItem | ToolbarGroup>
  theme?: 'light' | 'dark'
  showBorder?: boolean
  width?: string
  height?: string
  selectedData?: SelectedData
  hoverDelay?: number
  onItemClick?: (item: any, selectedData: SelectedData) => void
  sponsorEnabled?: boolean
  language?: string
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

function Toolbar({ 
  items, 
  theme = 'light', 
  showBorder = true, 
  width = '110px', 
  height = '28px', 
  selectedData = { text: '' }, 
  hoverDelay = 500, 
  onItemClick, 
  sponsorEnabled = false, 
  language = 'zh-CN' 
}: ToolbarProps) {
  const [hoveredItem, setHoveredItem] = useState<ToolbarItem | ToolbarGroup | null>(null)
  const [mouseOverGroup, setMouseOverGroup] = useState<string | null>(null)
  const [moreExpanded, setMoreExpanded] = useState(false)
  const hoverTimerRef = useRef<number | null>(null)

  const renderIcon = (icon: any) => {
    if (!icon) return '📝'
    
    // 处理字符串类型的图标名称
    if (typeof icon === 'string' && iconMap[icon as IconName]) {
      const IconComponent = iconMap[icon as IconName]
      return <IconComponent size={18} className="ltt-toolbar-icon" />
    }
    
    // 处理 lucide-react 图标
    if (typeof icon === 'function') {
      const IconComponent = icon
      return <IconComponent size={18} className="ltt-toolbar-icon" />
    }
    
    // 处理 SVG 字符串
    if (typeof icon === 'string' && icon.includes('<svg')) {
      return <div className="ltt-toolbar-icon" dangerouslySetInnerHTML={{ __html: icon }} />
    }
    
    // 处理 tabler 图标类名
    if (typeof icon === 'string' && icon.startsWith('ti ti-')) {
      return <i className={`ltt-toolbar-icon ${icon}`}></i>
    }
    
    // 处理其他情况
    return <span className="ltt-toolbar-icon">{icon}</span>
  }

  const groupRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const handleItemClickInternal = (item: any) => {
    if (onItemClick) {
      onItemClick(item, selectedData)
    } else {
      handleItemClick(item, selectedData, undefined, language)
    }
  }
  
  const renderItem = (item: ToolbarItem | ToolbarGroup) => {
    // 判断是否为 group 元素：检查是否有 subItems 属性且长度大于 0
    if ('subItems' in item && item.subItems && item.subItems.length > 0) {
      return (
        <div 
          ref={groupRef}
          key={item.id} 
          className="ltt-toolbar-main-item ltt-toolbar-group"
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
          <div className="ltt-toolbar-item-icon">
            {renderIcon(item.icon)}
          </div>
          {hoveredItem && hoveredItem.id === item.id && item.label && (
            <div className="ltt-toolbar-tooltip">
              {hoveredItem.label}
            </div>
          )}
          {mouseOverGroup === item.id && (
            <div 
              ref={dropdownRef}
              className={`ltt-toolbar-group-dropdown ${!showBorder ? 'ltt-no-border' : ''}`}
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
              {item.subItems.map((subItem) => (
                <div 
                  key={subItem.id}
                  className="ltt-toolbar-group-item"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onMouseEnter={() => setHoveredItem(subItem)}
                  onMouseLeave={() => setHoveredItem(item)}
                  onClick={() => handleItemClickInternal(subItem)}
                >
                  <div className="ltt-toolbar-item-icon">
                    {renderIcon(subItem.icon)}
                  </div>
                  {hoveredItem && hoveredItem.id === subItem.id && subItem.label && (
                    <div className="ltt-toolbar-tooltip ltt-toolbar-tooltip-sub">
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
          className="ltt-toolbar-main-item"
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onMouseEnter={() => setHoveredItem(toolbarItem)}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => handleItemClickInternal(toolbarItem)}
        >
          <div className="ltt-toolbar-item-icon">
            {renderIcon(toolbarItem.icon)}
          </div>
          {hoveredItem && hoveredItem.id === toolbarItem.id && toolbarItem.label && (
            <div className="ltt-toolbar-tooltip">
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
    <div className={`ltt-toolbar-container ltt-toolbar-${theme} ${theme === 'dark' ? 'ltt-dark-mode' : 'ltt-light-mode'}`}>
      {sponsorEnabled && (
        <div className="ltt-toolbar-sponsor" style={{ width: width, height }}>
          <iframe 
            src="https://duiliuliu.github.io/sponsor-page/?no-text=1" 
            title="Sponsor Page"
            className="ltt-toolbar-sponsor-iframe"
            frameBorder="0"
            scrolling="no"
            style={{ minWidth: '100%', minHeight: '100%' }}
          />
        </div>
      )}
      <div className="ltt-toolbar-main" style={{ minWidth: '60px', width: moreExpanded ? 'auto' : width, height: height, border: showBorder ? '1px solid var(--ls-border-color-plugin, #ccc)' : 'none' }}>
        {mainItems.map(renderItem)}
        {moreExpanded && moreItems.map(renderItem)}
        {hasMoreItems && (
          <div 
            className="ltt-toolbar-main-item ltt-toolbar-more"
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onClick={toggleMore}
            onMouseEnter={() => setHoveredItem({ label: moreExpanded ? 'Collapse' : 'More', id: 'more', funcmode: 'console', clickfunc: 'more' })}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="ltt-toolbar-item-icon">
              {moreExpanded ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.4" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="1.5"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.4" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="7" r="1.1" fill="currentColor"></circle>
                  <circle cx="12" cy="12" r="1.1" fill="currentColor"></circle>
                  <circle cx="12" cy="17" r="1.1" fill="currentColor"></circle>
                </svg>
              )}
            </div>
            {hoveredItem && hoveredItem.id === 'more' && hoveredItem.label && (
              <div className="ltt-toolbar-tooltip">
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
