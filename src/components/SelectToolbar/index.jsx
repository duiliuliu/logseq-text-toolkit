import React, { useState, useEffect, useRef } from 'react'
import Toolbar from '../Toolbar'

function SelectToolbar({ targetElement, items, theme = 'light', showBorder = true, width = '110px', height = '24px', hoverDelay = 1000 }) {
  const [selectedData, setSelectedData] = useState({})
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 })
  const [showToolbar, setShowToolbar] = useState(false)
  const containerRef = useRef(null)

  // 处理文本选择
  useEffect(() => {
    const handleSelection = (e) => {
      // 点击toolbar内部时，不隐藏toolbar
      if (e.target.closest('.floating-toolbar') || e.target.closest('.toolbar-container')) {
        return
      }

      const selection = window.getSelection()
      if (selection && selection.toString().length > 0) {
        // 检查选择是否在目标元素内
        const anchorNode = selection.anchorNode
        const focusNode = selection.focusNode
        const isInTarget = (targetElement && (targetElement.contains(anchorNode) || targetElement.contains(focusNode)))
        
        if (isInTarget || !targetElement) {
          const range = selection.getRangeAt(0)
          const rect = range.getBoundingClientRect()
          setSelectedData({
            text: selection.toString(),
            timestamp: new Date().toISOString(),
            range: range,
            rect: rect
          })
          // 计算toolbar应该显示在上方还是下方
          const toolbarHeight = 30; // 估算toolbar高度
          const windowHeight = window.innerHeight;
          
          // 如果上方空间足够，显示在上方；否则显示在下方
          let toolbarY;
          if (rect.top > toolbarHeight + 10) {
            // 上方空间足够，显示在上方
            toolbarY = rect.top - toolbarHeight - 10;
          } else {
            // 上方空间不足，显示在下方
            toolbarY = rect.bottom + 10;
          }
          
          setToolbarPosition({
            x: rect.left + rect.width / 2,
            y: toolbarY
          })
          setShowToolbar(true)
        } else {
          setShowToolbar(false)
        }
      } else {
        setShowToolbar(false)
      }
    }

    // 处理滚动事件，更新toolbar位置
    const handleScroll = () => {
      if (showToolbar && window.getSelection().toString().length > 0) {
        const selection = window.getSelection()
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        
        // 计算toolbar应该显示在上方还是下方
        const toolbarHeight = 30; // 估算toolbar高度
        const windowHeight = window.innerHeight;
        
        // 如果上方空间足够，显示在上方；否则显示在下方
        let toolbarY;
        if (rect.top > toolbarHeight + 10) {
          // 上方空间足够，显示在上方
          toolbarY = rect.top - toolbarHeight - 10;
        } else {
          // 上方空间不足，显示在下方
          toolbarY = rect.bottom + 10;
        }
        
        setToolbarPosition({
          x: rect.left + rect.width / 2,
          y: toolbarY
        })
      }
    }

    document.addEventListener('mouseup', handleSelection)
    window.addEventListener('scroll', handleScroll)
    return () => {
      document.removeEventListener('mouseup', handleSelection)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [showToolbar, targetElement])

  return (
    <div ref={containerRef}>
      {showToolbar && (
        <div 
          className="floating-toolbar"
          style={{
            position: 'fixed',
            left: toolbarPosition.x,
            top: toolbarPosition.y,
            transform: 'translateX(-50%)',
            zIndex: 10000
          }}
        >
          <Toolbar 
            items={items} 
            theme={theme} 
            showBorder={showBorder}
            width={width}
            height={height}
            selectedData={selectedData}
            hoverDelay={hoverDelay}
          />
        </div>
      )}
    </div>
  )
}

export default SelectToolbar