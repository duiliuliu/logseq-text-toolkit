/**
 * 注释功能模块
 */

import { CommentConfig } from './types.ts';
import { updateBlockContent } from '../../lib/textReplace/utils.ts';
import type { SelectedData } from '../Toolbar/textProcessor.ts';
import { logseqAPI } from '../../logseq/index.ts';
import { t } from '../../translations/i18n.ts';
import { logger } from '../../lib/logger/logger.ts';

/**
 * 生成注释功能
 */
export const Comment = {
  /**
   * 将选中文本包装为注释
   * @param selectedText 选中文本
   * @param comment 注释内容
   * @returns 包装后的文本
   */
  wrapText: (selectedText: string, comment: string): string => {
    const escapedText = selectedText.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const escapedComment = comment.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `[:span.inline-comment {:data-comment "${escapedComment}"} "${escapedText}"]`;
  },

  /**
   * 从注释中提取原始文本和注释
   * @param htmlText 注释 HTML
   * @returns 原始文本和注释
   */
  unwrapText: (htmlText: string): CommentConfig => {
    const regex = /\[:span\.inline-comment\s*\{:data-comment\s*"([^"]*)"\}\s*"([^"]*)"\]/i;
    const match = htmlText.match(regex);
    if (match) {
      return {
        selectedText: match[2], comment: match[1] };
    }
    return { selectedText: '', comment: '' };
  },

  /**
   * 创建并保存注释
   * @param selectedData 选中的数据
   * @param comment 注释内容
   * @param language 语言代码
   * @returns 是否保存成功
   */
  createComment: async (selectedData: SelectedData, comment: string, language: string = 'zh-CN'): Promise<boolean> => {
    if (!selectedData || !selectedData.text) {
      return false;
    }

    try {
      const processedText = Comment.wrapText(selectedData.text, comment);
      
      const success = await updateBlockContent(
        selectedData, processedText, language
      );
      
      return success;
    } catch (error) {
      logger.error('Error creating comment:', error);
      try {
        logseqAPI.UI.showMsg(`${t('toolbar.commentFailed', language)}: ${error instanceof Error ? error.message : String(error)}`, { type: 'error' });
      } catch (uiError) {
        logger.error('Error showing message:', uiError);
      }
      return false;
    }
  }
};

export { CommentModal } from './CommentModal.tsx';
export type { CommentConfig, CommentModalProps } from './types.ts';
