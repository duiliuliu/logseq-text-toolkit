/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * React 组件渲染工具
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { SettingsProvider } from '../../settings/useSettings'

interface RenderComponentProps {
  [key: string]: any
}

export const renderComponent = (
  container: HTMLElement | null,
  Component: React.ComponentType<any>,
  props: RenderComponentProps = {}
) => {
  if (container) {
    ReactDOM.createRoot(container).render(
      <React.StrictMode>
        <SettingsProvider>
          <Component {...props} />
        </SettingsProvider>
      </React.StrictMode>
    )
  }
}

export const waitForElement = (id: string, timeout: number = 100): Promise<HTMLElement | null> => {
  return new Promise((resolve) => {
    const check = () => {
      const element = document.getElementById(id)
      if (element) {
        resolve(element)
      } else {
        setTimeout(check, 10)
      }
    }
    setTimeout(check, 10)
    setTimeout(() => resolve(null), timeout)
  })
}
