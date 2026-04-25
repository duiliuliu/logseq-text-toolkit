/**
 * 行内注释功能模块
 */

import { logseqAPI } from '../../logseq/index.ts';
import { InlineCommentConfig } from './types.ts';

/**
 * 生成行内注释功能
 */
export const InlineComment = {
  /**
   * 将选中文本包装为行内注释
   * @param selectedText 选中文本
   * @param comment 注释内容
   * @returns 包装后的文本
   */
  wrapText: (selectedText: string, comment: string): string => {
    const escapedText = selectedText.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const escapedComment = comment.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<span class="inline-comment" data-comment="${escapedComment}">${escapedText}</span>`;
  },

  /**
   * 从行内注释中提取原始文本和注释
   * @param htmlText 行内注释 HTML
   * @returns 原始文本和注释
   */
  unwrapText: (htmlText: string): InlineCommentConfig => {
    const regex = /<span[^>]*data-comment="([^"]*)"[^>]*>([^<]*)<\/span>/i;
    const match = htmlText.match(regex);
    if (match) {
      return {
        selectedText: match[2], comment: match[1] };
    }
    return { selectedText: '', comment: '' };
  }
};

export default InlineComment;
