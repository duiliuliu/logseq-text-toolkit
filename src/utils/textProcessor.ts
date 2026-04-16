import { ToolbarItem } from '../types/index.ts';
import { BlockEntity } from '../types/logseq.ts';

export interface SelectedData {
  text: string;
  timestamp?: string;
  range?: Range;
  rect?: DOMRect;
}

interface EditorService {
  getCurrentBlock: () => Promise<BlockEntity | null>;
  updateBlock: (blockId: string, content: string) => Promise<boolean>;
}

export const processSelectedData = async (
  item: ToolbarItem, 
  selectedData: SelectedData, 
  editorService?: EditorService
): Promise<string> => {
  console.log('=== processSelectedData ===');
  console.log('Item:', item);
  console.log('Selected data:', selectedData);
  
  const selectedText = selectedData.text;
  if (!selectedText) {
    console.log('No selected text, returning original');
    return selectedText;
  }
  
  let result = selectedText;
  switch (item.funcmode) {
    case 'replace':
      console.log('Processing in replace mode');
      result = replaceText(item, selectedText);
      console.log('Replace result:', result);
      // 如果提供了editorService，调用replaceSelectedText执行实际替换
      if (editorService) {
        console.log('Calling replaceSelectedText');
        await replaceSelectedText(editorService, result, selectedData);
      }
      break;
    case 'add':
      console.log('Processing in add mode');
      result = addText(item, selectedText);
      break;
    case 'invoke':
      console.log('Processing in invoke mode');
      result = invokeText(item, selectedText);
      break;
    case 'console':
      console.log(`Processing ${item.clickfunc} with text: ${selectedText}`);
      break;
    default:
      console.log('Unknown funcmode:', item.funcmode);
  }
  return result;
}

export const replaceText = (item: ToolbarItem, text: string): string => {
  console.log('=== replaceText ===');
  console.log('Item:', item);
  console.log('Original text:', text);
  
  if (item.regex && item.replacement) {
    console.log('Using regex replace');
    const regex = new RegExp(item.regex, 'g');
    const result = text.replace(regex, item.replacement);
    console.log('Regex result:', result);
    return result;
  } else if (item.clickfunc) {
    console.log('Using clickfunc replace');
    // 处理模板字符串格式的clickfunc，如 "**${selectedText}**"
    const result = item.clickfunc.replace(/\${selectedText}/g, text);
    console.log('Clickfunc result:', result);
    return result;
  }
  console.log('No regex or clickfunc, returning original');
  return text;
}

export const addText = (item: ToolbarItem, text: string): string => {
  if (item.clickfunc) {
    return item.clickfunc.replace(/\${selectedText}/g, text);
  }
  return text;
}

export const invokeText = (item: ToolbarItem, text: string): string => {
  if (item.clickfunc) {
    return item.clickfunc.replace(/\${selectedText}/g, text);
  }
  return text;
}

// 处理文本替换的完整逻辑
export const replaceSelectedText = async (editorService: EditorService, processedText: string, selectedData: SelectedData): Promise<boolean> => {
  console.log('=== replaceSelectedText ===');
  console.log('Processed text:', processedText);
  console.log('Selected data:', selectedData);
  
  try {
    // 1. 获取当前块信息
    console.log('Step 1: 获取当前块信息');
    const block = await editorService.getCurrentBlock();
    console.log('Current block:', block);
    
    if (!block || !block.content) {
      console.error('Error: 没有获取到当前块或块内容');
      // 显示错误消息
      if (typeof logseq !== 'undefined' && logseq.UI && logseq.UI.showMsg) {
        logseq.UI.showMsg('没有获取到当前块或块内容', { type: 'error' });
      }
      return false;
    }
    
    // 2. 获取选中的文字和位置信息
    console.log('Step 2: 获取选中的文字和位置信息');
    const selectedText = selectedData.text;
    
    if (!selectedText) {
      console.error('Error: 没有选中的文字');
      // 显示错误消息
      if (typeof logseq !== 'undefined' && logseq.UI && logseq.UI.showMsg) {
        logseq.UI.showMsg('没有选中的文字', { type: 'error' });
      }
      return false;
    }
    
    // 3. 构建新的块内容
    console.log('Step 3: 构建新的块内容');
    const originalContent = block.content;
    let newContent: string;
    
    // 尝试使用range进行精确替换，如果不可用则使用indexOf
    if (selectedData.range) {
      console.log('Using range for precise replacement');
      try {
        // 这里我们假设range信息可以帮助我们更精确地定位
        // 实际应用中，我们可以使用更复杂的逻辑
        // 目前我们仍然使用indexOf，但可以改进
        const index = originalContent.indexOf(selectedText);
        if (index !== -1) {
          newContent = originalContent.substring(0, index) + processedText + originalContent.substring(index + selectedText.length);
        } else {
          throw new Error('Text not found');
        }
      } catch (rangeError) {
        console.warn('Range replacement failed, falling back to indexOf:', rangeError);
        const index = originalContent.indexOf(selectedText);
        if (index === -1) {
          console.error('Error: 选中的文字在块内容中未找到');
          if (typeof logseq !== 'undefined' && logseq.UI && logseq.UI.showMsg) {
            logseq.UI.showMsg('选中的文字在块内容中未找到', { type: 'error' });
          }
          return false;
        }
        newContent = originalContent.substring(0, index) + processedText + originalContent.substring(index + selectedText.length);
      }
    } else {
      console.log('Using indexOf for replacement');
      const index = originalContent.indexOf(selectedText);
      if (index === -1) {
        console.error('Error: 选中的文字在块内容中未找到');
        if (typeof logseq !== 'undefined' && logseq.UI && logseq.UI.showMsg) {
          logseq.UI.showMsg('选中的文字在块内容中未找到', { type: 'error' });
        }
        return false;
      }
      newContent = originalContent.substring(0, index) + processedText + originalContent.substring(index + selectedText.length);
    }
    
    console.log('Original content:', originalContent);
    console.log('New content:', newContent);
    
    // 4. 更新块内容
    console.log('Step 4: 更新块内容');
    const success = await editorService.updateBlock(block.uuid, newContent);
    
    if (success) {
      // 显示成功消息
      if (typeof logseq !== 'undefined' && logseq.UI && logseq.UI.showMsg) {
        logseq.UI.showMsg('文本替换成功', { type: 'success' });
      }
    } else {
      // 显示错误消息
      if (typeof logseq !== 'undefined' && logseq.UI && logseq.UI.showMsg) {
        logseq.UI.showMsg('文本替换失败', { type: 'error' });
      }
    }
    
    return success;
  } catch (error) {
    console.error('Error in replaceSelectedText:', error);
    // 显示错误消息
    if (typeof logseq !== 'undefined' && logseq.UI && logseq.UI.showMsg) {
      logseq.UI.showMsg(`文本替换失败: ${error instanceof Error ? error.message : String(error)}`, { type: 'error' });
    }
    return false;
  }
};

// 通用的文本替换函数，接受getCurrentBlock和updateBlock作为参数
export const replaceSelectedTextCommon = async (
  getCurrentBlock: () => Promise<BlockEntity | null>,
  updateBlock: (blockId: string, content: string) => Promise<boolean>,
  processedText: string
): Promise<boolean> => {
  try {
    const block = await getCurrentBlock();
    if (!block || !block.content) {
      console.error('Error: 没有获取到当前块或块内容');
      return false;
    }

    // 这里简化处理，直接使用processedText替换整个块内容
    // 实际应用中可能需要更复杂的逻辑来处理选中的文本
    const success = await updateBlock(block.uuid, processedText);
    return success;
  } catch (error) {
    console.error('Error in replaceSelectedTextCommon:', error);
    return false;
  }
};

export default {
  processSelectedData,
  replaceText,
  addText,
  invokeText,
  replaceSelectedText,
  replaceSelectedTextCommon
};
