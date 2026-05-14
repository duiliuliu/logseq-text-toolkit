/**
 * RendererArgs - 宏命令参数解析与更新工具
 * 
 * =============================================================================
 * 功能概述
 * =============================================================================
 * 
 * 本模块提供 Logseq 宏命令（如 {{renderer :heatmap}}）的参数解析和更新功能。
 * 支持位置参数和命名参数两种格式，支持多语言前缀。
 * 
 * =============================================================================
 * 支持的宏命令格式
 * =============================================================================
 * 
 * 1. 基础格式（无参数）:
 *    {{renderer :heatmap}}
 *    {{renderer :热力图}}
 * 
 * 2. 位置参数格式:
 *    {{renderer :heatmap year}}
 *    {{renderer :heatmap month}}
 *    {{renderer :热力图 year}}
 * 
 * 3. 命名参数格式:
 *    {{renderer :heatmap, view=month}}
 *    {{renderer :heatmap, displayMode=full, containerWidth=600px}}
 * 
 * 4. 混合格式:
 *    {{renderer :heatmap month, displayMode=full}}
 *    {{renderer :heatmap, year, containerWidth=500px}}
 * 
 * =============================================================================
 * 参数类型说明
 * =============================================================================
 * 
 * - 位置参数 (Positional): 
 *   第一个单词类型的参数，如 {{renderer :heatmap year}} 中的 'year'
 *   需要在注册时声明: registerRendererArgModel(':heatmap', { positional: ['view'] })
 * 
 * - 命名参数 (Named): 
 *   key=value 格式的参数，如 containerWidth=600px
 *   不需要预先声明，任意 key=value 都支持
 * 
 * =============================================================================
 * 使用示例
 * =============================================================================
 * 
 * // 1. 注册宏命令参数模型
 * registerRendererArgModel(':heatmap', { positional: ['view'] });
 * registerRendererArgModel(':blockview', { positional: ['view'] });
 * 
 * // 2. 创建更新器实例
 * const { updateRendererArgs } = createRendererArgUpdater([':heatmap', ':热力图']);
 * 
 * // 3. 解析参数（用于读取）
 * const split = splitRendererArgs([':heatmap', 'year', ',', 'displayMode=full']);
 * // → { type: ':heatmap', tokens: ['year', 'displayMode=full'] }
 * 
 * const parsed = parseRendererArgs(':heatmap', ['year', 'displayMode=full']);
 * // → { view: 'year', displayMode: 'full' }
 * 
 * // 4. 更新参数（用于写入）
 * const content = '{{renderer :heatmap, view=month}}';
 * const updated = updateRendererArgs(content, { containerWidth: '800px' });
 * // → '{{renderer :heatmap, month, containerWidth=800px}}'
 * 
 * // 5. 删除参数
 * const deleted = updateRendererArgs(content, { view: null });
 * // → '{{renderer :heatmap}}'
 * 
 * =============================================================================
 * 参数优先级
 * =============================================================================
 * 
 * 当同时存在位置参数和命名参数时：
 * 1. 命名参数优先（可以覆盖位置参数）
 * 2. 输出时位置参数放在前面，命名参数放在后面
 * 
 * 示例:
 * 输入: {{renderer :heatmap year, view=month}}
 * 解析: { view: 'month' }  ← 命名参数覆盖了位置参数
 * 输出: {{renderer :heatmap, month}}  ← view 放在前面作为位置参数
 * 
 * =============================================================================
 * 注意事项
 * =============================================================================
 * 
 * 1. 本模块不处理嵌套大括号 {{...{{inner}}...}}
 * 2. 参数值中的逗号可能导致解析不准确
 * 3. 中文前缀需要单独注册
 * 
 * =============================================================================
 */

export type RendererArgModel = {
  positional?: string[]
}

const models = new Map<string, RendererArgModel>()

/**
 * 注册宏命令参数模型
 * 
 * @param prefix - 宏命令前缀，如 ':heatmap' 或 ':热力图'
 * @param model - 参数模型配置
 * 
 * @example
 * registerRendererArgModel(':heatmap', { positional: ['view'] });
 * registerRendererArgModel(':热力图', { positional: ['view'] });
 */
export function registerRendererArgModel(prefix: string, model: RendererArgModel): void {
  models.set(prefix, model)
}

function findModel(type: string): { prefix: string; model: RendererArgModel } | null {
  let best: { prefix: string; model: RendererArgModel } | null = null
  for (const [prefix, model] of models.entries()) {
    if (!type.startsWith(prefix)) continue
    if (!best || prefix.length > best.prefix.length) {
      best = { prefix, model }
    }
  }
  return best
}

/**
 * 分割宏命令参数（用于读取）
 * 
 * 将 Logseq 传入的 payload.arguments 数组分割为 type 和 tokens
 * 
 * @param payloadArgs - Logseq App.onMacroRendererSlotted 回调中的 arguments
 * @returns 包含 type（宏类型）和 tokens（参数列表）的对象
 * 
 * @example
 * const result = splitRendererArgs([':heatmap', 'year', ',', 'displayMode=full']);
 * // result = { type: ':heatmap', tokens: ['year', 'displayMode=full'] }
 */
export function splitRendererArgs(payloadArgs: any[] | undefined): { type: string; tokens: string[] } | null {
  const args = (payloadArgs || []).map(v => String(v))
  if (args.length === 0) return null

  const type = args[0].trim()
  const restParts = args.slice(1).map(s => s.trim()).filter(Boolean)
  const tokens = restParts
    .flatMap(s => s.split(','))
    .map(s => s.trim())
    .filter(Boolean)

  return { type, tokens }
}

/**
 * 解析宏命令 tokens
 * 
 * 将 tokens 数组解析为 key-value 对象
 * 位置参数会根据注册的模型映射到对应的 key
 * 
 * @param type - 宏命令类型，如 ':heatmap'
 * @param tokens - 参数 tokens 数组
 * @returns 解析后的参数对象
 * 
 * @example
 * registerRendererArgModel(':heatmap', { positional: ['view'] });
 * const parsed = parseRendererArgs(':heatmap', ['year', 'displayMode=full']);
 * // parsed = { view: 'year', displayMode: 'full' }
 */
export function parseRendererArgs(type: string, tokens: string[]): Record<string, string> {
  const modelInfo = findModel(type)
  const model = modelInfo?.model

  const map: Record<string, string> = {}
  const positional: string[] = []

  for (const token of tokens) {
    const idx = token.indexOf('=')
    if (idx > 0) {
      const k = token.slice(0, idx).trim()
      const v = token.slice(idx + 1).trim()
      if (k) map[k] = v
      continue
    }
    positional.push(token)
  }

  if (model?.positional?.length) {
    for (let i = 0; i < model.positional.length; i++) {
      const key = model.positional[i]
      if (!key) continue
      if (map[key] !== undefined) continue
      if (positional[i] !== undefined) {
        map[key] = positional[i]
      }
    }
  }

  return map
}

/**
 * 创建宏命令参数更新器
 * 
 * 创建一个 updater 函数，用于更新 block 内容中的宏命令参数
 * 
 * @param prefixes - 支持的宏命令前缀数组
 * @returns 包含 updateRendererArgs 函数的对象
 * 
 * @example
 * const { updateRendererArgs } = createRendererArgUpdater([':heatmap', ':热力图']);
 * 
 * // 添加新参数
 * updateRendererArgs('{{renderer :heatmap}}', { view: 'year' });
 * // → '{{renderer :heatmap, year}}'
 * 
 * // 更新现有参数
 * updateRendererArgs('{{renderer :heatmap, view=month}}', { view: 'year' });
 * // → '{{renderer :heatmap, year}}'
 * 
 * // 删除参数
 * updateRendererArgs('{{renderer :heatmap, view=month}}', { view: null });
 * // → '{{renderer :heatmap}}'
 * 
 * // 批量操作
 * updateRendererArgs('{{renderer :heatmap, view=month}}', { 
 *   view: 'year', 
 *   containerWidth: '600px' 
 * });
 * // → '{{renderer :heatmap, year, containerWidth=600px}}'
 */
export function createRendererArgUpdater(prefixes: string | string[]): {
  updateRendererArgs: (content: string, updates: Record<string, string | null>) => string
} {
  const prefixList = Array.isArray(prefixes) ? prefixes : [prefixes]
  
  const updateRendererArgs = (content: string, updates: Record<string, string | null>): string => {
    const prefixPattern = prefixList.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
    const rendererRegex = new RegExp(`({{renderer\\s+(?:${prefixPattern})[^}]*?}})`, 'gi')
    
    return content.replace(rendererRegex, (rendererStr) => {
      const contentMatch = rendererStr.match(/{{renderer\s+([^}]+)}}/)
      if (!contentMatch) return rendererStr
      
      const rawContent = contentMatch[1].trim()
      
      // Split by comma first - handles both "type, args" and "type args" formats
      const commaParts = rawContent.split(',').map(s => s.trim())
      
      // First part may be "type" or "type args" - split by space to extract type
      const firstPart = commaParts[0]
      
      // Split firstPart by space to get type and any inline args
      const typeParts = firstPart.split(/\s+/)
      const type = typeParts[0]
      
      // Collect all args: inline args from firstPart + all remaining comma parts
      // Only split by space for comma parts that don't contain '=' or nested '{{'
      const argTokens: string[] = []
      
      // Add inline args from firstPart (skip type itself at index 0)
      for (let i = 1; i < typeParts.length; i++) {
        argTokens.push(typeParts[i])
      }
      
      // Add all subsequent comma parts
      for (let i = 1; i < commaParts.length; i++) {
        const part = commaParts[i]
        // Only split by space if part doesn't contain '=' (named arg) or nested '{{'
        if (!part.includes('=') && !part.includes('{{')) {
          const subParts = part.split(/\s+/)
          for (const subPart of subParts) {
            if (subPart.trim()) {
              argTokens.push(subPart.trim())
            }
          }
        } else {
          argTokens.push(part)
        }
      }
      
      // Parse existing args
      const existingArgs = parseRendererArgs(type, argTokens)
      const positionalKeys = findModel(type)?.model?.positional || []
      
      // Check which positional keys had positional format (no = sign) in original tokens
      const keepAsPositional: Record<string, boolean> = {}
      for (const token of argTokens) {
        if (!token.includes('=')) {
          for (const posKey of positionalKeys) {
            if (existingArgs[posKey] === token) {
              keepAsPositional[posKey] = true
            }
          }
        }
      }
      
      // Apply updates
      const newArgs: Record<string, string> = { ...existingArgs }
      const updatedPositionalKeys: string[] = []
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) {
          delete newArgs[key]
          delete keepAsPositional[key]
        } else {
          newArgs[key] = value
          // Only set positional format if this key wasn't originally in named format
          if (positionalKeys.includes(key) && !keepAsPositional[key]) {
            keepAsPositional[key] = true
            updatedPositionalKeys.push(key)
          }
        }
      }
      
      // Rebuild tokens - positionals first, then named args
      const newTokens: string[] = []
      
      // Add positional args first
      for (const posKey of positionalKeys) {
        if (newArgs[posKey] !== undefined) {
          if (keepAsPositional[posKey]) {
            newTokens.push(newArgs[posKey])
          } else {
            newTokens.push(`${posKey}=${newArgs[posKey]}`)
          }
          delete newArgs[posKey]
        }
      }
      
      // Add remaining as named args
      for (const [key, value] of Object.entries(newArgs)) {
        newTokens.push(`${key}=${value}`)
      }
      
      const newRendererStr = newTokens.length > 0
        ? `{{renderer ${type}, ${newTokens.join(', ')}}}`
        : `{{renderer ${type}}}`
      
      return newRendererStr
    })
  }
  
  return { updateRendererArgs }
}
