import { useState, useEffect, useRef } from 'react'
import Toolbar from '../Toolbar'
import { SelectedData } from '../../utils/textProcessor.ts'
import { getSelection, getWindow, getDocument } from '../../logseq/utils.ts'
import { useSettingsContext } from '../../settings/useSettings.tsx'

interface ToolbarPosition {
  x: number
  y: number
}

interface SelectToolbarProps {
  targetElement: HTMLElement | null
  items: Record<string, any>
  theme?: 'light' | 'dark'
  showBorder?: boolean
  width?: string
  height?: string
  hoverDelay?: number
  sponsorEnabled?: boolean
}

function SelectToolbar({ targetElement, items }: SelectToolbarProps) {
  const { settings } = useSettingsContext()
  const [selectedData, setSelectedData] = useState<SelectedData>({ text: '' })
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>({ x: 0, y: 0 })
  const [showToolbar, setShowToolbar] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectionRef = useRef<Selection | null>(null)
  
  // 从设置中获取配置
  const theme = settings?.theme || 'light'
  const showBorder = settings?.showBorder !== undefined ? settings.showBorder : true
  const width = settings?.width || '110px'
  const height = settings?.height || '24px'
  const hoverDelay = settings?.hoverDelay !== undefined ? settings.hoverDelay : 500
  const sponsorEnabled = settings?.sponsorEnabled !== undefined ? settings.sponsorEnabled : false
  
  // 处理文本处理完成后的回调
  const handleTextProcessed = async (processedText: string) => {
    console.log('Processed text:', processedText)
  }

  // 更新toolbar位置
  const updateToolbarPosition = () => {
    if (!targetElement) {
      setShowToolbar(false)
      return
    }
    
    const selection = getSelection()
    if (selection && selection.toString().length > 0) {
      // 检查选择是否在目标元素内
      const anchorNode = selection.anchorNode
      const focusNode = selection.focusNode
      const shouldShowToolbar = (targetElement.contains(anchorNode) || targetElement.contains(focusNode))
      
      if (shouldShowToolbar) {
        let rect: DOMRect
        try {
          // 优先使用focusNode.getBoundingClientRect()
          if (focusNode && focusNode.nodeType === Node.ELEMENT_NODE) {
            rect = (focusNode as HTMLElement).getBoundingClientRect()
          } else if (focusNode && focusNode.parentNode && focusNode.parentNode.nodeType === Node.ELEMENT_NODE) {
            rect = (focusNode.parentNode as HTMLElement).getBoundingClientRect()
          } else {
            const range = selection.getRangeAt(0)
            rect = range.getBoundingClientRect()
          }
        } catch (error) {
          rect = targetElement.getBoundingClientRect()
        }
        
        setSelectedData({
          text: selection.toString(),
          timestamp: new Date().toISOString(),
          rect: rect
        })
        
        // 计算toolbar应该显示在上方还是下方
        const toolbarHeight = 30; // 估算toolbar高度
        const padding = 10; // 间距
        
        // 获取视口高度
        const viewportHeight = getWindow().innerHeight;
        
        // 计算上方和下方的可用空间
        const spaceAbove = rect.top;
        const spaceBelow = viewportHeight - rect.bottom;
        
        // 优先选择空间更大的方向
        let toolbarY: number;
        if (spaceAbove >= spaceBelow && spaceAbove >= toolbarHeight + padding) {
          // 显示在上方
          toolbarY = rect.top - toolbarHeight - padding;
        } else if (spaceBelow >= toolbarHeight + padding) {
          // 显示在下方
          toolbarY = rect.bottom + padding;
        } else {
          // 空间不足，选择空间较大的方向
          toolbarY = spaceAbove > spaceBelow ? rect.top - toolbarHeight - padding : rect.bottom + padding;
        }
        
        const toolbarX = rect.left + rect.width / 2
        
        setToolbarPosition({
          x: toolbarX,
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

  // 处理文本选择
  useEffect(() => {
    if (!targetElement) return

    const handleSelection = (e: MouseEvent) => {
      // 点击toolbar内部时，不隐藏toolbar，包括展开的下拉菜单
      if (e.target && ((e.target as HTMLElement).closest('.ltt-floating-toolbar') || (e.target as HTMLElement).closest('.ltt-toolbar-container') || (e.target as HTMLElement).closest('.ltt-toolbar-group-dropdown'))) {
        // 保持选中状态，不做任何处理
        return
      }

      updateToolbarPosition()
    }

    // 处理鼠标移动事件，确保鼠标在toolbar内部时不隐藏
    const handleMouseMove = (e: MouseEvent) => {
      if (showToolbar && e.target && ((e.target as HTMLElement).closest('.ltt-floating-toolbar') || (e.target as HTMLElement).closest('.ltt-toolbar-container') || (e.target as HTMLElement).closest('.ltt-toolbar-group-dropdown'))) {
        // 鼠标在toolbar内部，保持显示状态
        return
      }
    }

    // 处理滚动事件，更新toolbar位置
    const handleScroll = () => {
      if (showToolbar) {
        updateToolbarPosition()
      }
    }

    // 绑定到targetElement及其所有父元素
    targetElement.addEventListener('mouseup', handleSelection)
    targetElement.addEventListener('mousemove', handleMouseMove)
    targetElement.addEventListener('scroll', handleScroll, true)
    
    // 绑定到所有可能的滚动容器
    let currentElement: HTMLElement | null = targetElement.parentElement
    while (currentElement) {
      currentElement.addEventListener('scroll', handleScroll, true)
      currentElement = currentElement.parentElement
    }
    
    // 绑定到document以捕获整个页面的滚动
    const doc = getDocument();
    doc.addEventListener('scroll', handleScroll, true)
    
    return () => {
      // 移除事件监听器
      targetElement.removeEventListener('mouseup', handleSelection)
      targetElement.removeEventListener('mousemove', handleMouseMove)
      targetElement.removeEventListener('scroll', handleScroll, true)
      
      // 移除父元素的事件监听器
      currentElement = targetElement.parentElement
      while (currentElement) {
        currentElement.removeEventListener('scroll', handleScroll, true)
        currentElement = currentElement.parentElement
      }
      
      // 移除document的事件监听器
      const doc = getDocument();
      doc.removeEventListener('scroll', handleScroll, true)
    }
  }, [showToolbar, targetElement])

  return (
    <div ref={containerRef}>
      {showToolbar && (
        <div 
          className="ltt-floating-toolbar"
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