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
      tag: '',
      propertyK: '',
      propertyV: '',
      targetPropertyK: '',
      list: [],
      defaultStyle: 'capsule',
      showLabels: true,
      showProgress: true,
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
        {t('settings.milestoneDescription', '配置里程碑组件的默认行为和显示样式。')}
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
        <label>{t('settings.milestone.showLabels', '显示标签')}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={milestone.showLabels ?? true}
            onChange={(e) => handleSettingChange('milestone.showLabels', e.target.checked)}
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

      <div style={{ margin: '32px 0 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
            {t('settings.milestone.templates', '预定义模板')}
          </h3>
          <button
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              cursor: 'pointer',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: '#fff',
            }}
            onClick={addTemplate}
          >
            {t('settings.milestone.addTemplate', '添加模板')}
          </button>
        </div>

        <div className="ltt-setting-item-group">
          {templates.length === 0 ? (
            <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>
              {t('settings.milestone.noTemplates', '暂无模板，点击上方按钮添加。')}
            </p>
          ) : (
            templates.map((template) => (
              <div key={template.id} style={{ borderBottom: templates.indexOf(template) !== templates.length - 1 ? '1px solid #e5e7eb' : 'none', paddingBottom: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      style={{ flex: 1, padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
                      placeholder={t('settings.milestone.templateName', '模板名称')}
                      value={template.name}
                      onChange={(e) => updateTemplate(template.id, { name: e.target.value })}
                    />
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      :{template.id.replace('template_', '')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        backgroundColor: '#fff',
                      }}
                      onClick={() => setEditingTemplateId(editingTemplateId === template.id ? null : template.id)}
                    >
                      {editingTemplateId === template.id
                        ? t('settings.milestone.collapse', '收起')
                        : t('settings.milestone.edit', '编辑')}
                    </button>
                    <button
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        border: '1px solid #ef4444',
                        borderRadius: '4px',
                        backgroundColor: '#fff',
                        color: '#ef4444',
                      }}
                      onClick={() => deleteTemplate(template.id)}
                    >
                      {t('settings.milestone.delete', '删除')}
                    </button>
                  </div>
                </div>

                {editingTemplateId === template.id && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
                      placeholder={t('settings.milestone.templateDescription', '描述（可选）')}
                      value={template.description || ''}
                      onChange={(e) => updateTemplate(template.id, { description: e.target.value })}
                    />
                    <input
                      style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
                      placeholder={t('settings.milestone.templateTag', '标签（可选）')}
                      value={template.tag || ''}
                      onChange={(e) => updateTemplate(template.id, { tag: e.target.value })}
                    />
                    <input
                      style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
                      placeholder={t('settings.milestone.templatePropertyK', '属性键（可选）')}
                      value={template.propertyK || ''}
                      onChange={(e) => updateTemplate(template.id, { propertyK: e.target.value })}
                    />
                    <input
                      style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
                      placeholder={t('settings.milestone.templatePropertyV', '属性值（可选）')}
                      value={template.propertyV || ''}
                      onChange={(e) => updateTemplate(template.id, { propertyV: e.target.value })}
                    />
                    <input
                      style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
                      placeholder={t('settings.milestone.templateTargetPropertyK', '目标属性键（必填）')}
                      value={template.targetPropertyK || ''}
                      onChange={(e) => updateTemplate(template.id, { targetPropertyK: e.target.value })}
                    />
                    <input
                      style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
                      placeholder={t('settings.milestone.templateList', '阶段列表（分号分隔）')}
                      value={(template.list || []).join(';')}
                      onChange={(e) => updateTemplate(template.id, { list: e.target.value.split(';').map(s => s.trim()).filter(Boolean) })}
                    />
                    <CustomSelect
                      options={styleOptions}
                      value={template.defaultStyle || 'capsule'}
                      onChange={(value) => updateTemplate(template.id, { defaultStyle: value })}
                    />
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
