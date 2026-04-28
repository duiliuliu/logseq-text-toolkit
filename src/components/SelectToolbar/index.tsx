import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Toolbar from '../Toolbar';
import { SelectedData } from '../Toolbar/textProcessor.ts';
import { getSelection, getWindow, getDocument } from '../../logseq/utils.ts';
import { useSettingsContext } from '../../settings/useSettings.tsx';
import { 
  toolbarManager, 
  eventBus
} from '../../lib/toolbar/index.ts';
import { logseqAPI } from '../../logseq/index.ts';
import { logger } from '../../lib/logger/logger.ts';

interface ToolbarPosition {
  x: number;
  y: number;
}

interface SelectToolbarProps {
  targetElement: HTMLElement | null;
  items: Array<any>;
  theme?: 'light' | 'dark';
  showBorder?: boolean;
  width?: string;
  height?: string;
  hoverDelay?: number;
  sponsorEnabled?: boolean;
}

function SelectToolbar({ targetElement, items: ToolbarItems }: SelectToolbarProps) {
  const { settings } = useSettingsContext();
  const [selectedData, setSelectedData] = useState<SelectedData>({ text: '' });
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>({ x: 0, y: 0 });
  const [showToolbar, setShowToolbar] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 从设置中获取配置
  const theme = settings?.theme || 'light';
  const showBorder = settings?.showBorder !== undefined ? settings.showBorder : true;
  const width = settings?.width || '110px';
  const height = settings?.height || '24px';
  const hoverDelay = settings?.hoverDelay !== undefined ? settings.hoverDelay : 500;
  const sponsorEnabled = settings?.sponsorEnabled !== undefined ? settings.sponsorEnabled : false;
  


  // 初始化工具栏管理器
  useEffect(() => {
    if (settings) {
      // 初始化管理器，不检查 isReady，确保能正常工作
      try {
        if (!toolbarManager.isReady()) {
          toolbarManager.initialize(settings);
        }
        toolbarManager.setLanguage(settings.language || 'zh-CN');
      } catch (error) {
        logger.error('Error initializing toolbar manager:', error);
      }
    }
  }, [settings]);

  // 订阅文本处理完成事件
  useEffect(() => {
    const handleTextProcessedEvent = (data: any) => {
      // 文本处理完成事件处理
    };

    eventBus.on('ltt-textProcessed', handleTextProcessedEvent);

    return () => {
      eventBus.off('ltt-textProcessed', handleTextProcessedEvent);
    };
  }, []);

  // 处理工具栏项目点击
  const handleItemClick = async (item: any, selectedData: SelectedData) => {
    // 使用 ToolbarManager 执行功能
    try {
      await toolbarManager.executeAction(item, selectedData);
    } catch (error) {
      logger.error('Error executing action:', error);
    }
  };

  const debounceRef = useRef<number | null>(null);

  // 更新工具栏位置（带防抖）
  const updateToolbarPosition = useCallback(async () => {
    if (!targetElement) {
      setShowToolbar(false);
      return;
    }

    const selection = getSelection();
    if (!selection || selection.toString().length === 0) {
      setShowToolbar(false);
      return;
    }

    const anchorNode = selection.anchorNode;
    const focusNode = selection.focusNode;
    const shouldShowToolbar = targetElement.contains(anchorNode) || targetElement.contains(focusNode);

    if (!shouldShowToolbar) {
      setShowToolbar(false);
      return;
    }

    try {
      const curPos = await logseqAPI.Editor.getEditingCursorPosition();
      
      if (curPos != null) {
        let before = '';
        let after = '';
        const selectedText = selection.toString();
        
        const block = await logseqAPI.Editor.getCurrentBlock();
        
        if (block && block.content && selectedText) {
          const content = block.content;
          
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            let currentNode = range.startContainer;
            
            while (currentNode && currentNode.nodeType !== Node.ELEMENT_NODE) {
              currentNode = currentNode.parentNode;
            }
            
            if (currentNode) {
              let offset = 0;
              let tempNode = block.content?.[0];
              
              while (tempNode && tempNode !== currentNode) {
                offset += tempNode.textContent?.length || 0;
                tempNode = tempNode.nextSibling;
              }
              
              offset += range.startOffset;
              
              if (offset >= 0 && offset + selectedText.length <= content.length) {
                before = content.substring(0, offset);
                after = content.substring(offset + selectedText.length);
              } else {
                const index = content.indexOf(selectedText);
                if (index !== -1) {
                  before = content.substring(0, index);
                  after = content.substring(index + selectedText.length);
                }
              }
            }
          } else {
            const index = content.indexOf(selectedText);
            if (index !== -1) {
              before = content.substring(0, index);
              after = content.substring(index + selectedText.length);
            }
          }
        }
        
        const newSelectedData: SelectedData = {
          text: selectedText,
          timestamp: new Date().toISOString(),
          rect: curPos.rect,
          before,
          after,
          block
        };
        setSelectedData(newSelectedData);
        eventBus.emit('ltt-selectionChange', { selectedData: newSelectedData });

        let toolbarY = curPos.top + curPos.rect.y - 35;
        let toolbarX: number;

        const viewportWidth = getWindow().innerWidth;
        
        if (containerRef.current) {
          const w = containerRef.current.offsetWidth;
          if (curPos.left + curPos.rect.x + w <= viewportWidth) {
            toolbarX = curPos.left + curPos.rect.x;
          } else {
            toolbarX = -w + viewportWidth;
          }
          if (toolbarX < 0) toolbarX = 0;
        } else {
          toolbarX = curPos.left + curPos.rect.x;
        }

        setToolbarPosition({ x: toolbarX, y: toolbarY });
        setShowToolbar(true);
      }
    } catch (error) {
      let rect: DOMRect;
      try {
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          rect = range.getBoundingClientRect();

          if (rect.width === 0 && focusNode?.parentElement) {
            rect = (focusNode.parentElement as HTMLElement).getBoundingClientRect();
          }
        } else {
          rect = targetElement.getBoundingClientRect();
        }
      } catch (e) {
        rect = targetElement.getBoundingClientRect();
      }

      let before = '';
      let after = '';
      const selectedText = selection.toString();
      
      const block = await logseqAPI.Editor.getCurrentBlock();
      
      if (block && block.content && selectedText) {
        const content = block.content;
        
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          let currentNode = range.startContainer;
          
          while (currentNode && currentNode.nodeType !== Node.ELEMENT_NODE) {
            currentNode = currentNode.parentNode;
          }
          
          if (currentNode) {
            let offset = 0;
            let tempNode = block.content?.[0];
            
            while (tempNode && tempNode !== currentNode) {
              offset += tempNode.textContent?.length || 0;
              tempNode = tempNode.nextSibling;
            }
            
            offset += range.startOffset;
            
            if (offset >= 0 && offset + selectedText.length <= content.length) {
              before = content.substring(0, offset);
              after = content.substring(offset + selectedText.length);
            } else {
              const index = content.indexOf(selectedText);
              if (index !== -1) {
                before = content.substring(0, index);
                after = content.substring(index + selectedText.length);
              }
            }
          }
        } else {
          const index = content.indexOf(selectedText);
          if (index !== -1) {
            before = content.substring(0, index);
            after = content.substring(index + selectedText.length);
          }
        }
      }
      
      const newSelectedData: SelectedData = {
        text: selectedText,
        timestamp: new Date().toISOString(),
        rect,
        before,
        after,
        block
      };
      setSelectedData(newSelectedData);
      eventBus.emit('ltt-selectionChange', { selectedData: newSelectedData });

      const toolbarHeight = 32;
      const padding = 3;
      const viewportHeight = getWindow().innerHeight;
      let toolbarY: number;

      const spaceAbove = rect.top;
      const spaceBelow = viewportHeight - rect.bottom;

      if (spaceAbove > toolbarHeight + 10) {
        toolbarY = rect.top - toolbarHeight - padding;
      } else {
        toolbarY = rect.bottom + padding;
      }

      let toolbarX = rect.left;
      const viewportWidth = getWindow().innerWidth;
      
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        if (toolbarX < 0) toolbarX = 0;
        if (toolbarX + w > viewportWidth) toolbarX = viewportWidth - w;
      }

      setToolbarPosition({ x: toolbarX, y: toolbarY });
      setShowToolbar(true);
    }
  }, [targetElement]);

  // 防抖包装的更新函数
  const debouncedUpdateToolbarPosition = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(updateToolbarPosition, 50);
  }, [updateToolbarPosition]);

  // 处理文本选择
  useEffect(() => {
    if (!targetElement) return;

    const handleSelection = (e: MouseEvent) => {
      if (e.target && ((e.target as HTMLElement).closest('.ltt-floating-toolbar') || (e.target as HTMLElement).closest('.ltt-toolbar-container') || (e.target as HTMLElement).closest('.ltt-toolbar-group-dropdown'))) {
        return;
      }
      debouncedUpdateToolbarPosition();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (showToolbar && e.target && ((e.target as HTMLElement).closest('.ltt-floating-toolbar') || (e.target as HTMLElement).closest('.ltt-toolbar-container') || (e.target as HTMLElement).closest('.ltt-toolbar-group-dropdown'))) {
        return;
      }
    };

    const handleScroll = () => {
      if (showToolbar) {
        debouncedUpdateToolbarPosition();
      }
    };

    targetElement.addEventListener('mouseup', handleSelection);
    targetElement.addEventListener('mousemove', handleMouseMove);
    targetElement.addEventListener('scroll', handleScroll, true);

    let currentElement: HTMLElement | null = targetElement.parentElement;
    while (currentElement) {
      currentElement.addEventListener('scroll', handleScroll, true);
      currentElement = currentElement.parentElement;
    }

    const doc = getDocument();
    doc.addEventListener('scroll', handleScroll, true);

    return () => {
      targetElement.removeEventListener('mouseup', handleSelection);
      targetElement.removeEventListener('mousemove', handleMouseMove);
      targetElement.removeEventListener('scroll', handleScroll, true);

      currentElement = targetElement.parentElement;
      while (currentElement) {
        currentElement.removeEventListener('scroll', handleScroll, true);
        currentElement = currentElement.parentElement;
      }

      const doc = getDocument();
      doc.removeEventListener('scroll', handleScroll, true);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [showToolbar, targetElement, debouncedUpdateToolbarPosition]);

  return (
    <div ref={containerRef}>
      <AnimatePresence>
        {showToolbar && (
          <motion.div 
            className="ltt-floating-toolbar"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -5 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SelectToolbar;
