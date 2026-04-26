import { ToolbarItem } from './types.ts';
import { logseqAPI } from '../../logseq/index.ts';
import { getSelection, getDocument } from '../../logseq/utils.ts';
import { t } from '../../translations/i18n.ts';
import { findAndReplaceText, replaceInSelectedElement } from '../../lib/textReplace/utils.ts';

/**
 * 选中数据接口
 */
export interface SelectedData {
  text: string;
  timestamp?: string;
  range?: Range;
  rect?: DOMRect;
}

/**
 * 处理选中的数据
 * @param item 工具栏项目
 * @param selectedData 选中的数据
 * @param language 语言代码
 * @returns 处理后的文本
 */
export const processSelectedData = async (
  item: ToolbarItem, 
  selectedData: SelectedData,
  language: string = 'zh-CN'
): Promise<string> => {
  const selectedText = selectedData.text;
  if (!selectedText) {
    return selectedText;
  }
  
  let result = selectedText;
  switch (item.funcmode) {
    case 'replace':
    case 'regexReplace':
      result = await replaceSelectedText(item, selectedData, language);
      break;
    case 'add':
    case 'invoke':
      result = replaceText(item, selectedText);
      break;
    case 'console':
      break;
  }
  return result;
};

// ====================================================================================================

/**
 * 处理文本替换的完整逻辑
 * @param item 工具栏项目
 * @param selectedData 选中的数据
 * @param language 语言代码
 * @returns 处理后的文本
 */
export const replaceSelectedText = async (
  item: ToolbarItem, 
  selectedData: SelectedData,
  language: string = 'zh-CN'
): Promise<string> => {
  try {
    // 1. 对selectedData.text 参数判断处理
    const selectedText = selectedData.text;
    if (!selectedText) {
      logseqAPI.UI.showMsg(t('toolbar.noSelection', language), { type: 'error' });
      return selectedText;
    }
    
    // 2. 对selectedData.text作文本处理
    let processedText: string;
    if (item.funcmode === 'regexReplace') {
      processedText = regexReplaceText(item, selectedText);
    } else {
      processedText = replaceText(item, selectedText);
    }
    
    // 3. 用处理后的文本更新block content
    const success = await updateBlockContent(selectedText, processedText, language);
    
    if (!success) {
      logseqAPI.UI.showMsg(t('toolbar.replaceFailed', language), { type: 'error' });
    }
    
    // 4. 返回 processedText
    return processedText;
  } catch (error) {
    try {
      logseqAPI.UI.showMsg(`${t('toolbar.replaceFailed', language)}: ${error instanceof Error ? error.message : String(error)}`, { type: 'error' });
    } catch (uiError) {
      console.warn('Error showing message:', uiError);
    }
    return selectedData.text;
  }
};

// ====================================================================================================

/**
 * 替换文本
 * @param item 工具栏项目
 * @param text 原始文本
 * @returns 替换后的文本
 */
export const replaceText = (item: ToolbarItem, text: string): string => {
  if (item.regex && item.replacement) {
    const regex = new RegExp(item.regex, 'g');
    return text.replace(regex, item.replacement);
  } else if (item.clickfunc) {
    return item.clickfunc.replace(/\${selectedText}/g, text);
  }
  return text;
};

// ====================================================================================================

/**
 * 正则替换文本
 * @param item 工具栏项目
 * @param text 原始文本
 * @returns 替换后的文本
 */
export const regexReplaceText = (item: ToolbarItem, text: string): string => {
  if (item.clickfunc) {
    try {
      // 处理对象格式的clickfunc（包含regex和replacement属性）
      if (typeof item.clickfunc === 'object' && item.clickfunc.regex && item.clickfunc.replacement) {
        const { regex: pattern, replacement, flags = 'g' } = item.clickfunc;
        const regex = new RegExp(pattern, flags);
        return text.replace(regex, replacement);
      }
      // 处理字符串格式的clickfunc（格式示例: /pattern/replacement/flags）
      else if (typeof item.clickfunc === 'string') {
        const regexMatch = item.clickfunc.match(/\/(.*)\/(.*)\/(.*)/);
        if (regexMatch) {
          const [, pattern, replacement, flags] = regexMatch;
          const regex = new RegExp(pattern, flags);
          return text.replace(regex, replacement);
        }
      }
    } catch (error) {
      console.warn('Error parsing regex:', error);
    }
  }
  return text;
};

// ====================================================================================================

/**
 * 更新 block 内容
 * @param selectedText 选中的文本
 * @param processedText 处理后的文本
 * @param language 语言代码
 * @returns 是否更新成功
 */
const updateBlockContent = async (
  selectedText: string, 
  processedText: string,
  language: string
): Promise<boolean> => {
  try {
    // a. 获取block
    const block = await logseqAPI.Editor.getCurrentBlock();
    if (!block || !block.content) {
      logseqAPI.UI.showMsg(t('toolbar.noBlockContent', language), { type: 'error' });
      return false;
    }
    
    const originalContent = block.content;
    
    // 实现精确的替换方法
    let newContent: string;
    
    // 尝试在当前选中的元素中进行精确替换
    const success = await replaceInSelectedElement(selectedText, processedText);
    if (success) {
      return true;
    }
    
    // 回退：使用indexOf找到第一个匹配项
    newContent = findAndReplaceText(originalContent, selectedText, processedText);
    
    // b. 更新block
    return await logseqAPI.Editor.updateBlock(block.uuid, newContent);
  } catch (error) {
    console.warn('Error updating block content:', error);
    return false;
  }
};



export default {
  processSelectedData,
  replaceText,
  regexReplaceText,
  replaceSelectedText
};
