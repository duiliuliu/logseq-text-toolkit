import React from 'react';
import ToolbarItem from '../ToolbarItem';
import { getToolbarPosition, getCurrentTheme } from '@/utils/state';
import '@/styles/toolbar.css';

const Toolbar = ({ items, onItemClick }) => {
  const position = getToolbarPosition();
  const theme = getCurrentTheme();

  return (
    <div 
      className={`toolbar toolbar-${theme}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
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