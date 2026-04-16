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
  } else if (item.template) {
    console.log('Using template replace');
    const result = item.template.replace('$^', text);
    console.log('Template result:', result);
    return result;
  }
  console.log('No regex or template, returning original');
  return text;
}

export const addText = (item, text) => {
  if (item.template) {
    return item.template.replace('$^', text);
  }
  return text;
}

export const invokeText = (item, text) => {
  if (item.template) {
    return item.template.replace('$^', text);
  }
  return text;
}

export const replaceSelectedTextCommon = async (getCurrentBlockFn, updateBlockFn, processedText) => {
  console.log('=== replaceSelectedTextCommon ===');
  console.log('Processed text:', processedText);
  try {
    const block = await getCurrentBlockFn();
    console.log('Current block:', block);
    if (!block) {
      console.error('No block selected');
      return false;
    }
    
    const success = await updateBlockFn(block.uuid, processedText);
    console.log('Update success:', success);
    return success;
  } catch (error) {
    console.error('Error replacing selected text:', error);
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
