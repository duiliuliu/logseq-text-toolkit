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
    <div className="ltt-settings-tab-content">
      <p className="ltt-tab-section-description-small">{t('settings.generalSettingsDescription', language)}</p>
      
      <div className="ltt-setting-item">
        <label>{t('settings.theme', language)}</label>
        <CustomSelect
          options={themeOptions}
          value={settings.theme}
          onChange={(value) => handleSettingChange('theme', value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.language', language)}</label>
        <CustomSelect
          options={languageOptions}
          value={settings.language}
          onChange={(value) => handleSettingChange('language', value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.developerMode', language)}</label>
        <div className="ltt-setting-toggle">
          <input
            type="checkbox"
            id="developerMode"
            checked={settings.developerMode || false}
            onChange={(e) => handleSettingChange('developerMode', e.target.checked)}
          />
          <label htmlFor="developerMode" className="ltt-toggle-slider"></label>
        </div>
      </div>

      <div className="ltt-settings-actions">
        <button 
          className="ltt-settings-btn ltt-settings-btn-save"
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
