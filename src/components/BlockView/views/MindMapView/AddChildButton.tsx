/**
 * AddChildButton 添加子节点按钮组件
 */

import React from 'react';

interface AddChildButtonProps {
  onClick: () => void;
  visible: boolean;
}

export function AddChildButton({ onClick, visible }: AddChildButtonProps) {
  return (
    <button
      className={`ltt-mindmap-btn ltt-mindmap-add-btn ${visible ? 'visible' : ''}`}
      onClick={onClick}
      title="添加子节点"
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
      >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
  );
}
