/**
 * 评论执行器
 */

import type { ActionExecutorFn } from '../types.ts';
import type { ToolbarItem } from '../../../components/Toolbar/types.ts';
import type { SelectedData } from '../../../components/Toolbar/textProcessor.ts';
import { eventBus } from '../EventBus.ts';

/**
 * 评论执行器
 */
export const commentExecutor: ActionExecutorFn = async (item: ToolbarItem, selectedData: SelectedData): Promise<string> => {
  // 发布评论调用事件
  eventBus.emit('ltt-invoke:comment', { selectedData });
  return selectedData.text;
};

/**
 * 内联评论执行器
 */
export const inlineCommentExecutor: ActionExecutorFn = async (item: ToolbarItem, selectedData: SelectedData): Promise<string> => {
  // 发布评论调用事件
  eventBus.emit('ltt-invoke:comment', { 
    selectedData, 
    template: item.invokeParams 
  });
  return selectedData.text;
};
