import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { loadSettings, saveSettings, resetSettings } from '../utils/settings.js'

// 创建设置上下文
const SettingsContext = createContext(null)

/**
 * 自定义 Hook，用于管理设置
 * @returns {Object} 设置相关的状态和方法
 */
const useSettings = () => {
  const [settings, setSettings] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  // 加载设置
  const loadSettingsData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await loadSettings()
      setSettings(data)
      return data
    } catch (err) {
      console.error('Failed to load settings:', err)
      setError(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 保存设置
  const saveSettingsData = useCallback(async (newSettings) => {
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
      setError(err)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [])

  // 重置设置
  const resetSettingsData = useCallback(async () => {
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
      setError(err)
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
export const SettingsProvider = ({ children }) => {
  const settingsData = useSettings()

  return (
    <SettingsContext.Provider value={settingsData}>
      {children}
    </SettingsContext.Provider>
  )
}

// 用于在其他组件中访问设置
export const useSettingsContext = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider')
  }
  return context
}

export default useSettings
