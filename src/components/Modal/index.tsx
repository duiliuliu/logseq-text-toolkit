import React, { useEffect, useState } from 'react';
import './modal.css';

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  isOpen?: boolean
  width?: string | 'auto'
  theme?: 'light' | 'dark'
  resizeObserverTarget?: string // DOM element ID to observe for resizing
}

const Modal = ({ title, onClose, children, isOpen = false, width = '400px', theme = 'light', resizeObserverTarget }: ModalProps) => {
  const [modalWidth, setModalWidth] = useState(width);

  useEffect(() => {
    if (!isOpen) return;

    // Set initial width
    setModalWidth(width);

    // Set up resize observer if target is provided
    if (resizeObserverTarget) {
      const targetElement = document.getElementById(resizeObserverTarget);
      if (targetElement) {
        const updateSize = () => {
          // Calculate modal width based on target element
          const targetWidth = targetElement.clientWidth;
          const newWidth = Math.min(targetWidth * 0.9, 800); // 90% of target width, max 800px
          setModalWidth(`${newWidth}px`);
        };

        // Initial update
        updateSize();

        // Create resize observer
        const observer = new ResizeObserver(updateSize);
        observer.observe(targetElement);

        // Cleanup
        return () => {
          observer.disconnect();
        };
      }
    }
  }, [isOpen, width, resizeObserverTarget]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className={`modal-container modal-${theme}`} style={{ width: modalWidth }}>
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