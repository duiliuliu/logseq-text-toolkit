/**
 * MindMapNode 节点组件
 */

import React, { useCallback, useState, useEffect } from 'react';
import type { MindMapNode as MindMapNodeType, MindMapState, MindMapStateManager } from '../../../../lib/blockView/mindMap/types';
import { MindMapBlockAPI } from '../../../../lib/blockView/mindMap/blockAPI';
import { createDebounceFn } from '../../../../lib/blockView/mindMap/debounce';
import { CollapseButton } from './CollapseButton';
import { AddChildButton } from './AddChildButton';
import { InlineEditor } from './InlineEditor';

interface MindMapNodeProps {
  node: MindMapNodeType;
  state: MindMapState;
  stateManager: MindMapStateManager;
  isRoot: boolean;
}

export function MindMapNode({ node, state, stateManager, isRoot }: MindMapNodeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const debouncedUpdate = useCallback(
    createDebounceFn(
      (uuid: string, content: string) => {
        MindMapBlockAPI.updateBlock(uuid, content);
      },
      500
    ),
    []
  );

  useEffect(() => {
    return () => debouncedUpdate.cancel();
  }, [debouncedUpdate]);

  const handleContentChange = useCallback(
    (content: string) => {
      stateManager.setState(prev => ({
        nodes: new Map(prev.nodes).set(node.uuid, {
          ...prev.nodes.get(node.uuid)!,
          content,
        }),
      }));
      debouncedUpdate(node.uuid, content);
    },
    [node.uuid, stateManager, debouncedUpdate]
  );

  const handleAddChild = useCallback(async () => {
    try {
      const newUuid = await MindMapBlockAPI.addChild(node.uuid, '');
      if (newUuid) {
        await stateManager.loadTree();
        setTimeout(() => {
          stateManager.setState({ editingNode: newUuid });
        }, 100);
      }
    } catch (error) {
      console.error('Failed to add child:', error);
    }
  }, [node.uuid, stateManager]);

  const handleToggleCollapse = useCallback(() => {
    const newCollapsed = !node.collapsed;
    stateManager.setState(prev => ({
      nodes: new Map(prev.nodes).set(node.uuid, {
        ...prev.nodes.get(node.uuid)!,
        collapsed: newCollapsed,
      }),
    }));
    MindMapBlockAPI.setCollapsed(node.uuid, newCollapsed);
  }, [node.uuid, node.collapsed, stateManager]);

  const hasChildren = node.children.length > 0;
  const isCollapsed = node.collapsed;

  return (
    <div
      className={`ltt-mindmap-node ${isRoot ? 'ltt-mindmap-node-root' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="ltt-mindmap-node-content">
        {hasChildren && (
          <CollapseButton
            collapsed={isCollapsed}
            onClick={handleToggleCollapse}
            visible={isHovered || isCollapsed}
          />
        )}

        <InlineEditor
          content={node.content}
          onChange={handleContentChange}
          onFocus={() => stateManager.setState({ editingNode: node.uuid })}
          onBlur={() => stateManager.setState({ editingNode: null })}
          placeholder="请输入文字"
        />

        <AddChildButton
          onClick={handleAddChild}
          visible={isHovered}
        />
      </div>

      {hasChildren && !isCollapsed && (
        <div className="ltt-mindmap-node-children">
          {node.children.map(childUuid => {
            const childNode = state.nodes.get(childUuid);
            return childNode ? (
              <MindMapNode
                key={childUuid}
                node={childNode}
                state={state}
                stateManager={stateManager}
                isRoot={false}
              />
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
