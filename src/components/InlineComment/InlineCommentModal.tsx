/**
 * 行内注释弹窗组件
 * 参考 shadn 和 notion 极简风格设计
 */

import React, { useState, useEffect, useRef } from 'react';
import { InlineCommentModalProps } from '../../lib/inlineComment/types.ts';
import { t } from '../../translations/i18n.ts';
import { logseqAPI } from '../../logseq/index.ts';
import { InlineComment } from '../../lib/inlineComment/index.ts';
import { eventBus } from '../../lib/toolbar/index.ts';
import './inlineComment.css';

export const InlineCommentModal: React.FC<InlineCommentModalProps> = ({
  isOpen,
  selectedText,
  onClose,
  buttons
}) => {
  const [comment, setComment] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setComment('');
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!comment.trim()) {
      return;
    }

    try {
      const processedText = InlineComment.wrapText(selectedText, comment);
      const block = await logseqAPI.Editor.getCurrentBlock();
      
      if (!block || !block.content) {
        console.warn('No block or block content');
        onClose?.();
        return;
      }
      
      const originalContent = block.content;
      
      // 使用精确的替换方法
      const index = originalContent.indexOf(selectedText);
      let newContent: string;
      
      if (index === -1) {
        console.warn('Selected text not found in block content');
        newContent = originalContent.replace(selectedText, processedText);
      } else {
        newContent = originalContent.substring(0, index) + processedText + originalContent.substring(index + selectedText.length);
      }
      
      await logseqAPI.Editor.updateBlock(block.uuid, newContent);
      
      // 发布文本处理完成事件
      eventBus.emit('ltt-textProcessed', {
        processedText,
        originalItem: { id: 'wrap-inline-comment', label: 'Inline Comment', funcmode: 'invoke', clickfunc: 'inlineComment' } as any
      });
    } catch (error) {
      console.warn('Error updating block with inline comment:', error);
    }
    
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
            <span className="inline-comment-modal-title-text">文本</span>
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
            placeholder={t('inlineComment.placeholder', 'zh-CN')}
          />
        </div>

        {/* 底部按钮 */}
        <div className="inline-comment-modal-footer">
          {buttons ? (
            buttons.map((button) => (
              <button
                key={button.id}
                className={`inline-comment-modal-button ${button.primary ? 'primary' : ''}`}
                onClick={() => button.onClick({ selectedText, comment })}
              >
                {button.label}
              </button>
            ))
          ) : (
            <button
              className="inline-comment-modal-button primary"
              onClick={handleSave}
            >
              {t('inlineComment.save', 'zh-CN')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InlineCommentModal;
