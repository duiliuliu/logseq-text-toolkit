/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 热力图设置 Tab
 */

import { t } from '../../../translations/i18n.ts'
import CustomSelect from '../../CustomSelect/index.tsx'
import { Settings, HeatmapSettings as HeatmapSettingsType } from '../../../settings/types'
import { TabComponentProps } from '../index'
import { generateIndigoGradient } from '../../../lib/heatmap/colorCalculator'

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

  const formulaNote = language?.startsWith('zh')
    ? '简化：当天 blocks 数量（count = blocks.length）。加权：count = blocks.length + Σmin(childrenCount×0.3, 3) + 0.1×Σmin(contentLength/100, 1)。'
    : 'Simple: count = blocks.length. Weighted: count = blocks.length + Σmin(childrenCount×0.3, 3) + 0.1×Σmin(contentLength/100, 1).'

  const gradientColors = generateIndigoGradient(
    heatmapSettings.colorScheme.minColor,
    heatmapSettings.colorScheme.maxColor,
    6
  )

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
        <CustomSelect
          options={viewTypeOptions}
          value={heatmapSettings.defaultViewType}
          onChange={(value) => handleSettingChange('defaultViewType', value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.heatmap.defaultDisplayMode', language)}</label>
        <CustomSelect
          options={displayModeOptions}
          value={heatmapSettings.defaultDisplayMode}
          onChange={(value) => handleSettingChange('defaultDisplayMode', value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.heatmap.defaultColorFormula', language)}</label>
        <CustomSelect
          options={colorFormulaOptions}
          value={heatmapSettings.defaultColorFormula}
          onChange={(value) => handleSettingChange('defaultColorFormula', value)}
        />
      </div>
      <div style={{ margin: '-8px 0 16px 0', fontSize: '12px', color: 'var(--ls-secondary-text-color-plugin, #999)', lineHeight: 1.4 }}>
        {formulaNote}
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.heatmap.minColor', language)}</label>
        <input
          type="color"
          value={heatmapSettings.colorScheme.minColor}
          onChange={(e) => handleColorChange('minColor', e.target.value)}
          style={{ width: '32px', height: '24px', padding: '0', border: '1px solid var(--ls-border-color-plugin, #ccc)', borderRadius: '4px', cursor: 'pointer' }}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.heatmap.maxColor', language)}</label>
        <input
          type="color"
          value={heatmapSettings.colorScheme.maxColor}
          onChange={(e) => handleColorChange('maxColor', e.target.value)}
          style={{ width: '32px', height: '24px', padding: '0', border: '1px solid var(--ls-border-color-plugin, #ccc)', borderRadius: '4px', cursor: 'pointer' }}
        />
      </div>
      <div style={{ margin: '-8px 0 16px 0' }}>
        <div
          style={{
            height: '10px',
            borderRadius: '6px',
            border: '1px solid var(--ls-border-color-plugin, #ccc)',
            background: `linear-gradient(90deg, ${heatmapSettings.colorScheme.minColor}, ${heatmapSettings.colorScheme.maxColor})`,
            marginBottom: '8px',
          }}
        />
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {gradientColors.map((c) => (
            <div
              key={c}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '6px',
                backgroundColor: c,
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="ltt-settings-actions">
        <button 
          className="ltt-settings-btn ltt-settings-btn-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? t('settings.saving', language) : t('settings.saveHeatmapSettings', language)}
        </button>
      </div>
    </div>
  )
}

export default HeatmapSettings
