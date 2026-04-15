export const processText = (item, selectedText) => {
  if (!selectedText) return selectedText
  
  switch (item.funcmode) {
    case 'replace':
      return replaceText(item, selectedText)
    case 'add':
      return addText(item, selectedText)
    case 'invoke':
      return invokeText(item, selectedText)
    case 'console':
      console.log(`Processing ${item.clickfunc} with text: ${selectedText}`)
      return selectedText
    default:
      return selectedText
  }
}

export const replaceText = (item, text) => {
  if (item.regex && item.replacement) {
    const regex = new RegExp(item.regex, 'g')
    return text.replace(regex, item.replacement)
  } else if (item.template) {
    return item.template.replace('$^', text)
  }
  return text
}

export const addText = (item, text) => {
  if (item.template) {
    return item.template.replace('$^', text)
  }
  return text
}

export const invokeText = (item, text) => {
  if (item.template) {
    return item.template.replace('$^', text)
  }
  return text
}
