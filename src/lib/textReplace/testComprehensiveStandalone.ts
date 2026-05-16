/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * utils.ts 全功能测试套件（独立版本）
 * 复制所有相关函数，不依赖外部导入
 */

interface ToolbarItem {
  id: string;
  label: string;
  binding?: string;
  icon?: string;
  invoke: string;
  invokeParams: any;
  regex?: string;
  replacement?: string;
  hidden?: boolean;
}

interface RegexReplaceParams {
  regex: string;
  replacement: string;
  flags?: string;
}

type InvokeParams = string | RegexReplaceParams;

/**
 * 判断 invokeParams 是否为正则替换配置对象
 */
function isRegexReplaceParams(params: InvokeParams): params is RegexReplaceParams {
  return typeof params === 'object' && params !== null && 'regex' in params;
}

/**
 * 检查文本是否已有格式
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
 * 将原始文本中的格式标记解析为嵌套格式
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
 * 检测 invokeParams 中的包裹模式
 */
const parseWrapperPattern = (invokeParams: string): { prefix: string; suffix: string } | null => {
  const match = invokeParams.match(/^(.*)\${selectedText}(.*)$/);
  if (match) {
    return { prefix: match[1], suffix: match[2] };
  }
  return null;
};

/**
 * 判断文本是否需要引号包裹
 */
const needsQuotes = (text: string): boolean => {
  if (text.startsWith('[:') && text.endsWith(']')) {
    return false;
  }
  
  return text.includes(' ') || text.includes('\u00A0') || text.includes('\u3000') || 
         text.includes('"') || text.includes("'");
};

/**
 * 智能处理引号包裹
 */
const wrapWithQuotesIfNeeded = (prefix: string, suffix: string, text: string): string => {
  const prefixHasQuote = prefix.endsWith('"') || prefix.endsWith("'");
  const suffixHasQuote = suffix.startsWith('"') || suffix.startsWith("'");
  
  if (needsQuotes(text) && !prefixHasQuote && !suffixHasQuote) {
    return prefix + `"${text}"` + suffix;
  }
  
  if (!needsQuotes(text) && prefixHasQuote && suffixHasQuote) {
    const cleanPrefix = prefix.slice(0, -1);
    const cleanSuffix = suffix.slice(1);
    return cleanPrefix + text + cleanSuffix;
  }
  
  return prefix + text + suffix;
};

/**
 * 智能处理嵌套格式引号
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
 * 替换文本 - 核心函数
 */
const replaceText = (item: ToolbarItem, text: string): string => {
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
 */
const regexReplaceText = (item: ToolbarItem, text: string): string => {
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
      console.error('Error parsing regex:', error);
    }
  }
  return text;
};

// ToolbarItem 配置
const toolbarItems: ToolbarItem[] = [
  { id: 'wrap-bold', label: 'Bold', invoke: 'replace', invokeParams: '**${selectedText}**' },
  { id: 'wrap-italic', label: 'Italic', invoke: 'replace', invokeParams: '*${selectedText}*' },
  { id: 'wrap-strike-through', label: 'Strike through', invoke: 'replace', invokeParams: '~~${selectedText}~~' },
  { id: 'wrap-code', label: 'Code', invoke: 'replace', invokeParams: '`${selectedText}`' },
  { id: 'wrap-subscript', label: 'Subscript', invoke: 'replace', invokeParams: '[:sub ${selectedText}]' },
  { id: 'wrap-superscript', label: 'Superscript', invoke: 'replace', invokeParams: '[:sup ${selectedText}]' },
  { id: 'wrap-yellow-hl', label: 'Yellow', invoke: 'replace', invokeParams: '==${selectedText}==' },
  { id: 'wrap-red-hl', label: 'Red highlight', invoke: 'replace', invokeParams: '[:mark.red ${selectedText}]' },
  { id: 'wrap-blue-hl', label: 'Blue highlight', invoke: 'replace', invokeParams: '[:mark.blue ${selectedText}]' },
  { id: 'wrap-green-hl', label: 'Green highlight', invoke: 'replace', invokeParams: '[:mark.green ${selectedText}]' },
  { id: 'wrap-purple-hl', label: 'Purple highlight', invoke: 'replace', invokeParams: '[:mark.purple ${selectedText}]' },
  { id: 'wrap-red-text', label: 'Red text', invoke: 'replace', invokeParams: '[:span.red ${selectedText}]' },
  { id: 'wrap-blue-text', label: 'Blue text', invoke: 'replace', invokeParams: '[:span.blue ${selectedText}]' },
  { id: 'wrap-yellow-text', label: 'Yellow text', invoke: 'replace', invokeParams: '[:span.yellow ${selectedText}]' },
  { id: 'wrap-green-text', label: 'Green text', invoke: 'replace', invokeParams: '[:span.green ${selectedText}]' },
  { id: 'wrap-purple-text', label: 'Purple text', invoke: 'replace', invokeParams: '[:span.purple ${selectedText}]' },
  { id: 'wrap-red-underline', label: 'Red underline', invoke: 'replace', invokeParams: '[:u.red ${selectedText}]' },
  { id: 'wrap-blue-underline', label: 'Blue underline', invoke: 'replace', invokeParams: '[:u.blue ${selectedText}]' },
  { id: 'wrap-yellow-underline', label: 'Yellow underline', invoke: 'replace', invokeParams: '[:u.yellow ${selectedText}]' },
  { id: 'wrap-green-underline', label: 'Green underline', invoke: 'replace', invokeParams: '[:u.green ${selectedText}]' },
  { id: 'wrap-purple-underline', label: 'Purple underline', invoke: 'replace', invokeParams: '[:u.purple ${selectedText}]' },
  { id: 'wrap-cloze', label: 'Cloze', invoke: 'replace', invokeParams: '[:span.cloze ${selectedText}]' },
  {
    id: 'remove-formatting',
    label: 'Remove formatting',
    invoke: 'regexReplace',
    invokeParams: {
      regex: "\\[:span\\.inline-comment\\s*\\{[^}]*\\}\\s*([^\\]]*)\\]|\\[:(?:mark|span|u|sub|sup|b|i|s|code|cloze|div)(?:\\.(?:red|blue|yellow|green|purple))?\\s*([^\\]]*)\\]|==([^=]*)==|~~([^~]*)~~|\\*\\*([^\\*]*)\\*\\*|\\*([^\\*]*)\\*|`([^`]*)`",
      replacement: "$1$2$3$4$5$6$7"
    }
  }
];

interface TestCase {
  name: string;
  item: ToolbarItem;
  input: string;
  expected: string;
  category: 'normal' | 'extreme' | 'edge';
}

const testCases: TestCase[] = [
  // ==========================================
  // 普通场景测试
  // ==========================================
  
  // 基础文本
  { name: '普通文本 - 粗体', item: toolbarItems.find(i => i.id === 'wrap-bold')!, input: '普通文本', expected: '**普通文本**', category: 'normal' },
  { name: '普通文本 - 斜体', item: toolbarItems.find(i => i.id === 'wrap-italic')!, input: '普通文本', expected: '*普通文本*', category: 'normal' },
  { name: '普通文本 - 红色文本', item: toolbarItems.find(i => i.id === 'wrap-red-text')!, input: '普通文本', expected: '[:span.red 普通文本]', category: 'normal' },
  
  // 带空格
  { name: '带空格文本 - 粗体', item: toolbarItems.find(i => i.id === 'wrap-bold')!, input: '带 空格 的 文本', expected: '**"带 空格 的 文本"**', category: 'normal' },
  { name: '带空格文本 - 红色文本', item: toolbarItems.find(i => i.id === 'wrap-red-text')!, input: '带 空格 的 文本', expected: '[:span.red "带 空格 的 文本"]', category: 'normal' },
  { name: '带空格文本 - 高亮', item: toolbarItems.find(i => i.id === 'wrap-yellow-hl')!, input: '带 空格 的 文本', expected: '=="带 空格 的 文本"==', category: 'normal' },
  
  // 单格式嵌套
  { name: '已有粗体 - 再次应用粗体', item: toolbarItems.find(i => i.id === 'wrap-bold')!, input: '**已加粗**', expected: '**[:b "已加粗"]**', category: 'normal' },
  { name: '已有斜体 - 应用红色', item: toolbarItems.find(i => i.id === 'wrap-red-text')!, input: '*斜体文本*', expected: '[:span.red [:i "斜体文本"]]', category: 'normal' },
  { name: '已有删除线 - 应用下划线', item: toolbarItems.find(i => i.id === 'wrap-red-underline')!, input: '~~删除线文本~~', expected: '[:u.red [:s "删除线文本"]]', category: 'normal' },
  
  // Hiccup 嵌套
  { name: '已有 hiccup - 单层嵌套', item: toolbarItems.find(i => i.id === 'wrap-red-text')!, input: '[:b "加粗文本"]', expected: '[:span.red [:b "加粗文本"]]', category: 'normal' },
  { name: '已有 hiccup - 多层嵌套', item: toolbarItems.find(i => i.id === 'wrap-blue-text')!, input: '[:mark.red "高亮文本"]', expected: '[:span.blue [:mark.red "高亮文本"]]', category: 'normal' },
  { name: '已有 hiccup - 复杂嵌套', item: toolbarItems.find(i => i.id === 'wrap-green-text')!, input: '[:u.red [:b "嵌套文本"]]', expected: '[:span.green [:u.red [:b "嵌套文本"]]]', category: 'normal' },
  
  // 换行文本
  { name: '换行文本 - 两行', item: toolbarItems.find(i => i.id === 'wrap-red-text')!, input: '第一行\n第二行', expected: '[:div [:span.red 第一行]][:div [:span.red 第二行]]', category: 'normal' },
  { name: '换行文本 - 三行', item: toolbarItems.find(i => i.id === 'wrap-blue-text')!, input: '第一行\n第二行\n第三行', expected: '[:div [:span.blue 第一行]][:div [:span.blue 第二行]][:div [:span.blue 第三行]]', category: 'normal' },
  { name: '换行文本 - 带空行', item: toolbarItems.find(i => i.id === 'wrap-green-text')!, input: '第一行\n\n第二行', expected: '[:div [:span.green 第一行]][:div [:span.green 第二行]]', category: 'normal' },
  
  // Markdown + Hiccup 混合
  { name: 'Markdown 嵌套 hiccup', item: toolbarItems.find(i => i.id === 'wrap-bold')!, input: '[:span.red "红色文本"]', expected: '**[:span.red "红色文本"]**', category: 'normal' },
  { name: 'Hiccup 嵌套 Markdown', item: toolbarItems.find(i => i.id === 'wrap-red-text')!, input: '**粗体文本**', expected: '[:span.red [:b "粗体文本"]]', category: 'normal' },
  { name: '多层混合格式', item: toolbarItems.find(i => i.id === 'wrap-purple-text')!, input: '==**高亮加粗**==', expected: '[:span.purple [:mark [:b "高亮加粗"]]]', category: 'normal' },
  
  // ==========================================
  // 极端场景测试
  // ==========================================
  
  // 深层嵌套
  { name: '极端深层嵌套 - 4层', item: toolbarItems.find(i => i.id === 'wrap-red-text')!, input: '[:span.blue [:u.green [:b "深层文本"]]]', expected: '[:span.red [:span.blue [:u.green [:b "深层文本"]]]]', category: 'extreme' },
  { name: '极端深层嵌套 - 5层', item: toolbarItems.find(i => i.id === 'wrap-blue-text')!, input: '[:mark.red [:span.blue [:u.green [:b "五层嵌套"]]]]', expected: '[:span.blue [:mark.red [:span.blue [:u.green [:b "五层嵌套"]]]]]', category: 'extreme' },
  
  // 多种格式混合
  { name: '极端多种格式混合', item: toolbarItems.find(i => i.id === 'wrap-red-text')!, input: '**粗体** 和 *斜体* 和 ~~删除~~ 和 ==高亮== 和 `代码`', expected: '[:span.red [:b "粗体"]] 和 [:span.red [:i "斜体"]] 和 [:span.red [:s "删除"]] 和 [:span.red [:mark "高亮"]] 和 [:span.red [:code "代码"]]', category: 'extreme' },
  
  // 换行 + 嵌套
  { name: '极端换行加嵌套', item: toolbarItems.find(i => i.id === 'wrap-blue-text')!, input: '**粗体文本**\n[:span.red "红色文本"]\n普通文本', expected: '[:div [:span.blue [:b "粗体文本"]]][:div [:span.blue [:span.red "红色文本"]]][:div [:span.blue 普通文本]]', category: 'extreme' },
  
  // 特殊字符
  { name: '极端特殊字符 - 引号', item: toolbarItems.find(i => i.id === 'wrap-red-text')!, input: '文本含"引号"文本', expected: '[:span.red "文本含"引号"文本"]', category: 'extreme' },
  { name: '极端特殊字符 - 单引号', item: toolbarItems.find(i => i.id === 'wrap-blue-text')!, input: "文本含'单引号'文本", expected: '[:span.blue "文本含\'单引号\'文本"]', category: 'extreme' },
  { name: '极端特殊字符 - 混合引号', item: toolbarItems.find(i => i.id === 'wrap-green-text')!, input: '文本含"双"和\'单\'引号', expected: '[:span.green "文本含"双"和\'单\'引号"]', category: 'extreme' },
  
  // 非断行空格
  { name: '极端非断行空格', item: toolbarItems.find(i => i.id === 'wrap-yellow-text')!, input: '带\u00A0非断行空格\u00A0的文本', expected: '[:span.yellow "带\u00A0非断行空格\u00A0的文本"]', category: 'extreme' },
  { name: '极端全角空格', item: toolbarItems.find(i => i.id === 'wrap-purple-text')!, input: '带\u3000全角空格\u3000的文本', expected: '[:span.purple "带\u3000全角空格\u3000的文本"]', category: 'extreme' },
  
  // 嵌套hiccup中的空格
  { name: '极端嵌套hiccup中的空格', item: toolbarItems.find(i => i.id === 'wrap-red-text')!, input: '[:b "带 空格 的 加粗"]', expected: '[:span.red [:b "带 空格 的 加粗"]]', category: 'extreme' },
  { name: '极端多层嵌套hiccup中的空格', item: toolbarItems.find(i => i.id === 'wrap-blue-text')!, input: '[:u.red [:b "第一层 带 空格"]]', expected: '[:span.blue [:u.red [:b "第一层 带 空格"]]]', category: 'extreme' },
  
  // 换行中的特殊格式
  { name: '极端换行加空格', item: toolbarItems.find(i => i.id === 'wrap-green-text')!, input: '带 空格 的 第一行\n第二行', expected: '[:div [:span.green "带 空格 的 第一行"]][:div [:span.green 第二行]]', category: 'extreme' },
  { name: '极端换行加嵌套', item: toolbarItems.find(i => i.id === 'wrap-red-text')!, input: '**粗体第一行**\n[:span.blue "蓝色第二行"]\n第三行', expected: '[:div [:span.red [:b "粗体第一行"]]][:div [:span.red [:span.blue "蓝色第二行"]]][:div [:span.red 第三行]]', category: 'extreme' },
  
  // ==========================================
  // 边界场景测试
  // ==========================================
  
  // 空文本
  { name: '边界空文本', item: toolbarItems.find(i => i.id === 'wrap-bold')!, input: '', expected: '', category: 'edge' },
  { name: '边界仅换行', item: toolbarItems.find(i => i.id === 'wrap-red-text')!, input: '\n', expected: '', category: 'edge' },
  { name: '边界仅空格', item: toolbarItems.find(i => i.id === 'wrap-blue-text')!, input: '   ', expected: '', category: 'edge' },
  { name: '边界仅换行和空格', item: toolbarItems.find(i => i.id === 'wrap-green-text')!, input: '\n  \n', expected: '', category: 'edge' },
  
  // 纯格式标记
  { name: '边界纯粗体标记', item: toolbarItems.find(i => i.id === 'wrap-red-text')!, input: '****', expected: '[:span.red **]', category: 'edge' },
  { name: '边界空hiccup格式', item: toolbarItems.find(i => i.id === 'wrap-blue-text')!, input: '[:b ""]', expected: '[:span.blue [:b ""]]', category: 'edge' },
  
  // 单字符
  { name: '边界单字符', item: toolbarItems.find(i => i.id === 'wrap-bold')!, input: 'A', expected: '**A**', category: 'edge' },
  { name: '边界单字符带空格', item: toolbarItems.find(i => i.id === 'wrap-red-text')!, input: 'A ', expected: '[:span.red "A "]', category: 'edge' },
  
  // 特殊 Unicode
  { name: '边界 Emoji', item: toolbarItems.find(i => i.id === 'wrap-bold')!, input: '🎉🎊✨', expected: '**🎉🎊✨**', category: 'edge' },
  { name: '边界中文标点', item: toolbarItems.find(i => i.id === 'wrap-red-text')!, input: '你好，的世界！', expected: '[:span.red 你好，的世界！]', category: 'edge' },
  { name: '边界特殊符号', item: toolbarItems.find(i => i.id === 'wrap-blue-text')!, input: '文本含@#$%^&*符号', expected: '[:span.blue "文本含@#$%^&*符号"]', category: 'edge' },
  
  // 嵌套边缘情况
  { name: '边界嵌套空粗体', item: toolbarItems.find(i => i.id === 'wrap-red-text')!, input: '**', expected: '[:span.red **]', category: 'edge' },
  { name: '边界嵌套不完整标记', item: toolbarItems.find(i => i.id === 'wrap-green-text')!, input: '*未闭合*', expected: '[:span.green [:i "未闭合"]]', category: 'edge' },
  
  // Remove Formatting 测试
  { name: 'Remove Formatting - 普通文本', item: toolbarItems.find(i => i.id === 'remove-formatting')!, input: '普通文本', expected: '普通文本', category: 'normal' },
  { name: 'Remove Formatting - 简单格式', item: toolbarItems.find(i => i.id === 'remove-formatting')!, input: '[:span.red 普通文本]', expected: '普通文本', category: 'normal' },
  { name: 'Remove Formatting - 嵌套格式', item: toolbarItems.find(i => i.id === 'remove-formatting')!, input: '[:span.red [:b "加粗文本"]]', expected: '加粗文本', category: 'extreme' },
  { name: 'Remove Formatting - 换行格式', item: toolbarItems.find(i => i.id === 'remove-formatting')!, input: '[:div [:span.red 第一行]][:div [:span.blue 第二行]]', expected: '第一行第二行', category: 'extreme' },
  { name: 'Remove Formatting - Markdown格式', item: toolbarItems.find(i => i.id === 'remove-formatting')!, input: '**粗体** 和 *斜体* 和 ~~删除~~', expected: '粗体 和 斜体 和 删除', category: 'normal' },
  { name: 'Remove Formatting - 复杂嵌套', item: toolbarItems.find(i => i.id === 'remove-formatting')!, input: '[:div [:span.red [:b "深层嵌套"]]][:div [:mark.blue "高亮"]]', expected: '深层嵌套高亮', category: 'extreme' },
  { name: 'Remove Formatting - 带引号文本', item: toolbarItems.find(i => i.id === 'remove-formatting')!, input: '[:span.red "带引号的文本"]', expected: '带引号的文本', category: 'normal' },
  { name: 'Remove Formatting - 空hiccup', item: toolbarItems.find(i => i.id === 'remove-formatting')!, input: '[:b ""]', expected: '', category: 'edge' }
];

/**
 * 测试运行器
 */
function runTests() {
  console.log('='.repeat(60));
  console.log('utils.ts 全功能测试套件');
  console.log('='.repeat(60));
  console.log();
  
  let passedCount = 0;
  let failedCount = 0;
  const failedTests: TestCase[] = [];
  
  const normalTests = testCases.filter(t => t.category === 'normal');
  const extremeTests = testCases.filter(t => t.category === 'extreme');
  const edgeTests = testCases.filter(t => t.category === 'edge');
  
  console.log(`📋 测试统计:`);
  console.log(`   - 普通场景: ${normalTests.length} 个`);
  console.log(`   - 极端场景: ${extremeTests.length} 个`);
  console.log(`   - 边界场景: ${edgeTests.length} 个`);
  console.log(`   - 总计: ${testCases.length} 个`);
  console.log();
  
  // 按类别运行测试
  const categories = [
    { name: '普通场景', tests: normalTests },
    { name: '极端场景', tests: extremeTests },
    { name: '边界场景', tests: edgeTests }
  ];
  
  for (const category of categories) {
    if (category.tests.length === 0) continue;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📂 ${category.name}测试`);
    console.log(`${'='.repeat(60)}\n`);
    
    for (const testCase of category.tests) {
      try {
        let result: string;
        
        if (testCase.item.invoke === 'regexReplace') {
          result = regexReplaceText(testCase.item, testCase.input);
          // 应用多次替换以处理嵌套
          let iterations = 0;
          let previousResult;
          do {
            previousResult = result;
            result = regexReplaceText(testCase.item, result);
            iterations++;
          } while (result !== previousResult && iterations < 10);
          // 清理残留引号
          result = result.replace(/"/g, '');
        } else {
          result = replaceText(testCase.item, testCase.input);
        }
        
        const passed = result === testCase.expected;
        
        if (passed) {
          console.log(`  ✅ ${testCase.name}`);
          passedCount++;
        } else {
          console.log(`  ❌ ${testCase.name}`);
          console.log(`     输入: ${JSON.stringify(testCase.input)}`);
          console.log(`     期望: ${JSON.stringify(testCase.expected)}`);
          console.log(`     实际: ${JSON.stringify(result)}`);
          failedCount++;
          failedTests.push(testCase);
        }
      } catch (error) {
        console.log(`  ❌ ${testCase.name} - 抛出异常:`);
        console.log(`     错误: ${error}`);
        failedCount++;
        failedTests.push(testCase);
      }
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 测试结果汇总`);
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ 通过: ${passedCount}`);
  console.log(`❌ 失败: ${failedCount}`);
  console.log(`📈 总计: ${testCases.length}`);
  console.log(`🎯 通过率: ${((passedCount / testCases.length) * 100).toFixed(2)}%`);
  
  if (failedCount > 0) {
    console.log(`\n❌ 失败测试列表:`);
    for (const test of failedTests) {
      console.log(`   - [${test.category}] ${test.name}`);
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`测试完成！`);
  console.log(`${'='.repeat(60)}`);
  
  return { passedCount, failedCount, total: testCases.length };
}

// 运行测试
const results = runTests();

export { testCases, toolbarItems, runTests, results };
