/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * React 渲染工具函数
 * 提供统一的组件渲染能力
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { SettingsProvider } from '../../settings/useSettings'

export interface RenderOptions {
  wrapWithProvider?: boolean
}

const roots = new Map<HTMLElement, ReactDOM.Root>()

export function renderComponent<T extends object>(
  container: HTMLElement | null,
  Component: React.ComponentType<T>,
  props?: T,
  options: RenderOptions = { wrapWithProvider: true }
): void {
  if (!container) {
    return
  }

  if (!roots.has(container)) {
    roots.set(container, ReactDOM.createRoot(container))
  }

  const root = roots.get(container)!
  const element = options.wrapWithProvider ? (
    <React.StrictMode>
      <SettingsProvider>
        <Component {...props} />
      </SettingsProvider>
    </React.StrictMode>
  ) : (
    <React.StrictMode>
      <Component {...props} />
    </React.StrictMode>
  )

  root.render(element)
}

export function unmountComponent(container: HTMLElement): void {
  const root = roots.get(container)
  if (root) {
    root.unmount()
    roots.delete(container)
  }
}

export function clearAllRoots(): void {
  roots.forEach((root) => root.unmount())
  roots.clear()
}

export function hasRoot(container: HTMLElement): boolean {
  return roots.has(container)
}
