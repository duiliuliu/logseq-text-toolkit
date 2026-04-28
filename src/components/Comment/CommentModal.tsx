/**
 * 行内注释弹窗组件
 * 参考 Notion 极简风格设计
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
      // 获取光标位置并设置弹窗位置
      updateModalPosition();
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  // 更新弹窗位置
  const updateModalPosition = async () => {
    try {
      // 使用Logseq API获取编辑光标位置
      const cursorPosition = await logseqAPI.Editor.getEditingCursorPosition();
      if (cursorPosition && cursorPosition.rect) {
        // 计算弹窗位置，使其显示在光标下方
        const { top, left, height } = cursorPosition.rect;
        setPosition({
          top: top + height + 10, // 10px 间距
          left: left
        });
      } else {
        // 如果无法获取光标位置，使用默认居中位置
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

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="ltt-inline-comment-modal-overlay" 
        onClick={onClose} 
        onKeyDown={handleKeyDown}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <motion.div 
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
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5, scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {/* 头部 */}
          <div className="ltt-inline-comment-modal-header">
            <span className="ltt-inline-comment-modal-title">{t('inlineComment.addComment', currentLanguage)}</span>
            <button className="ltt-inline-comment-modal-close" onClick={onClose} aria-label="close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 选中文本显示 */}
          <div className="ltt-inline-comment-modal-selected-text">
            <span className="ltt-inline-comment-modal-selected-label">{t('inlineComment.selectedText', currentLanguage)}</span>
            <span className="ltt-inline-comment-modal-selected-content">"{selectedText}"</span>
          </div>

          {/* 内容 */}
          <div className="ltt-inline-comment-modal-content">
            <textarea
              ref={textareaRef}
              className="ltt-inline-comment-modal-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('inlineComment.placeholder', currentLanguage)}
              rows={1}
            />
          </div>

          {/* 底部按钮 */}
          <div className="ltt-inline-comment-modal-footer">
            <button
              className="ltt-inline-comment-modal-button ltt-secondary"
              onClick={handleSave}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                <path d="M16 4h2a2 2 0 0 1 2 2v2" />
              </svg>
              <span>{t('inlineComment.annotation', currentLanguage)}</span>
            </button>
            <button
              className="ltt-inline-comment-modal-button ltt-primary"
              onClick={handleSave}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>{t('inlineComment.comment', currentLanguage)}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommentModal;
