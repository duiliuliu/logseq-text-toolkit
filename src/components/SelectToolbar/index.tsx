/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * 选择工具栏组件
 *
 * DB 图优先使用 logseq.Editor.onInputSelectionEnd 获取 textarea 选区；
 * file 图或旧 Host 没有该 Hook 时，回退到原生 DOM Selection。
 */

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import Toolbar from '../Toolbar';
import { SelectedData } from '../Toolbar/types.ts';
import { getSelection, getWindow, getDocument } from '../../logseq/utils.ts';
import { useSettingsContext } from '../../settings/useSettings.tsx';
import {
  toolbarManager,
  eventBus
} from '../../lib/toolbar/index.ts';
import {
  calculateToolbarPositionFromPoint,
  createSelectionFromSDKEvent,
  getBlockContent,
  resolveSelectionRange,
  toDOMRect,
  type SDKSelectionEvent,
} from '../../lib/toolbar/selection.ts';
import { logseqAPI } from '../../logseq/index.ts';
import logger from '../../lib/logger/index';

interface ToolbarPosition {
  x: number;
  y: number;
}

const SELECTION_DELAY = 200;
const FALLBACK_TOOLBAR_WIDTH = 200;

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

function isToolbarEventTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  return !!element?.closest?.(
    '.ltt-floating-toolbar, .ltt-toolbar-container, .ltt-toolbar-group-dropdown'
  );
}

function nodeToElement(node: Node | null): Element | null {
  if (!node) {
    return null;
  }
  return node.nodeType === Node.ELEMENT_NODE
    ? (node as Element)
    : node.parentElement;
}

function SelectToolbar({ targetElement, items: ToolbarItems, defaultShow = false }: SelectToolbarProps) {
  const { settings } = useSettingsContext();
  const [selectedData, setSelectedData] = useState<SelectedData>({ text: '' });
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>({ x: 0, y: 0 });
  const [showToolbar, setShowToolbar] = useState(defaultShow);
  const containerRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const sdkRequestIdRef = useRef(0);
  const lastSDKSelectionAtRef = useRef(0);

  const sdkSelectionAvailable =
    typeof logseqAPI.Editor?.onInputSelectionEnd === 'function';

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

  const getCurrentBlock = useCallback(async () => {
    try {
      return await logseqAPI.Editor?.getCurrentBlock?.() ?? null;
    } catch (error) {
      logger.warn('Failed to get current block:', error);
      return null;
    }
  }, []);

  const showSelection = useCallback((data: SelectedData) => {
    if (!data.text) {
      setShowToolbar(false);
      return;
    }

    setSelectedData(data);
    eventBus.emit('ltt-selectionChange', { selectedData: data });

    const toolbarWidth = floatingRef.current?.offsetWidth || FALLBACK_TOOLBAR_WIDTH;
    const anchor = data.point ?? {
      x: data.rect?.left ?? 0,
      y: data.rect?.top ?? 0,
    };
    setToolbarPosition(calculateToolbarPositionFromPoint(anchor, toolbarWidth));
    setShowToolbar(true);
  }, []);

  const handleSDKSelection = useCallback(async (event: SDKSelectionEvent) => {
    const requestId = ++sdkRequestIdRef.current;

    if (!event || !event.text) {
      lastSDKSelectionAtRef.current = 0;
      setShowToolbar(false);
      return;
    }
    if (
      typeof event.start === 'number' &&
      typeof event.end === 'number' &&
      event.start === event.end
    ) {
      lastSDKSelectionAtRef.current = 0;
      setShowToolbar(false);
      return;
    }

    // 标记 SDK 选区已经生效，避免原生回退路径重复处理/覆盖。
    lastSDKSelectionAtRef.current = Date.now();
    const block = await getCurrentBlock();

    // 拖动选择时 Host 可能连续触发 select 事件，丢弃过期的异步结果。
    if (requestId !== sdkRequestIdRef.current) {
      return;
    }

    showSelection(createSelectionFromSDKEvent(event, block));
  }, [getCurrentBlock, showSelection]);

  useEffect(() => {
    if (!sdkSelectionAvailable) {
      return;
    }

    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = logseqAPI.Editor.onInputSelectionEnd((event) => {
        void handleSDKSelection(event as SDKSelectionEvent);
      });
    } catch (error) {
      logger.error('Failed to subscribe Editor.onInputSelectionEnd:', error);
    }

    return () => {
      try {
        unsubscribe?.();
      } catch (error) {
        logger.warn('Failed to unsubscribe Editor.onInputSelectionEnd:', error);
      }
    };
  }, [sdkSelectionAvailable, handleSDKSelection]);

  const handleItemClick = async (item: any, data: SelectedData) => {
    try {
      await toolbarManager.executeAction(item, data);
      setShowToolbar(false);
    } catch (error) {
      logger.error('Error executing action:', error);
    }
  };

  // 原生 DOM Selection 回退：file 图或旧 Host 没有 onInputSelectionEnd 时使用。
  const updateToolbarFromNativeSelection = useCallback(async () => {
    const doc = getDocument();
    const selection = getSelection();
    const text = selection?.toString() ?? '';

    if (!selection || !text) {
      setShowToolbar(false);
      return;
    }

    // 新版 Host：SDK 事件已处理；旧版 Host：Hook 可能存在但不触发，
    // 因此原生路径始终保留，只在 SDK 刚处理过时跳过。
    if (Date.now() - lastSDKSelectionAtRef.current < 600) {
      return;
    }

    const anchorNode = selection.anchorNode;
    const focusNode = selection.focusNode;

    if (targetElement) {
      if (!targetElement.contains(anchorNode) && !targetElement.contains(focusNode)) {
        setShowToolbar(false);
        return;
      }
    } else {
      const element = nodeToElement(anchorNode) ?? nodeToElement(focusNode);
      if (!element?.closest?.('.ls-block, .editor-inner, #main-content-container, #app-main-home')) {
        setShowToolbar(false);
        return;
      }
    }

    let rect: DOMRect | null = null;
    if (selection.rangeCount > 0) {
      try {
        const range = selection.getRangeAt(0);
        const rangeRect = range.getBoundingClientRect();
        if (rangeRect.width > 0 || rangeRect.height > 0) {
          rect = rangeRect;
        }
      } catch (error) {
        logger.debug('Failed to read native selection range:', error);
      }
    }

    const block = await getCurrentBlock();
    const content = getBlockContent(block);
    const rangeInfo = resolveSelectionRange(content, { text });
    let point: { x: number; y: number } | null = null;

    // getEditingCursorPosition 在新旧版本都可能返回 null，不能作为唯一路径。
    try {
      const curPos = await logseqAPI.Editor?.getEditingCursorPosition?.();
      if (curPos?.rect) {
        rect = toDOMRect(curPos.rect);
        point = {
          x: (curPos.left ?? 0) + rect.left,
          y: (curPos.top ?? 0) + rect.top,
        };
      }
    } catch (error) {
      logger.debug('Failed to get editing cursor position:', error);
    }

    if (!rect) {
      const fallbackNode = nodeToElement(focusNode) ?? nodeToElement(anchorNode);
      const fallbackElement = fallbackNode ?? targetElement ?? doc.body;
      rect = fallbackElement?.getBoundingClientRect?.() ?? toDOMRect(null);
    }

    const start = rangeInfo?.start;
    const end = rangeInfo?.end;

    showSelection({
      text,
      start,
      end,
      before: start !== undefined ? content.slice(0, start) : '',
      after: end !== undefined ? content.slice(end) : '',
      rect,
      point: point ?? { x: rect.left, y: rect.top },
      block: block ?? undefined,
      source: 'native',
      timestamp: new Date().toISOString(),
    });
  }, [getCurrentBlock, showSelection, targetElement]);

  useEffect(() => {
    const listenerTarget: EventTarget | null = targetElement ?? getDocument();
    if (!listenerTarget?.addEventListener) {
      return;
    }

    let pendingTimer: ReturnType<typeof setTimeout> | null = null;

    const handleMouseUp = (event: MouseEvent) => {
      if (isToolbarEventTarget(event.target)) {
        return;
      }

      if (pendingTimer) {
        clearTimeout(pendingTimer);
      }

      pendingTimer = setTimeout(() => {
        pendingTimer = null;
        void updateToolbarFromNativeSelection();
      }, SELECTION_DELAY);
    };

    listenerTarget.addEventListener('mouseup', handleMouseUp as EventListener);

    return () => {
      if (pendingTimer) {
        clearTimeout(pendingTimer);
        pendingTimer = null;
      }
      listenerTarget.removeEventListener('mouseup', handleMouseUp as EventListener);
    };
  }, [targetElement, updateToolbarFromNativeSelection]);

  // 滚动或窗口尺寸变化后选区位置不再可靠，直接收起工具栏。
  useEffect(() => {
    if (!showToolbar) {
      return;
    }

    const doc = getDocument();
    const win = getWindow();
    const hide = () => setShowToolbar(false);

    doc?.addEventListener?.('scroll', hide, true);
    win?.addEventListener?.('resize', hide);

    return () => {
      doc?.removeEventListener?.('scroll', hide, true);
      win?.removeEventListener?.('resize', hide);
    };
  }, [showToolbar]);

  // 首次渲染时 floatingRef 还没有宽度；渲染后用真实宽度再校正一次。
  useLayoutEffect(() => {
    if (!showToolbar) {
      return;
    }
    const toolbarWidth = floatingRef.current?.offsetWidth;
    if (!toolbarWidth) {
      return;
    }
    const anchor = selectedData.point ?? {
      x: selectedData.rect?.left ?? 0,
      y: selectedData.rect?.top ?? 0,
    };
    setToolbarPosition(calculateToolbarPositionFromPoint(anchor, toolbarWidth));
  }, [showToolbar, selectedData.point, selectedData.rect]);

  return (
    <div ref={containerRef}>
      {showToolbar && (
        <div
          ref={floatingRef}
          className="ltt-floating-toolbar"
          data-selection-source={selectedData.source ?? 'unknown'}
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
