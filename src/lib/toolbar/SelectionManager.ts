/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 选区管理器
 * 统一管理文本选择检测，支持 SDK 事件和原生事件两种模式
 */

import { getSelection, getDocument, getWindow } from '../../logseq/utils.ts';
import type { BlockEntity } from '../../logseq/types';

export interface SelectionInfo {
  text: string;
  start: number;
  end: number;
  caret?: {
    left: number;
    top: number;
    height: number;
    pos: number;
    rect: DOMRect;
  };
  point?: {
    x: number;
    y: number;
  };
}

export interface AdaptedSelection {
  text: string;
  start: number;
  end: number;
  rect: DOMRect;
  caret: {
    left: number;
    top: number;
    height: number;
  };
  point: { x: number; y: number };
  before: string;
  after: string;
  block?: BlockEntity;
  timestamp: string;
}

export type SelectionHandler = (selection: AdaptedSelection) => void;

export class SelectionEventAdapter {
  static fromSDKEvent(event: SelectionInfo): AdaptedSelection {
    const rect = event.caret?.rect || new DOMRect(
      event.caret?.left || 0,
      event.caret?.top || 0,
      0,
      event.caret?.height || 20
    );

    return {
      text: event.text,
      start: event.start,
      end: event.end,
      rect,
      caret: {
        left: event.caret?.left || 0,
        top: event.caret?.top || 0,
        height: event.caret?.height || 20,
      },
      point: {
        x: event.point?.x || 0,
        y: event.point?.y || 0,
      },
      before: '',
      after: '',
      timestamp: new Date().toISOString(),
    };
  }

  static async fromNativeEvent(
    getBlock: () => Promise<BlockEntity | null>
  ): Promise<AdaptedSelection | null> {
    const selection = getSelection();
    const doc = getDocument();

    if (!selection || selection.toString().length === 0) {
      return null;
    }

    const text = selection.toString();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    let start = 0;
    let end = 0;
    let before = '';
    let after = '';
    let block: BlockEntity | undefined;

    try {
      const currentBlock = await getBlock();
      if (currentBlock?.content) {
        const content = currentBlock.content;
        const selectedIndex = content.indexOf(text);
        
        if (selectedIndex !== -1) {
          start = selectedIndex;
          end = selectedIndex + text.length;
          before = content.substring(0, start);
          after = content.substring(end);
        }
        block = currentBlock;
      }
    } catch (error) {
      console.warn('[SelectionEventAdapter] Failed to get block context:', error);
    }

    return {
      text,
      start,
      end,
      rect,
      caret: {
        left: rect.left,
        top: rect.top,
        height: rect.height,
      },
      point: {
        x: rect.left,
        y: rect.top,
      },
      before,
      after,
      block,
      timestamp: new Date().toISOString(),
    };
  }

  static enrichWithContext(
    selection: AdaptedSelection,
    block: BlockEntity
  ): AdaptedSelection {
    if (!block) {
      return selection;
    }

    const content = block.content || '';
    if (!content) {
      return { ...selection, block };
    }

    const start = content.indexOf(selection.text);
    
    if (start !== -1) {
      return {
        ...selection,
        start,
        end: start + selection.text.length,
        before: content.substring(0, start),
        after: content.substring(start + selection.text.length),
        block,
      };
    }

    return { ...selection, block };
  }
}

export class SelectionManager {
  private handlers: Set<SelectionHandler> = new Set();
  private nativeEventCleanup: (() => void) | null = null;
  private sdkEventCleanup: (() => void) | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private lastSelectionText: string = '';
  private readonly debounceDelay: number = 50;

  constructor(
    private getBlock: () => Promise<BlockEntity | null>,
    private registerSDKEEvent: (handler: (info: SelectionInfo) => void) => () => void
  ) {}

  private emitSelection(selection: AdaptedSelection) {
    this.handlers.forEach(handler => {
      try {
        handler(selection);
      } catch (error) {
        console.error('[SelectionManager] Handler error:', error);
      }
    });
  }

  private handleSDKEvent = (event: SelectionInfo) => {
    const adapted = SelectionEventAdapter.fromSDKEvent(event);
    this.emitSelection(adapted);
  };

  private async handleNativeEvent() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      const selection = await SelectionEventAdapter.fromNativeEvent(this.getBlock);
      
      if (selection && selection.text !== this.lastSelectionText) {
        this.lastSelectionText = selection.text;
        this.emitSelection(selection);
      }
    }, this.debounceDelay);
  }

  onSelection(handler: SelectionHandler): () => void {
    this.handlers.add(handler);
    
    if (this.handlers.size === 1) {
      this.startNativeMonitoring();
    }

    return () => {
      this.handlers.delete(handler);
      
      if (this.handlers.size === 0) {
        this.stopNativeMonitoring();
      }
    };
  }

  private startNativeMonitoring() {
    const doc = getDocument();
    
    const handleMouseUp = () => {
      this.handleNativeEvent();
    };

    doc.addEventListener('mouseup', handleMouseUp);
    
    this.nativeEventCleanup = () => {
      doc.removeEventListener('mouseup', handleMouseUp);
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
    };
  }

  private stopNativeMonitoring() {
    if (this.nativeEventCleanup) {
      this.nativeEventCleanup();
      this.nativeEventCleanup = null;
    }
  }

  registerSDKEvents(): () => void {
    this.sdkEventCleanup = this.registerSDKEEvent(this.handleSDKEvent);
    return () => {
      if (this.sdkEventCleanup) {
        this.sdkEventCleanup();
        this.sdkEventCleanup = null;
      }
    };
  }

  destroy() {
    this.stopNativeMonitoring();
    if (this.sdkEventCleanup) {
      this.sdkEventCleanup();
    }
    this.handlers.clear();
  }
}

export function calculateToolbarPosition(
  selection: AdaptedSelection,
  containerWidth: number = 200,
  toolbarHeight: number = 32,
  padding: number = 3
): { x: number; y: number } {
  const viewportHeight = getWindow().innerHeight;
  const viewportWidth = getWindow().innerWidth;
  
  const rect = selection.rect;
  const spaceAbove = rect.top;
  const spaceBelow = viewportHeight - rect.bottom;

  let toolbarY: number;
  if (spaceAbove > toolbarHeight + 10) {
    toolbarY = rect.top - toolbarHeight - padding;
  } else {
    toolbarY = rect.bottom + padding;
  }

  let toolbarX = rect.left + rect.width / 2;

  if (toolbarX - containerWidth / 2 < 0) {
    toolbarX = containerWidth / 2;
  }
  if (toolbarX + containerWidth / 2 > viewportWidth) {
    toolbarX = viewportWidth - containerWidth / 2;
  }

  return { x: toolbarX, y: toolbarY };
}
