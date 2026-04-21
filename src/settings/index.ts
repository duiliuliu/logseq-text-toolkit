import { Settings, ThemeType, LanguageType } from './types'
import defaultSettings from './defaultSettings'
import { logseqAPI } from '../logseq'

export function getSettings(): Settings {
  try {
    const logseqSettings = logseqAPI.settings || {}
    return {
      ...defaultSettings,
      ...logseqSettings,
      // 确保类型正确
      theme: (logseqSettings.theme || 'light') as ThemeType,
      language: (logseqSettings.language || 'zh-CN') as LanguageType,
      useSystemTheme: Boolean(logseqSettings.useSystemTheme),
      useSystemLanguage: Boolean(logseqSettings.useSystemLanguage),
      toolbar: Boolean(logseqSettings.toolbar),
      disabled: Boolean(logseqSettings.disabled),
      toolbarShortcut: logseqSettings.toolbarShortcut || '',
    }
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
