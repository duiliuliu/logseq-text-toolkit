/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 选择工具栏组件
 */

import { useState, useEffect, useRef, useCallback } from 'react';
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

const debounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(fn: T, delay: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

interface DebouncedUpdateState {
  lastSelectionTime: number;
  lastSelectedText: string;
  pendingTimer: ReturnType<typeof setTimeout> | null;
}

const DOUBLE_CLICK_THRESHOLD = 300;
const SELECTION_DELAY = 200;

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
  
  const selectionStateRef = useRef<DebouncedUpdateState>({
    lastSelectionTime: 0,
    lastSelectedText: '',
    pendingTimer: null
  });

  const theme = settings?.theme || 'light';
  const showBorder = settings?.showBorder !== undefined ? settings.showBorder : true;
  const width = settings?.width || '110px';
  const height = settings?.height || '24px';
  const hoverDelay = settings?.hoverDelay !== undefined ? settings.hoverDelay : 500;
  const sponsorEnabled = settings?.sponsorEnabled !== undefined ? settings.sponsorEnabled : false;

  useEffect(() => {
    if (settings) {
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

  useEffect(() => {
    const handleTextProcessedEvent = (_data: any) => {
      // 文本处理完成事件处理
    };

    eventBus.on('ltt-textProcessed', handleTextProcessedEvent);

    return () => {
      eventBus.off('ltt-textProcessed', handleTextProcessedEvent);
    };
  }, []);

  const handleItemClick = async (item: any, selectedData: SelectedData) => {
    try {
      await toolbarManager.executeAction(item, selectedData);
      setShowToolbar(false);
    } catch (error) {
      logger.error('Error executing action:', error);
    }
  };

  const updateToolbarPosition = async () => {
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
                tempNode = tempNode?.nextSibling || null;
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
              tempNode = tempNode?.nextSibling || null;
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
  };

  const handleDelayedSelection = useCallback(() => {
    const state = selectionStateRef.current;
    
    const now = Date.now();
    const timeSinceLastSelection = now - state.lastSelectionTime;
    
    if (timeSinceLastSelection < DOUBLE_CLICK_THRESHOLD) {
      state.lastSelectionTime = now;
      return;
    }
    
    state.lastSelectionTime = now;
    
    updateToolbarPosition();
  }, [updateToolbarPosition]);

  useEffect(() => {
    if (!targetElement) return;

    const handleSelection = async (e: MouseEvent) => {
      if (e.target && ((e.target as HTMLElement).closest('.ltt-floating-toolbar') || (e.target as HTMLElement).closest('.ltt-toolbar-container') || (e.target as HTMLElement).closest('.ltt-toolbar-group-dropdown'))) {
        return;
      }

      const state = selectionStateRef.current;
      
      if (state.pendingTimer) {
        clearTimeout(state.pendingTimer);
        state.pendingTimer = null;
      }
      
      state.pendingTimer = setTimeout(() => {
        handleDelayedSelection();
        state.pendingTimer = null;
      }, SELECTION_DELAY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (showToolbar && e.target && ((e.target as HTMLElement).closest('.ltt-floating-toolbar') || (e.target as HTMLElement).closest('.ltt-toolbar-container') || (e.target as HTMLElement).closest('.ltt-toolbar-group-dropdown'))) {
        return;
      }
    };

    const handleScroll = () => {
      if (showToolbar) {
        updateToolbarPosition();
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
      const state = selectionStateRef.current;
      if (state.pendingTimer) {
        clearTimeout(state.pendingTimer);
        state.pendingTimer = null;
      }
      
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
    };
  }, [showToolbar, targetElement, handleDelayedSelection, updateToolbarPosition]);

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
    </div>
  );
}

export default SelectToolbar;
