import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import { Settings, SettingsContextType, ThemeType, LanguageType } from './types.ts'
import defaultSettings from './defaultSettings.ts'
import { logseqAPI } from '../logseq/index.ts'
import { logger } from '../lib/logger/logger.ts'

const SettingsContext = createContext<SettingsContextType | null>(null)

const useSettings = (): SettingsContextType => {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadSettingsData = useCallback(async (): Promise<Settings | null> => {
    setIsLoading(true)
    setError(null)
    try {
      if (logseqAPI && logseqAPI.settings) {
        let data: Settings = {
          ...defaultSettings,
          ...logseqAPI.settings,
          theme: (logseqAPI.settings.theme || 'light') as ThemeType,
          language: (logseqAPI.settings.language || 'zh-CN') as LanguageType,
          useSystemTheme: Boolean(logseqAPI.settings.useSystemTheme),
          toolbar: Boolean(logseqAPI.settings.toolbar),
          disabled: Boolean(logseqAPI.settings.disabled),
          showBorder: Boolean(logseqAPI.settings.showBorder),
          sponsorEnabled: Boolean(logseqAPI.settings.sponsorEnabled),
          hoverDelay: parseInt(logseqAPI.settings.hoverDelay) || 500
        }
        
        if (data.ToolbarItems) {
          data.ToolbarItems = data.ToolbarItems.map(item => {
            if ('funcmode' in item && 'clickfunc' in item && !('invoke' in item)) {
              item.invoke = item.funcmode
              item.invokeParams = item.clickfunc
            }
            if ('subItems' in item && item.subItems) {
              item.subItems = item.subItems.map(subItem => {
                if ('funcmode' in subItem && 'clickfunc' in subItem && !('invoke' in subItem)) {
                  subItem.invoke = subItem.funcmode
                  subItem.invokeParams = subItem.clickfunc
                }
                return subItem
              })
            }
            return item
          })
        }
        
        if (data.useSystemTheme) {
          try {
            const userConfigs = await logseqAPI.App.getUserConfigs()
            if (userConfigs) {
              const updatedSettings: Settings = {
                ...data,
                theme: userConfigs.preferredThemeMode as ThemeType
              }
              setSettings(updatedSettings)
              return updatedSettings
            }
          } catch {
            setSettings(data)
            return data
          }
        }
        
        setSettings(data)
        return data
      }
      setSettings(defaultSettings)
      return defaultSettings
    } catch (err) {
      logger.error('Failed to load settings:', err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveSettingsData = useCallback(async (newSettings: Settings): Promise<boolean> => {
    setIsSaving(true)
    setError(null)
    try {
      if (logseqAPI) {
        const settingsToSave: Settings = {
          ...newSettings,
          useSystemTheme: newSettings.theme === 'system'
        }
        
        await logseqAPI.updateSettings(settingsToSave as unknown as Record<string, any>)
        
        if (settingsToSave.useSystemTheme) {
          try {
            const userConfigs = await logseqAPI.App.getUserConfigs()
            if (userConfigs) {
              const updatedSettings: Settings = {
                ...settingsToSave,
                theme: userConfigs.preferredThemeMode as ThemeType
              }
              setSettings(updatedSettings)
            }
          } catch {
            setSettings(settingsToSave)
          }
        } else {
          setSettings(settingsToSave)
        }
        return true
      }
      return false
    } catch (err) {
      logger.error('Failed to save settings:', err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return false
    } finally {
      setIsSaving(false)
    }
  }, [])

  const resetSettingsData = useCallback(async (): Promise<boolean> => {
    setIsSaving(true)
    setError(null)
    try {
      if (logseqAPI) {
        await logseqAPI.updateSettings(defaultSettings as unknown as Record<string, any>)
        setSettings(defaultSettings)
        return true
      }
      return false
    } catch (err) {
      logger.error('Failed to save settings:', err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return false
    } finally {
      setIsSaving(false)
    }
  }, [])

  useEffect(() => {
    loadSettingsData()
  }, [loadSettingsData])

  useEffect(() => {
    if (logseqAPI && (logseqAPI as any).onSettingsChanged) {
      const unsubscribe = (logseqAPI as any).onSettingsChanged((newSettings: any, oldSettings: any) => {
        let mergedSettings: Settings = {
          ...defaultSettings,
          ...newSettings,
          theme: (newSettings.theme || 'light') as ThemeType,
          language: (newSettings.language || 'zh-CN') as LanguageType,
          useSystemTheme: Boolean(newSettings.useSystemTheme),
          toolbar: Boolean(newSettings.toolbar),
          disabled: Boolean(newSettings.disabled),
          showBorder: Boolean(newSettings.showBorder),
          sponsorEnabled: Boolean(newSettings.sponsorEnabled),
          hoverDelay: parseInt(newSettings.hoverDelay) || 500
        }
        
        if (mergedSettings.ToolbarItems) {
          mergedSettings.ToolbarItems = mergedSettings.ToolbarItems.map(item => {
            if ('funcmode' in item && 'clickfunc' in item && !('invoke' in item)) {
              item.invoke = item.funcmode
              item.invokeParams = item.clickfunc
            }
            if ('subItems' in item && item.subItems) {
              item.subItems = item.subItems.map(subItem => {
                if ('funcmode' in subItem && 'clickfunc' in subItem && !('invoke' in subItem)) {
                  subItem.invoke = subItem.funcmode
                  subItem.invokeParams = subItem.clickfunc
                }
                return subItem
              })
            }
            return item
          })
        }
        setSettings(mergedSettings)
      })
      return unsubscribe
    }
  }, [])

  return {
    settings,
    isLoading,
    isSaving,
    error,
    loadSettings: loadSettingsData,
    saveSettings: saveSettingsData,
    resetSettings: resetSettingsData
  }
}

interface SettingsProviderProps {
  children: ReactNode
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const settingsData = useSettings()

  return (
    <SettingsContext.Provider value={settingsData}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettingsContext = (): SettingsContextType => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider')
  }
  return context
}

export default useSettings
