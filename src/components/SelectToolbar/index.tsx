import { useState, useEffect, useRef } from 'react'
import Toolbar from '../Toolbar'

interface SelectedData {
  text: string
  timestamp?: string
  range?: Range
  rect?: DOMRect
}

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

function SelectToolbar({ targetElement, items, theme = 'light', showBorder = true, width = '110px', height = '24px', hoverDelay = 500, sponsorEnabled = true }: SelectToolbarProps) {
  const [selectedData, setSelectedData] = useState<SelectedData>({ text: '' })
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>({ x: 0, y: 0 })
  const [showToolbar, setShowToolbar] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  

  
  // 处理文本处理完成后的回调
  const handleTextProcessed = async (processedText: string) => {
    console.log('Processed text:', processedText)
  }

  // 处理文本选择
  useEffect(() => {
    const handleSelection = (e: MouseEvent) => {
      // 点击toolbar内部时，不隐藏toolbar，包括展开的下拉菜单
      if (e.target && (e.target as HTMLElement).closest('.floating-toolbar') || (e.target as HTMLElement).closest('.toolbar-container') || (e.target as HTMLElement).closest('.toolbar-group-dropdown')) {
        // 保持选中状态，不做任何处理
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
          setShowToolbar(true)
        } else {
          setShowToolbar(false)
        }
      } else {
        setShowToolbar(false)
      }
    }

    // 处理鼠标移动事件，确保鼠标在toolbar内部时不隐藏
    const handleMouseMove = (e: MouseEvent) => {
      if (showToolbar && e.target && ((e.target as HTMLElement).closest('.floating-toolbar') || (e.target as HTMLElement).closest('.toolbar-container') || (e.target as HTMLElement).closest('.toolbar-group-dropdown'))) {
        // 鼠标在toolbar内部，保持显示状态
        return
      }
    }

    // 处理滚动事件，更新toolbar位置
    const handleScroll = () => {
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
    }

    document.addEventListener('mouseup', handleSelection)
    document.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)
    return () => {
      document.removeEventListener('mouseup', handleSelection)
      document.removeEventListener('mousemove', handleMouseMove)
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
            sponsorEnabled={sponsorEnabled}
            onTextProcessed={handleTextProcessed}
          />
        </div>
      )}
    </div>
  )
}

export default SelectToolbar