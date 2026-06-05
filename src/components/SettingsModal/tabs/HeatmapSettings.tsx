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
import { getAllTemplates } from '../../../lib/summary/templates'

function HeatmapSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const heatmapSettings = settings.heatmap || {
    enabled: true,
    defaultViewType: 'year',
    defaultDisplayMode: 'full',
    defaultColorFormula: 'simple',
    colorScheme: {
      minColor: '#eef2ff',
      maxColor: '#3730a3',
      gradientSteps: 5,
    },
    enableMonthPageCreation: false,
    monthPageTemplate: '{year}-{month}',
    monthPageTemplateType: '',
    enableWeekPageCreation: false,
    weekPageTemplate: '{year}-W{week}',
    weekPageTemplateType: '',
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => {
      if (!prev) return prev
      return {
        ...prev,
        heatmap: {
          ...prev.heatmap,
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

  const handleMonthPageCreationChange = (key: string, value: any) => {
    handleSettingChange(key, value);
  }

  const handleWeekPageCreationChange = (key: string, value: any) => {
    handleSettingChange(key, value);
  }

  const templateOptions = [
    { value: '', label: t('settings.heatmap.templateNone', language) },
    ...getAllTemplates().map(tpl => ({
      value: tpl.id,
      label: tpl.name
    }))
  ]

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

      <div className="ltt-setting-item ltt-template-setting">
        <label>{t('settings.heatmap.defaultSlashCommandTemplate', language)}</label>
        <input
          type="text"
          value={heatmapSettings.defaultSlashCommandTemplate || ''}
          onChange={(e) => handleSettingChange('defaultSlashCommandTemplate', e.target.value)}
          placeholder=":heatmap, view=year, tag=Task"
          className="ltt-default-template-input"
        />
        <div className="ltt-default-template-hint">
          {t('settings.default', language)}: :heatmap, view=year, tag=Task
        </div>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.heatmap.defaultColorFormula', language)}</label>
        <CustomSelect
          options={colorFormulaOptions}
          value={heatmapSettings.defaultColorFormula}
          onChange={(value) => handleSettingChange('defaultColorFormula', value)}
        />
      </div>

      <div className="ltt-settings-hint" style={{ margin: '-8px 0 16px 0' }}>
        {t('settings.heatmap.formulaNote', language)}
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

      <div className="ltt-settings-section-title" style={{ marginTop: '24px', marginBottom: '12px', fontWeight: 600, fontSize: '14px' }}>
        {t('settings.heatmap.monthPageCreation', language)}
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.heatmap.enableMonthPageCreation', language)}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={heatmapSettings.enableMonthPageCreation || false}
            onChange={(e) => handleMonthPageCreationChange('enableMonthPageCreation', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.heatmap.monthTemplateType', language)}</label>
        <CustomSelect
          options={templateOptions}
          value={heatmapSettings.monthPageTemplateType || ''}
          onChange={(value) => handleMonthPageCreationChange('monthPageTemplateType', value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.heatmap.monthPageNameTemplate', language)}</label>
        <input
          type="text"
          value={heatmapSettings.monthPageTemplate || ''}
          onChange={(e) => handleMonthPageCreationChange('monthPageTemplate', e.target.value)}
          placeholder="{year}-{month}"
        />
      </div>
      <div className="ltt-settings-hint" style={{ margin: '-8px 0 12px 0' }}>
        {t('settings.heatmap.templateNote', language)}
      </div>

      <div className="ltt-settings-section-title" style={{ marginTop: '24px', marginBottom: '12px', fontWeight: 600, fontSize: '14px' }}>
        {t('settings.heatmap.weekPageCreation', language)}
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.heatmap.enableWeekPageCreation', language)}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={heatmapSettings.enableWeekPageCreation || false}
            onChange={(e) => handleWeekPageCreationChange('enableWeekPageCreation', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.heatmap.weekTemplateType', language)}</label>
        <CustomSelect
          options={templateOptions}
          value={heatmapSettings.weekPageTemplateType || ''}
          onChange={(value) => handleWeekPageCreationChange('weekPageTemplateType', value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.heatmap.weekPageNameTemplate', language)}</label>
        <input
          type="text"
          value={heatmapSettings.weekPageTemplate || ''}
          onChange={(e) => handleWeekPageCreationChange('weekPageTemplate', e.target.value)}
          placeholder="{year}-W{week}"
        />
      </div>
      <div className="ltt-settings-hint" style={{ margin: '-8px 0 12px 0' }}>
        {t('settings.heatmap.templateNote', language)}
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
