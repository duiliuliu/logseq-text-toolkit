import React from 'react';
import './modal.css';

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  isOpen?: boolean
  width?: string
  theme?: 'light' | 'dark'
}

const Modal = ({ title, onClose, children, isOpen = false, width = 'auto', theme = 'light' }: ModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className={`modal-container modal-${theme}`} style={{ width: width === 'auto' ? 'max-content' : width, maxWidth: '90vw', maxHeight: '90vh' }}>
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