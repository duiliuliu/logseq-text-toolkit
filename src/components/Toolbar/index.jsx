import React from 'react';
import ToolbarItem from '../ToolbarItem';
import { getToolbarPosition, getCurrentTheme } from '@/utils/state';
import '@/styles/toolbar.css';

const Toolbar = ({ items, onItemClick }) => {
  // 使用固定位置，确保在预览页面中可见
  const position = { x: 50, y: 50 };
  const theme = getCurrentTheme() || 'light';

  return (
    <div 
      className={`toolbar toolbar-${theme}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: 'fixed',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        color: '#333333'
      }}
    >
      {items.map((item, index) => (
        <ToolbarItem
          key={index}
          icon={item.icon}
          label={item.label}
          onClick={() => onItemClick(item.id)}
          isGroup={item.isGroup}
        >
          {item.children && item.children.map((child, childIndex) => (
            <ToolbarItem
              key={childIndex}
              icon={child.icon}
              label={child.label}
              onClick={() => onItemClick(child.id)}
            />
          ))}
        </ToolbarItem>
      ))}
    </div>
  );
};

export default Toolbar;