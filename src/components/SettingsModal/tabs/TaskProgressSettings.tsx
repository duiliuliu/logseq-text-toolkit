/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 任务进度设置 Tab
 */

import { t } from '../../../translations/i18n.ts'
import CustomSelect from '../../CustomSelect/index.tsx'
import { Settings } from '../../../settings/types.ts'
import { TabComponentProps } from '../index.tsx'
import { ProgressDisplayType } from '../../../lib/taskProgress/types.ts'

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
    statusColors: {}
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
            checked={taskProgress.displayOptions?.['mini-circle']?.showLabel ?? true}
            onChange={(e) => handleSettingChange('taskProgress.displayOptions.mini-circle.showLabel', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.taskProgress.labelFormat', language)}</label>
        <CustomSelect
          options={labelFormatOptions}
          value={taskProgress.displayOptions?.['mini-circle']?.labelFormat || 'fraction'}
          onChange={(value) => handleSettingChange('taskProgress.displayOptions.mini-circle.labelFormat', value)}
        />
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
