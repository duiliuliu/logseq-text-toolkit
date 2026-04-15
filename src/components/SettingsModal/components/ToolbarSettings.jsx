import React from 'react'

function ToolbarSettings({ settings, handleSettingChange, handleSaveToolbar, t, isSaving }) {
  return (
    <div className="settings-section-content">
      <h3 className="settings-section-title">{t('settings.toolbarSettings')}</h3>
      <p className="settings-section-description">{t('settings.toolbarSettingsDescription')}</p>
      
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

      <div className="setting-item setting-item-row">
        <div className="setting-item-row-left">
          <div className="setting-item-row-item">
            <div className="setting-item-label">{t('settings.width')} (px)</div>
            <div className="setting-item-value">
              <input 
                type="number" 
                value={settings.toolbar?.width?.replace('px', '') || 300} 
                onChange={(e) => handleSettingChange('toolbar.width', `${e.target.value}px`)}
                min="50"
                className="setting-input setting-input-number"
              />
            </div>
          </div>
          <div className="setting-item-row-item">
            <div className="setting-item-label">{t('settings.height')} (px)</div>
            <div className="setting-item-value">
              <input 
                type="number" 
                value={settings.toolbar?.height?.replace('px', '') || 50} 
                onChange={(e) => handleSettingChange('toolbar.height', `${e.target.value}px`)}
                min="20"
                className="setting-input setting-input-number"
              />
            </div>
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
        <div className="setting-item-label">{t('settings.hoverDelay')} (ms)</div>
        <div className="setting-item-value">
          <input 
            type="number" 
            value={settings.toolbar?.hoverDelay || 0} 
            onChange={(e) => handleSettingChange('toolbar.hoverDelay', parseInt(e.target.value) || 0)}
            min="0"
            className="setting-input setting-input-number"
          />
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-item-label">{t('settings.toolbarItems')} (JSON)</div>
        <div className="setting-item-value">
          <textarea 
            value={JSON.stringify(settings.toolbar?.items || [], null, 2)}
            onChange={(e) => {
              try {
                const items = JSON.parse(e.target.value)
                handleSettingChange('toolbar.items', items)
              } catch (error) {
                // Ignore invalid JSON
              }
            }}
            className="setting-textarea"
          />
        </div>
      </div>
      
      <div className="settings-save-section">
        <button 
          className="settings-btn settings-btn-save"
          onClick={handleSaveToolbar}
          disabled={isSaving}
          type="button"
        >
          {isSaving ? t('settings.saving') : t('settings.saveToolbarSettings')}
        </button>
      </div>
    </div>
  )
}

export default ToolbarSettings
