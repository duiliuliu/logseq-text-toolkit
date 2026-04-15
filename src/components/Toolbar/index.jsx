import React, { useState, useRef, useCallback } from 'react'
import './toolbar.css'
import { processText } from '../../utils/textProcessor.js'
import ToolbarItem from '../ToolbarItem/index.jsx'

function Toolbar({ 
  items, 
  theme = 'light', 
  showBorder = true, 
  width = '110px', 
  height = '24px', 
  selectedData = {}, 
  hoverDelay = 500, 
  onTextProcessed 
}) {
  const [hoveredItem, setHoveredItem] = useState(null)
  const [mouseOverGroup, setMouseOverGroup] = useState(null)
  const [moreExpanded, setMoreExpanded] = useState(false)
  const hoverTimerRef = useRef(null)

  const parseItems = useCallback((data) => {
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
  }, [])

  const handleItemClick = useCallback((item) => {
    if (item.clickfunc) {
      console.log(`Clicked: ${item.clickfunc} (mode: ${item.funcmode})`)
      if (selectedData && selectedData.text) {
        console.log(`Selected data:`, selectedData)
        const processedText = processText(item, selectedData.text)
        console.log(`Processed text:`, processedText)
        if (onTextProcessed) {
          onTextProcessed(processedText, item)
        }
      }
    }
  }, [selectedData, onTextProcessed])

  const handleGroupHover = useCallback((item) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
    }
    setHoveredItem(item)
    setMouseOverGroup(item.id)
  }, [])

  const handleGroupLeave = useCallback(() => {
    setHoveredItem(null)
    hoverTimerRef.current = setTimeout(() => {
      setMouseOverGroup(null)
    }, hoverDelay)
  }, [hoverDelay])

  const handleHover = useCallback((item) => {
    setHoveredItem(item)
  }, [])

  const toggleMore = useCallback((e) => {
    e.stopPropagation()
    setMoreExpanded(!moreExpanded)
  }, [moreExpanded])

  const toolbarItems = parseItems(items)
  const visibleItems = toolbarItems.filter(item => !item.hidden)
  const hiddenItems = toolbarItems.filter(item => item.hidden)
  const mainItems = visibleItems.slice(0, 3)
  const moreItems = visibleItems.slice(3).concat(hiddenItems)

  const renderItem = (item) => (
    <ToolbarItem
      key={item.id}
      item={item}
      isGroup={item.isGroup}
      hoveredItem={hoveredItem}
      mouseOverGroup={mouseOverGroup}
      hoverDelay={hoverDelay}
      showBorder={showBorder}
      selectedData={selectedData}
      onTextProcessed={onTextProcessed}
      onHover={handleHover}
      onGroupHover={handleGroupHover}
      onGroupLeave={handleGroupLeave}
      onItemClick={handleItemClick}
      onSubItemClick={handleItemClick}
    />
  )

  return (
    <div className={`toolbar-container toolbar-${theme} ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      <div className="toolbar-main" style={{ width: moreExpanded ? 'auto' : width, height }}>
        {mainItems.map(renderItem)}
        {moreExpanded && moreItems.map(renderItem)}
        <div 
          className="toolbar-main-item toolbar-more"
          onClick={toggleMore}
          onMouseEnter={() => setHoveredItem({ label: moreExpanded ? 'Collapse' : 'More', id: 'more' })}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <div className="toolbar-item-icon">{moreExpanded ? '−' : '⋮'}</div>
          {hoveredItem?.id === 'more' && hoveredItem.label && (
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
