import React, { useState } from 'react'
import { t } from '../../../translations/i18n.ts'
import CustomSelect from '../../CustomSelect/index.tsx'
import { Settings } from '../../../settings/types.ts'
import { TabComponentProps } from '../index.tsx'

function GeneralSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const [isFeatureSectionExpanded, setIsFeatureSectionExpanded] = useState(false)

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

  const features = [
    {
      id: 'toolbar',
      name: t('settings.tabs.toolbar', language),
      description: t('settings.features.toolbarDescription', language),
      enabled: settings.toolbar ?? true,
      path: 'toolbar'
    },
    {
      id: 'taskProgress',
      name: t('settings.tabs.taskProgress', language),
      description: t('settings.features.taskProgressDescription', language),
      enabled: settings.taskProgress?.enabled ?? true,
      path: 'taskProgress.enabled'
    },
    {
      id: 'heatmap',
      name: t('settings.tabs.heatmap', language),
      description: t('settings.features.heatmapDescription', language),
      enabled: settings.heatmap?.enabled ?? true,
      path: 'heatmap.enabled'
    },
    {
      id: 'blockView',
      name: t('settings.tabs.blockView', language),
      description: t('settings.features.blockViewDescription', language),
      enabled: settings.blockView?.enabled ?? true,
      path: 'blockView.enabled'
    },
    {
      id: 'milestone',
      name: t('settings.tabs.milestone', language),
      description: t('settings.features.milestoneDescription', language),
      enabled: settings.milestone?.enabled ?? true,
      path: 'milestone.enabled'
    },
    {
      id: 'summary',
      name: t('settings.tabs.summary', language),
      description: t('settings.features.summaryDescription', language),
      enabled: settings.summary?.enabled ?? true,
      path: 'summary.enabled'
    }
  ]

  const enabledFeatures = features.filter(f => f.enabled)
  const disabledFeatures = features.filter(f => !f.enabled)

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
      <div className="ltt-feature-management">
        <div 
          className="ltt-feature-management-header"
          onClick={() => setIsFeatureSectionExpanded(!isFeatureSectionExpanded)}
        >
          <div className="ltt-feature-management-title">
            <span className="ltt-feature-management-icon">
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                style={{
                  transform: isFeatureSectionExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
            <h4>{t('settings.featuresTitle', language)}</h4>
            <span className="ltt-feature-management-count">
              {enabledFeatures.length}/{features.length}
            </span>
          </div>
        </div>

        {isFeatureSectionExpanded && (
          <div className="ltt-feature-management-content">
            <div className="ltt-settings-hint" style={{ marginBottom: '16px' }}>
              {t('settings.featuresHint', language)}
            </div>

            {enabledFeatures.length > 0 && (
              <div className="ltt-feature-group">
                <div className="ltt-feature-group-title">
                  {t('settings.features.enabled', language)} ({enabledFeatures.length})
                </div>
                <div className="ltt-feature-divider" />
                {enabledFeatures.map((feature, index) => (
                  <React.Fragment key={feature.id}>
                    <div className="ltt-feature-item">
                      <div className="ltt-feature-item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                          <circle cx="12" cy="12" r="8" />
                        </svg>
                      </div>
                      <div className="ltt-feature-item-content">
                        <div className="ltt-feature-item-name">{feature.name}</div>
                        <div className="ltt-feature-item-description">{feature.description}</div>
                      </div>
                      <label className="ltt-switch">
                        <input
                          type="checkbox"
                          checked={feature.enabled}
                          onChange={(e) => handleSettingChange(feature.path, e.target.checked)}
                        />
                        <span className="ltt-switch-slider"></span>
                      </label>
                    </div>
                    {index < enabledFeatures.length - 1 && <div className="ltt-feature-divider" />}
                  </React.Fragment>
                ))}
              </div>
            )}

            {disabledFeatures.length > 0 && (
              <div className="ltt-feature-group" style={{ marginTop: '24px' }}>
                <div className="ltt-feature-group-title">
                  {t('settings.features.disabled', language)} ({disabledFeatures.length})
                </div>
                <div className="ltt-feature-divider" />
                {disabledFeatures.map((feature, index) => (
                  <React.Fragment key={feature.id}>
                    <div className="ltt-feature-item">
                      <div className="ltt-feature-item-icon ltt-feature-item-icon-disabled">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="8" />
                        </svg>
                      </div>
                      <div className="ltt-feature-item-content">
                        <div className="ltt-feature-item-name">{feature.name}</div>
                        <div className="ltt-feature-item-description">{feature.description}</div>
                      </div>
                      <label className="ltt-switch">
                        <input
                          type="checkbox"
                          checked={feature.enabled}
                          onChange={(e) => handleSettingChange(feature.path, e.target.checked)}
                        />
                        <span className="ltt-switch-slider"></span>
                      </label>
                    </div>
                    {index < disabledFeatures.length - 1 && <div className="ltt-feature-divider" />}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}
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
