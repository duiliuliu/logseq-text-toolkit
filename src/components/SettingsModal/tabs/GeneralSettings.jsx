import React from 'react'
import { t } from '../../../translations/i18n.js'

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
      <p className="tab-section-description-small">{t('settings.generalSettingsDescription', language)}</p>
      
      <div className="setting-item">
        <label>{t('settings.theme', language)}</label>
        <select 
          value={settings.theme} 
          onChange={(e) => handleSettingChange('theme', e.target.value)}
          style={{ maxWidth: '150px', boxSizing: 'border-box' }}
        >
          <option value="light">{t('settings.lightTheme', language)}</option>
          <option value="dark">{t('settings.darkTheme', language)}</option>
        </select>
      </div>

      <div className="setting-item">
        <label>{t('settings.language', language)}</label>
        <select 
          value={settings.language} 
          onChange={(e) => handleSettingChange('language', e.target.value)}
          style={{ maxWidth: '150px', boxSizing: 'border-box' }}
        >
          <option value="zh-CN">{t('settings.chinese', language)}</option>
          <option value="en">{t('settings.english', language)}</option>
          <option value="ja">{t('settings.japanese', language)}</option>
        </select>
      </div>

      <div className="settings-actions">
        <button 
          className="settings-btn settings-btn-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? t('settings.saving', language) : t('settings.saveGeneralSettings', language)}
        </button>
      </div>
    </div>
  )
}

export default GeneralSettings
