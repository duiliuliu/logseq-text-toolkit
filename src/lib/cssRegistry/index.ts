/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * CSS 资源注册中心
 * 提供 CSS 资源的注册、加载和管理功能
 * 
 * 工作流程：
 * 1. registerCSS() 注册 CSS 内容（自动存储到内存）
 * 2. getCSSFileList() 获取 CSS 文件列表（供 vite 打包使用）
 * 3. 打包时自动从注册内容生成 CSS 文件到 dist
 */

import { logseqAPI } from '../../logseq'
import logger from '../logger'

/* ============================================================================
   类型定义
   ============================================================================ */

export type CSSSource = 
  | { type: 'inline'; content: string }
  | { type: 'external'; path: string }
  | { type: 'both'; inlineContent: string; externalPath?: string }

interface CSSRegistration {
  name: string
  source: CSSSource
  loaded?: boolean
}

/* ============================================================================
   注册表管理
   ============================================================================ */

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

/* ============================================================================
   CSS 文件列表导出（供打包脚本使用）
   ============================================================================ */

/**
 * 获取所有需要导出为外部文件的 CSS 列表
 * 格式: { name: string, content: string, fileName: string }
 * 
 * 使用场景：
 * 1. vite.config.js 调用此函数获取 CSS 列表
 * 2. 打包时自动生成 CSS 文件到 dist
 */
export function getCSSFileList(): Array<{ name: string; content: string; fileName: string }> {
  const files: Array<{ name: string; content: string; fileName: string }> = []
  
  for (const reg of registrations.values()) {
    if (reg.source.type === 'inline' && reg.source.content) {
      files.push({
        name: reg.name,
        content: reg.source.content,
        fileName: `${reg.name}.css`
      })
    } else if (reg.source.type === 'both' && reg.source.inlineContent) {
      files.push({
        name: reg.name,
        content: reg.source.inlineContent,
        fileName: reg.source.externalPath || `${reg.name}.css`
      })
    } else if (reg.source.type === 'external' && reg.source.path) {
      files.push({
        name: reg.name,
        content: '',
        fileName: reg.source.path
      })
    }
  }
  
  return files
}

/* ============================================================================
   CSS 加载
   ============================================================================ */

export async function loadAllCSS(): Promise<void> {
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
