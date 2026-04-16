import React, { useState } from 'react';
import { getCurrentTheme } from '../../utils/state';
import './modal.css';

const Modal = ({ title, onClose, children, isOpen = false, width = '400px' }) => {
  const theme = getCurrentTheme();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className={`modal-container modal-${theme}`} style={{ width }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;