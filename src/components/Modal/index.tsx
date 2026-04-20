import React, { useState, useEffect } from 'react';
import './modal.css';

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  isOpen?: boolean
  width?: string
  theme?: 'light' | 'dark'
}

const Modal = ({ title, onClose, children, isOpen = false, width = '400px', theme = 'light' }: ModalProps) => {
  const [modalWidth, setModalWidth] = useState(width);

  useEffect(() => {
    const updateModalWidth = () => {
      const rootElement = document.getElementById('root');
      if (rootElement) {
        const rootWidth = rootElement.clientWidth;
        // 设置模态框宽度为 root 元素宽度的 80%，但不超过 800px
        const newWidth = Math.min(rootWidth * 0.8, 800);
        setModalWidth(`${newWidth}px`);
      }
    };

    // 初始更新
    updateModalWidth();

    // 监听 rootResize 事件
    window.addEventListener('rootResize', updateModalWidth);
    // 监听窗口 resize 事件
    window.addEventListener('resize', updateModalWidth);

    return () => {
      window.removeEventListener('rootResize', updateModalWidth);
      window.removeEventListener('resize', updateModalWidth);
    };
  }, []);

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