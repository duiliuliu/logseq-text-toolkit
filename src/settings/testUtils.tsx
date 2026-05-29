/**
 * Settings 测试工具组件
 * 为测试提供完整的 settings context
 */

import React from 'react'
import { Settings, SettingsContextType } from './types.ts'
import defaultSettings from './defaultSettings.ts'

/**
 * Mock useSettings hook for testing
 */
export const mockUseSettings = (overrides?: Partial<Settings>) => {
  const settings: Settings = {
    ...defaultSettings,
    ...overrides
  }

  return {
    settings,
    isLoading: false,
    isSaving: false,
    error: null,
    theme: 'light' as const,
    saveSettings: async () => true,
    resetSettings: async () => true,
    setTheme: () => {}
  }
}

export const MockSettingsProvider: React.FC<{
  children: React.ReactNode
  initialSettings?: Partial<Settings>
}> = ({ children }) => {
  return <>{children}</>
}
