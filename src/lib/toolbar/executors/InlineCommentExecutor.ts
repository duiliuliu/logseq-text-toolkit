/**
 * 行内注释功能执行器
 */

import type { ActionExecutorFn } from '../types.ts';
import type { ToolbarItem } from '../../../components/Toolbar/types.ts';
import type { SelectedData } from '../../../components/Toolbar/textProcessor.ts';

// 定义一个回调函数
import type { SelectedData } from '../../../components/Toolbar/textProcessor.ts';

let onShowInlineComment: ((selectedData: SelectedData) => void) | null = null;
let onHideInlineComment: (() => void) | null = null;

/**
 * 设置弹窗显示控制回调
 */
export function setInlineCommentControl(
  onShow: (selectedData: SelectedData) => void,
  onHide: () => void
) {
  onShowInlineComment = onShow;
  onHideInlineComment = onHide;
}

/**
 * 行内注释执行器
 */
export const inlineCommentExecutor: ActionExecutorFn = async (
  item: ToolbarItem,
  selectedData: SelectedData
): Promise<string> => {
  // 显示弹窗
  if (onShowInlineComment) {
    onShowInlineComment(selectedData);
  }

  // 返回原始文本，因为实际处理是在弹窗中完成的
  return selectedData.text;
};
