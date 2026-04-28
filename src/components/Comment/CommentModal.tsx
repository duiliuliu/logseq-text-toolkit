/**
 * 行内注释弹窗组件
 * 参考 shadn 和 notion 极简风格设计
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommentModalProps } from './types.ts';
import { t } from '../../translations/i18n.ts';
import { useSettingsContext } from '../../settings/useSettings.tsx';
import { logseqAPI } from '../../logseq/index.ts';
import './inlineComment.css';

export const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  selectedData,
  onClose,
  onSave
}) => {
  const selectedText = selectedData.text;
  const [comment, setComment] = useState('');
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettingsContext();
  
  // 获取当前语言，默认为 zh-CN
  const currentLanguage = settings?.language || 'zh-CN';

  useEffect(() => {
    if (isOpen) {
      setComment('');
      updateModalPosition();
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  const updateModalPosition = async () => {
    try {
      const cursorPosition = await logseqAPI.Editor.getEditingCursorPosition();
      if (cursorPosition && cursorPosition.rect) {
        const { top, left, height } = cursorPosition.rect;
        setPosition({
          top: top + height + 10,
          left: left
        });
      } else {
        setPosition(null);
      }
    } catch (error) {
      console.warn('Error getting cursor position:', error);
      setPosition(null);
    }
  };

  const handleSave = () => {
    if (!comment.trim()) {
      return;
    }
    onSave?.({ selectedText, comment });
    onClose?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose?.();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="ltt-inline-comment-modal-overlay"
          onClick={onClose}
          onKeyDown={handleKeyDown}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.2 }}
            ref={modalRef}
            className="ltt-inline-comment-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: position ? 'fixed' : 'relative',
              top: position ? `${position.top}px` : 'auto',
              left: position ? `${position.left}px` : 'auto',
              margin: position ? 0 : '20px',
              transform: position ? 'none' : 'translateY(0)',
              maxWidth: '420px',
              width: '90%'
            }}
          >
            <div className="ltt-inline-comment-modal-header">
              <div className="ltt-inline-comment-modal-title">
                <span className="ltt-inline-comment-modal-title-text">{t('inlineComment.text', currentLanguage)}</span>
                <span className="ltt-inline-comment-modal-title-selected">{selectedText}</span>
              </div>
              <button className="ltt-inline-comment-modal-close" onClick={onClose} aria-label="close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="ltt-inline-comment-modal-content">
              <textarea
                ref={textareaRef}
                className="ltt-inline-comment-modal-textarea"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('inlineComment.placeholder', currentLanguage)}
              />
            </div>
            <div className="ltt-inline-comment-modal-footer">
              <button className="ltt-inline-comment-modal-button ltt-primary" onClick={handleSave}>
                {t('inlineComment.save', currentLanguage)}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommentModal;