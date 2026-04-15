import React from 'react'
import { getTranslation } from '../../../utils/i18n.js'

function AdvancedSettings({ settings, setSettings, onSave, isSaving, language }) {
  return (
    <div className="settings-tab-content">
      <p className="tab-section-description-small">{getTranslation('settings.advancedSettingsDescription', language)}</p>
      
      <div className="settings-placeholder">
        <p>{getTranslation('settings.settingsNotConfigured', language)}</p>
        <p>{getTranslation('settings.comingSoon', language)}</p>
      </div>
    </div>
  )
}

export default AdvancedSettings
