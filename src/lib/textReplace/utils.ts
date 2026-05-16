/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 文本替换工具
 */

import { getSelection, getDocument } from '../../logseq/utils.ts';
import { logseqAPI } from '../../logseq/index.ts';
import { t } from '../../translations/i18n.ts';
import { SelectedData, ToolbarItem, InvokeParams, RegexReplaceParams } from '../../components/Toolbar/types.ts';
import logger from '../logger/index';

/**
 * 判断 invokeParams 是否为正则替换配置对象
 */
function isRegexReplaceParams(params: InvokeParams): params is RegexReplaceParams {
  return typeof params === 'object' && params !== null && 'regex' in params;
}

/**
 * 更新块内容
 * @param selectedData 选中的数据
 * @param processedText 处理后的文本
 * @param language 语言代码
 * @returns 是否更新成功
 */
export const updateBlockContent = async (
  selectedData: SelectedData, 
  processedText: string,
  language: string
): Promise<boolean> => {
  try {
    const block = selectedData.block;
    if (!block || !block.content) {
      logseqAPI.UI.showMsg(t('toolbar.noBlockContent', language), { type: 'error' });
      return false;
    }
    
    const originalContent = block.content;
    const selectedText = selectedData.text;
    
    const success = await replaceInSelectedElement(selectedData, processedText);
    if (success) {
      return true;
    }
    
    const newContent = findAndReplaceText(originalContent, selectedText, processedText);
    
    if (newContent !== originalContent) {
      return await logseqAPI.Editor.updateBlock(block.uuid, newContent);
    } else {
      return false;
    }
  } catch (error) {
    logger.error('Error updating block content:', error);
    return false;
  }
};

/**
 * 回退：使用indexOf找到第一个匹配项的辅助函数
 * @param originalContent 原始内容
 * @param selectedText 选中的文本
 * @param processedText 处理后的文本
 * @returns 替换后的内容
 */
export const findAndReplaceText = (originalContent: string, selectedText: string, processedText: string): string => {
  const index = originalContent.indexOf(selectedText);
  if (index === -1) {
    logger.warn('Selected text not found in block content:', {
      originalContent,
      selectedText,
      processedText
    });
    return originalContent;
  }
  return originalContent.substring(0, index) + processedText + originalContent.substring(index + selectedText.length);
};

/**
 * 在当前选中的元素中进行精确替换
 * @param selectedData 选中的数据
 * @param processedText 处理后的文本
 * @returns 是否替换成功
 */
export const replaceInSelectedElement = async (selectedData: SelectedData, processedText: string): Promise<boolean> => {
  try {
    const selection = getSelection();
    const doc = getDocument();
    if (!selection || selection.rangeCount === 0) {
      logger.debug('未找到有效的选择范围');
      return false;
    }
    
    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    
    if (startContainer === endContainer && startContainer.nodeType === Node.TEXT_NODE) {
      const textNode = startContainer as Text;
      const startOffset = range.startOffset;
      
      logger.debug('在同一个文本节点中进行替换', {
        nodeText: textNode.textContent,
        startOffset,
        endOffset: range.endOffset
      });
      
      const newText = selectedData.before + processedText + selectedData.after;
      logger.debug('生成新文本', { newText });
      
      textNode.textContent = newText;
      
      const newRange = doc.createRange();
      newRange.setStart(textNode, startOffset);
      newRange.setEnd(textNode, startOffset + processedText.length);
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      logger.debug('替换成功，重新设置选择范围');
      return true;
    } else {
      logger.debug('不在同一个文本节点中，无法进行精确替换', {
        startContainer: startContainer.nodeType,
        endContainer: endContainer.nodeType
      });
      return false;
    }
  } catch (error) {
    logger.error('替换选中元素时出错', error);
    return false;
  }
};

/**
 * 检查文本是否已有格式
 * @param text 要检查的文本
 * @returns 是否包含格式标记
 */
const hasExistingFormat = (text: string): boolean => {
  if (text.startsWith('[:') && text.endsWith(']')) {
    return true;
  }
  
  const formatPatterns = [
    /\*\*[^*]+\*\*/,
    /\*[^*]+\*/,
    /~~[^~]+~~/,
    /==[^=]+==/,
    /`[^`]+`/,
  ];
  
  return formatPatterns.some(pattern => pattern.test(text));
};

/**
 * 将原始文本中的格式标记解析为 Logseq 支持的嵌套格式
 * @param text 原始文本（可能包含格式）
 * @returns 处理后的文本（已转换为嵌套格式）
 */
const parseNestedFormat = (text: string): string => {
  if (text.startsWith('[:') && text.endsWith(']')) {
    return text;
  }
  
  let result = text;
  
  result = result.replace(/\*\*([^*]+)\*\*/g, '[:b "$1"]');
  result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '[:i "$1"]');
  result = result.replace(/~~([^~]+)~~/g, '[:s "$1"]');
  result = result.replace(/==([^=]+)==/g, '[:mark "$1"]');
  result = result.replace(/`([^`]+)`/g, '[:code "$1"]');
  
  return result;
};

/**
 * 检测 invokeParams 中的包裹模式，并提取前缀和后缀
 * @param invokeParams 工具项的 invokeParams
 * @returns 包含 prefix 和 suffix 的对象
 */
const parseWrapperPattern = (invokeParams: string): { prefix: string; suffix: string } | null => {
  const match = invokeParams.match(/^(.*)\${selectedText}(.*)$/);
  if (match) {
    return { prefix: match[1], suffix: match[2] };
  }
  
  return null;
};

/**
 * 判断文本是否需要用引号包裹（包含空格、引号等特殊字符）
 * @param text 文本
 * @returns 是否需要引号
 */
const needsQuotes = (text: string): boolean => {
  // 跳过已经是完整 hiccup 格式的文本
  if (text.startsWith('[:') && text.endsWith(']')) {
    return false;
  }
  
  return text.includes(' ') || text.includes('\u00A0') || text.includes('\u3000') || 
         text.includes('"') || text.includes("'");
};

/**
 * 处理文本的引号包裹逻辑
 * @param prefix 前缀
 * @param suffix 后缀
 * @param text 文本内容
 * @returns 处理后的文本
 */
const wrapWithQuotesIfNeeded = (prefix: string, suffix: string, text: string): string => {
  // 检查前缀和后缀是否有引号
  const prefixHasQuote = prefix.endsWith('"') || prefix.endsWith("'");
  const suffixHasQuote = suffix.startsWith('"') || suffix.startsWith("'");
  
  // 如果需要引号但没有提供，则添加引号
  if (needsQuotes(text) && !prefixHasQuote && !suffixHasQuote) {
    return prefix + `"${text}"` + suffix;
  }
  
  // 如果不需要引号但提供了引号，则移除引号
  if (!needsQuotes(text) && prefixHasQuote && suffixHasQuote) {
    const cleanPrefix = prefix.slice(0, -1);
    const cleanSuffix = suffix.slice(1);
    return cleanPrefix + text + cleanSuffix;
  }
  
  // 否则保持原样
  return prefix + text + suffix;
};

/**
 * 智能处理嵌套格式 - 确保正确处理引号
 * @param prefix 前缀
 * @param suffix 后缀
 * @param text 原始文本
 * @param nestedText 已处理的嵌套文本
 * @returns 正确处理后的结果
 */
const handleNestedQuotes = (prefix: string, suffix: string, text: string, nestedText: string): string => {
  const prefixHasQuote = prefix.endsWith('"') || prefix.endsWith("'");
  const suffixHasQuote = suffix.startsWith('"') || suffix.startsWith("'");
  
  const isAlreadyNested = text.startsWith('[:') && text.endsWith(']');
  
  const isEntirelyWrappedFormat = (
    (text.startsWith('**') && text.endsWith('**')) ||
    (text.startsWith('*') && text.endsWith('*') && !text.startsWith('**')) ||
    (text.startsWith('~~') && text.endsWith('~~')) ||
    (text.startsWith('==') && text.endsWith('==')) ||
    (text.startsWith('`') && text.endsWith('`'))
  );
  
  const hasFormatMarkers = text.includes('**') || text.includes('*') || text.includes('~~') || text.includes('==') || text.includes('`');
  const isPartiallyFormatted = hasFormatMarkers && !isEntirelyWrappedFormat;
  
  if (isAlreadyNested) {
    // 如果是已嵌套格式，直接使用原始文本
    if (prefixHasQuote && suffixHasQuote) {
      const cleanPrefix = prefix.slice(0, -1);
      const cleanSuffix = suffix.slice(1);
      return cleanPrefix + text + cleanSuffix;
    } else {
      return prefix + text + suffix;
    }
  }
  
  if (isEntirelyWrappedFormat) {
    if (prefixHasQuote && suffixHasQuote) {
      const cleanPrefix = prefix.slice(0, -1);
      const cleanSuffix = suffix.slice(1);
      return cleanPrefix + nestedText + cleanSuffix;
    } else {
      return wrapWithQuotesIfNeeded(prefix, suffix, nestedText);
    }
  }
  
  if (isPartiallyFormatted) {
    return wrapWithQuotesIfNeeded(prefix, suffix, nestedText);
  }
  
  return wrapWithQuotesIfNeeded(prefix, suffix, nestedText);
};

/**
 * 将文本中的换行符转换为 HTML 换行标签
 * @param text 原始文本
 * @returns 转换后的文本
 */
export const convertNewlinesToHtml = (text: string): string => {
  return text.replace(/\n/g, '<br>');
};

/**
 * 处理文本中的换行，将每行转换为 div 包裹的 hiccup 结构
 * 自动过滤空行和首尾空白行
 * @param text 原始文本
 * @returns 处理后的 hiccup 文本
 */
export const processTextWithNewlines = (text: string): string => {
  if (!text.includes('\n')) {
    return text;
  }
  
  const lines = text.split('\n');
  const processedLines = lines
    .map(line => line.trim())
    .filter(line => line !== '');
  
  if (processedLines.length === 0) {
    return '';
  }
  
  if (processedLines.length === 1) {
    return processedLines[0];
  }
  
  return processedLines.map(line => `[:div ${line}]`).join('');
};

/**
 * 替换文本 - 支持嵌套格式处理和换行转换
 * @param item 工具栏项目
 * @param text 原始文本
 * @returns 替换后的文本（hiccup格式）
 */
export const replaceText = (item: ToolbarItem, text: string): string => {
  // 处理空文本和纯空白文本
  if (!text || text.trim() === '') {
    return '';
  }
  
  const hasNewlines = text.includes('\n');
  
  if (hasNewlines) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      return '';
    }
    
    const processedLines = lines.map(line => {
      if (item.regex && item.replacement) {
        const regex = new RegExp(item.regex, 'g');
        return line.replace(regex, item.replacement);
      } else if (item.invokeParams) {
        if (isRegexReplaceParams(item.invokeParams)) {
          const { regex: pattern, replacement, flags = 'g' } = item.invokeParams;
          const regex = new RegExp(pattern, flags);
          return line.replace(regex, replacement);
        } else {
          const invokeParamsStr = String(item.invokeParams);
          const wrapper = parseWrapperPattern(invokeParamsStr);
          
          if (wrapper && hasExistingFormat(line)) {
            const nestedText = parseNestedFormat(line);
            return handleNestedQuotes(wrapper.prefix, wrapper.suffix, line, nestedText);
          } else {
            // 直接替换时也需要检查是否需要引号包裹
            const wrapper = parseWrapperPattern(invokeParamsStr);
            if (wrapper) {
              return wrapWithQuotesIfNeeded(wrapper.prefix, wrapper.suffix, line);
            }
            return invokeParamsStr.replace(/\${selectedText}/g, line);
          }
        }
      }
      return line;
    });
    
    if (processedLines.length === 1) {
      return processedLines[0];
    }
    
    return processedLines.map(line => `[:div ${line}]`).join('');
  } else {
    if (item.regex && item.replacement) {
      const regex = new RegExp(item.regex, 'g');
      return text.replace(regex, item.replacement);
    } else if (item.invokeParams) {
      if (isRegexReplaceParams(item.invokeParams)) {
        const { regex: pattern, replacement, flags = 'g' } = item.invokeParams;
        const regex = new RegExp(pattern, flags);
        return text.replace(regex, replacement);
      } else {
          const invokeParamsStr = String(item.invokeParams);
          const wrapper = parseWrapperPattern(invokeParamsStr);
          
          if (wrapper && hasExistingFormat(text)) {
            const nestedText = parseNestedFormat(text);
            return handleNestedQuotes(wrapper.prefix, wrapper.suffix, text, nestedText);
          } else {
            // 直接替换时也需要检查是否需要引号包裹
            if (wrapper) {
              return wrapWithQuotesIfNeeded(wrapper.prefix, wrapper.suffix, text);
            }
            return invokeParamsStr.replace(/\${selectedText}/g, text);
          }
        }
    }
    return text;
  }
};

/**
 * 正则替换文本
 * @param item 工具栏项目
 * @param text 原始文本
 * @returns 替换后的文本
 */
export const regexReplaceText = (item: ToolbarItem, text: string): string => {
  if (item.invokeParams) {
    try {
      if (isRegexReplaceParams(item.invokeParams)) {
        const { regex: pattern, replacement, flags = 'g' } = item.invokeParams;
        const regex = new RegExp(pattern, flags);
        return text.replace(regex, replacement);
      } else if (typeof item.invokeParams === 'string') {
        const regexMatch = item.invokeParams.match(/\/(.*)\/(.*)\/(.*)/);
        if (regexMatch) {
          const [, pattern, replacement, flags] = regexMatch;
          const regex = new RegExp(pattern, flags);
          return text.replace(regex, replacement);
        }
      }
    } catch (error) {
      logger.error('Error parsing regex:', error);
    }
  }
  return text;
};
