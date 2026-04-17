import { useState, useEffect, useRef, useCallback } from 'react'
import Toolbar from '../Toolbar'
import { SelectedData } from '../../utils/textProcessor.ts'

interface ToolbarPosition {
  x: number
  y: number
}

interface SelectToolbarProps {
  targetElement?: HTMLElement
  items: Record<string, any>
  theme?: 'light' | 'dark'
  showBorder?: boolean
  width?: string
  height?: string
  hoverDelay?: number
  sponsorEnabled?: boolean
}

function SelectToolbar({ targetElement, items, theme = 'light', showBorder = true, width = '110px', height = '24px', hoverDelay = 500, sponsorEnabled = false }: SelectToolbarProps) {
  const [selectedData, setSelectedData] = useState<SelectedData>({ text: '' })
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>({ x: 0, y: 0 })
  const [showToolbar, setShowToolbar] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  

  
  // 处理文本处理完成后的回调
  const handleTextProcessed = async (processedText: string) => {
    console.log('Processed text:', processedText)
  }

  // 处理文本选择
  const handleSelection = useCallback((e: MouseEvent) => {
    // 检查是否点击了toolbar内部的元素，包括more按钮
    const isInsideToolbar = 
      (e.target as HTMLElement).closest('.floating-toolbar') || 
      (e.target as HTMLElement).closest('.toolbar-container') || 
      (e.target as HTMLElement).closest('.toolbar-group-dropdown') || 
      (e.target as HTMLElement).closest('.toolbar-more');
    
    if (isInsideToolbar && showToolbar) {
      // 点击工具栏内部，直接返回，不做任何处理
      return
    }

    const selection = window.getSelection()
    if (selection && selection.toString().length > 0) {
      // 检查选中的元素是否在targetElement内
      const range = selection.getRangeAt(0)
      const commonAncestor = range.commonAncestorContainer as HTMLElement
      const isInTarget = targetElement && targetElement.contains(commonAncestor)
      
      if (isInTarget || !targetElement) {
        // 无论是否有targetElement，都显示工具栏
        const rect = range.getBoundingClientRect()
        
        setSelectedData({
          text: selection.toString(),
          timestamp: new Date().toISOString(),
          range: range,
          rect: rect
        })
        
        // 计算toolbar应该显示在上方还是下方
        const toolbarHeight = 30; // 估算toolbar高度
        const toolbarY = rect.top > toolbarHeight + 10 
          ? rect.top - toolbarHeight - 10 
          : rect.bottom + 10;
        
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
  }, [showToolbar, targetElement]);

  // 处理鼠标移动事件，确保鼠标在toolbar内部时不隐藏
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (showToolbar && e.target && ((e.target as HTMLElement).closest('.floating-toolbar') || (e.target as HTMLElement).closest('.toolbar-container') || (e.target as HTMLElement).closest('.toolbar-group-dropdown'))) {
      // 鼠标在toolbar内部，保持显示状态
      return
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
          
          // 如果上方空间足够，显示在上方；否则显示在下方
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
    document.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)
    return () => {
      document.removeEventListener('mouseup', handleSelection)
      document.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleSelection, handleMouseMove, handleScroll])

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
            sponsorEnabled={sponsorEnabled}
            onTextProcessed={handleTextProcessed}
          />
        </div>
      )}
    </div>
  )
}

export default SelectToolbar