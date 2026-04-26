/**
 * CommentManager 组件
 * 独立管理评论功能，通过事件总线与其他组件通信
 */

import React, { useState, useEffect, useRef } from 'react';
import { CommentModal } from './CommentModal.tsx';
import { Comment } from './index.ts';
import { SelectedData } from '../Toolbar/textProcessor.ts';
import { t } from '../../translations/i18n.ts';
import { useSettingsContext } from '../../settings/useSettings.tsx';
import { eventBus } from '../../lib/toolbar/index.ts';
import { updateBlockContent } from '../../lib/textReplace/utils.ts';

interface CommentState {
  isOpen: boolean;
  selectedData: SelectedData | null;
}

export const CommentManager: React.FC = () => {
  const [commentState, setCommentState] = useState<CommentState>({
    isOpen: false,
    selectedData: null
  });
  const { settings } = useSettingsContext();
  const currentLanguage = settings?.language || 'zh-CN';

  useEffect(() => {
    // 监听评论调用事件
    const handleInvokeComment = (data: { selectedData: SelectedData }) => {
      setCommentState({
        isOpen: true,
        selectedData: data.selectedData
      });
    };

    eventBus.on('ltt-invoke:comment', handleInvokeComment);

    return () => {
      eventBus.off('ltt-invoke:comment', handleInvokeComment);
    };
  }, []);

  const handleClose = () => {
    setCommentState({
      isOpen: false,
      selectedData: null
    });
  };

  const handleSave = async (data: { selectedText: string; comment: string }) => {
    if (!commentState.selectedData) {
      return;
    }

    try {
      const processedText = Comment.wrapText(data.selectedText, data.comment);
      
      const success = await updateBlockContent(
        commentState.selectedData, processedText, currentLanguage
      );
      
      if (success) {
        // 发布评论完成事件
        eventBus.emit('ltt-comment:completed', {
          blockId: commentState.selectedData.block?.uuid || '',
          comment: data.comment,
          success: true
        });
      }
    } catch (error) {
      console.warn('Error updating block with inline comment:', error);
      // 发布评论完成事件（失败）
      eventBus.emit('ltt-comment:completed', {
        blockId: commentState.selectedData?.block?.uuid || '',
        comment: data.comment,
        success: false
      });
    }
    
    handleClose();
  };

  if (!commentState.isOpen || !commentState.selectedData) {
    return null;
  }

  return (
    <CommentModal
      isOpen={commentState.isOpen}
      selectedData={commentState.selectedData}
      onClose={handleClose}
      onSave={handleSave}
    />
  );
};

export default CommentManager;
