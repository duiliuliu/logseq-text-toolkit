import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import { Settings, SettingsContextType, ThemeType, LanguageType } from './types.ts'
import defaultSettings from './defaultSettings.ts'
import { logseqAPI } from '../logseq/index.ts'
import { logger } from '../lib/logger/logger.ts'

// 创建设置上下文
const SettingsContext = createContext<SettingsContextType | null>(null)

/**
 * 自定义 Hook，用于管理设置
 * @returns {SettingsContextType} 设置相关的状态和方法
 */
const useSettings = (): SettingsContextType => {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // 加载设置
  const loadSettingsData = useCallback(async (): Promise<Settings | null> => {
    setIsLoading(true)
    setError(null)
    try {
      // 使用logseqAPI
      if (logseqAPI && logseqAPI.settings) {
        // 确保所有必需字段都有值
        let data: Settings = {
          ...defaultSettings,
          ...logseqAPI.settings,
          // 确保类型正确
          theme: (logseqAPI.settings.theme || 'light') as ThemeType,
          language: (logseqAPI.settings.language || 'zh-CN') as LanguageType,
          useSystemTheme: Boolean(logseqAPI.settings.useSystemTheme),
          useSystemLanguage: Boolean(logseqAPI.settings.useSystemLanguage),
          // 确保工具栏相关字段类型正确
          toolbar: Boolean(logseqAPI.settings.toolbar),
          disabled: Boolean(logseqAPI.settings.disabled),
          showBorder: Boolean(logseqAPI.settings.showBorder),
          sponsorEnabled: Boolean(logseqAPI.settings.sponsorEnabled),
          // 确保数值类型正确
          hoverDelay: parseInt(logseqAPI.settings.hoverDelay) || 500
        }
        
        // 兼容旧版本的 funcmode 和 clickfunc
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
        
        // 如果设置了使用系统配置，从logseq获取系统配置
        if (data.useSystemTheme || data.useSystemLanguage) {
          try {
            const userConfigs = await logseqAPI.App.getUserConfigs()
            if (userConfigs) {
              const updatedSettings: Settings = {
                ...data,
                theme: data.useSystemTheme ? (userConfigs.preferredThemeMode as ThemeType) : data.theme,
                language: data.useSystemLanguage ? (userConfigs.preferredLanguage as LanguageType) : data.language
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
      // 如果没有logseqAPI，返回默认设置
      setSettings(defaultSettings)
      return defaultSettings
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 保存设置
  const saveSettingsData = useCallback(async (newSettings: Settings): Promise<boolean> => {
    setIsSaving(true)
    setError(null)
    try {
      if (logseqAPI) {
        // 处理系统设置标记
        const settingsToSave: Settings = {
          ...newSettings,
          useSystemTheme: newSettings.theme === 'system',
          useSystemLanguage: newSettings.language === 'system'
        }
        
        await logseqAPI.updateSettings(settingsToSave as unknown as Record<string, any>)
        
        // 如果设置为系统值，立即从logseq获取系统配置
        if (settingsToSave.useSystemTheme || settingsToSave.useSystemLanguage) {
          try {
            const userConfigs = await logseqAPI.App.getUserConfigs()
            if (userConfigs) {
              const updatedSettings: Settings = {
                ...settingsToSave,
                theme: settingsToSave.useSystemTheme ? (userConfigs.preferredThemeMode as ThemeType) : settingsToSave.theme,
                language: settingsToSave.useSystemLanguage ? (userConfigs.preferredLanguage as LanguageType) : settingsToSave.language
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
      setError(err instanceof Error ? err : new Error(String(err)))
      return false
    } finally {
      setIsSaving(false)
    }
  }, [])

  // 重置设置
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
      setError(err instanceof Error ? err : new Error(String(err)))
      return false
    } finally {
      setIsSaving(false)
    }
  }, [])

  // 初始化时加载设置
  useEffect(() => {
    loadSettingsData()
  }, [loadSettingsData])

  // 监听设置变化
  useEffect(() => {
    if (logseqAPI && (logseqAPI as any).onSettingsChanged) {
      const unsubscribe = (logseqAPI as any).onSettingsChanged((newSettings: any, oldSettings: any) => {
        // 确保类型正确
        let mergedSettings: Settings = {
          ...defaultSettings,
          ...newSettings,
          theme: (newSettings.theme || 'light') as ThemeType,
          language: (newSettings.language || 'zh-CN') as LanguageType,
          useSystemTheme: Boolean(newSettings.useSystemTheme),
          useSystemLanguage: Boolean(newSettings.useSystemLanguage),
          // 确保工具栏相关字段类型正确
          toolbar: Boolean(newSettings.toolbar),
          disabled: Boolean(newSettings.disabled),
          showBorder: Boolean(newSettings.showBorder),
          sponsorEnabled: Boolean(newSettings.sponsorEnabled),
          // 确保数值类型正确
          hoverDelay: parseInt(newSettings.hoverDelay) || 500
        }
        
        // 兼容旧版本的 funcmode 和 clickfunc
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

// Settings Provider 组件
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

// 用于在其他组件中访问设置
export const useSettingsContext = (): SettingsContextType => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider')
  }
  return context
}

export default useSettings
