/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * CSS 资源注册中心
 * 统一管理所有 CSS 资源的加载和拷贝
 */

import { logseqAPI } from '../../logseq'
import logger from '../../lib/logger'

export type CSSSource = 
  | { type: 'inline'; content: string }
  | { type: 'external'; path: string; copyTo?: string }
  | { type: 'both'; inlineContent: string; externalPath?: string; copyTo?: string }

interface CSSRegistration {
  name: string
  source: CSSSource
  loaded?: boolean
}

const registrations: Map<string, CSSRegistration> = new Map()

export function registerCSS(name: string, source: CSSSource): void {
  if (registrations.has(name)) {
    logger.warn(`[CSSRegistry] CSS "${name}" already registered, skipping`)
    return
  }
  registrations.set(name, { name, source })
  logger.debug(`[CSSRegistry] Registered CSS: ${name}`)
}

export function unregisterCSS(name: string): void {
  registrations.delete(name)
  logger.debug(`[CSSRegistry] Unregistered CSS: ${name}`)
}

export function getCSSRegistration(name: string): CSSRegistration | undefined {
  return registrations.get(name)
}

export function getAllRegistrations(): CSSRegistration[] {
  return Array.from(registrations.values())
}

export function getCopyFiles(): Array<{ from: string; to?: string }> {
  const files: Array<{ from: string; to?: string }> = []
  
  for (const reg of registrations.values()) {
    if (reg.source.type === 'external' && reg.source.path) {
      files.push({
        from: reg.source.path,
        to: reg.source.copyTo
      })
    } else if (reg.source.type === 'both' && reg.source.externalPath) {
      files.push({
        from: reg.source.externalPath,
        to: reg.source.copyTo
      })
    }
  }
  
  return files
}

export async function loadAllCSS(): Promise<void> {
  const { registerAllCSS } = await import('./registerAll')
  registerAllCSS()
  
  logger.info(`[CSSRegistry] Loading ${registrations.size} CSS resources...`)
  
  for (const reg of registrations.values()) {
    if (reg.loaded) continue
    
    try {
      await loadCSSResource(reg)
      reg.loaded = true
    } catch (error) {
      logger.error(`[CSSRegistry] Failed to load CSS "${reg.name}":`, error)
    }
  }
  
  logger.info('[CSSRegistry] CSS loading completed')
}

async function loadCSSResource(reg: CSSRegistration): Promise<void> {
  const { name, source } = reg
  
  if (source.type === 'inline') {
    logseqAPI.provideStyle(source.content)
    logger.info(`[CSSRegistry] Loaded inline CSS: ${name}`)
    
  } else if (source.type === 'external') {
    await loadExternalCSS(name, source.path)
    
  } else if (source.type === 'both') {
    logseqAPI.provideStyle(source.inlineContent)
    logger.info(`[CSSRegistry] Loaded inline CSS: ${name}`)
    
    if (source.externalPath) {
      await loadExternalCSS(name, source.externalPath)
    }
  }
}

async function loadExternalCSS(name: string, path: string): Promise<void> {
  try {
    const response = await fetch(`./${path}`)
    if (response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('text/css')) {
        const content = await response.text()
        if (content.trim()) {
          logseqAPI.provideStyle(content)
          logger.info(`[CSSRegistry] Loaded external CSS: ${name} from ${path}`)
        } else {
          logger.warn(`[CSSRegistry] External CSS is empty: ${name} from ${path}`)
        }
      } else {
        logger.warn(`[CSSRegistry] Response is not CSS: ${name} from ${path}`)
      }
    } else {
      logger.warn(`[CSSRegistry] CSS file not found: ${name} from ${path}`)
    }
  } catch (error) {
    logger.error(`[CSSRegistry] Error loading external CSS ${name}:`, error)
    throw error
  }
}
