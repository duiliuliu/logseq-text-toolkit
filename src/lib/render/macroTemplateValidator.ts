/**
 * 宏命令模板验证工具
 * 
 * 用于验证用户在设置中输入的默认斜杠命令模板是否有效
 * 复用 rendererArgs.ts 中的参数模型注册和解析功能
 */

import { findModel, parseRendererArgs, registerRendererArgModel } from './rendererArgs'

export interface MacroValidationResult {
  valid: boolean
  error?: string
  warnings?: string[]
}

/**
 * 预定义的宏命令前缀列表
 */
const MACRO_PREFIXES = {
  taskprogress: ':taskprogress',
  heatmap: ':heatmap',
  blockview: ':blockview',
  milestone: ':milestone'
} as const

/**
 * 从已注册的宏命令中提取模板字符串（不包括 {{renderer }} 外壳）
 */
export function extractMacroTemplate(template: string): string {
  // 移除 {{renderer }} 外壳
  const match = template.match(/\{\{renderer\s+(.+?)\}\}/)
  return match ? match[1].trim() : template.trim()
}

/**
 * 分割宏内容为前缀和 tokens 数组
 * 
 * @param macroContent - 宏内容字符串，如 ":taskprogress mini-circle"
 * @returns 包含前缀和 tokens 的对象
 */
function splitMacroContent(macroContent: string): { prefix: string; tokens: string[] } {
  // 找到第一个非前缀字符的位置（空格或逗号）
  const firstSpace = macroContent.indexOf(' ')
  const firstComma = macroContent.indexOf(',')
  let splitIndex = -1
  
  if (firstSpace !== -1 && firstComma !== -1) {
    splitIndex = Math.min(firstSpace, firstComma)
  } else if (firstSpace !== -1) {
    splitIndex = firstSpace
  } else if (firstComma !== -1) {
    splitIndex = firstComma
  }
  
  if (splitIndex === -1) {
    return { prefix: macroContent.trim(), tokens: [] }
  }
  
  const prefix = macroContent.slice(0, splitIndex).trim()
  const rest = macroContent.slice(splitIndex).trim()
  
  // 分割 tokens（复用 rendererArgs 中的逻辑）
  const tokens = rest
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .flatMap(s => s.split(/\s+/))
    .map(s => s.trim())
    .filter(Boolean)
  
  return { prefix, tokens }
}

/**
 * 验证宏命令模板
 * 
 * @param template - 用户输入的模板字符串，例如 ":taskprogress mini-circle" 或完整的 "{{renderer :taskprogress mini-circle}}"
 * @param macroType - 宏命令类型，用于特定验证
 * @returns 验证结果
 */
export function validateMacroTemplate(
  template: string,
  macroType: 'taskprogress' | 'heatmap' | 'blockview' | 'milestone'
): MacroValidationResult {
  const warnings: string[] = []
  
  // 空检查
  if (!template || template.trim() === '') {
    return {
      valid: true,
      warnings: ['Empty template will use default values']
    }
  }

  // 提取宏模板内容
  const macroContent = extractMacroTemplate(template)
  
  // 检查是否以有效前缀开头
  const validPrefix = MACRO_PREFIXES[macroType]
  if (!macroContent.startsWith(validPrefix)) {
    return {
      valid: false,
      error: `Template must start with "${validPrefix}"`
    }
  }

  // 分割为前缀和 tokens
  const { prefix, tokens } = splitMacroContent(macroContent)

  // 使用 rendererArgs 中的 parseRendererArgs 来解析参数
  const parsedArgs = parseRendererArgs(prefix, tokens)

  // 使用 rendererArgs 中的 findModel 来获取注册的模型
  const modelInfo = findModel(prefix)
  const model = modelInfo?.model

  // 检查位置参数
  if (model?.positional && model.positional.length > 0) {
    // 检查第一个位置参数（如果有）
    const firstPositional = model.positional[0]
    if (firstPositional && tokens.length > 0) {
      // 检查第一个位置参数是否被正确映射
      const mappedValue = parsedArgs[firstPositional]
      if (!mappedValue) {
        warnings.push(`First positional argument should be mapped to "${firstPositional}"`)
      }
    }
  }

  // 检查未知参数（警告而非错误）
  const knownKeys = model?.positional || []
  for (const key of Object.keys(parsedArgs)) {
    if (!knownKeys.includes(key)) {
      warnings.push(`Unknown parameter "${key}" - it may be ignored`)
    }
  }

  // 基本格式检查
  // 1. 不能有未闭合的大括号
  if ((template.match(/\{/g) || []).length !== (template.match(/\}/g) || []).length) {
    return {
      valid: false,
      error: 'Unmatched braces in template'
    }
  }

  // 2. 检查参数值中的特殊字符
  for (const token of tokens) {
    if (token.includes('{{') || token.includes('}}')) {
      return {
        valid: false,
        error: 'Nested braces are not supported in parameters'
      }
    }
  }

  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * 获取指定宏类型的有效前缀
 */
export function getMacroPrefix(macroType: keyof typeof MACRO_PREFIXES): string {
  return MACRO_PREFIXES[macroType]
}

/**
 * 获取所有宏类型的列表
 */
export function getMacroTypes(): Array<{ type: keyof typeof MACRO_PREFIXES; prefix: string }> {
  return Object.entries(MACRO_PREFIXES).map(([type, prefix]) => ({
    type: type as keyof typeof MACRO_PREFIXES,
    prefix
  }))
}

/**
 * 兼容性别名：保持与旧版本的 registerMacroModel 兼容，
 * 现在实际调用 rendererArgs 中的 registerRendererArgModel
 */
export function registerMacroModel(prefix: string, model: { positional?: string[] }): void {
  registerRendererArgModel(prefix, model)
}
