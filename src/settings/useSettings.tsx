/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 */

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import { Settings, SettingsContextType } from './types.ts'
import defaultSettings from './defaultSettings.ts'
import { getSettingsWithSystem, updateSettings } from './index.ts'
import { logseqAPI } from '../logseq/index.ts'
import logger from '../lib/logger/index'

const SettingsContext = createContext<SettingsContextType | null>(null)

const useSettings = (): SettingsContextType => {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const loadSettings = useCallback(async (): Promise<Settings | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getSettingsWithSystem()
      setSettings(data)
      return data
    } catch (err) {
      logger.error('Failed to load settings:', err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveSettings = useCallback(async (newSettings: Partial<Settings>): Promise<boolean> => {
    setIsSaving(true)
    setError(null)
    try {
      updateSettings(newSettings)
      await loadSettings()
      return true
    } catch (err) {
      logger.error('Failed to save settings:', err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return false
    } finally {
      setIsSaving(false)
    }
  }, [loadSettings])

  const resetSettings = useCallback(async (): Promise<boolean> => {
    setIsSaving(true)
    setError(null)
    try {
      updateSettings(defaultSettings)
      await loadSettings()
      return true
    } catch (err) {
      logger.error('Failed to reset settings:', err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return false
    } finally {
      setIsSaving(false)
    }
  }, [loadSettings])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  useEffect(() => {
    if ((logseqAPI as any).onSettingsChanged) {
      const unsub = (logseqAPI as any).onSettingsChanged(() => {
        loadSettings()
      })
      return unsub
    }
  }, [loadSettings])

  useEffect(() => {
    // 监听 theme 变化
    const setupThemeListener = async () => {
      try {
        if ((logseqAPI as any).onThemeModeChanged) {
          const unsub = (logseqAPI as any).onThemeModeChanged(({ mode }: { mode: string }) => {
            const newTheme = mode === 'dark' ? 'dark' : 'light'
            setTheme(newTheme)
            logger.info(`[Settings] Theme changed to: ${newTheme}`)
          })
          return unsub
        }
      } catch (err) {
        logger.warn('[Settings] Failed to setup theme listener:', err)
      }
    }

    const unsubPromise = setupThemeListener()
    return () => {
      unsubPromise.then(unsub => {
        if (typeof unsub === 'function') {
          unsub()
        }
      })
    }
  }, [])

  return {
    settings,
    isLoading,
    isSaving,
    error,
    loadSettings,
    saveSettings,
    resetSettings,
    theme
  }
}

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const data = useSettings()
  return (
    <SettingsContext.Provider value={data}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettingsContext = () => {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider')
  return ctx
}

export default useSettings
