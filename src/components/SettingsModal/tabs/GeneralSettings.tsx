import { t } from '../../../translations/i18n.ts'
import CustomSelect from '../../CustomSelect/index.tsx'
import { Settings } from '../../../settings/types.ts'
import { TabComponentProps } from '../index.tsx'

function GeneralSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const handleSettingChange = (path: string, value: any) => {
    setSettings(prev => {
      if (!prev) return prev
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

  const themeOptions = [
    { value: 'system', label: t('settings.themeFollowSystem', language) },
    { value: 'light', label: t('settings.lightTheme', language) },
    { value: 'dark', label: t('settings.darkTheme', language) }
  ]

  // 从 meta.language.languages 获取语言选项
  const languageOptions = [
    { value: 'system', label: t('settings.languageFollowSystem', language) },
    ...(settings.meta?.language?.languages.map(lang => ({
      value: lang.code,
      label: lang.name
    })) || [
      { value: 'zh-CN', label: t('settings.chinese', language) },
      { value: 'en', label: t('settings.english', language) },
      { value: 'ja', label: t('settings.japanese', language) }
    ])
  ]

  return (
    <div className="ltt-settings-tab-content">
      <p className="ltt-tab-section-description-small">{t('settings.generalSettingsDescription', language)}</p>
      
      <div className="ltt-setting-item">
        <label>{t('settings.theme', language)}</label>
        <CustomSelect
          options={themeOptions}
          value={settings.theme}
          onChange={(value) => handleSettingChange('theme', value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.language', language)}</label>
        <CustomSelect
          options={languageOptions}
          value={settings.language}
          onChange={(value) => handleSettingChange('language', value)}
        />
      </div>

      {/* Feature Management Section */}
      <div className="ltt-settings-section">
        <h4>{t('settings.features', language)}</h4>
        <div className="ltt-settings-hint" style={{ margin: '8px 0 16px 0' }}>
          {t('settings.featuresHint', language)}
        </div>
        <div className="ltt-feature-grid">
          {/* Toolbar */}
          <div className={`ltt-feature-card ${settings.toolbar !== false ? 'ltt-feature-card-active' : ''}`}>
            <div className="ltt-feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </div>
            <div className="ltt-feature-info">
              <div className="ltt-feature-name">{t('settings.tabs.toolbar', language)}</div>
              <div className="ltt-feature-desc">{t('settings.toolbarSettingsDescription', language)}</div>
            </div>
            <label className="ltt-switch">
              <input
                type="checkbox"
                checked={settings.toolbar ?? true}
                onChange={(e) => handleSettingChange('toolbar', e.target.checked)}
              />
              <span className="ltt-switch-slider"></span>
            </label>
          </div>

          {/* Task Progress */}
          <div className={`ltt-feature-card ${settings.taskProgress?.enabled !== false ? 'ltt-feature-card-active' : ''}`}>
            <div className="ltt-feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="ltt-feature-info">
              <div className="ltt-feature-name">{t('settings.tabs.taskProgress', language)}</div>
              <div className="ltt-feature-desc">{t('settings.taskProgressDescription', language).substring(0, 30)}...</div>
            </div>
            <label className="ltt-switch">
              <input
                type="checkbox"
                checked={settings.taskProgress?.enabled ?? true}
                onChange={(e) => handleSettingChange('taskProgress.enabled', e.target.checked)}
              />
              <span className="ltt-switch-slider"></span>
            </label>
          </div>

          {/* Heatmap */}
          <div className={`ltt-feature-card ${settings.heatmap?.enabled !== false ? 'ltt-feature-card-active' : ''}`}>
            <div className="ltt-feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <div className="ltt-feature-info">
              <div className="ltt-feature-name">{t('settings.tabs.heatmap', language)}</div>
              <div className="ltt-feature-desc">{t('settings.heatmap.description', language).substring(0, 30)}...</div>
            </div>
            <label className="ltt-switch">
              <input
                type="checkbox"
                checked={settings.heatmap?.enabled ?? true}
                onChange={(e) => handleSettingChange('heatmap.enabled', e.target.checked)}
              />
              <span className="ltt-switch-slider"></span>
            </label>
          </div>

          {/* Block View */}
          <div className={`ltt-feature-card ${settings.blockView?.enabled !== false ? 'ltt-feature-card-active' : ''}`}>
            <div className="ltt-feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </div>
            <div className="ltt-feature-info">
              <div className="ltt-feature-name">{t('settings.tabs.blockView', language)}</div>
              <div className="ltt-feature-desc">{t('settings.blockView.description', language).substring(0, 30)}...</div>
            </div>
            <label className="ltt-switch">
              <input
                type="checkbox"
                checked={settings.blockView?.enabled ?? true}
                onChange={(e) => handleSettingChange('blockView.enabled', e.target.checked)}
              />
              <span className="ltt-switch-slider"></span>
            </label>
          </div>

          {/* Summary */}
          <div className={`ltt-feature-card ${settings.summary?.enabled !== false ? 'ltt-feature-card-active' : ''}`}>
            <div className="ltt-feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className="ltt-feature-info">
              <div className="ltt-feature-name">{t('settings.tabs.summary', language)}</div>
              <div className="ltt-feature-desc">{t('settings.summary.description', language).substring(0, 30)}...</div>
            </div>
            <label className="ltt-switch">
              <input
                type="checkbox"
                checked={settings.summary?.enabled ?? true}
                onChange={(e) => handleSettingChange('summary.enabled', e.target.checked)}
              />
              <span className="ltt-switch-slider"></span>
            </label>
          </div>

          {/* Milestone */}
          <div className={`ltt-feature-card ${settings.milestone?.enabled !== false ? 'ltt-feature-card-active' : ''}`}>
            <div className="ltt-feature-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div className="ltt-feature-info">
              <div className="ltt-feature-name">{t('settings.tabs.milestone', language)}</div>
              <div className="ltt-feature-desc">{t('settings.milestoneDescription', language).substring(0, 30)}...</div>
            </div>
            <label className="ltt-switch">
              <input
                type="checkbox"
                checked={settings.milestone?.enabled ?? true}
                onChange={(e) => handleSettingChange('milestone.enabled', e.target.checked)}
              />
              <span className="ltt-switch-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.developerMode', language)}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={settings.developerMode || false}
            onChange={(e) => handleSettingChange('developerMode', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-settings-actions">
        <button 
          className="ltt-settings-btn ltt-settings-btn-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? t('settings.saving', language) : t('settings.saveGeneralSettings', language)}
        </button>
      </div>
    </div>
  )
}

export default GeneralSettings
