import React, { useState } from 'react'
import { t } from '../../../translations/i18n.js'

function ToolbarSettings({ settings, setSettings, onSave, isSaving, language }) {
  const [jsonError, setJsonError] = useState('')
  
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

  const handleJsonChange = (value) => {
    setJsonError('')
    try {
      JSON.parse(value)
      handleSettingChange('toolbar.items', JSON.parse(value))
    } catch (error) {
      setJsonError(t('settings.error', language))
    }
  }

  return (
    <div className="settings-tab-content">
      <p className="tab-section-description-small">{t('settings.toolbarSettingsDescription', language)}</p>
      
      <div className="setting-item">
        <label>{t('settings.enabled', language)}</label>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={settings.toolbar.enabled} 
            onChange={(e) => handleSettingChange('toolbar.enabled', e.target.checked)}
          />
          <span className="switch-slider"></span>
        </label>
      </div>

      <div className="setting-item">
        <label>{t('settings.showBorder', language)}</label>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={settings.toolbar.showBorder} 
            onChange={(e) => handleSettingChange('toolbar.showBorder', e.target.checked)}
          />
          <span className="switch-slider"></span>
        </label>
      </div>

      <div className="setting-item">
        <label>赞助栏</label>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={settings.toolbar.sponsorEnabled} 
            onChange={(e) => handleSettingChange('toolbar.sponsorEnabled', e.target.checked)}
          />
          <span className="switch-slider"></span>
        </label>
      </div>

      <div className="setting-item">
        <label>{t('settings.width', language)} (px)</label>
        <input 
          type="number" 
          value={settings.toolbar.width.replace('px', '')} 
          onChange={(e) => handleSettingChange('toolbar.width', `${e.target.value}px`)}
          placeholder="110"
          min="1"
        />
      </div>

      <div className="setting-item">
        <label>{t('settings.height', language)} (px)</label>
        <input 
          type="number" 
          value={settings.toolbar.height.replace('px', '')} 
          onChange={(e) => handleSettingChange('toolbar.height', `${e.target.value}px`)}
          placeholder="24"
          min="1"
        />
      </div>

      <div className="setting-item">
        <label>{t('settings.hoverDelay', language)} (ms)</label>
        <input 
          type="number" 
          value={settings.toolbar.hoverDelay} 
          onChange={(e) => handleSettingChange('toolbar.hoverDelay', parseInt(e.target.value) || 0)}
          min="0"
        />
      </div>



      <div className="setting-item setting-item-json">
        <label>元素</label>
        <div className="json-editor">
          <textarea 
            value={JSON.stringify(settings.toolbar.items, null, 2)}
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder={t('settings.jsonSettings', language)}
          />
          {jsonError && <div className="json-error">{jsonError}</div>}
        </div>
      </div>

      <div className="settings-actions">
        <button 
          className="settings-btn settings-btn-save"
          onClick={onSave}
          disabled={isSaving || jsonError}
        >
          {isSaving ? t('settings.saving', language) : t('settings.saveToolbarSettings', language)}
        </button>
      </div>
    </div>
  )
}

export default ToolbarSettings
