/**
 * 行内注释弹窗组件
 * 极简紧凑设计风格
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommentModalProps } from './types.ts';
import { t } from '../../translations/i18n.ts';
import { useSettingsContext } from '../../settings/useSettings.tsx';
import { logseqAPI } from '../../logseq/index.ts';
import { Textarea } from '../ui/textarea.tsx';
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
          transition={{ duration: 0.15 }}
          className="ltt-inline-comment-modal-overlay"
          onClick={onClose}
          onKeyDown={handleKeyDown}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25, duration: 0.18 }}
            ref={modalRef}
            className="ltt-inline-comment-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: position ? 'fixed' : 'relative',
              top: position ? `${position.top}px` : 'auto',
              left: position ? `${position.left}px` : 'auto',
              margin: position ? 0 : '20px',
              transform: position ? 'none' : 'translateY(0)',
              maxWidth: '400px',
              width: '90%'
            }}
          >
            <div className="ltt-inline-comment-modal-header">
              <span className="ltt-inline-comment-modal-title">{t('inlineComment.addComment', currentLanguage)}</span>
              <button className="ltt-inline-comment-modal-close" onClick={onClose} aria-label="close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedText && (
              <div className="ltt-inline-comment-modal-selected">
                <span className="ltt-inline-comment-modal-selected-text">"{selectedText}"</span>
              </div>
            )}

            <div className="ltt-inline-comment-modal-content">
              <Textarea
                ref={textareaRef}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('inlineComment.placeholder', currentLanguage)}
                rows={2}
              />
            </div>

            <div className="ltt-inline-comment-modal-footer">
              <button className="ltt-inline-comment-modal-btn ltt-btn-primary" onClick={handleSave}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>{t('inlineComment.annotate', currentLanguage)}</span>
              </button>
              <button className="ltt-inline-comment-modal-btn ltt-btn-primary" onClick={handleSave}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>{t('inlineComment.comment', currentLanguage)}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommentModal;