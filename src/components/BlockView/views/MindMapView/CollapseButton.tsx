/**
 * CollapseButton 折叠按钮组件
 */

import React from 'react';

interface CollapseButtonProps {
  collapsed: boolean;
  onClick: () => void;
  visible: boolean;
}

export function CollapseButton({ collapsed, onClick, visible }: CollapseButtonProps) {
  return (
    <button
      className={`ltt-mindmap-btn ltt-mindmap-collapse-btn ${visible ? 'visible' : ''}`}
      onClick={onClick}
      title={collapsed ? '展开' : '折叠'}
    >
      <svg 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ 
          transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
  );
}
