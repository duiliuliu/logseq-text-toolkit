import React from 'react';
import './index.css';

interface ToolbarItemProps {
  icon?: React.ReactNode
  label?: string
  onClick?: () => void
  children?: React.ReactNode
  isGroup?: boolean
}

const ToolbarItem = ({ icon, label, onClick, children, isGroup = false }: ToolbarItemProps) => {
  return (
    <div className="toolbar-item" onClick={onClick}>
      {icon && <span className="toolbar-icon">{icon}</span>}
      {label && <span className="toolbar-label">{label}</span>}
      {isGroup && children && (
        <div className="toolbar-group">
          {children}
        </div>
      )}
    </div>
  );
};

export default ToolbarItem;