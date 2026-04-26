/**
 * 行内注释弹窗组件
 * 参考 shadn 和 notion 极简风格设计
 */

import React, { useState, useEffect, useRef } from 'react';
import { CommentModalProps } from './types.ts';
import { t } from '../../translations/i18n.ts';
import { useSettingsContext } from '../../settings/useSettings.tsx';
import './inlineComment.css';

export const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  selectedData,
  onClose,
  onSave
}) => {
  const selectedText = selectedData.text;
  const [comment, setComment] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { settings } = useSettingsContext();
  
  // 获取当前语言，默认为 zh-CN
  const currentLanguage = settings?.language || 'zh-CN';

  useEffect(() => {
    if (isOpen) {
      setComment('');
      textareaRef.current?.focus();
    }
  }, [isOpen]);

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
    <div className="inline-comment-modal-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
      <div className="inline-comment-modal" onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <div className="inline-comment-modal-header">
          <div className="inline-comment-modal-title">
            <span className="inline-comment-modal-title-text">{t('inlineComment.text', currentLanguage)}</span>
            <span className="inline-comment-modal-title-selected">{selectedText}</span>
          </div>
          <button className="inline-comment-modal-close" onClick={onClose} aria-label="close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容 */}
        <div className="inline-comment-modal-content">
          <textarea
            ref={textareaRef}
            className="inline-comment-modal-textarea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('inlineComment.placeholder', currentLanguage)}
          />
        </div>

        {/* 底部按钮 */}
        <div className="inline-comment-modal-footer">
          <button
            className="inline-comment-modal-button primary"
            onClick={handleSave}
          >
            {t('inlineComment.save', currentLanguage)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
