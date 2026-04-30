/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 注释功能模块
 */

import { CommentConfig } from './types.ts';

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
    const escapedText = selectedText
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    const escapedComment = comment
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
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
  }
};

export { CommentModal } from './CommentModal.tsx';
export type { CommentConfig, CommentModalProps } from './types.ts';
