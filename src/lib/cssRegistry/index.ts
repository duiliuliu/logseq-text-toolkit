/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * CSS 资源注册中心
 * 提供 CSS 资源的注册、加载和管理功能
 * 支持 inline（内置）、external（外部）和 both（混合）三种类型
 */

import { logseqAPI } from '../../logseq'
import logger from '../logger'

/* ============================================================================
   类型定义
   ============================================================================ */

/**
 * CSS 资源来源类型
 * - inline: 内置 CSS 字符串
 * - external: 外部 CSS 文件路径
 * - both: 两者都有，优先使用 external
 */
export type CSSSource = 
  | { type: 'inline'; content: string }
  | { type: 'external'; path: string; copyTo?: string }
  | { type: 'both'; inlineContent: string; externalPath?: string; copyTo?: string }

interface CSSRegistration {
  name: string
  source: CSSSource
  loaded?: boolean
}

/* ============================================================================
   注册表管理
   ============================================================================ */

/** CSS 注册表，存储所有已注册的 CSS 资源 */
const registrations: Map<string, CSSRegistration> = new Map()

/**
 * 注册一个 CSS 资源
 * @param name - CSS 资源名称（唯一标识）
 * @param source - CSS 来源配置
 */
export function registerCSS(name: string, source: CSSSource): void {
  if (registrations.has(name)) {
    logger.warn(`⚠️ CSSRegistry: CSS "${name}" already registered, skipping`);
    return;
  }
  registrations.set(name, { name, source });
  logger.debug(`🎨 CSSRegistry: Registered CSS: ${name}`);
}

/**
 * 取消注册 CSS 资源
 * @param name - CSS 资源名称
 */
export function unregisterCSS(name: string): void {
  registrations.delete(name);
  logger.debug(`🎨 CSSRegistry: Unregistered CSS: ${name}`);
}

/**
 * 获取单个 CSS 注册信息
 * @param name - CSS 资源名称
 * @returns 注册信息或 undefined
 */
export function getCSSRegistration(name: string): CSSRegistration | undefined {
  return registrations.get(name)
}

/**
 * 获取所有已注册的 CSS 资源
 * @returns CSS 注册信息数组
 */
export function getAllRegistrations(): CSSRegistration[] {
  return Array.from(registrations.values())
}

/* ============================================================================
   外部文件复制（供打包脚本使用）
   ============================================================================ */

/**
 * 获取需要复制到 dist 目录的外部 CSS 文件列表
 * 供 copy-css.js 等打包脚本调用
 * @returns 文件路径列表，格式 { from: string; to?: string }
 */
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

/* ============================================================================
   CSS 加载
   ============================================================================ */

/**
 * 加载所有已注册的 CSS 资源
 * 按类型分别处理 inline 和 external
 */
export async function loadAllCSS(): Promise<void> {
  logger.info(`🎨 CSSRegistry: Loading ${registrations.size} CSS resources...`);

  for (const reg of registrations.values()) {
    if (reg.loaded) continue;

    try {
      await loadCSSResource(reg);
      reg.loaded = true;
    } catch (error) {
      logger.error(`❌ CSSRegistry: Failed to load CSS "${reg.name}"`, error);
    }
  }

  logger.info('✅ CSSRegistry: CSS loading completed');
}

/**
 * 加载单个 CSS 资源
 * @param reg - CSS 注册信息
 */
async function loadCSSResource(reg: CSSRegistration): Promise<void> {
  const { name, source } = reg;

  if (source.type === 'inline') {
    logseqAPI.provideStyle(source.content);
    logger.info(`🎨 CSSRegistry: Loaded inline CSS: ${name}`);

  } else if (source.type === 'external') {
    await loadExternalCSS(name, source.path);

  } else if (source.type === 'both') {
    logseqAPI.provideStyle(source.inlineContent);
    logger.info(`🎨 CSSRegistry: Loaded inline CSS: ${name}`);

    if (source.externalPath) {
      await loadExternalCSS(name, source.externalPath);
    }
  }
}

/**
 * 从外部路径加载 CSS 文件
 * @param name - CSS 名称（用于日志）
 * @param path - CSS 文件路径（相对路径，会拼接 ./）
 */
async function loadExternalCSS(name: string, path: string): Promise<void> {
  try {
    const response = await fetch(`./${path}`);
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/css')) {
        const content = await response.text();
        if (content.trim()) {
          logseqAPI.provideStyle(content);
          logger.info(`🎨 CSSRegistry: Loaded external CSS: ${name} from ${path}`);
        } else {
          logger.warn(`⚠️ CSSRegistry: External CSS is empty: ${name} from ${path}`);
        }
      } else {
        logger.warn(`⚠️ CSSRegistry: Response is not CSS: ${name} from ${path}`);
      }
    } else {
      logger.warn(`⚠️ CSSRegistry: CSS file not found: ${name} from ${path}`);
    }
  } catch (error) {
    logger.error(`❌ CSSRegistry: Error loading external CSS ${name}`, error);
  }
}
