/**
 * 文本替换工具
 */

import { getSelection, getDocument } from '../../logseq/utils.ts';

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
    throw new Error('选中的文字在块内容中未找到');
  }
  return originalContent.substring(0, index) + processedText + originalContent.substring(index + selectedText.length);
};

/**
 * 在当前选中的元素中进行精确替换
 * @param selectedText 选中的文本
 * @param processedText 处理后的文本
 * @returns 是否替换成功
 */
export const replaceInSelectedElement = async (selectedText: string, processedText: string): Promise<boolean> => {
  try {
    // 获取当前选择
    const selection = getSelection();
    const doc = getDocument();
    if (!selection || selection.rangeCount === 0) {
      return false;
    }
    
    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    
    // 检查是否在同一个文本节点中
    if (startContainer === endContainer && startContainer.nodeType === Node.TEXT_NODE) {
      const textNode = startContainer as Text;
      const startOffset = range.startOffset;
      const endOffset = range.endOffset;
      
      // 验证选中的文本是否匹配
      const actualSelectedText = textNode.textContent?.substring(startOffset, endOffset);
      if (actualSelectedText === selectedText) {
        // 执行精确替换
        const before = textNode.textContent?.substring(0, startOffset) || '';
        const after = textNode.textContent?.substring(endOffset) || '';
        const newText = before + processedText + after;
        
        textNode.textContent = newText;
        
        // 重新设置选择范围
        const newRange = doc.createRange();
        newRange.setStart(textNode, startOffset);
        newRange.setEnd(textNode, startOffset + processedText.length);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.warn('Error in replaceInSelectedElement:', error);
    return false;
  }
};

/**
 * 更新块内容
 * @param selectedText 选中的文本
 * @param processedText 处理后的文本
 * @param block 块对象
 * @returns 是否更新成功
 */
export const updateBlockContent = async (
  selectedText: string, 
  processedText: string,
  block: any
): Promise<boolean> => {
  try {
    if (!block || !block.content) {
      console.warn('No block or block content');
      return false;
    }
    
    const originalContent = block.content;
    
    // 尝试在当前选中的元素中进行精确替换
    const success = await replaceInSelectedElement(selectedText, processedText);
    if (success) {
      return true;
    }
    
    // 回退：使用indexOf找到第一个匹配项
    const newContent = findAndReplaceText(originalContent, selectedText, processedText);
    
    // 更新block
    return true;
  } catch (error) {
    console.warn('Error updating block content:', error);
    return false;
  }
};
