/**
 * Milestone Settings Tab
 */

import { t } from '../../../translations/i18n.ts';
import CustomSelect from '../../CustomSelect/index.tsx';
import { Settings } from '../../../settings/types.ts';
import { TabComponentProps } from '../index.tsx';
import { MilestoneTemplate } from '../../../lib/milestone/types.ts';
import React, { useState } from 'react';

const styleOptions = [
  { value: 'capsule', label: t('settings.milestone.styleCapsule', '胶囊') },
  { value: 'badge', label: t('settings.milestone.styleBadge', '徽章') },
  { value: 'track', label: t('settings.milestone.styleTrack', '轨道') },
  { value: 'card', label: t('settings.milestone.styleCard', '卡片') },
  { value: 'compact', label: t('settings.milestone.styleCompact', '紧凑') },
];

function MilestoneSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const handleSettingChange = (path: string, value: any) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const newSettings = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const milestone = settings.milestone || {
    enabled: true,
    defaultStyle: 'capsule',
    showLabels: true,
    showProgress: true,
    templates: [],
  };

  const templates = milestone.templates || [];

  const addTemplate = () => {
    const newTemplate: MilestoneTemplate = {
      id: `template_${Date.now()}`,
      name: t('settings.milestone.newTemplate', '新模板'),
      description: '',
      filterTag: '',
      filterPropKey: '',
      filterPropValue: '',
      milestonePropKey: '',
      milestoneList: [],
      displayStyle: 'capsule',
      showProgress: true,
      showLabel: true,
      dateField: 'scheduled',
    };

    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        milestone: {
          ...prev.milestone!,
          templates: [...templates, newTemplate],
        },
      };
    });

    setEditingTemplateId(newTemplate.id);
  };

  const updateTemplate = (id: string, updates: Partial<MilestoneTemplate>) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        milestone: {
          ...prev.milestone!,
          templates: templates.map(t => t.id === id ? { ...t, ...updates } : t),
        },
      };
    });
  };

  const deleteTemplate = (id: string) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        milestone: {
          ...prev.milestone!,
          templates: templates.filter(t => t.id !== id),
        },
      };
    });
    if (editingTemplateId === id) {
      setEditingTemplateId(null);
    }
  };

  return (
    <div className="ltt-settings-tab-content">
      <p className="ltt-tab-section-description-small">
        {t('settings.milestone.description', '配置里程碑组件的默认行为和显示样式。')}
      </p>

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
        <label>{t('settings.milestone.defaultStyle', '默认显示样式')}</label>
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
              handleSettingChange('milestone.showLabel', e.target.checked);
              handleSettingChange('milestone.showLabels', e.target.checked);
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

      <div className="ltt-milestone-templates-section">
        <div className="ltt-milestone-templates-header">
          <h3 className="ltt-milestone-templates-title">
            {t('settings.milestone.templates', '预定义模板')}
          </h3>
          <button
            className="ltt-milestone-add-template-btn"
            onClick={addTemplate}
          >
            <svg className="ltt-milestone-add-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {t('settings.milestone.addTemplate', '添加模板')}
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
            templates.map((template, index) => (
              <div 
                key={template.id} 
                className={`ltt-milestone-template-card ${editingTemplateId === template.id ? 'ltt-milestone-template-card-expanded' : ''}`}
              >
                <div className="ltt-milestone-template-card-header">
                  <div className="ltt-milestone-template-info">
                    <div className="ltt-milestone-template-number">
                      {index + 1}
                    </div>
                    <input
                      className="ltt-milestone-template-name-input"
                      placeholder={t('settings.milestone.templateName', '模板名称')}
                      value={template.name}
                      onChange={(e) => updateTemplate(template.id, { name: e.target.value })}
                    />
                    <span className="ltt-milestone-template-id">
                      :{template.id.replace('template_', '')}
                    </span>
                  </div>
                  <div className="ltt-milestone-template-actions">
                    <button
                      className={`ltt-milestone-action-btn ltt-milestone-action-btn-edit ${editingTemplateId === template.id ? 'ltt-milestone-action-btn-active' : ''}`}
                      onClick={() => setEditingTemplateId(editingTemplateId === template.id ? null : template.id)}
                      title={editingTemplateId === template.id ? t('settings.milestone.collapse', '收起') : t('settings.milestone.edit', '编辑')}
                    >
                      {editingTemplateId === template.id ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      )}
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

                {editingTemplateId === template.id && (
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
                      </div>

                      <div className="ltt-milestone-form-item">
                        <label className="ltt-milestone-form-label">
                          {t('settings.milestone.templateFilterPropValue', '筛选属性值（可选）')}
                        </label>
                        <input
                          className="ltt-milestone-form-input"
                          placeholder={t('settings.milestone.templateFilterPropValue', '筛选属性值（可选）')}
                          value={template.filterPropValue || ''}
                          onChange={(e) => updateTemplate(template.id, { filterPropValue: e.target.value })}
                        />
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

                      <div className="ltt-milestone-form-item">
                        <label className="ltt-milestone-form-label">
                          {t('settings.milestone.defaultStyle', '显示样式')}
                        </label>
                        <CustomSelect
                          options={styleOptions}
                          value={template.displayStyle || 'capsule'}
                          onChange={(value) => updateTemplate(template.id, { displayStyle: value })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="ltt-settings-actions">
        <button
          className="ltt-settings-btn ltt-settings-btn-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? t('settings.saving', '保存中...') : t('settings.saveMilestoneSettings', '保存里程碑设置')}
        </button>
      </div>
    </div>
  );
}

export default MilestoneSettings;
