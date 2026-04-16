import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import { loadSettings, saveSettings, resetSettings } from '../utils/settings.ts'
import { Settings, SettingsContextType } from '../config/types.ts'

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
      const data = await loadSettings()
      setSettings(data)
      return data
    } catch (err) {
      console.error('Failed to load settings:', err)
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
      const success = await saveSettings(newSettings)
      if (success) {
        setSettings(newSettings)
      }
      return success
    } catch (err) {
      console.error('Failed to save settings:', err)
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
      const success = await resetSettings()
      if (success) {
        await loadSettingsData()
      }
      return success
    } catch (err) {
      console.error('Failed to reset settings:', err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return false
    } finally {
      setIsSaving(false)
    }
  }, [loadSettingsData])

  // 初始化时加载设置
  useEffect(() => {
    loadSettingsData()
  }, [loadSettingsData])

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
