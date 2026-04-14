import React, { useState } from 'react';
import '../../styles/toolbar.css';

const ToolbarItem = ({ icon, label, onClick, children, isGroup = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="toolbar-item" 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {icon && <span className="toolbar-icon">{icon}</span>}
      {label && <span className="toolbar-label">{label}</span>}
      {isGroup && children && isHovered && (
        <div className="toolbar-group">
          {children}
        </div>
      )}
    </div>
  );
};

export default ToolbarItem;