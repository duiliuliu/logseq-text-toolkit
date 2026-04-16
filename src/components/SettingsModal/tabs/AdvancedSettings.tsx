import { t } from '../../../translations/i18n.ts'
import { Settings } from '../../../types/index.ts'

// 标签页组件 Props 类型
interface TabComponentProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings | null>>;
  onSave: () => void;
  isSaving: boolean;
  language: string;
}

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
