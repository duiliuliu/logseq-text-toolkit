import React from 'react'
import { getTranslation } from '../../../utils/i18n.js'

function ToolbarSettings({ settings, setSettings, onSave, isSaving, language }) {
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
      <h3 className="tab-section-title">{getTranslation('toolbar.title', language)}</h3>
      <p className="tab-section-description">{getTranslation('toolbar.description', language)}</p>
      
      <div className="setting-item">
        <label>{getTranslation('toolbar.enabled', language)}</label>
        <input 
          type="checkbox" 
          checked={settings.toolbar.enabled} 
          onChange={(e) => handleSettingChange('toolbar.enabled', e.target.checked)}
        />
      </div>

      <div className="setting-item">
        <label>{getTranslation('toolbar.showBorder', language)}</label>
        <input 
          type="checkbox" 
          checked={settings.toolbar.showBorder} 
          onChange={(e) => handleSettingChange('toolbar.showBorder', e.target.checked)}
        />
      </div>

      <div className="setting-item">
        <label>{getTranslation('toolbar.width', language)}</label>
        <input 
          type="text" 
          value={settings.toolbar.width} 
          onChange={(e) => handleSettingChange('toolbar.width', e.target.value)}
          placeholder={language === 'zh-CN' ? '例如：110px' : language === 'ja' ? '例：110px' : 'e.g.: 110px'}
        />
      </div>

      <div className="setting-item">
        <label>{getTranslation('toolbar.height', language)}</label>
        <input 
          type="text" 
          value={settings.toolbar.height} 
          onChange={(e) => handleSettingChange('toolbar.height', e.target.value)}
          placeholder={language === 'zh-CN' ? '例如：24px' : language === 'ja' ? '例：24px' : 'e.g.: 24px'}
        />
      </div>

      <div className="setting-item">
        <label>{getTranslation('toolbar.hoverDelay', language)}</label>
        <input 
          type="number" 
          value={settings.toolbar.hoverDelay} 
          onChange={(e) => handleSettingChange('toolbar.hoverDelay', parseInt(e.target.value) || 0)}
          min="0"
        />
      </div>

      <div className="settings-actions">
        <button 
          className="settings-btn settings-btn-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? getTranslation('toolbar.saving', language) : getTranslation('toolbar.save', language)}
        </button>
      </div>
    </div>
  )
}

export default ToolbarSettings
