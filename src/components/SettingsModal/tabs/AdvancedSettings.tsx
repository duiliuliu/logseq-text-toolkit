import { t } from '../../../translations/i18n.ts'
import { Settings } from '../../../config/types.ts'
import { TabComponentProps } from '../index.tsx'

function AdvancedSettings({ language }: TabComponentProps) {
  return (
    <div className="settings-tab-content">
      <p className="tab-section-description-small">{t('settings.advancedSettingsDescription', language)}</p>
      
      <div className="settings-placeholder">
        <p>{t('settings.settingsNotConfigured', language)}</p>
        <p>{t('settings.comingSoon', language)}</p>
      </div>
    </div>
  )
}

export default AdvancedSettings
