import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { getToolbarPosition, getCurrentTheme } from '../../utils/state';
import '../../styles/toolbar.css';

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
      <ToggleGroup type="multiple" className="flex gap-1">
        {items.map((item, index) => (
          <ToggleGroupItem
            key={index}
            value={item.id}
            onClick={() => onItemClick(item.id)}
            className="px-3 py-1 rounded-md hover:bg-gray-100"
          >
            <div className="flex items-center gap-1">
              {item.icon && <span className="font-bold">{item.icon}</span>}
              {item.label && <span>{item.label}</span>}
            </div>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
};

export default Toolbar;