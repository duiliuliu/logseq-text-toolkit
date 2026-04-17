import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import { Settings, SettingsContextType } from './types.ts'
import defaultSettings from './defaultSettings.ts'
import { logseqAPI } from '../logseq/index.ts'

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

  // 同步系统配置
  const syncSystemConfigs = useCallback(async (currentSettings: Settings): Promise<Settings> => {
    let updatedSettings = { ...currentSettings };
    
    try {
      if (logseqAPI && logseqAPI.App && logseqAPI.App.getUserConfigs) {
        const systemConfigs = await logseqAPI.App.getUserConfigs();
        
        if (currentSettings.useSystemTheme) {
          updatedSettings.theme = systemConfigs.darkMode ? 'dark' : 'light';
        }
        
        if (currentSettings.useSystemLanguage) {
          updatedSettings.language = systemConfigs.preferredLanguage as LanguageType;
        }
      }
    } catch (err) {
      console.error('Failed to sync system configs:', err);
    }
    
    return updatedSettings;
  }, []);

  // 加载设置
  const loadSettingsData = useCallback(async (): Promise<Settings | null> => {
    setIsLoading(true)
    setError(null)
    try {
      // 使用logseqAPI
      let settingsData: Settings;
      if (logseqAPI && logseqAPI.settings) {
        settingsData = { ...defaultSettings, ...logseqAPI.settings } as unknown as Settings
      } else {
        settingsData = defaultSettings;
      }
      
      // 同步系统配置
      const updatedSettings = await syncSystemConfigs(settingsData);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      console.error('Failed to load settings:', err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [syncSystemConfigs])

  // 保存设置
  const saveSettingsData = useCallback(async (newSettings: Settings): Promise<boolean> => {
    setIsSaving(true)
    setError(null)
    try {
      if (logseqAPI) {
        await logseqAPI.updateSettings(newSettings as unknown as Record<string, any>)
        
        // 同步系统配置
        const updatedSettings = await syncSystemConfigs(newSettings);
        setSettings(updatedSettings);
        return true
      }
      return false
    } catch (err) {
      console.error('Failed to save settings:', err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return false
    } finally {
      setIsSaving(false)
    }
  }, [syncSystemConfigs])

  // 重置设置
  const resetSettingsData = useCallback(async (): Promise<boolean> => {
    setIsSaving(true)
    setError(null)
    try {
      if (logseqAPI) {
        await logseqAPI.updateSettings(defaultSettings as unknown as Record<string, any>)
        
        // 同步系统配置
        const updatedSettings = await syncSystemConfigs(defaultSettings);
        setSettings(updatedSettings);
        return true
      }
      return false
    } catch (err) {
      console.error('Failed to reset settings:', err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return false
    } finally {
      setIsSaving(false)
    }
  }, [syncSystemConfigs])

  // 初始化时加载设置
  useEffect(() => {
    loadSettingsData()
  }, [loadSettingsData])

  // 监听设置变化
  useEffect(() => {
    if (logseqAPI && (logseqAPI as any).onSettingsChanged) {
      const unsubscribe = (logseqAPI as any).onSettingsChanged(async (newSettings: any, oldSettings: any) => {
        console.log('Settings changed:', { newSettings, oldSettings })
        const mergedSettings = { ...defaultSettings, ...newSettings } as unknown as Settings
        
        // 同步系统配置
        const updatedSettings = await syncSystemConfigs(mergedSettings);
        setSettings(updatedSettings)
      })
      return unsubscribe
    }
  }, [syncSystemConfigs])

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
