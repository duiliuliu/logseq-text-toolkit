/**
 * MindMapCanvas 思维导图画布组件
 */

import React from 'react';
import type { MindMapState, MindMapStateManager } from '../../../../lib/blockView/mindMap/types';
import { MindMapNode } from './MindMapNode';
import { ConnectionLines } from './ConnectionLines';

interface MindMapCanvasProps {
  state: MindMapState;
  stateManager: MindMapStateManager;
}

export function MindMapCanvas({ state, stateManager }: MindMapCanvasProps) {
  const { nodes, rootBlockUuid } = state;
  const rootNode = nodes.get(rootBlockUuid);

  if (!rootNode) {
    return <div className="ltt-mindmap-loading">Loading...</div>;
  }

  return (
    <div className="ltt-mindmap-canvas">
      <ConnectionLines nodes={nodes} rootUuid={rootBlockUuid} />
      
      <div className="ltt-mindmap-nodes">
        <div className="ltt-mindmap-root-wrapper">
          <MindMapNode
            node={rootNode}
            state={state}
            stateManager={stateManager}
            isRoot={true}
          />
          
          <div className="ltt-mindmap-children">
            {rootNode.children.map(childUuid => {
              const childNode = nodes.get(childUuid);
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
        </div>
      </div>
    </div>
  );
}
