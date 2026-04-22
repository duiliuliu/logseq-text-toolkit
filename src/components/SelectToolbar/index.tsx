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
  items: Array<any>
  theme?: 'light' | 'dark'
  showBorder?: boolean
  width?: string
  height?: string
  hoverDelay?: number
  sponsorEnabled?: boolean
  updateToolbarPosition?: (containerRef: React.RefObject<HTMLDivElement>, setToolbarPosition: React.Dispatch<React.SetStateAction<ToolbarPosition>>, setShowToolbar: React.Dispatch<React.SetStateAction<boolean>>, setSelectedData: React.Dispatch<React.SetStateAction<SelectedData>>) => void
}

function SelectToolbar({ targetElement, items: ToolbarItems, updateToolbarPosition: externalUpdateToolbarPosition }: SelectToolbarProps) {
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

  // 处理文本选择
  useEffect(() => {
    if (!targetElement) return

    const handleSelection = (e: MouseEvent) => {
      // 点击toolbar内部时，不隐藏toolbar，包括展开的下拉菜单
      if (e.target && ((e.target as HTMLElement).closest('.ltt-floating-toolbar') || (e.target as HTMLElement).closest('.ltt-toolbar-container') || (e.target as HTMLElement).closest('.ltt-toolbar-group-dropdown'))) {
        // 保持选中状态，不做任何处理
        return
      }

      if (externalUpdateToolbarPosition) {
        externalUpdateToolbarPosition(containerRef, setToolbarPosition, setShowToolbar, setSelectedData)
      }
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
      if (showToolbar && externalUpdateToolbarPosition) {
        externalUpdateToolbarPosition(containerRef, setToolbarPosition, setShowToolbar, setSelectedData)
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
  }, [showToolbar, targetElement, externalUpdateToolbarPosition])

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
            items={ToolbarItems} 
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