export const processSelectedData = (item, selectedData) => {
  console.log('=== processSelectedData ===');
  console.log('Item:', item);
  console.log('Selected data:', selectedData);
  
  const selectedText = selectedData.text;
  if (!selectedText) {
    console.log('No selected text, returning original');
    return selectedText;
  }
  
  switch (item.funcmode) {
    case 'replace':
      console.log('Processing in replace mode');
      const result = replaceText(item, selectedText);
      console.log('Replace result:', result);
      // 这里可以添加对replaceSelectedText的调用
      // 但由于replaceSelectedText是异步函数，需要在调用处处理
      return result;
    case 'add':
      console.log('Processing in add mode');
      return addText(item, selectedText);
    case 'invoke':
      console.log('Processing in invoke mode');
      return invokeText(item, selectedText);
    case 'console':
      console.log(`Processing ${item.clickfunc} with text: ${selectedText}`);
      return selectedText;
    default:
      console.log('Unknown funcmode:', item.funcmode);
      return selectedText;
  }
}

export const replaceText = (item, text) => {
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

export const addText = (item, text) => {
  if (item.clickfunc) {
    return item.clickfunc.replace(/\${selectedText}/g, text);
  }
  return text;
}

export const invokeText = (item, text) => {
  if (item.clickfunc) {
    return item.clickfunc.replace(/\${selectedText}/g, text);
  }
  return text;
}



// 处理文本替换的完整逻辑
export const replaceSelectedText = async (editorService, processedText, selectedData) => {
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
    
    // 精确替换选中的文本
    // 这里实现一个更精确的替换逻辑
    // 找到第一个匹配的文本并替换
    const index = originalContent.indexOf(selectedText);
    if (index === -1) {
      console.error('Error: 选中的文字在块内容中未找到');
      // 显示错误消息
      if (typeof logseq !== 'undefined' && logseq.UI && logseq.UI.showMsg) {
        logseq.UI.showMsg('选中的文字在块内容中未找到', { type: 'error' });
      }
      return false;
    }
    
    // 构建新内容
    const newContent = originalContent.substring(0, index) + processedText + originalContent.substring(index + selectedText.length);
    
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
      logseq.UI.showMsg(`文本替换失败: ${error.message}`, { type: 'error' });
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
