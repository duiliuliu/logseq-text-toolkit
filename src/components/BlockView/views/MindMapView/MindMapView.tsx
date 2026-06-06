/**
 * MindMapView - Canvas 渲染版本
 * 保持与其他视图的一致性，Root Node 保持原生渲染
 */

import React, { useRef, useEffect, useState } from 'react';
import { MindMapStateManager } from '../../../../lib/blockView/mindMap/state';
import { MindMapCanvasRenderer } from '../../../../lib/blockView/mindMap/CanvasRenderer';
import { getSettingsWithSystem } from '../../../../settings';
import { MindMapBlockAPI } from '../../../../lib/blockView/mindMap/blockAPI';
import { createDebounceFn } from '../../../../lib/blockView/mindMap/debounce';
import { MIND_MAP_THEMES } from '../../../../lib/blockView/mindMap/themes';
import type { MindMapColorScheme, MindMapThemeName } from '../../../../lib/blockView/mindMap/types';
import './mindMapView.css';

interface MindMapViewProps {
  rootUuid: string;
  content?: string;
  children?: any[];
}

export function MindMapView({ rootUuid, content, children }: MindMapViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stateManager] = useState(() => new MindMapStateManager(rootUuid));
  const [renderer, setRenderer] = useState<MindMapCanvasRenderer | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // 加载初始数据
  useEffect(() => {
    stateManager.loadTree();
  }, [stateManager]);

  // 初始化 Canvas 渲染器
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const themeName = 'pure' as MindMapThemeName;
    const newRenderer = new MindMapCanvasRenderer(
      canvasRef.current,
      stateManager.getState().nodes,
      rootUuid,
      themeName
    );
    
    setRenderer(newRenderer);
    
    return () => {
      setRenderer(null);
    };
  }, [rootUuid]);

  // 更新 Canvas 渲染
  useEffect(() => {
    if (renderer) {
      renderer.updateNodes(stateManager.getState().nodes, rootUuid);
    }
  }, [stateManager.getState().nodes, renderer, rootUuid]);

  // 处理鼠标移动
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !renderer) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    renderer.handleMouseMove(x, y);
  };

  // 处理点击
  const handleClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !renderer) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const { action, nodeUuid } = renderer.handleClick(x, y);
    
    if (action === 'toggle-collapse' && nodeUuid) {
      // 切换折叠状态
      stateManager.setState(prev => {
        const nodes = new Map(prev.nodes);
        const node = nodes.get(nodeUuid);
        if (node) {
          nodes.set(nodeUuid, { ...node, collapsed: !node.collapsed });
        }
        return { ...prev, nodes };
      });
    } else if (action === 'add-child' && nodeUuid) {
      // 添加子节点
      const newUuid = await MindMapBlockAPI.addChild(nodeUuid, '');
      if (newUuid) {
        await stateManager.loadTree();
        setEditingNode(newUuid);
        setEditingValue('');
      }
    } else if (action === 'edit' && nodeUuid) {
      // 编辑节点
      const node = stateManager.getState().nodes.get(nodeUuid);
      if (node) {
        setEditingNode(nodeUuid);
        setEditingValue(node.content);
      }
    }
  };

  // 防抖更新节点内容
  const debouncedUpdate = createDebounceFn(
    async (uuid: string, value: string) => {
      await MindMapBlockAPI.updateBlock(uuid, value);
      await stateManager.loadTree();
    },
    500
  );

  return (
    <div className="ltt-mindmap-view" ref={containerRef}>
      {/* MindMap Canvas 区域 - 带缩进与 Root Node 对齐 */}
      <div className="ltt-mindmap-canvas-container">
        <canvas
          ref={canvasRef}
          className="ltt-mindmap-canvas"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        />
        
        {/* 编辑输入框 - 仅在编辑时显示 */}
        {editingNode && (
          <input
            type="text"
            className="ltt-mindmap-edit-input"
            value={editingValue}
            onChange={(e) => {
              setEditingValue(e.target.value);
              debouncedUpdate(editingNode, e.target.value);
            }}
            onBlur={() => {
              setEditingNode(null);
              // 确保保存最终值
              if (editingValue) {
                MindMapBlockAPI.updateBlock(editingNode, editingValue);
              }
            }}
            autoFocus
          />
        )}
      </div>
    </div>
  );
}
