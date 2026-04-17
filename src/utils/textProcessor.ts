import { ToolbarItem } from '../components/Toolbar/types.ts';
import { logseqAPI } from '../logseq/index.ts';

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
    
    // 实现精确的替换方法，参考range和rect信息
    let newContent: string;
    
    if (selectedData.range) {
      // 如果有range信息，尝试使用更精确的方法
      newContent = buildContentWithRange(originalContent, selectedText, processedText, selectedData);
    } else {
      // 使用indexOf找到第一个匹配项
      const index = originalContent.indexOf(selectedText);
      if (index === -1) {
        console.error('Selected text not found in block content:', {
          originalContent,
          selectedText,
          processedText,
          selectedData
        });
        logseqAPI.UI.showMsg('选中的文字在块内容中未找到', { type: 'error' });
        return false;
      }
      newContent = originalContent.substring(0, index) + processedText + originalContent.substring(index + selectedText.length);
    }
    
    const success = await logseqAPI.Editor.updateBlock(block.uuid, newContent);
    
    if (success) {
      logseqAPI.UI.showMsg('文本替换成功', { type: 'success' });
    } else {
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
  const index = originalContent.indexOf(selectedText);
  if (index === -1) {
    console.error('Selected text not found in block content (fallback to indexOf):', {
      originalContent,
      selectedText,
      processedText,
      selectedData
    });
    throw new Error('选中的文字在块内容中未找到');
  }
  return originalContent.substring(0, index) + processedText + originalContent.substring(index + selectedText.length);
};

export default {
  processSelectedData,
  replaceText,
  replaceSelectedText
};
