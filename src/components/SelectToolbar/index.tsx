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

  const handleItemClick = async (item: any, selectedData: SelectedData) => {
    try {
      await toolbarManager.executeAction(item, selectedData);
      setShowToolbar(false);
    } catch (error) {
      logger.error('Error executing action:', error);
    }
  };

  useEffect(() => {
    if (!logseqAPI.Editor?.onInputSelectionEnd) {
      logger.warn('Editor.onInputSelectionEnd is not available');
      return;
    }

    const unsubscribe = logseqAPI.Editor.onInputSelectionEnd(
      async (info: { text: string; start: number; end: number; point: { x: number; y: number } }) => {
        const { text, start, end, point } = info;

        if (!text || text.length === 0 || start === end) {
          setShowToolbar(false);
          return;
        }

        const block = await logseqAPI.Editor.getCurrentBlock();
        const content = block?.content || '';

        let before = '';
        let after = '';
        if (content && start >= 0 && end <= content.length) {
          before = content.substring(0, start);
          after = content.substring(end);
        }

        const rect = {
          top: point.y,
          left: point.x,
          bottom: point.y,
          right: point.x,
          width: 0,
          height: 0,
          x: point.x,
          y: point.y,
          toJSON: () => ({})
        } as DOMRect;

        const newSelectedData: SelectedData = {
          text,
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
        const viewportWidth = getWindow().innerWidth;

        let toolbarY: number;
        const spaceAbove = point.y;
        const spaceBelow = viewportHeight - point.y;
        if (spaceAbove > toolbarHeight + 10) {
          toolbarY = point.y - toolbarHeight - padding;
        } else {
          toolbarY = point.y + padding;
        }

        let toolbarX = point.x;
        if (containerRef.current) {
          const w = containerRef.current.offsetWidth;
          toolbarX = point.x - w / 2;
          if (toolbarX < 0) toolbarX = 0;
          if (toolbarX + w > viewportWidth) toolbarX = viewportWidth - w;
        }

        setToolbarPosition({ x: toolbarX, y: toolbarY });
        setShowToolbar(true);
      }
    );

    return () => unsubscribe();
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
