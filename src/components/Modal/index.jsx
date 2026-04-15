import React, { useState } from 'react';
import { getCurrentTheme } from '../../utils/state';
import './modal.css';

const Modal = ({ title, onClose, onSubmit, placeholder = '请输入内容' }) => {
  const [content, setContent] = useState('');
  const theme = getCurrentTheme();

  const handleSubmit = () => {
    onSubmit(content);
    setContent('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className={`modal modal-${theme}`}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <textarea
            className="modal-input"
            placeholder={placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
        </div>
        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose}>取消</button>
          <button className="modal-submit" onClick={handleSubmit}>确定</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;