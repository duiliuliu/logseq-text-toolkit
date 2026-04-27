/**
 * 评论执行器
 */

import type { ActionExecutorFn } from '../types.ts';
import type { ToolbarItem } from '../../../components/Toolbar/types.ts';
import type { SelectedData } from '../../../components/Toolbar/textProcessor.ts';
import { Comment } from '../../../components/Comment/index.ts';
import { logseqAPI } from '../../../logseq/index.ts';
import { t } from '../../../translations/i18n.ts';
import { logger } from '../../logger/logger.ts';

/**
 * 内联评论执行器
 */
export const inlineCommentExecutor: ActionExecutorFn = async (item: ToolbarItem, selectedData: SelectedData): Promise<string> => {
  try {
    // 直接调用Comment.createComment方法
    // 这里可以根据需要弹出评论输入框，或者使用默认评论模板
    const commentTemplate = item.invokeParams || '';
    
    // 这里简化处理，使用模板作为评论内容
    // 实际应用中，应该弹出一个模态框让用户输入评论
    const success = await Comment.createComment(selectedData, commentTemplate);
    
    if (success) {
      logseqAPI.UI.showMsg(t('toolbar.commentSuccess', 'zh-CN'), { type: 'success' });
    }
  } catch (error) {
    logger.error('Error executing inline comment:', error);
    try {
      logseqAPI.UI.showMsg(`${t('toolbar.commentFailed', 'zh-CN')}: ${error instanceof Error ? error.message : String(error)}`, { type: 'error' });
    } catch (uiError) {
      logger.error('Error showing message:', uiError);
    }
  }
  return selectedData.text;
};
