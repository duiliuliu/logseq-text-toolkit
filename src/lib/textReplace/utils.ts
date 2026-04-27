/**
 * 文本替换工具
 */

import { getSelection, getDocument } from '../../logseq/utils.ts';
import { logseqAPI } from '../../logseq/index.ts';
import { t } from '../../translations/i18n.ts';
import { SelectedData } from '../../components/Toolbar/textProcessor.ts';
import { logger } from '../logger/logger.ts';

/**
 * 更新块内容
 * @param selectedData 选中的数据
 * @param processedText 处理后的文本
 * @param language 语言代码
 * @returns 是否更新成功
 */
export const updateBlockContent = async (
  selectedData: SelectedData, 
  processedText: string,
  language: string
): Promise<boolean> => {
  try {
    // 从selectedData获取block
    const block = selectedData.block;
    if (!block || !block.content) {
      logseqAPI.UI.showMsg(t('toolbar.noBlockContent', language), { type: 'error' });
      return false;
    }
    
    const originalContent = block.content;
    const selectedText = selectedData.text;
    
    // 尝试在当前选中的元素中进行精确替换
    const success = await replaceInSelectedElement(selectedData, processedText);
    if (success) {
      return true;
    }
    
    // 回退：使用indexOf找到第一个匹配项
    const newContent = findAndReplaceText(originalContent, selectedText, processedText);
    
    // 只有当内容确实发生变化时才更新block
    if (newContent !== originalContent) {
      return await logseqAPI.Editor.updateBlock(block.uuid, newContent);
    } else {
      // 内容没有变化，返回false表示更新失败
      return false;
    }
  } catch (error) {
    console.warn('Error updating block content:', error);
    return false;
  }
};

// ====================================================================================================

/**
 * 回退：使用indexOf找到第一个匹配项的辅助函数
 * @param originalContent 原始内容
 * @param selectedText 选中的文本
 * @param processedText 处理后的文本
 * @returns 替换后的内容
 */
export const findAndReplaceText = (originalContent: string, selectedText: string, processedText: string): string => {
  const index = originalContent.indexOf(selectedText);
  if (index === -1) {
    console.warn('Selected text not found in block content:', {
      originalContent,
      selectedText,
      processedText
    });
    // 找不到选中的文本时，返回原始内容，不抛出错误
    return originalContent;
  }
  return originalContent.substring(0, index) + processedText + originalContent.substring(index + selectedText.length);
};

/**
 * 在当前选中的元素中进行精确替换
 * @param selectedData 选中的数据
 * @param processedText 处理后的文本
 * @returns 是否替换成功
 */
export const replaceInSelectedElement = async (selectedData: SelectedData, processedText: string): Promise<boolean> => {
  try {

    
    // 获取当前选择
    const selection = getSelection();
    const doc = getDocument();
    if (!selection || selection.rangeCount === 0) {
      logger.debug('未找到有效的选择范围');
      return false;
    }
    
    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    
    // 检查是否在同一个文本节点中
    if (startContainer === endContainer && startContainer.nodeType === Node.TEXT_NODE) {
      const textNode = startContainer as Text;
      const startOffset = range.startOffset;
      
      logger.debug('在同一个文本节点中进行替换', {
        nodeText: textNode.textContent,
        startOffset,
        endOffset: range.endOffset
      });
      
      // 执行精确替换
      const newText = selectedData.before + processedText + selectedData.after;
      logger.debug('生成新文本', { newText });
      
      textNode.textContent = newText;
      
      // 重新设置选择范围
      const newRange = doc.createRange();
      newRange.setStart(textNode, startOffset);
      newRange.setEnd(textNode, startOffset + processedText.length);
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      logger.debug('替换成功，重新设置选择范围');
      return true;
    } else {
      logger.debug('不在同一个文本节点中，无法进行精确替换', {
        startContainer: startContainer.nodeType,
        endContainer: endContainer.nodeType
      });
      return false;
    }
  } catch (error) {
    logger.error('替换选中元素时出错', error);
    return false;
  }
};
