import React, { useState, useRef } from 'react'
import './toolbar.css'
import { Bold, Italic, Underline, Strikethrough, Highlighter, Type, X, Menu } from 'lucide-react'
import { processSelectedData } from '../../utils/textProcessor.js'

type IconName = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'highlighter' | 'type' | 'x' | 'menu'

interface ToolbarItem {
  id: string
  label: string
  binding?: string
  icon?: IconName | React.ReactNode
  funcmode: string
  clickfunc: string
  regex?: string
  replacement?: string
  hidden?: boolean
}

interface ToolbarGroup {
  id: string
  isGroup: true
  items: ToolbarItem[]
  label: string
  hidden?: boolean
}

interface SelectedData {
  text: string
  timestamp?: string
  range?: Range
  rect?: DOMRect
}

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

function Toolbar({ items, theme = 'light', showBorder = true, width = '110px', height = '24px', selectedData = { text: '' }, hoverDelay = 500, onTextProcessed, sponsorEnabled = true }: ToolbarProps) {
  const [hoveredItem, setHoveredItem] = useState<ToolbarItem | ToolbarGroup | null>(null)
  const [mouseOverGroup, setMouseOverGroup] = useState<string | null>(null)
  const [moreExpanded, setMoreExpanded] = useState(false)
  const hoverTimerRef = useRef<number | null>(null)

  const parseItems = (data: Record<string, any>): (ToolbarItem | ToolbarGroup)[] => {
    const result: (ToolbarItem | ToolbarGroup)[] = []
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'object' && !value.label) {
        const groupItems: ToolbarItem[] = []
        for (const [groupKey, groupValue] of Object.entries(value)) {
          if (groupValue && typeof groupValue === 'object' && 'label' in groupValue) {
            const typedGroupValue = groupValue as any;
            groupItems.push({
              id: groupKey,
              label: typedGroupValue.label,
              funcmode: typedGroupValue.funcmode || 'replace',
              clickfunc: typedGroupValue.clickfunc || '',
              binding: typedGroupValue.binding,
              icon: typedGroupValue.icon,
              regex: typedGroupValue.regex,
              replacement: typedGroupValue.replacement,
              hidden: typedGroupValue.hidden
            })
          }
        }
        if (groupItems.length > 0) {
          result.push({
            id: key,
            isGroup: true as const,
            items: groupItems,
            label: key,
            hidden: value.hidden
          })
        }
      } else if (value && typeof value === 'object' && 'label' in value) {
        const typedValue = value as any;
        result.push({
          id: key,
          label: typedValue.label,
          funcmode: typedValue.funcmode || 'replace',
          clickfunc: typedValue.clickfunc || '',
          binding: typedValue.binding,
          icon: typedValue.icon,
          regex: typedValue.regex,
          replacement: typedValue.replacement,
          hidden: typedValue.hidden
        })
      }
    }
    return result
  }

  const renderIcon = (icon: any) => {
    if (!icon) return '📝'
    
    // 处理字符串类型的图标名称
    if (typeof icon === 'string' && iconMap[icon as IconName]) {
      const IconComponent = iconMap[icon as IconName]
      return <IconComponent size={18} className="toolbar-icon" />
    }
    
    // 处理 lucide-react 图标
    if (typeof icon === 'function') {
      const IconComponent = icon
      return <IconComponent size={18} className="toolbar-icon" />
    }
    
    // 处理 SVG 字符串
    if (typeof icon === 'string' && icon.includes('<svg')) {
      return <div className="toolbar-icon" dangerouslySetInnerHTML={{ __html: icon }} />
    }
    
    // 处理其他情况
    return <span className="toolbar-icon">{icon}</span>
  }

  const handleItemClick = (item: ToolbarItem) => {
    if (item.clickfunc) {
      if (selectedData && selectedData.text) {
        const processedText = processSelectedData(item, selectedData)
        if (onTextProcessed) {
          onTextProcessed(processedText)
        }
      }
    }
  }

  const renderItem = (item: ToolbarItem | ToolbarGroup) => {
    if ('isGroup' in item && item.isGroup) {
      return (
        <div 
          key={item.id} 
          className="toolbar-main-item toolbar-group"
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
          <div className="toolbar-item-icon">📂</div>
          {hoveredItem && hoveredItem.id === item.id && item.label && (
            <div className="toolbar-tooltip">
              {hoveredItem.label}
            </div>
          )}
          {mouseOverGroup === item.id && (
            <div 
              className={`toolbar-group-dropdown ${!showBorder ? 'no-border' : ''}`}
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
      const toolbarItem = item as ToolbarItem;
      return (
        <div 
          key={toolbarItem.id} 
          className="toolbar-main-item"
          onMouseEnter={() => setHoveredItem(toolbarItem)}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => handleItemClick(toolbarItem)}
        >
          <div className="toolbar-item-icon">
            {renderIcon(toolbarItem.icon)}
          </div>
          {hoveredItem && hoveredItem.id === toolbarItem.id && toolbarItem.label && (
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

  const toggleMore = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setMoreExpanded(!moreExpanded)
  }

  return (
    <div className={`toolbar-container toolbar-${theme} ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      {sponsorEnabled && (
        <div className="toolbar-sponsor" style={{ width: moreExpanded ? 'auto' : width, height }}>
          <iframe 
            src="https://duiliuliu.github.io/sponsor-page/?no-text=1" 
            title="Sponsor Page"
            className="toolbar-sponsor-iframe"
            frameBorder="0"
            scrolling="no"
            style={{ minWidth: '100%', minHeight: '100%' }}
          />
        </div>
      )}
      <div className="toolbar-main" style={{ width: moreExpanded ? 'auto' : width, height }}>
        {mainItems.map(renderItem)}
        {moreExpanded && moreItems.map(renderItem)}
        <div 
          className="toolbar-main-item toolbar-more"
          onClick={toggleMore}
          onMouseEnter={() => setHoveredItem({ label: moreExpanded ? 'Collapse' : 'More', id: 'more', funcmode: 'console', clickfunc: 'more' })}
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