/**
 * MindMapView 主容器组件
 */

import React, { useEffect, useState } from 'react';
import { MindMapStateManager } from '../../../../lib/blockView/mindMap/state';
import { MindMapCanvas } from './MindMapCanvas';
import { getSettingsWithSystem } from '../../../../settings';
import type { MindMapColorScheme, MindMapThemeName } from '../../../../lib/blockView/mindMap/types';
import { MIND_MAP_THEMES } from '../../../../lib/blockView/mindMap/themes';
import './mindMapView.css';

interface MindMapViewProps {
  rootUuid: string;
}

export function MindMapView({ rootUuid }: MindMapViewProps) {
  const [stateManager] = useState(() => new MindMapStateManager(rootUuid));
  const [state, setState] = useState(stateManager.getState());
  const [colorScheme, setColorScheme] = useState<MindMapColorScheme>(MIND_MAP_THEMES.pure.scheme);

  useEffect(() => {
    return stateManager.subscribe(newState => {
      setState(newState);
    });
  }, [stateManager]);

  useEffect(() => {
    stateManager.loadTree();
  }, [stateManager]);

  useEffect(() => {
    async function loadSettings() {
      const settings = await getSettingsWithSystem();
      const themeName = settings?.blockView?.mindMap?.theme as MindMapThemeName || 'pure';
      const customColors = settings?.blockView?.mindMap?.customColors as Partial<MindMapColorScheme> || {};
      
      const themeScheme = MIND_MAP_THEMES[themeName]?.scheme || MIND_MAP_THEMES.pure.scheme;
      setColorScheme({ ...themeScheme, ...customColors });
    }
    loadSettings();
  }, []);

  return (
    <div className="ltt-mindmap-view" style={{
      '--mindmap-bg-color': colorScheme.backgroundColor,
      '--mindmap-node-border-color': colorScheme.nodeBorderColor,
      '--mindmap-node-border-width': colorScheme.nodeBorderWidth,
      '--mindmap-node-border-radius': colorScheme.nodeBorderRadius,
      '--mindmap-node-bg-color': colorScheme.nodeBackgroundColor,
      '--mindmap-node-hover-bg-color': colorScheme.nodeHoverBackgroundColor,
      '--mindmap-text-color': colorScheme.textColor,
      '--mindmap-text-hover-color': colorScheme.textHoverColor,
      '--mindmap-font-size': colorScheme.fontSize,
      '--mindmap-font-weight': colorScheme.fontWeight,
      '--mindmap-line-color': colorScheme.lineColor,
      '--mindmap-line-width': colorScheme.lineWidth,
      '--mindmap-line-style': colorScheme.lineStyle,
      '--mindmap-button-color': colorScheme.buttonColor,
      '--mindmap-button-hover-color': colorScheme.buttonHoverColor,
    } as React.CSSProperties}>
      <hr className="ltt-mindmap-divider" />
      <MindMapCanvas state={state} stateManager={stateManager} />
    </div>
  );
}
