export const processText = (item, selectedText, variables = {}) => {
  if (!selectedText) return selectedText
  
  switch (item.funcmode) {
    case 'replace':
      return replaceText(item, selectedText, variables)
    case 'console':
      console.log(`Processing ${item.clickfunc} with text: ${selectedText}`)
      return selectedText
    default:
      return selectedText
  }
}

export const replaceText = (item, selectedText, variables = {}) => {
  const allVariables = {
    ...variables,
    selectedText: selectedText
  }
  
  if (item.regex && item.replacement) {
    const regex = new RegExp(item.regex, 'g')
    const processedReplacement = renderTemplate(item.replacement, allVariables)
    return selectedText.replace(regex, processedReplacement)
  } else if (item.template) {
    return renderTemplate(item.template, allVariables)
  }
  return selectedText
}

export const renderTemplate = (template, variables) => {
  if (!template) return template
  
  let result = template
  
  const templateLiteralRegex = /\${(\w+)}/g
  result = result.replace(templateLiteralRegex, (match, varName) => {
    if (varName in variables) {
      return variables[varName]
    }
    return match
  })
  
  const doubleBraceRegex = /\{\{\$(\w+)\}\}/g
  result = result.replace(doubleBraceRegex, (match, varName) => {
    if (varName in variables) {
      return variables[varName]
    }
    return match
  })
  
  result = result.replace(/\$\^/g, variables.selectedText || '')
  
  return result
}
