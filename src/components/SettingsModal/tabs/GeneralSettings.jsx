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
      <h3 className="tab-section-title">{getTranslation('general.title', language)}</h3>
      <p className="tab-section-description">{getTranslation('general.description', language)}</p>
      
      <div className="setting-item">
        <label>{getTranslation('general.theme', language)}</label>
        <select 
          value={settings.theme} 
          onChange={(e) => handleSettingChange('theme', e.target.value)}
        >
          <option value="light">{getTranslation('theme.light', language)}</option>
          <option value="dark">{getTranslation('theme.dark', language)}</option>
        </select>
      </div>

      <div className="setting-item">
        <label>{getTranslation('general.language', language)}</label>
        <select 
          value={settings.language} 
          onChange={(e) => handleSettingChange('language', e.target.value)}
        >
          <option value="zh-CN">{getTranslation('language.zh-CN', language)}</option>
          <option value="en">{getTranslation('language.en', language)}</option>
          <option value="ja">{getTranslation('language.ja', language)}</option>
        </select>
      </div>

      <div className="settings-actions">
        <button 
          className="settings-btn settings-btn-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? getTranslation('general.saving', language) : getTranslation('general.save', language)}
        </button>
      </div>
    </div>
  )
}

export default GeneralSettings
