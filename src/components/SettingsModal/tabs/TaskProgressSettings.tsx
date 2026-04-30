/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 任务进度设置 Tab
 */

import { t, getStatusName } from '../../../translations/i18n.ts'
import CustomSelect from '../../CustomSelect/index.tsx'
import { Settings } from '../../../settings/types.ts'
import { TabComponentProps } from '../index.tsx'

const defaultStatusColors: Record<string, string> = {
  'todo': '#f59e0b',
  'doing': '#3b82f6',
  'in-review': '#06b6d4',
  'done': '#10b981',
  'waiting': '#8b5cf6',
  'canceled': '#ef4444',
}

function TaskProgressSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const handleSettingChange = (path: string, value: any) => {
    setSettings(prev => {
      if (!prev) return prev
      const newSettings = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let current = newSettings
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newSettings
    })
  }

  const handleStatusColorChange = (status: string, color: string) => {
    setSettings(prev => {
      if (!prev) return prev
      const newSettings = JSON.parse(JSON.stringify(prev))
      if (!newSettings.meta) newSettings.meta = {}
      if (!newSettings.meta.taskProgress) newSettings.meta.taskProgress = { statusColors: {} }
      if (!newSettings.meta.taskProgress.statusColors) newSettings.meta.taskProgress.statusColors = {}
      newSettings.meta.taskProgress.statusColors[status] = color
      return newSettings
    })
  }

  const displayTypeOptions = [
    { value: 'mini-circle', label: t('settings.taskProgress.miniCircle', language) },
    { value: 'dot-matrix', label: t('settings.taskProgress.dotMatrix', language) },
    { value: 'status-cursor', label: t('settings.taskProgress.statusCursor', language) },
    { value: 'progress-capsule', label: t('settings.taskProgress.progressCapsule', language) },
    { value: 'step-progress', label: t('settings.taskProgress.stepProgress', language) }
  ]

  const sizeOptions = [
    { value: 'small', label: t('settings.taskProgress.sizeSmall', language) },
    { value: 'medium', label: t('settings.taskProgress.sizeMedium', language) },
    { value: 'large', label: t('settings.taskProgress.sizeLarge', language) }
  ]

  const labelFormatOptions = [
    { value: 'fraction', label: t('settings.taskProgress.labelFraction', language) },
    { value: 'percentage', label: t('settings.taskProgress.labelPercentage', language) },
    { value: 'both', label: t('settings.taskProgress.labelBoth', language) }
  ]

  const taskProgress = settings.taskProgress || {
    enabled: true,
    defaultDisplayType: 'mini-circle',
    displayOptions: {},
  }

  const statusColors = {
    ...defaultStatusColors,
    ...settings.meta?.taskProgress?.statusColors
  }

  return (
    <div className="ltt-settings-tab-content">
      <p className="ltt-tab-section-description-small">
        {t('settings.taskProgressDescription', language)}
      </p>
      
      <div className="ltt-setting-item">
        <label>{t('settings.taskProgress.enabled', language)}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={taskProgress.enabled || false}
            onChange={(e) => handleSettingChange('taskProgress.enabled', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.taskProgress.defaultDisplayType', language)}</label>
        <CustomSelect
          options={displayTypeOptions}
          value={taskProgress.defaultDisplayType || 'mini-circle'}
          onChange={(value) => handleSettingChange('taskProgress.defaultDisplayType', value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.taskProgress.size', language)}</label>
        <CustomSelect
          options={sizeOptions}
          value={taskProgress.displayOptions?.['mini-circle']?.size || 'small'}
          onChange={(value) => handleSettingChange('taskProgress.displayOptions.mini-circle.size', value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.taskProgress.showLabel', language)}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={taskProgress.showLabel ?? true}
            onChange={(e) => handleSettingChange('taskProgress.showLabel', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.taskProgress.labelFormat', language)}</label>
        <CustomSelect
          options={labelFormatOptions}
          value={taskProgress.labelFormat || 'fraction'}
          onChange={(value) => handleSettingChange('taskProgress.labelFormat', value)}
        />
      </div>

      <div className="ltt-settings-section">
        <h4>{t('settings.taskProgress.statusColors', language)}</h4>
        <p className="ltt-section-hint" style={{ fontSize: '12px', color: '#666', margin: '4px 0 12px' }}>
          点击色块修改颜色，更多状态请在 settings.json 中配置
        </p>
        
        <div className="ltt-status-colors-grid">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="ltt-status-color-row">
              <input
                type="color"
                value={color}
                onChange={(e) => handleStatusColorChange(status, e.target.value)}
                className="ltt-color-input"
              />
              <span className="ltt-status-label">{getStatusName(status, language)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ltt-settings-actions">
        <button 
          className="ltt-settings-btn ltt-settings-btn-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? t('settings.saving', language) : t('settings.saveTaskProgressSettings', language)}
        </button>
      </div>
    </div>
  )
}

export default TaskProgressSettings