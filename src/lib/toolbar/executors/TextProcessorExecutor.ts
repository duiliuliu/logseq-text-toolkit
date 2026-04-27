/**
 * 文本处理执行器
 */

import type { ActionExecutorFn } from '../types.ts';
import type { ToolbarItem } from '../../../components/Toolbar/types.ts';
import type { SelectedData } from '../../../components/Toolbar/textProcessor.ts';
import { replaceText, regexReplaceText } from '../../../components/Toolbar/textProcessor.ts';
import { updateBlockContent } from '../../../lib/textReplace/utils.ts';
import { logseqAPI } from '../../../logseq/index.ts';
import { t } from '../../../translations/i18n.ts';

/**
 * 替换执行器
 */
export const replaceExecutor: ActionExecutorFn = async (item: ToolbarItem, selectedData: SelectedData): Promise<string> => {
  try {
    const selectedText = selectedData.text;
    if (!selectedText) {
      logseqAPI.UI.showMsg(t('toolbar.noSelection', 'zh-CN'), { type: 'error' });
      return selectedText;
    }
    
    const processedText = replaceText(item, selectedText);
    const success = await updateBlockContent(selectedData, processedText, 'zh-CN');
    
    if (!success) {
      logseqAPI.UI.showMsg(t('toolbar.replaceFailed', 'zh-CN'), { type: 'error' });
    }
    
    return processedText;
  } catch (error) {
    try {
      logseqAPI.UI.showMsg(`${t('toolbar.replaceFailed', 'zh-CN')}: ${error instanceof Error ? error.message : String(error)}`, { type: 'error' });
    } catch (uiError) {
      console.warn('Error showing message:', uiError);
    }
    return selectedData.text;
  }
};

/**
 * 正则替换执行器
 */
export const regexReplaceExecutor: ActionExecutorFn = async (item: ToolbarItem, selectedData: SelectedData): Promise<string> => {
  try {
    const selectedText = selectedData.text;
    if (!selectedText) {
      logseqAPI.UI.showMsg(t('toolbar.noSelection', 'zh-CN'), { type: 'error' });
      return selectedText;
    }
    
    const processedText = regexReplaceText(item, selectedText);
    const success = await updateBlockContent(selectedData, processedText, 'zh-CN');
    
    if (!success) {
      logseqAPI.UI.showMsg(t('toolbar.replaceFailed', 'zh-CN'), { type: 'error' });
    }
    
    return processedText;
  } catch (error) {
    try {
      logseqAPI.UI.showMsg(`${t('toolbar.replaceFailed', 'zh-CN')}: ${error instanceof Error ? error.message : String(error)}`, { type: 'error' });
    } catch (uiError) {
      console.warn('Error showing message:', uiError);
    }
    return selectedData.text;
  }
};
