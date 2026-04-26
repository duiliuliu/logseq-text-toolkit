import { useState, useEffect, useRef, useCallback } from 'react'
import Toolbar from '../Toolbar'
import { SelectedData } from '../Toolbar/textProcessor.ts'
import { getSelection, getWindow, getDocument } from '../../logseq/utils.ts'
import { useSettingsContext } from '../../settings/useSettings.tsx'
import { logseqAPI } from '../../logseq/index.ts'
import { InlineCommentModal } from '../InlineComment/index'
import { InlineComment } from '../../lib/inlineComment/index.ts'
import { 
  toolbarManager, 
  eventBus, 
  type ItemClickEvent, 
  type TextProcessedEvent 
} from '../../lib/toolbar/index.ts'

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
}

function SelectToolbar({ targetElement, items: ToolbarItems }: SelectToolbarProps) {
  const { settings } = useSettingsContext()
  const [selectedData, setSelectedData] = useState<SelectedData>({ text: '' })
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>({ x: 0, y: 0 })
  const [showToolbar, setShowToolbar] = useState(false)
  const [showInlineComment, setShowInlineComment] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // 从设置中获取配置
  const theme = settings?.theme || 'light'
  const showBorder = settings?.showBorder !== undefined ? settings.showBorder : true
  const width = settings?.width || '110px'
  const height = settings?.height || '24px'
  const hoverDelay = settings?.hoverDelay !== undefined ? settings.hoverDelay : 500
  const sponsorEnabled = settings?.sponsorEnabled !== undefined ? settings.sponsorEnabled : false

  // 初始化工具栏管理器
  useEffect(() => {
    if (settings && !toolbarManager.isReady()) {
      toolbarManager.initialize(settings)
      toolbarManager.setLanguage(settings.language || 'zh-CN')
    }
  }, [settings])

  // 订阅文本处理完成事件
  useEffect(() => {
    const handleTextProcessedEvent = (data: TextProcessedEvent) => {
      console.log('Processed text:', data.processedText)
    }

    eventBus.on('textProcessed', handleTextProcessedEvent)

    return () => {
      eventBus.off('textProcessed', handleTextProcessedEvent)
    }
  }, [])
  
  // 处理 inlineComment 保存
  const handleInlineCommentSave = async (config: { selectedText: string, comment: string }) => {
    const processedText = InlineComment.wrapText(config.selectedText, config.comment)
    
    try {
      const block = await logseqAPI.Editor.getCurrentBlock()
      if (!block || !block.content) {
        console.warn('No block or block content')
        setShowInlineComment(false)
        return
      }
      
      const originalContent = block.content
      
      // 使用精确的替换方法
      const index = originalContent.indexOf(config.selectedText)
      let newContent: string
      
      if (index === -1) {
        console.warn('Selected text not found in block content')
        newContent = originalContent.replace(config.selectedText, processedText)
      } else {
        newContent = originalContent.substring(0, index) + processedText + originalContent.substring(index + config.selectedText.length)
      }
      
      await logseqAPI.Editor.updateBlock(block.uuid, newContent)
      
      // 发布文本处理完成事件
      eventBus.emit('textProcessed', {
        processedText,
        originalItem: { id: 'wrap-inline-comment', label: 'Inline Comment', funcmode: 'invoke', clickfunc: 'inlineComment' } as any
      })
    } catch (error) {
      console.warn('Error updating block with inline comment:', error)
    }
    
    setShowInlineComment(false)
  }
  
  // 使用事件总线处理项目点击
  const handleItemClick = useCallback(async (item: any, selectedData: SelectedData) => {
    // 特殊处理 inlineComment
    if (item.funcmode === 'invoke' && item.clickfunc === 'inlineComment') {
      setShowToolbar(false) // 隐藏工具栏
      setShowInlineComment(true)
      return
    }
    
    // 发布项目点击事件
    eventBus.emit('itemClick', { item, selectedData })
    
    // 执行功能
    try {
      const processedText = await toolbarManager.executeAction(item, selectedData)
      console.log('Action executed, processed text:', processedText)
    } catch (error) {
      console.warn('Error executing action:', error)
    }
  }, [])

  // 更新工具栏位置
  const updateToolbarPosition = async () => {
    if (!targetElement) {
      setShowToolbar(false)
      return
    }

    const selection = getSelection()
    if (!selection || selection.toString().length === 0) {
      setShowToolbar(false)
      return
    }

    // 检查是否在目标元素内
    const anchorNode = selection.anchorNode
    const focusNode = selection.focusNode
    const shouldShowToolbar = targetElement.contains(anchorNode) || targetElement.contains(focusNode)

    if (!shouldShowToolbar) {
      setShowToolbar(false)
      return
    }

    try {
      // 使用 logseqAPI 获取光标位置
      const curPos = await logseqAPI.Editor.getEditingCursorPosition()
      if (curPos != null) {
        const newSelectedData: SelectedData = {
          text: selection.toString(),
          timestamp: new Date().toISOString(),
          rect: curPos.rect
        }
        setSelectedData(newSelectedData)

        // 发布选择变化事件
        eventBus.emit('selectionChange', { selectedData: newSelectedData })

        let toolbarY = curPos.top + curPos.rect.y - 35
        let toolbarX: number

        // 边界不超出屏幕
        const viewportWidth = getWindow().innerWidth
        if (containerRef.current) {
          const w = containerRef.current.offsetWidth
          if (curPos.left + curPos.rect.x + w <= viewportWidth) {
            toolbarX = curPos.left + curPos.rect.x
          } else {
            toolbarX = -w + viewportWidth
          }
          if (toolbarX < 0) toolbarX = 0
        } else {
          toolbarX = curPos.left + curPos.rect.x
        }

        setToolbarPosition({ x: toolbarX, y: toolbarY })
        setShowToolbar(true)
      }
    } catch (error) {
      console.error('Error getting cursor position:', error)
      // 如果 logseqAPI 失败，降级到原来的实现
      // 核心：只获取一次正确位置
      let rect: DOMRect
      try {
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          rect = range.getBoundingClientRect()

          // 只有宽度为0时光标才兜底，不影响选中文本
          if (rect.width === 0 && focusNode?.parentElement) {
            rect = (focusNode.parentElement as HTMLElement).getBoundingClientRect()
          }
        } else {
          rect = targetElement.getBoundingClientRect()
        }
      } catch {
        rect = targetElement.getBoundingClientRect()
      }

      const newSelectedData: SelectedData = {
        text: selection.toString(),
        timestamp: new Date().toISOString(),
        rect
      }
      setSelectedData(newSelectedData)

      // 发布选择变化事件
      eventBus.emit('selectionChange', { selectedData: newSelectedData })

      // 定位（紧贴选中文字，不飘）
      const toolbarHeight = 32
      const padding = 3 // 贴文字距离
      const viewportHeight = getWindow().innerHeight
      let toolbarY: number

      // 上下位置判断
      const spaceAbove = rect.top
      const spaceBelow = viewportHeight - rect.bottom

      if (spaceAbove > toolbarHeight + 10) {
        toolbarY = rect.top - toolbarHeight - padding
      } else {
        toolbarY = rect.bottom + padding
      }

      // 左侧对齐（与选中文字左侧对齐）
      let toolbarX = rect.left

      // 边界不超出屏幕
      const viewportWidth = getWindow().innerWidth
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth
        if (toolbarX < 0) toolbarX = 0
        if (toolbarX + w > viewportWidth) toolbarX = viewportWidth - w
      }

      setToolbarPosition({ x: toolbarX, y: toolbarY })
      setShowToolbar(true)
    }
  }

  // 处理文本选择
  useEffect(() => {
    if (!targetElement) return

    const handleSelection = async (e: MouseEvent) => {
      // 点击toolbar内部时，不隐藏toolbar，包括展开的下拉菜单
      if (e.target && ((e.target as HTMLElement).closest('.ltt-floating-toolbar') || (e.target as HTMLElement).closest('.ltt-toolbar-container') || (e.target as HTMLElement).closest('.ltt-toolbar-group-dropdown') || (e.target as HTMLElement).closest('.inline-comment-modal'))) {
        // 保持选中状态，不做任何处理
        return
      }

      await updateToolbarPosition()
    }

    // 处理鼠标移动事件，确保鼠标在toolbar内部时不隐藏
    const handleMouseMove = (e: MouseEvent) => {
      if (showToolbar && e.target && ((e.target as HTMLElement).closest('.ltt-floating-toolbar') || (e.target as HTMLElement).closest('.ltt-toolbar-container') || (e.target as HTMLElement).closest('.ltt-toolbar-group-dropdown') || (e.target as HTMLElement).closest('.inline-comment-modal'))) {
        // 鼠标在toolbar内部，保持显示状态
        return
      }
    }

    // 处理滚动事件，更新toolbar位置
    const handleScroll = async () => {
      if (showToolbar) {
        await updateToolbarPosition()
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
            items={ToolbarItems} 
            theme={theme} 
            showBorder={showBorder}
            width={width}
            height={height}
            selectedData={selectedData}
            hoverDelay={hoverDelay}
            sponsorEnabled={sponsorEnabled}
            onItemClick={handleItemClick}
          />
        </div>
      )}
      {showInlineComment && (
        <InlineCommentModal 
          isOpen={showInlineComment}
          selectedText={selectedData.text}
          onClose={() => setShowInlineComment(false)}
          onSave={handleInlineCommentSave}
        />
      )}
    </div>
  )
}

export default SelectToolbar
