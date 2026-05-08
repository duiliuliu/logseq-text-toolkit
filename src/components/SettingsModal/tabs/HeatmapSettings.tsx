/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 热力图设置 Tab
 */

import { t } from '../../../translations/i18n.ts'
import { Settings, HeatmapSettings as HeatmapSettingsType } from '../../../settings/types'
import { TabComponentProps } from '../index'

function HeatmapSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const heatmapSettings: HeatmapSettingsType = settings.heatmap || {
    enabled: true,
    defaultViewType: 'year',
    defaultDisplayMode: 'full',
    defaultColorFormula: 'simple',
    colorScheme: {
      minColor: '#eef2ff',
      maxColor: '#3730a3',
      gradientSteps: 5,
    },
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => {
      if (!prev) return prev
      return {
        ...prev,
        heatmap: {
          ...heatmapSettings,
          [key]: value,
        },
      }
    })
  }

  const handleColorChange = (key: 'minColor' | 'maxColor', value: string) => {
    handleSettingChange('colorScheme', {
      ...heatmapSettings.colorScheme,
      [key]: value,
    })
  }

  const viewTypeOptions = [
    { value: 'year', label: t('settings.heatmap.viewTypeYear', language) },
    { value: 'month', label: t('settings.heatmap.viewTypeMonth', language) },
    { value: 'week', label: t('settings.heatmap.viewTypeWeek', language) }
  ]

  const displayModeOptions = [
    { value: 'full', label: t('settings.heatmap.displayModeFull', language) },
    { value: 'basic', label: t('settings.heatmap.displayModeBasic', language) },
    { value: 'minimal', label: t('settings.heatmap.displayModeMinimal', language) }
  ]

  const colorFormulaOptions = [
    { value: 'simple', label: t('settings.heatmap.colorFormulaSimple', language) },
    { value: 'weighted', label: t('settings.heatmap.colorFormulaWeighted', language) }
  ]

  return (
    <div className="ltt-settings-tab-content">
      <p className="ltt-tab-section-description-small">
        {t('settings.heatmap.description', language)}
      </p>
      
      <div className="ltt-setting-item">
        <label>{t('settings.heatmap.enabled', language)}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={heatmapSettings.enabled}
            onChange={(e) => handleSettingChange('enabled', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.heatmap.defaultViewType', language)}</label>
        <select
          value={heatmapSettings.defaultViewType}
          onChange={(e) => handleSettingChange('defaultViewType', e.target.value)}
        >
          {viewTypeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.heatmap.defaultDisplayMode', language)}</label>
        <select
          value={heatmapSettings.defaultDisplayMode}
          onChange={(e) => handleSettingChange('defaultDisplayMode', e.target.value)}
        >
          {displayModeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.heatmap.defaultColorFormula', language)}</label>
        <select
          value={heatmapSettings.defaultColorFormula}
          onChange={(e) => handleSettingChange('defaultColorFormula', e.target.value)}
        >
          {colorFormulaOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="ltt-settings-section">
        <h4>{t('settings.heatmap.colorScheme', language)}</h4>
        
        <div className="ltt-setting-item">
          <label>{t('settings.heatmap.minColor', language)}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="color"
              value={heatmapSettings.colorScheme.minColor}
              onChange={(e) => handleColorChange('minColor', e.target.value)}
              style={{ width: '32px', height: '24px', padding: '0', border: '1px solid var(--ls-border-color-plugin, #ccc)', borderRadius: '4px', cursor: 'pointer' }}
            />
            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--ls-secondary-text-color-plugin, #666)' }}>
              {heatmapSettings.colorScheme.minColor}
            </span>
          </div>
        </div>

        <div className="ltt-setting-item">
          <label>{t('settings.heatmap.maxColor', language)}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="color"
              value={heatmapSettings.colorScheme.maxColor}
              onChange={(e) => handleColorChange('maxColor', e.target.value)}
              style={{ width: '32px', height: '24px', padding: '0', border: '1px solid var(--ls-border-color-plugin, #ccc)', borderRadius: '4px', cursor: 'pointer' }}
            />
            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--ls-secondary-text-color-plugin, #666)' }}>
              {heatmapSettings.colorScheme.maxColor}
            </span>
          </div>
        </div>

        <div className="ltt-setting-item">
          <label>{t('settings.heatmap.preview', language)}</label>
          <div style={{ display: 'flex', gap: '4px' }}>
            <div style={{ width: '32px', height: '20px', backgroundColor: heatmapSettings.colorScheme.minColor, borderRadius: '4px', border: '1px solid var(--ls-border-color-plugin, #ccc)' }} />
            <div style={{ width: '32px', height: '20px', backgroundColor: '#e0e7ff', borderRadius: '4px', border: '1px solid var(--ls-border-color-plugin, #ccc)' }} />
            <div style={{ width: '32px', height: '20px', backgroundColor: '#c7d2fe', borderRadius: '4px', border: '1px solid var(--ls-border-color-plugin, #ccc)' }} />
            <div style={{ width: '32px', height: '20px', backgroundColor: '#a5b4fc', borderRadius: '4px', border: '1px solid var(--ls-border-color-plugin, #ccc)' }} />
            <div style={{ width: '32px', height: '20px', backgroundColor: heatmapSettings.colorScheme.maxColor, borderRadius: '4px', border: '1px solid var(--ls-border-color-plugin, #ccc)' }} />
          </div>
        </div>
      </div>

      <div className="ltt-settings-actions">
        <button 
          className="ltt-settings-btn ltt-settings-btn-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? t('settings.saving', language) : t('settings.save', language)}
        </button>
      </div>
    </div>
  )
}

export default HeatmapSettings