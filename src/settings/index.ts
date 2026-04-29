import { Settings, ThemeType, LanguageType } from './types'
import defaultSettings from './defaultSettings'
import { logseqAPI } from '../logseq'

export function getSettings(): Settings {
  try {
    const logseqSettings = logseqAPI.settings || {}
    const settings = {
      ...defaultSettings,
      ...logseqSettings,
      // 确保类型正确
      theme: (logseqSettings.theme || 'light') as ThemeType,
      language: (logseqSettings.language || 'zh-CN') as LanguageType,
      useSystemTheme: Boolean(logseqSettings.useSystemTheme),
      toolbar: Boolean(logseqSettings.toolbar),
      disabled: Boolean(logseqSettings.disabled),
    }
    
    // 兼容旧版本的 funcmode 和 clickfunc
    if (settings.ToolbarItems) {
      settings.ToolbarItems = settings.ToolbarItems.map(item => {
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
    
    return settings
  } catch (error) {
    console.error('Error getting settings:', error)
    return defaultSettings
  }
}

export function updateSettings(newSettings: Partial<Settings>): void {
  try {
    const settingsToSave = {
      ...newSettings,
    }
    logseqAPI.updateSettings(settingsToSave)
  } catch (error) {
    console.error('Error updating settings:', error)
  }
}

export { defaultSettings }
