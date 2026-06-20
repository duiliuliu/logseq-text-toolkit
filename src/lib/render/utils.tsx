/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * React 渲染工具函数
 * 提供统一的组件渲染能力
 * =============================================================================
 * 核心改进（P0.3 - LRU + 上限 + StrictMode 条件启用）
 * =============================================================================
 * 问题：长时间运行插件，大量宏渲染器（heatmap, milestone, task-progress 等）
 *       每次渲染都会创建新的 ReactDOM.Root 实例，存入 roots Map 但从不清理，
 *       导致内存泄漏和性能下降。
 *
 * 解决方案：
 * 1. 最大 root 数量上限 (MAX_ROOTS = 50)：超过上限自动清理最久未使用的
 * 2. LRU 访问顺序更新：每次 renderComponent 访问容器时更新访问顺序
 * 3. 开发环境启用 StrictMode，生产环境禁用，减少不必要的双渲染开销
 * 4. 清理函数 unmountComponent + clearAllRoots 保持向后兼容
 *
 * 生命周期示例（LRU 顺序，最近访问的在末尾）：
 *   render(A)  → roots: [A]
 *   render(B)  → roots: [A, B]
 *   render(C)  → roots: [A, B, C]
 *   render(A)  → roots: [B, C, A]  (A 被访问，移到末尾)
 *   超过上限时：清理第一个（B），继续渲染
 * =============================================================================
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { SettingsProvider } from '../../settings/useSettings'
import logger from '../logger'

export interface RenderOptions {
  wrapWithProvider?: boolean
}

/** 最大 root 数量上限：避免长时间运行的内存泄漏 */
const MAX_ROOTS = 50

/** 开发环境标记，控制是否启用 React.StrictMode */
const IS_DEVELOPMENT = (() => {
  try {
    // @ts-ignore - Vite 环境变量
    return import.meta.env?.MODE === 'development' || import.meta.env?.DEV === true
  } catch {
    return false
  }
})()

/**
 * LRU 缓存结构
 * - keys() 返回的迭代器保持插入顺序
 * - 每次访问时将容器移到末尾（先 delete 再 set）
 * - 清理时从开头移除最久未使用的
 */
const roots = new Map<HTMLElement, ReactDOM.Root>()

/**
 * 清理最久未使用的 root
 * 当超过 MAX_ROOTS 上限时自动调用
 */
function evictOldestRoot(): void {
  const firstEntry = roots.entries().next()
  if (!firstEntry.done) {
    const [oldContainer, oldRoot] = firstEntry.value
    try {
      oldRoot.unmount()
      roots.delete(oldContainer)
      logger.debug('🧹 RenderUtils: Evicted LRU root')
    } catch (err) {
      logger.warn('🧹 RenderUtils: Failed to unmount evicted root:', err)
      roots.delete(oldContainer)
    }
  }
}

export function renderComponent<T extends object>(
  container: HTMLElement | null,
  Component: React.ComponentType<T>,
  props?: T,
  options: RenderOptions = { wrapWithProvider: true }
): void {
  if (!container) {
    return
  }

  // LRU: 访问时先移除再插入，保持"最近使用在末尾"的顺序
  const existingRoot = roots.get(container)
  if (existingRoot) {
    roots.delete(container)
    roots.set(container, existingRoot)
  } else {
    // 超过上限时清理最久未使用的 root
    if (roots.size >= MAX_ROOTS) {
      evictOldestRoot()
    }
    const newRoot = ReactDOM.createRoot(container)
    roots.set(container, newRoot)
    logger.debug(`🎨 RenderUtils: New root created (${roots.size}/${MAX_ROOTS})`)
  }

  const root = roots.get(container)!

  // 开发环境启用 StrictMode（帮助发现副作用问题），生产环境禁用以提升性能
  const element = options.wrapWithProvider ? (
    IS_DEVELOPMENT ? (
      <React.StrictMode>
        <SettingsProvider>
          <Component {...props} />
        </SettingsProvider>
      </React.StrictMode>
    ) : (
      <SettingsProvider>
        <Component {...props} />
      </SettingsProvider>
    )
  ) : (
    IS_DEVELOPMENT ? (
      <React.StrictMode>
        <Component {...props} />
      </React.StrictMode>
    ) : (
      <Component {...props} />
    )
  )

  root.render(element)
}

export function unmountComponent(container: HTMLElement): void {
  const root = roots.get(container)
  if (root) {
    try {
      root.unmount()
    } catch (err) {
      logger.warn('🧹 RenderUtils: unmountComponent failed:', err)
    }
    roots.delete(container)
  }
}

export function clearAllRoots(): void {
  let count = 0
  roots.forEach((root) => {
    try {
      root.unmount()
      count++
    } catch (err) {
      logger.warn('🧹 RenderUtils: clearAllRoots partial failure:', err)
    }
  })
  roots.clear()
  if (count > 0) {
    logger.debug(`🧹 RenderUtils: Cleared ${count} root(s)`)
  }
}

export function hasRoot(container: HTMLElement): boolean {
  return roots.has(container)
}

/** 供测试/调试使用：获取当前 root 数量 */
export function getRootCount(): number {
  return roots.size
}
