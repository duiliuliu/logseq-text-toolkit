/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * SelectToolbar SDK 集成示例
 * 展示如何使用 logseqAPI.Editor.onInputSelectionEnd 实现文本选择检测
 */

import { useState, useEffect, useRef } from 'react';
import { logseqAPI } from '../../logseq/index.ts';
import type { SelectedData } from '../Toolbar/types.ts';
import {
  calculateToolbarPositionFromPoint,
  createSelectionFromSDKEvent,
  type SDKSelectionEvent,
} from '../../lib/toolbar/selection.ts';

interface SelectToolbarWithSDKProps {
  targetElement: HTMLElement | null;
  onSelection?: (selection: SelectedData) => void;
}

export function SelectToolbarWithSDK({
  onSelection
}: SelectToolbarWithSDKProps) {
  const [selection, setSelection] = useState<SelectedData | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!logseqAPI.Editor?.onInputSelectionEnd) {
      return;
    }

    const handleSDKSelection = async (event: SDKSelectionEvent) => {
      try {
        const block = await logseqAPI.Editor.getCurrentBlock();
        const adaptedSelection = createSelectionFromSDKEvent(event, block);

        if (!adaptedSelection.text) {
          setVisible(false);
          return;
        }

        setSelection(adaptedSelection);

        const containerWidth = containerRef.current?.offsetWidth || 200;
        const anchor = adaptedSelection.point ?? {
          x: adaptedSelection.rect?.left ?? 0,
          y: adaptedSelection.rect?.top ?? 0,
        };
        setPosition(calculateToolbarPositionFromPoint(anchor, containerWidth));
        setVisible(true);

        onSelection?.(adaptedSelection);
      } catch (error) {
        console.error('[SelectToolbarWithSDK] Selection handler error:', error);
      }
    };

    const unregister = logseqAPI.Editor.onInputSelectionEnd(handleSDKSelection);

    return () => {
      unregister();
    };
  }, [onSelection]);

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
