export const processText = (item, selectedData) => {
  console.log('=== processText ===');
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

export const replaceSelectedTextCommon = async (getCurrentBlockFn, updateBlockFn, processedText) => {
  console.log('=== replaceSelectedTextCommon - 开始 ===');
  console.log('Step 1: 准备替换文本');
  console.log('Processed text:', processedText);
  
  try {
    console.log('Step 2: 获取当前块');
    const block = await getCurrentBlockFn();
    console.log('Step 3: 检查当前块');
    console.log('Current block:', block);
    
    if (!block) {
      console.error('Error: 没有选中的块');
      return false;
    }
    
    console.log('Step 4: 更新块内容');
    console.log('Block ID:', block.uuid);
    
    const success = await updateBlockFn(block.uuid, processedText);
    
    console.log('Step 5: 检查更新结果');
    console.log('Update success:', success);
    
    console.log('=== replaceSelectedTextCommon - 结束 ===');
    return success;
  } catch (error) {
    console.error('Error replacing selected text:', error);
    console.log('=== replaceSelectedTextCommon - 异常结束 ===');
    return false;
  }
};

// 处理文本替换的完整逻辑
export const processAndReplaceText = async (editorService, processedText, item, selectedData) => {
  console.log('=== processAndReplaceText ===');
  console.log('Processed text:', processedText);
  console.log('Item:', item);
  console.log('Selected data:', selectedData);
  
  try {
    // 1. 获取当前块信息
    console.log('Step 1: 获取当前块信息');
    const block = await editorService.getCurrentBlock();
    console.log('Current block:', block);
    
    if (!block || !block.content) {
      console.error('Error: 没有获取到当前块或块内容');
      return false;
    }
    
    // 2. 获取选中的文字和位置
    console.log('Step 2: 获取选中的文字和位置');
    const selectedText = selectedData.text;
    if (!selectedText) {
      console.error('Error: 没有选中的文字');
      return false;
    }
    
    const selection = window.getSelection();
    if (!selection) {
      console.error('Error: 无法获取选择对象');
      return false;
    }
    
    console.log('Selected text:', selectedText);
    
    // 3. 构建新的块内容
    console.log('Step 3: 构建新的块内容');
    const originalContent = block.content;
    
    // 查找选中文本在原始内容中的位置
    const selectionStart = selection.anchorOffset;
    const selectionEnd = selection.focusOffset;
    const anchorNode = selection.anchorNode;
    
    console.log('Selection start:', selectionStart);
    console.log('Selection end:', selectionEnd);
    console.log('Anchor node:', anchorNode);
    
    // 构建新内容
    let newContent;
    if (anchorNode && anchorNode.textContent) {
      const nodeText = anchorNode.textContent;
      const beforeSelection = nodeText.substring(0, Math.min(selectionStart, selectionEnd));
      const afterSelection = nodeText.substring(Math.max(selectionStart, selectionEnd));
      const newNodeText = beforeSelection + processedText + afterSelection;
      
      // 替换整个块内容
      newContent = originalContent.replace(nodeText, newNodeText);
    } else {
      // 简化处理：直接替换第一个匹配的选中文本
      newContent = originalContent.replace(selectedText, processedText);
    }
    
    console.log('Original content:', originalContent);
    console.log('New content:', newContent);
    
    // 4. 更新块内容
    console.log('Step 4: 更新块内容');
    const success = await editorService.updateBlock(block.uuid, newContent);
    
    return success;
  } catch (error) {
    console.error('Error in processAndReplaceText:', error);
    return false;
  }
};

export default {
  processText,
  replaceText,
  addText,
  invokeText,
  replaceSelectedTextCommon
};
