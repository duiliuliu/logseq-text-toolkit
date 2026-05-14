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
    // Create regex to match any of the prefixes
    const prefixPattern = prefixList.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
    const rendererRegex = new RegExp(`({{renderer\\s+(?:${prefixPattern})[^}]*?}})`, 'gi')
    
    return content.replace(rendererRegex, (rendererStr) => {
      // Extract the inside part: ":heatmap foo bar, key=value"
      const contentMatch = rendererStr.match(/{{renderer\s+([^}]+)}}/)
      if (!contentMatch) return rendererStr
      
      const rawContent = contentMatch[1]
      
      // Split into type and rest parts - the first token is the type
      const parts = rawContent.trim().split(/\s+/)
      if (parts.length === 0) return rendererStr
      
      const type = parts[0]
      const restParts = parts.slice(1).join(' ')
      
      // Tokenize rest parts using the same logic as splitRendererArgs
      const tokens = restParts
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
      
      // Parse existing args
      const existingArgs = parseRendererArgs(type, tokens)
      
      // Apply updates
      const newArgs: Record<string, string> = { ...existingArgs }
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) {
          delete newArgs[key]
        } else {
          newArgs[key] = value
        }
      }
      
      // Rebuild tokens: combine positional (if any) and named args
      const modelInfo = findModel(type)
      const positionalKeys = modelInfo?.model?.positional || []
      
      const newTokens: string[] = []
      
      // Handle positional arguments first
      for (const posKey of positionalKeys) {
        if (newArgs[posKey] !== undefined) {
          newTokens.push(newArgs[posKey])
          delete newArgs[posKey] // Remove from named args
        }
      }
      
      // Add remaining as named args
      for (const [key, value] of Object.entries(newArgs)) {
        newTokens.push(`${key}=${value}`)
      }
      
      // Build the new renderer string
      const tokenStr = newTokens.join(', ')
      const newRendererStr = tokenStr 
        ? `{{renderer ${type}, ${tokenStr}}}`
        : `{{renderer ${type}}}`
      
      return newRendererStr
    })
  }
  
  return { updateRendererArgs }
}
