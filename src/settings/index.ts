import { Settings } from './types'
import defaultSettings from './defaultSettings'
import { logseqAPI } from '../logseq'

export function getSettings(): Settings {
  try {
    const logseqSettings = logseqAPI.settings || {}
    return {
      ...defaultSettings,
      ...logseqSettings,
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
