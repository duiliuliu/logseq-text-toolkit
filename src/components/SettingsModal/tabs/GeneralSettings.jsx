import React from 'react'
import { t } from '../../../translations/i18n.js'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select.jsx'

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
        <Select value={settings.theme} onValueChange={(value) => handleSettingChange('theme', value)}>
          <SelectTrigger className="w-[120px] h-6 text-xs">
            <SelectValue placeholder={t('settings.theme', language)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">{t('settings.lightTheme', language)}</SelectItem>
            <SelectItem value="dark">{t('settings.darkTheme', language)}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="setting-item">
        <label>{t('settings.language', language)}</label>
        <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
          <SelectTrigger className="w-[120px] h-6 text-xs">
            <SelectValue placeholder={t('settings.language', language)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="zh-CN">{t('settings.chinese', language)}</SelectItem>
            <SelectItem value="en">{t('settings.english', language)}</SelectItem>
            <SelectItem value="ja">{t('settings.japanese', language)}</SelectItem>
          </SelectContent>
        </Select>
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
