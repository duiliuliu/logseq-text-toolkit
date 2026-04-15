import React from 'react'
import { getTranslation } from '../../../utils/i18n.js'

function GeneralSettings({ settings, setSettings, onSave, isSaving, language }) {
  const handleSettingChange = (path, value) => {
    setSettings(prev => {
      const newSettings = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let current = newSettings
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newSettings
    })
  }

  return (
    <div className="settings-tab-content">
      <p className="tab-section-description-small">{getTranslation('settings.generalSettingsDescription', language)}</p>
      
      <div className="setting-item">
        <label>{getTranslation('settings.theme', language)}</label>
        <select 
          value={settings.theme} 
          onChange={(e) => handleSettingChange('theme', e.target.value)}
        >
          <option value="light">{getTranslation('settings.lightTheme', language)}</option>
          <option value="dark">{getTranslation('settings.darkTheme', language)}</option>
        </select>
      </div>

      <div className="setting-item">
        <label>{getTranslation('settings.language', language)}</label>
        <select 
          value={settings.language} 
          onChange={(e) => handleSettingChange('language', e.target.value)}
        >
          <option value="zh-CN">{getTranslation('settings.chinese', language)}</option>
          <option value="en">{getTranslation('settings.english', language)}</option>
          <option value="ja">{getTranslation('settings.japanese', language)}</option>
        </select>
      </div>

      <div className="settings-actions">
        <button 
          className="settings-btn settings-btn-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? getTranslation('settings.saving', language) : getTranslation('settings.saveGeneralSettings', language)}
        </button>
      </div>
    </div>
  )
}

export default GeneralSettings
