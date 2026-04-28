import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './modal.css';

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  isOpen?: boolean
  width?: string
  theme?: 'light' | 'dark'
}

const Modal = ({ title, onClose, children, isOpen = false, width = '90vw', theme = 'light' }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 25,
              duration: 0.25 
            }}
            className={`modal-container modal-${theme}`}
            style={{ width }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">{title}</h3>
              <button className="modal-close" onClick={onClose}>×</button>
            </div>
            <div className="modal-content">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;