/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 */

import { Settings, ThemeType, LanguageType } from './types'
import defaultSettings from './defaultSettings'
import { logseqAPI } from '../logseq'
import logger from '../lib/logger/index'

function processSettings(logseqSettings: any, userConfigs?: any): Settings {
  const settings = {
    ...defaultSettings,
    ...logseqSettings,
    theme: (logseqSettings.theme || 'light') as ThemeType,
    language: (logseqSettings.language || 'zh-CN') as LanguageType,
    useSystemTheme: Boolean(logseqSettings.useSystemTheme),
    useSystemLanguage: Boolean(logseqSettings.useSystemLanguage),
    toolbar: Boolean(logseqSettings.toolbar),
    disabled: Boolean(logseqSettings.disabled),
    showBorder: Boolean(logseqSettings.showBorder),
    sponsorEnabled: Boolean(logseqSettings.sponsorEnabled),
    hoverDelay: parseInt(logseqSettings.hoverDelay) || 500,
    toolbarShortcut: logseqSettings.toolbarShortcut || '',
  }

  if (userConfigs) {
    if (settings.useSystemTheme && userConfigs.preferredThemeMode) {
      settings.theme = userConfigs.preferredThemeMode as ThemeType
    }
    if (settings.useSystemLanguage && userConfigs.preferredLanguage) {
      settings.language = userConfigs.preferredLanguage as LanguageType
    }
    if (userConfigs.preferredDateFormat) {
      settings.dateFormat = userConfigs.preferredDateFormat;
    }
  }

  if (settings.ToolbarItems) {
    settings.ToolbarItems = settings.ToolbarItems.map((item: any) => {
      if ('funcmode' in item && 'clickfunc' in item && !('invoke' in item)) {
        item.invoke = item.funcmode
        item.invokeParams = item.clickfunc
      }
      if (item.subItems) {
        item.subItems = item.subItems.map((sub: any) => {
          if ('funcmode' in sub && 'clickfunc' in sub && !('invoke' in sub)) {
            sub.invoke = sub.funcmode
            sub.invokeParams = sub.clickfunc
          }
          return sub
        })
      }
      return item
    })
  }

  return settings
}

export function getSettings(): Settings {
  try {
    const logseqSettings = logseqAPI.settings || {}
    return processSettings(logseqSettings)
  } catch (error) {
    console.error('Error getting settings:', error)
    return defaultSettings
  }
}

export async function getSettingsWithSystem(): Promise<Settings> {
  try {
    const logseqSettings = logseqAPI.settings || {}
    let userConfigs: any = null
    try {
      userConfigs = await logseqAPI.App.getUserConfigs()
    } catch {
    }
    return processSettings(logseqSettings, userConfigs)
  } catch (error) {
    logger.error('Error getting settings with system:', error)
    return defaultSettings
  }
}

export function updateSettings(newSettings: Partial<Settings>): void {
  try {
    const settingsToSave: any = {
      ...newSettings,
      useSystemTheme: newSettings.theme === 'system',
      useSystemLanguage: newSettings.language === 'system'
    }
    logseqAPI.updateSettings(settingsToSave)
  } catch (error) {
    logger.error('Error updating settings:', error)
  }
}

export { processSettings, defaultSettings }
