/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 选择工具栏组件
 */

import { useState, useEffect, useRef } from 'react';
import Toolbar from '../Toolbar';
import { SelectedData } from '../Toolbar/types.ts';
import { getWindow } from '../../logseq/utils.ts';
import { useSettingsContext } from '../../settings/useSettings.tsx';
import { 
  toolbarManager, 
  eventBus
} from '../../lib/toolbar/index.ts';
import { logseqAPI } from '../../logseq/index.ts';
import logger from '../../lib/logger/index';

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
  defaultShow?: boolean;
}

function SelectToolbar({ targetElement, items: ToolbarItems, defaultShow = false }: SelectToolbarProps) {
  const { settings } = useSettingsContext();
  const [selectedData, setSelectedData] = useState<SelectedData>({ text: '' });
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>({ x: 0, y: 0 });
  const [showToolbar, setShowToolbar] = useState(defaultShow);
  const containerRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

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
        toolbarManager.setLanguage(settings?.language || 'zh-CN');
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

  const calculateToolbarPosition = (rect: DOMRect) => {
    const toolbarHeight = 32;
    const padding = 3;
    const viewportHeight = getWindow().innerHeight;
    const viewportWidth = getWindow().innerWidth;
    let toolbarY: number;
    let toolbarX: number;

    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;

    if (spaceAbove > toolbarHeight + 10) {
      toolbarY = rect.top - toolbarHeight - padding;
    } else {
      toolbarY = rect.bottom + padding;
    }

    toolbarX = rect.left + rect.width / 2;

    if (containerRef.current) {
      const w = containerRef.current.offsetWidth;
      if (toolbarX - w / 2 < 0) {
        toolbarX = w / 2;
      }
      if (toolbarX + w / 2 > viewportWidth) {
        toolbarX = viewportWidth - w / 2;
      }
    }

    return { x: toolbarX, y: toolbarY };
  };

  const handleSelectionEnd = (e: any) => {
    console.log('Selection event from Logseq API:', e);
    
    if (!e.text || e.text.length === 0) {
      setShowToolbar(false);
      return;
    }

    const newSelectedData: SelectedData = {
      text: e.text,
      timestamp: new Date().toISOString(),
      rect: e.caret?.rect,
      before: e.before,
      after: e.after,
      block: e.block
    };
    
    setSelectedData(newSelectedData);
    eventBus.emit('ltt-selectionChange', { selectedData: newSelectedData });

    if (e.caret?.rect) {
      const position = calculateToolbarPosition(e.caret.rect);
      setToolbarPosition(position);
      setShowToolbar(true);
    }
  };

  useEffect(() => {
    try {
      unsubscribeRef.current = logseqAPI.Editor.onInputSelectionEnd(handleSelectionEnd);
    } catch (error) {
      logger.error('Error registering onInputSelectionEnd:', error);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

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
