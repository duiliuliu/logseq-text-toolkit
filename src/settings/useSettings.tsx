/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 */

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import { Settings, SettingsContextType } from './types.ts'
import defaultSettings from './defaultSettings.ts'
import { processSettings, updateSettings as updateSettingsInIndex } from './index.ts'
import { logseqAPI } from '../logseq/index.ts'
import { logger } from '../logseq/logger'

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
      if (logseqAPI && logseqAPI.settings) {
        let userConfigs: any = null
        try {
          userConfigs = await logseqAPI.App.getUserConfigs()
        } catch {
          // 忽略获取失败的情况
        }

        const data = processSettings(logseqAPI.settings, userConfigs)
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

  // 保存设置
  const saveSettingsData = useCallback(async (newSettings: Settings): Promise<boolean> => {
    setIsSaving(true)
    setError(null)
    try {
      if (logseqAPI) {
        updateSettingsInIndex(newSettings)

        let userConfigs: any = null
        try {
          userConfigs = await logseqAPI.App.getUserConfigs()
        } catch {
          // 忽略获取失败的情况
        }

        const updatedSettings = processSettings(newSettings, userConfigs)
        setSettings(updatedSettings)
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

  // 重置设置
  const resetSettingsData = useCallback(async (): Promise<boolean> => {
    setIsSaving(true)
    setError(null)
    try {
      if (logseqAPI) {
        await logseqAPI.updateSettings(defaultSettings as unknown as Record<string, any>)
        const data = processSettings(defaultSettings)
        setSettings(data)
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

  // 初始化时加载设置
  useEffect(() => {
    loadSettingsData()
  }, [loadSettingsData])

  // 监听设置变化
  useEffect(() => {
    if (logseqAPI && (logseqAPI as any).onSettingsChanged) {
      const unsubscribe = (logseqAPI as any).onSettingsChanged(async (newSettings: any, oldSettings: any) => {
        let userConfigs: any = null
        try {
          userConfigs = await logseqAPI.App.getUserConfigs()
        } catch {
          // 忽略获取失败的情况
        }

        const mergedSettings = processSettings(newSettings, userConfigs)
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
