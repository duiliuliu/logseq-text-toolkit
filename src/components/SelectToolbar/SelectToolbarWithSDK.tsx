/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * SelectToolbar SDK 集成示例
 * 展示如何使用 logseqAPI.Editor.onInputSelectionEnd 实现文本选择检测
 */

import React, { useState, useEffect, useRef } from 'react';
import { logseqAPI } from '../../logseq/index.ts';
import { SelectionEventAdapter, calculateToolbarPosition, type AdaptedSelection } from '../../lib/toolbar/SelectionManager.ts';

interface SelectToolbarWithSDKProps {
  targetElement: HTMLElement | null;
  onSelection?: (selection: AdaptedSelection) => void;
}

export function SelectToolbarWithSDK({
  targetElement,
  onSelection
}: SelectToolbarWithSDKProps) {
  const [selection, setSelection] = useState<AdaptedSelection | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!targetElement) return;

    const handleSDKSelection = async (event: any) => {
      try {
        const adaptedSelection = SelectionEventAdapter.fromSDKEvent(event);
        
        const block = await logseqAPI.Editor.getCurrentBlock();
        const enrichedSelection = block
          ? SelectionEventAdapter.enrichWithContext(adaptedSelection, block)
          : adaptedSelection;

        setSelection(enrichedSelection);
        
        const containerWidth = containerRef.current?.offsetWidth || 200;
        const pos = calculateToolbarPosition(enrichedSelection, containerWidth);
        setPosition(pos);
        
        setVisible(true);
        
        onSelection?.(enrichedSelection);
      } catch (error) {
        console.error('[SelectToolbarWithSDK] Selection handler error:', error);
      }
    };

    const unregister = logseqAPI.Editor.onInputSelectionEnd(handleSDKSelection);

    return () => {
      unregister();
    };
  }, [targetElement, onSelection]);

  if (!visible || !selection) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="ltt-floating-toolbar"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        transform: 'translateX(-50%)',
        zIndex: 10000,
      }}
    >
      <div className="ltt-toolbar-content">
        <span>Selected: {selection.text}</span>
      </div>
    </div>
  );
}

export default SelectToolbarWithSDK;
