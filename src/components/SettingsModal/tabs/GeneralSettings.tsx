import { t } from '../../../translations/i18n.ts'
import CustomSelect from '../../CustomSelect/index.tsx'
import { Settings } from '../../../settings/types.ts'
import { TabComponentProps } from '../index.tsx'

function GeneralSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const handleSettingChange = (path: string, value: any) => {
    setSettings(prev => {
      if (!prev) return prev
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

  const themeOptions = [
    { value: 'system', label: t('settings.themeFollowSystem', language) },
    { value: 'light', label: t('settings.lightTheme', language) },
    { value: 'dark', label: t('settings.darkTheme', language) }
  ]

  const languageOptions = [
    { value: 'system', label: t('settings.languageFollowSystem', language) },
    { value: 'zh-CN', label: t('settings.chinese', language) },
    { value: 'en', label: t('settings.english', language) },
    { value: 'ja', label: t('settings.japanese', language) }
  ]

  return (
    <div className="settings-tab-content">
      <p className="tab-section-description-small">{t('settings.generalSettingsDescription', language)}</p>
      
      <div className="setting-item">
        <label>{t('settings.theme', language)}</label>
        <CustomSelect
          options={themeOptions}
          value={settings.theme}
          onChange={(value) => handleSettingChange('theme', value)}
        />
      </div>

      <div className="setting-item">
        <label>{t('settings.language', language)}</label>
        <CustomSelect
          options={languageOptions}
          value={settings.language}
          onChange={(value) => handleSettingChange('language', value)}
        />
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
