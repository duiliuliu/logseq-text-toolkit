/**
 * ConnectionLines 连接线组件
 */

import React from 'react';
import type { MindMapNode } from '../../../../lib/blockView/mindMap/types';

interface ConnectionLinesProps {
  nodes: Map<string, MindMapNode>;
  rootUuid: string;
}

export function ConnectionLines({ nodes, rootUuid }: ConnectionLinesProps) {
  const lines: React.ReactNode[] = [];
  
  const rootNode = nodes.get(rootUuid);
  if (!rootNode) return null;

  const renderLines = (parentUuid: string, parentLevel: number) => {
    const parentNode = nodes.get(parentUuid);
    if (!parentNode) return;

    parentNode.children.forEach((childUuid, index) => {
      const childNode = nodes.get(childUuid);
      if (!childNode) return;

      const lineKey = `${parentUuid}-${childUuid}`;
      lines.push(
        <svg key={lineKey} className="ltt-mindmap-connection-line">
          <path
            d={`M 0 0 L 20 0 L 20 ${index * 80 + 40} L 40 ${index * 80 + 40}`}
            className="ltt-mindmap-path"
          />
        </svg>
      );

      if (childNode.children.length > 0 && !childNode.collapsed) {
        renderLines(childUuid, parentLevel + 1);
      }
    });
  };

  renderLines(rootUuid, 0);

  return (
    <div className="ltt-mindmap-connections">
      {lines}
    </div>
  );
}
