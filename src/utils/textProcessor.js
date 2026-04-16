export const processText = (item, selectedText) => {
  console.log('=== processText ===');
  console.log('Item:', item);
  console.log('Selected text:', selectedText);
  
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
    const result = getReplacementByClickFunc(item.clickfunc, text);
    console.log('Clickfunc result:', result);
    return result;
  }
  console.log('No regex or clickfunc, returning original');
  return text;
}

export const addText = (item, text) => {
  if (item.clickfunc) {
    return getReplacementByClickFunc(item.clickfunc, text);
  }
  return text;
}

export const invokeText = (item, text) => {
  if (item.clickfunc) {
    return getReplacementByClickFunc(item.clickfunc, text);
  }
  return text;
}

// 根据clickfunc获取替换文本
const getReplacementByClickFunc = (clickfunc, text) => {
  switch (clickfunc) {
    case '加粗':
      return `**${text}**`;
    case '斜体':
      return `*${text}*`;
    case '删除线':
      return `~~${text}~~`;
    case '背景高亮黄':
      return `==${text}==`;
    case '背景高亮红':
      return `[[#red]]==${text}==`;
    case '背景高亮绿':
      return `[[#green]]==${text}==`;
    case '背景高亮蓝':
      return `[[#blue]]==${text}==`;
    case '字体高亮红':
      return `[[$red]]==${text}==`;
    case '字体高亮黄':
      return `[[$yellow]]==${text}==`;
    case '字体高亮绿':
      return `[[$green]]==${text}==`;
    case '字体高亮蓝':
      return `[[$blue]]==${text}==`;
    case '下划线高亮红':
      return `__${text}__`;
    case '下划线高亮黄':
      return `__${text}__`;
    case '下划线高亮绿':
      return `__${text}__`;
    case '下划线高亮蓝':
      return `__${text}__`;
    case '文本替换':
      return text; // 文本替换默认返回原文本
    case '清除格式':
      return text.replace(/\[\[(?:#|\$)(?:red|green|blue|yellow)\]\]|==([^=]*)==|~~([^~]*)~~|\^\^([^\^]*)\^\^|\*\*([^\*]*)\*\*|\*([^\*]*)\*|_([^_]*)_|\$([^\$]*)\$|`([^`]*)`/g, '$1$2$3$4$5$6$7$8');
    default:
      return text;
  }
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

export default {
  processText,
  replaceText,
  addText,
  invokeText,
  replaceSelectedTextCommon
};
