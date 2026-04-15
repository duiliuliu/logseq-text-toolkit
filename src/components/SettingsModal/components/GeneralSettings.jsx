import React from 'react'
import { CheckCircle2 } from 'lucide-react'

function GeneralSettings({ settings, t }) {
  return (
    <div className="settings-section-content">
      <div className="setting-item">
        <div className="setting-item-label-wrapper">
          <div className="setting-item-label-content">
            <div className="setting-item-label">{t('settings.theme')}</div>
            <div className="setting-item-description">
              <CheckCircle2 size={12} className="setting-item-check-icon" />
              {t('settings.themeFollowSystem')}
            </div>
          </div>
        </div>
        <div className="setting-item-value">
          <div className="setting-input-readonly">
            {settings?.theme || ''}
          </div>
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-item-label-wrapper">
          <div className="setting-item-label-content">
            <div className="setting-item-label">{t('settings.language')}</div>
            <div className="setting-item-description">
              <CheckCircle2 size={12} className="setting-item-check-icon" />
              {t('settings.languageFollowSystem')}
            </div>
          </div>
        </div>
        <div className="setting-item-value">
          <div className="setting-input-readonly">
            {settings?.language || ''}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GeneralSettings
