import React from 'react'

function ToolbarSettings({ settings, handleSettingChange, t }) {
  return (
    <div className="settings-section-content">
      <div className="setting-item">
        <div className="setting-item-label">{t('settings.enabled')}</div>
        <div className="setting-item-value">
          <div className="setting-switch-wrapper">
            <input 
              type="checkbox" 
              id="toolbar-enabled"
              checked={settings.toolbar?.enabled || false} 
              onChange={(e) => handleSettingChange('toolbar.enabled', e.target.checked)}
              className="setting-switch"
            />
            <label htmlFor="toolbar-enabled" className="setting-switch-label"></label>
          </div>
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-item-label">{t('settings.showBorder')}</div>
        <div className="setting-item-value">
          <div className="setting-switch-wrapper">
            <input 
              type="checkbox" 
              id="toolbar-showBorder"
              checked={settings.toolbar?.showBorder || false} 
              onChange={(e) => handleSettingChange('toolbar.showBorder', e.target.checked)}
              className="setting-switch"
            />
            <label htmlFor="toolbar-showBorder" className="setting-switch-label"></label>
          </div>
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-item-label">{t('settings.width')}</div>
        <div className="setting-item-value">
          <div className="setting-input-with-unit">
            <input 
              type="text" 
              value={settings.toolbar?.width || ''} 
              onChange={(e) => handleSettingChange('toolbar.width', e.target.value)}
              placeholder="e.g., 110px"
              className="setting-input"
            />
            <span className="setting-input-unit">px</span>
          </div>
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-item-label">{t('settings.height')}</div>
        <div className="setting-item-value">
          <div className="setting-input-with-unit">
            <input 
              type="text" 
              value={settings.toolbar?.height || ''} 
              onChange={(e) => handleSettingChange('toolbar.height', e.target.value)}
              placeholder="e.g., 24px"
              className="setting-input"
            />
            <span className="setting-input-unit">px</span>
          </div>
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-item-label">{t('settings.hoverDelay')}</div>
        <div className="setting-item-value">
          <div className="setting-input-with-unit">
            <input 
              type="number" 
              value={settings.toolbar?.hoverDelay || 0} 
              onChange={(e) => handleSettingChange('toolbar.hoverDelay', parseInt(e.target.value) || 0)}
              min="0"
              className="setting-input"
            />
            <span className="setting-input-unit">ms</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ToolbarSettings
