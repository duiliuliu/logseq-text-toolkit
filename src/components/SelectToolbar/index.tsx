import { useState, useEffect, useCallback } from 'react'
import Toolbar from '../Toolbar'

interface ToolbarPosition {
  x: number
  y: number
}

interface SelectToolbarProps {
  items: Record<string, any>
  theme?: 'light' | 'dark'
  showBorder?: boolean
  width?: string
  height?: string
  hoverDelay?: number
  sponsorEnabled?: boolean
}

function SelectToolbar({ items, theme = 'light', showBorder = true, width = '110px', height = '24px', hoverDelay = 500, sponsorEnabled = false }: SelectToolbarProps) {
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>({ x: 0, y: 0 })
  const [showToolbar, setShowToolbar] = useState(false)

  // 处理文本选择
  const handleSelection = useCallback((e: MouseEvent) => {
    // 检查是否点击了toolbar内部的元素
    const isInsideToolbar = 
      (e.target as HTMLElement).closest('.floating-toolbar') || 
      (e.target as HTMLElement).closest('.toolbar-container') || 
      (e.target as HTMLElement).closest('.toolbar-group-dropdown') || 
      (e.target as HTMLElement).closest('.toolbar-more');
    
    if (isInsideToolbar && showToolbar) {
      // 点击工具栏内部，保持显示状态
      return
    }

    const selection = window.getSelection()
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      
      // 计算toolbar应该显示在上方还是下方
      const toolbarHeight = 30; // 估算toolbar高度
      
      let toolbarY: number;
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
  }, [showToolbar]);

  // 处理滚动事件，更新toolbar位置
  const handleScroll = useCallback(() => {
    if (showToolbar) {
      const selection = window.getSelection()
      if (selection && selection.toString().length > 0) {
        const range = selection.getRangeAt(0)
        if (range) {
          const rect = range.getBoundingClientRect()
          
          // 计算toolbar应该显示在上方还是下方
          const toolbarHeight = 30; // 估算toolbar高度
          
          let toolbarY: number;
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
    }
  }, [showToolbar]);

  // 添加事件监听器
  useEffect(() => {
    document.addEventListener('mouseup', handleSelection)
    window.addEventListener('scroll', handleScroll)
    return () => {
      document.removeEventListener('mouseup', handleSelection)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleSelection, handleScroll])

  return (
    <div>
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
            hoverDelay={hoverDelay}
            sponsorEnabled={sponsorEnabled}
          />
        </div>
      )}
    </div>
  )
}

export default SelectToolbar