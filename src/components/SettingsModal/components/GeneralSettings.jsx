import React from 'react'

function GeneralSettings({ settings, handleSettingChange, handleSaveGeneral, t, isSaving }) {
  return (
    <div className="settings-section-content">
      <h3 className="settings-section-title">{t('settings.generalSettings')}</h3>
      <p className="settings-section-description">{t('settings.generalSettingsDescription')}</p>
      
      <div className="setting-item">
        <div className="setting-item-label">{t('settings.theme')}</div>
        <div className="setting-item-value">
          <select 
            value={settings?.theme || 'light'} 
            onChange={(e) => handleSettingChange('theme', e.target.value)}
            className="setting-select"
          >
            <option value="light">{t('settings.lightTheme')}</option>
            <option value="dark">{t('settings.darkTheme')}</option>
          </select>
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-item-label">{t('settings.language')}</div>
        <div className="setting-item-value">
          <select 
            value={settings?.language || 'zh-CN'} 
            onChange={(e) => handleSettingChange('language', e.target.value)}
            className="setting-select"
          >
            <option value="zh-CN">{t('settings.chinese')}</option>
            <option value="en">{t('settings.english')}</option>
            <option value="ja">{t('settings.japanese')}</option>
          </select>
        </div>
      </div>
      
      <div className="settings-save-section">
        <button 
          className="settings-btn settings-btn-save"
          onClick={handleSaveGeneral}
          disabled={isSaving}
          type="button"
        >
          {isSaving ? t('settings.saving') : t('settings.saveGeneralSettings')}
        </button>
      </div>
    </div>
  )
}

export default GeneralSettings
