export type RendererArgModel = {
  positional?: string[]
}

const models = new Map<string, RendererArgModel>()

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
      const typeParts = firstPart.split(/\s+/)
      const type = typeParts[0]
      
      // Collect all args from all comma parts
      const argTokens: string[] = []
      
      // Add remaining args from first part (skip type itself)
      for (let i = 1; i < typeParts.length; i++) {
        argTokens.push(typeParts[i])
      }
      
      // Add all subsequent comma parts
      for (let i = 1; i < commaParts.length; i++) {
        argTokens.push(commaParts[i])
      }
      
      // Parse existing args
      const existingArgs = parseRendererArgs(type, argTokens)
      const positionalKeys = findModel(type)?.model?.positional || []
      
      // Check which positional keys had positional format (no = sign)
      const positionalFormat: Record<string, boolean> = {}
      for (const token of argTokens) {
        if (!token.includes('=')) {
          for (const posKey of positionalKeys) {
            if (existingArgs[posKey] === token) {
              positionalFormat[posKey] = true
            }
          }
        }
      }
      
      // Apply updates
      const newArgs: Record<string, string> = { ...existingArgs }
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) {
          delete newArgs[key]
        } else {
          newArgs[key] = value
        }
      }
      
      // Rebuild tokens - positionals first, then named args
      const newTokens: string[] = []
      
      // Add positional args first
      for (const posKey of positionalKeys) {
        if (newArgs[posKey] !== undefined) {
          newTokens.push(newArgs[posKey])
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
