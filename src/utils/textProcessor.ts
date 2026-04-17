import { ToolbarItem } from '../components/Toolbar/types.ts';
import { logseqAPI } from '../logseq/index.ts';
import { getSelection, getDocument } from '../logseq/utils.ts';

export interface SelectedData {
  text: string;
  timestamp?: string;
  range?: Range;
  rect?: DOMRect;
}

export const processSelectedData = async (
  item: ToolbarItem, 
  selectedData: SelectedData
): Promise<string> => {
  const selectedText = selectedData.text;
  if (!selectedText) {
    return selectedText;
  }
  
  let result = selectedText;
  switch (item.funcmode) {
    case 'replace':
      await replaceSelectedText(item, selectedData);
      result = replaceText(item, selectedText);
      break;
    case 'add':
    case 'invoke':
      result = replaceText(item, selectedText);
      break;
    case 'console':
      break;
  }
  return result;
}

export const replaceText = (item: ToolbarItem, text: string): string => {
  if (item.regex && item.replacement) {
    const regex = new RegExp(item.regex, 'g');
    return text.replace(regex, item.replacement);
  } else if (item.clickfunc) {
    return item.clickfunc.replace(/\${selectedText}/g, text);
  }
  return text;
}

// 回退：使用indexOf找到第一个匹配项的辅助函数
const findAndReplaceText = (originalContent: string, selectedText: string, processedText: string): string => {
  const index = originalContent.indexOf(selectedText);
  if (index === -1) {
    console.error('Selected text not found in block content:', {
      originalContent,
      selectedText,
      processedText
    });
    throw new Error('选中的文字在块内容中未找到');
  }
  return originalContent.substring(0, index) + processedText + originalContent.substring(index + selectedText.length);
};

// 处理文本替换的完整逻辑
export const replaceSelectedText = async (item: ToolbarItem, selectedData: SelectedData): Promise<boolean> => {
  try {
    const selectedText = selectedData.text;
    if (!selectedText) {
      logseqAPI.UI.showMsg('没有选中的文字', { type: 'error' });
      return false;
    }
    
    const processedText = replaceText(item, selectedText);
    
    const block = await logseqAPI.Editor.getCurrentBlock();
    if (!block || !block.content) {
      logseqAPI.UI.showMsg('没有获取到当前块或块内容', { type: 'error' });
      return false;
    }
    
    const originalContent = block.content;
    
    // 实现精确的替换方法
    let newContent: string;
    
    if (selectedData.range) {
      // 使用range信息实现精确替换
      newContent = buildContentWithRange(originalContent, selectedText, processedText, selectedData);
    } else {
      // 尝试在当前选中的元素中进行精确替换
      const success = await replaceInSelectedElement(selectedText, processedText);
      if (success) {
        return true;
      }
      
      // 回退：使用indexOf找到第一个匹配项
      newContent = findAndReplaceText(originalContent, selectedText, processedText);
    }
    
    const success = await logseqAPI.Editor.updateBlock(block.uuid, newContent);
    
    if (!success) {
      logseqAPI.UI.showMsg('文本替换失败', { type: 'error' });
    }
    
    return success;
  } catch (error) {
    try {
      logseqAPI.UI.showMsg(`文本替换失败: ${error instanceof Error ? error.message : String(error)}`, { type: 'error' });
    } catch (uiError) {
      console.error('Error showing message:', uiError);
    }
    return false;
  }
};

// 在当前选中的元素中进行精确替换
const replaceInSelectedElement = async (selectedText: string, processedText: string): Promise<boolean> => {
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
    console.error('Error in replaceInSelectedElement:', error);
    return false;
  }
};

// 使用range信息构建精确的替换内容
const buildContentWithRange = (originalContent: string, selectedText: string, processedText: string, selectedData: SelectedData): string => {
  // 首先尝试使用range的startOffset和endOffset（如果可用）
  if (selectedData.range && 'startOffset' in selectedData.range && 'endOffset' in selectedData.range) {
    const range = selectedData.range as any;
    if (range.startContainer && range.startContainer.textContent) {
      const containerText = range.startContainer.textContent;
      const startOffset = range.startOffset;
      const endOffset = range.endOffset;
      
      // 检查选中的文本是否匹配
      const textInRange = containerText.substring(startOffset, endOffset);
      if (textInRange === selectedText) {
        // 构建新内容
        const newContainerText = containerText.substring(0, startOffset) + processedText + containerText.substring(endOffset);
        
        // 查找容器文本在原始内容中的位置
        const containerIndex = originalContent.indexOf(containerText);
        if (containerIndex !== -1) {
          return originalContent.substring(0, containerIndex) + newContainerText + originalContent.substring(containerIndex + containerText.length);
        }
      }
    }
  }
  
  // 如果range信息不可用或匹配失败，回退到indexOf方法
  return findAndReplaceText(originalContent, selectedText, processedText);
};

export default {
  processSelectedData,
  replaceText,
  replaceSelectedText
};
