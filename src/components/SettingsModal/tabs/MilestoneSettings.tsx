/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * 里程碑设置 Tab
 */

import { t } from '../../../translations/i18n.ts'
import CustomSelect from '../../CustomSelect/index.tsx'
import { TabComponentProps } from '../index.tsx'
import { MilestoneTemplate, DEFAULT_COLOR_SCHEME } from '../../../lib/milestone/types.ts'
import React, { useState } from 'react'

const styleOptions = [
  { value: 'capsule', label: t('settings.milestone.styleCapsule', '胶囊') },
  { value: 'badge', label: t('settings.milestone.styleBadge', '徽章') },
  { value: 'track', label: t('settings.milestone.styleTrack', '轨道') },
  { value: 'card', label: t('settings.milestone.styleCard', '卡片') },
  { value: 'compact', label: t('settings.milestone.styleCompact', '紧凑') },
  { value: 'arrow-capsule', label: t('settings.milestone.styleArrowCapsule', '箭头胶囊') },
  { value: 'timeline-track', label: t('settings.milestone.styleTimelineTrack', '时间线轨道') },
]

const colorInputs = [
  { key: 'completed', label: '已完成', defaultValue: DEFAULT_COLOR_SCHEME.completed },
  { key: 'inProgress', label: '进行中', defaultValue: DEFAULT_COLOR_SCHEME.inProgress },
  { key: 'pending', label: '待开始', defaultValue: DEFAULT_COLOR_SCHEME.pending },
  { key: 'failed', label: '失败', defaultValue: DEFAULT_COLOR_SCHEME.failed },
  { key: 'skipped', label: '跳过', defaultValue: DEFAULT_COLOR_SCHEME.skipped },
  { key: 'background', label: '背景', defaultValue: DEFAULT_COLOR_SCHEME.background },
  { key: 'text', label: '文字', defaultValue: DEFAULT_COLOR_SCHEME.text },
]

function MilestoneSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [collapsedTemplates, setCollapsedTemplates] = useState<Set<string>>(new Set())

  const toggleTemplate = (id: string) => {
    const newCollapsed = new Set(collapsedTemplates)
    if (newCollapsed.has(id)) {
      newCollapsed.delete(id)
    } else {
      newCollapsed.add(id)
    }
    setCollapsedTemplates(newCollapsed)
  }

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

  const milestone = settings.milestone || {
    enabled: true,
    defaultStyle: 'capsule',
    showLabels: true,
    showProgress: true,
    inline: false,
    templates: [],
  }

  const templates = milestone.templates || []

  const isIdUnique = (id: string, excludeId?: string): boolean => {
    return !templates.some(t => t.id === id && t.id !== excludeId)
  }

  const isNameUnique = (name: string, excludeId?: string): boolean => {
    return !templates.some(t => t.name === name && t.id !== excludeId)
  }

  const generateUniqueId = (): string => {
    let id = `template_${Date.now()}`
    let counter = 1
    while (!isIdUnique(id)) {
      id = `template_${Date.now()}_${counter}`
      counter++
    }
    return id
  }

  const addTemplate = () => {
    const newTemplate: MilestoneTemplate = {
      id: generateUniqueId(),
      name: t('settings.milestone.newTemplate', '新模板'),
      description: '',
      filterTag: '',
      filterPropKey: '',
      milestonePropKey: '',
      milestoneList: [],
      displayStyle: 'capsule',
      showProgress: true,
      showLabel: true,
      inline: false,
      dateField: 'scheduled',
    }

    let templateName = newTemplate.name
    let counter = 1
    while (!isNameUnique(templateName)) {
      templateName = `${t('settings.milestone.newTemplate', '新模板')} ${counter}`
      counter++
    }
    newTemplate.name = templateName

    setSettings(prev => {
      if (!prev) return prev
      return {
        ...prev,
        milestone: {
          ...prev.milestone!,
          templates: [...templates, newTemplate],
        },
      }
    })

    // New templates are expanded by default
  }

  const updateTemplate = (id: string, updates: Partial<MilestoneTemplate>) => {
    const newErrors: { [key: string]: string } = {}

    if (updates.name !== undefined) {
      if (!updates.name.trim()) {
        newErrors[`name_${id}`] = t('settings.milestone.nameRequired', '模板名称不能为空')
      } else if (!isNameUnique(updates.name, id)) {
        newErrors[`name_${id}`] = t('settings.milestone.nameDuplicate', '模板名称已存在')
      }
    }

    setErrors(newErrors)

    if (newErrors[`name_${id}`] && updates.name !== undefined) {
      return
    }

    setSettings(prev => {
      if (!prev) return prev
      return {
        ...prev,
        milestone: {
          ...prev.milestone!,
          templates: templates.map(t => t.id === id ? { ...t, ...updates } : t),
        },
      }
    })
  }

  const deleteTemplate = (id: string) => {
    setSettings(prev => {
      if (!prev) return prev
      return {
        ...prev,
        milestone: {
          ...prev.milestone!,
          templates: templates.filter(t => t.id !== id),
        },
      }
    })
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[`name_${id}`]
      return newErrors
    })
    // Also remove from collapsed state
    const newCollapsed = new Set(collapsedTemplates)
    newCollapsed.delete(id)
    setCollapsedTemplates(newCollapsed)
  }

  return (
    <div className="ltt-settings-tab-content">
      {/* Tab Description */}
      <p className="ltt-tab-section-description-small">
        {t('settings.milestoneDescription', language) || '配置里程碑显示样式和模板'}
      </p>

      {/* Basic Settings */}
      <div className="ltt-setting-item">
        <label>{t('settings.milestone.enabled', '启用里程碑功能')}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={milestone.enabled || false}
            onChange={(e) => handleSettingChange('milestone.enabled', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.milestone.defaultStyle', '默认样式')}</label>
        <CustomSelect
          options={styleOptions}
          value={milestone.defaultStyle || 'capsule'}
          onChange={(value) => handleSettingChange('milestone.defaultStyle', value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.milestone.showLabel', '显示标签')}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={milestone.showLabel ?? milestone.showLabels ?? true}
            onChange={(e) => {
              handleSettingChange('milestone.showLabel', e.target.checked)
              handleSettingChange('milestone.showLabels', e.target.checked)
            }}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.milestone.showProgress', '显示进度')}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={milestone.showProgress ?? true}
            onChange={(e) => handleSettingChange('milestone.showProgress', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.milestone.inline', '行内模式')}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={milestone.inline ?? false}
            onChange={(e) => handleSettingChange('milestone.inline', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      {/* Default Colors Section */}
      <div className="ltt-settings-section">
        <h4>{t('settings.milestone.defaultColors', '默认配色')}</h4>
        <div className="ltt-milestone-color-grid-compact">
          {colorInputs.map(({ key, label, defaultValue }) => (
            <div key={key} className="ltt-milestone-color-item-compact">
              <input
                type="color"
                value={(milestone.defaultColorScheme as any)?.[key] || defaultValue}
                onChange={(e) => handleSettingChange(`milestone.defaultColorScheme.${key}`, e.target.value)}
                title={label}
              />
              <span className="ltt-milestone-color-dot" style={{ backgroundColor: (milestone.defaultColorScheme as any)?.[key] || defaultValue }}></span>
              <span className="ltt-milestone-color-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Templates Section */}
      <div className="ltt-milestone-templates-section">
        <div className="ltt-milestone-templates-header">
          <h3 className="ltt-milestone-templates-title">
            {t('settings.milestone.templates', '模板配置')}
          </h3>
          <button
            className="ltt-milestone-add-template-btn"
            onClick={addTemplate}
          >
            <svg className="ltt-milestone-add-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {t('settings.milestone.addTemplate', '添加')}
          </button>
        </div>

        <div className="ltt-milestone-templates-list">
          {templates.length === 0 ? (
            <div className="ltt-milestone-no-templates">
              <svg className="ltt-milestone-empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                <line x1="9" y1="9" x2="15" y2="9"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              <p className="ltt-milestone-no-templates-text">
                {t('settings.milestone.noTemplates', '暂无模板，点击上方按钮添加。')}
              </p>
            </div>
          ) : (
            templates.map((template, index) => {
              const isCollapsed = collapsedTemplates.has(template.id)
              return (
                <div
                  key={template.id}
                  className={`ltt-milestone-template-card ${isCollapsed ? '' : 'ltt-milestone-template-card-expanded'}`}
                >
                  <div className="ltt-milestone-template-card-header">
                    <div className="ltt-milestone-template-info">
                      <div className="ltt-milestone-template-number">
                        {index + 1}
                      </div>
                      <input
                        className={`ltt-milestone-template-name-input ${errors[`name_${template.id}`] ? 'ltt-milestone-input-error' : ''}`}
                        placeholder={t('settings.milestone.templateName', '模板名称')}
                        value={template.name}
                        onChange={(e) => updateTemplate(template.id, { name: e.target.value })}
                      />
                      {errors[`name_${template.id}`] && (
                        <span className="ltt-milestone-error-message">
                          {errors[`name_${template.id}`]}
                        </span>
                      )}
                      <span className="ltt-milestone-template-id">
                        :{template.id.replace('template_', '')}
                      </span>
                    </div>
                    <div className="ltt-milestone-template-actions">
                      <button
                        className="ltt-milestone-action-btn ltt-milestone-action-btn-collapse"
                        onClick={() => toggleTemplate(template.id)}
                        title={isCollapsed ? t('settings.milestone.edit', '展开') : t('settings.milestone.collapse', '折叠')}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline
                            points={isCollapsed ? "9 18 15 12 9 6" : "18 9 12 15 6 9"}
                          ></polyline>
                        </svg>
                      </button>
                      <button
                        className="ltt-milestone-action-btn ltt-milestone-action-btn-delete"
                        onClick={() => deleteTemplate(template.id)}
                        title={t('settings.milestone.delete', '删除')}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="ltt-milestone-template-card-body">
                      <div className="ltt-milestone-form-grid">
                        <div className="ltt-milestone-form-item">
                          <label className="ltt-milestone-form-label">
                            {t('settings.milestone.templateDescription', '描述（可选）')}
                          </label>
                          <input
                            className="ltt-milestone-form-input"
                            placeholder={t('settings.milestone.templateDescription', '描述（可选）')}
                            value={template.description || ''}
                            onChange={(e) => updateTemplate(template.id, { description: e.target.value })}
                          />
                        </div>

                        <div className="ltt-milestone-form-item">
                          <label className="ltt-milestone-form-label">
                            {t('settings.milestone.templateFilterTag', '筛选标签（可选）')}
                          </label>
                          <input
                            className="ltt-milestone-form-input"
                            placeholder={t('settings.milestone.templateFilterTag', '筛选标签（可选）')}
                            value={template.filterTag || ''}
                            onChange={(e) => updateTemplate(template.id, { filterTag: e.target.value })}
                          />
                        </div>

                        <div className="ltt-milestone-form-item">
                          <label className="ltt-milestone-form-label">
                            {t('settings.milestone.templateFilterPropKey', '筛选属性键（可选）')}
                          </label>
                          <input
                            className="ltt-milestone-form-input"
                            placeholder={t('settings.milestone.templateFilterPropKey', '筛选属性键（可选）')}
                            value={template.filterPropKey || ''}
                            onChange={(e) => updateTemplate(template.id, { filterPropKey: e.target.value })}
                          />
                          <div className="ltt-milestone-form-hint">
                            填写格式：可以填写 :user.property/xxx 或直接填写 xxx（系统会自动添加前缀）
                          </div>
                        </div>

                        <div className="ltt-milestone-form-item ltt-milestone-form-item-full">
                          <label className="ltt-milestone-form-label ltt-milestone-form-label-required">
                            {t('settings.milestone.templateMilestonePropKey', '里程碑属性键（必填）')}
                          </label>
                          <input
                            className="ltt-milestone-form-input"
                            placeholder={t('settings.milestone.templateMilestonePropKey', '里程碑属性键（必填）')}
                            value={template.milestonePropKey || ''}
                            onChange={(e) => updateTemplate(template.id, { milestonePropKey: e.target.value })}
                          />
                          <div className="ltt-milestone-form-hint">
                            填写格式：可以填写 :user.property/xxx 或直接填写 xxx（系统会自动添加前缀）
                          </div>
                        </div>

                        <div className="ltt-milestone-form-item ltt-milestone-form-item-full">
                          <label className="ltt-milestone-form-label">
                            {t('settings.milestone.templateMilestoneList', '里程碑列表（分号分隔）')}
                          </label>
                          <input
                            className="ltt-milestone-form-input"
                            placeholder="投递简历;技术一面;技术二面;HR面;Offer"
                            value={(template.milestoneList || []).join(';')}
                            onChange={(e) => updateTemplate(template.id, { milestoneList: e.target.value.split(';').map(s => s.trim()).filter(Boolean) })}
                          />
                        </div>

                        {/* Template Display Options in Row */}
                        <div className="ltt-milestone-template-display-row">
                          <div className="ltt-milestone-form-item">
                            <label className="ltt-milestone-form-label">
                              {t('settings.milestone.defaultStyle', '显示样式')}
                            </label>
                            <div className="ltt-setting-item">
                              <CustomSelect
                                options={styleOptions}
                                value={template.displayStyle || 'capsule'}
                                onChange={(value) => updateTemplate(template.id, { displayStyle: value })}
                              />
                            </div>
                          </div>

                          <div className="ltt-milestone-form-item">
                            <label className="ltt-milestone-form-label">
                              {t('settings.milestone.showProgress', '显示进度')}
                            </label>
                            <label className="ltt-switch">
                              <input
                                type="checkbox"
                                checked={template.showProgress ?? true}
                                onChange={(e) => updateTemplate(template.id, { showProgress: e.target.checked })}
                              />
                              <span className="ltt-switch-slider"></span>
                            </label>
                          </div>

                          <div className="ltt-milestone-form-item">
                            <label className="ltt-milestone-form-label">
                              {t('settings.milestone.showLabel', '显示标签')}
                            </label>
                            <label className="ltt-switch">
                              <input
                                type="checkbox"
                                checked={template.showLabel ?? true}
                                onChange={(e) => updateTemplate(template.id, { showLabel: e.target.checked })}
                              />
                              <span className="ltt-switch-slider"></span>
                            </label>
                          </div>

                          <div className="ltt-milestone-form-item">
                            <label className="ltt-milestone-form-label">
                              {t('settings.milestone.inline', '行内模式')}
                            </label>
                            <label className="ltt-switch">
                              <input
                                type="checkbox"
                                checked={template.inline ?? false}
                                onChange={(e) => updateTemplate(template.id, { inline: e.target.checked })}
                              />
                              <span className="ltt-switch-slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Template Custom Colors Section */}
                      <div className="ltt-milestone-template-color-section">
                        <div className="ltt-milestone-template-color-header">
                          <span className="ltt-milestone-template-color-title">自定义配色</span>
                          <span className="ltt-milestone-template-color-hint">可选</span>
                        </div>
                        <div className="ltt-milestone-color-grid-compact">
                          {colorInputs.map(({ key, label, defaultValue }) => (
                            <div key={key} className="ltt-milestone-color-item-compact">
                              <input
                                type="color"
                                value={(template.colorScheme as any)?.[key] || defaultValue}
                                onChange={(e) => updateTemplate(template.id, {
                                  colorScheme: {
                                    ...template.colorScheme,
                                    [key]: e.target.value
                                  } as any
                                })}
                                title={label}
                              />
                              <span className="ltt-milestone-color-dot" style={{ backgroundColor: (template.colorScheme as any)?.[key] || defaultValue }}></span>
                              <span className="ltt-milestone-color-label">{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="ltt-settings-actions">
        <button
          className="ltt-settings-btn ltt-settings-btn-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? t('settings.saving', language) : t('settings.saveMilestoneSettings', language)}
        </button>
      </div>
    </div>
  )
}

export default MilestoneSettings
