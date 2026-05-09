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
