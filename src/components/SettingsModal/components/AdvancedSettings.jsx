import React from 'react'

function AdvancedSettings({ t }) {
  return (
    <div className="settings-section-content">
      <h3 className="settings-section-title">{t('settings.advancedSettings')}</h3>
      <p className="settings-section-description">{t('settings.advancedSettingsDescription')}</p>
      
      <div className="settings-empty-state">
        <div className="settings-empty-state-content">
          <p className="settings-empty-state-text">{t('settings.settingsNotConfigured')}</p>
          <p className="settings-empty-state-subtext">{t('settings.comingSoon')}</p>
        </div>
      </div>
    </div>
  )
}

export default AdvancedSettings
