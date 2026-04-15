import React from 'react'
import { getTranslation } from '../../../utils/i18n.js'

function AdvancedSettings({ settings, setSettings, onSave, isSaving, language }) {
  return (
    <div className="settings-tab-content">
      <h3 className="tab-section-title">{getTranslation('advanced.title', language)}</h3>
      <p className="tab-section-description">{getTranslation('advanced.description', language)}</p>
      
      <div className="settings-placeholder">
        <p>{getTranslation('advanced.placeholder', language)}</p>
        <p>{getTranslation('advanced.comingSoon', language)}</p>
      </div>
    </div>
  )
}

export default AdvancedSettings
