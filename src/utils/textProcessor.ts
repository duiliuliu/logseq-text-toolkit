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
      // 直接调用新的replaceSelectedText函数，它会处理文本替换和API调用
      console.log('Calling replaceSelectedText');
      await replaceSelectedText(item, selectedData);
      // 计算替换结果用于返回
      result = replaceText(item, selectedText);
      console.log('Replace result:', result);
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
      // 对于console模式，不执行文本替换
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
export const replaceSelectedText = async (item: ToolbarItem, selectedData: SelectedData): Promise<boolean> => {
  console.log('=== replaceSelectedText ===');
  console.log('Item:', item);
  console.log('Selected data:', selectedData);
  
  try {
    // 1. 处理文本
    const selectedText = selectedData.text;
    if (!selectedText) {
      console.error('Error: 没有选中的文字');
      // 显示错误消息
      logseqAPI.UI.showMsg('没有选中的文字', { type: 'error' });
      return false;
    }
    
    // 处理文本替换
    let processedText = selectedText;
    if (item.regex && item.replacement) {
      console.log('Using regex replace');
      const regex = new RegExp(item.regex, 'g');
      processedText = selectedText.replace(regex, item.replacement);
    } else if (item.clickfunc) {
      console.log('Using clickfunc replace');
      // 处理模板字符串格式的clickfunc，如 "**${selectedText}**"
      processedText = item.clickfunc.replace(/\${selectedText}/g, selectedText);
    }
    
    console.log('Processed text:', processedText);
    
    // 2. 获取当前块信息
    console.log('Step 1: 获取当前块信息');
    const block = await logseqAPI.Editor.getCurrentBlock();
    console.log('Current block:', block);
    
    if (!block || !block.content) {
      console.error('Error: 没有获取到当前块或块内容');
      // 显示错误消息
      logseqAPI.UI.showMsg('没有获取到当前块或块内容', { type: 'error' });
      return false;
    }
    
    // 3. 构建新的块内容
    console.log('Step 2: 构建新的块内容');
    const originalContent = block.content;
    let newContent: string;
    
    // 参考 https://github.com/qbosen/logseq-plugin-wrap/blob/master/src/index.jsx#L195 的实现
    // 尝试使用更精确的方法进行替换
    console.log('Using precise replacement method');
    
    // 首先尝试使用indexOf找到第一个匹配项
    const index = originalContent.indexOf(selectedText);
    if (index === -1) {
      console.error('Error: 选中的文字在块内容中未找到');
      logseqAPI.UI.showMsg('选中的文字在块内容中未找到', { type: 'error' });
      return false;
    }
    
    // 构建新内容
    newContent = originalContent.substring(0, index) + processedText + originalContent.substring(index + selectedText.length);
    
    console.log('Original content:', originalContent);
    console.log('New content:', newContent);
    
    // 4. 更新块内容
    console.log('Step 3: 更新块内容');
    const success = await logseqAPI.Editor.updateBlock(block.uuid, newContent);
    
    if (success) {
      // 显示成功消息
      logseqAPI.UI.showMsg('文本替换成功', { type: 'success' });
    } else {
      // 显示错误消息
      logseqAPI.UI.showMsg('文本替换失败', { type: 'error' });
    }
    
    return success;
  } catch (error) {
    console.error('Error in replaceSelectedText:', error);
    // 显示错误消息
    try {
      logseqAPI.UI.showMsg(`文本替换失败: ${error instanceof Error ? error.message : String(error)}`, { type: 'error' });
    } catch (uiError) {
      console.error('Error showing message:', uiError);
    }
    return false;
  }
};

export default {
  processSelectedData,
  replaceText,
  addText,
  invokeText,
  replaceSelectedText
};
