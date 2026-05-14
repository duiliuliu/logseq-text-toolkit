import React, { useState } from 'react';
import { t } from '../../../translations/i18n';
import CustomSelect from '../../CustomSelect';
import { TabComponentProps } from '../index';
import { ViewType, TableTheme } from '../../../lib/blockView/types';

function BlockViewSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const blockViewSettings = settings?.blockView || {
    enabled: true,
    defaultView: 'list' as ViewType,
    table: {
      defaultTheme: 'default' as TableTheme,
      defaultShowStriped: true,
      defaultShowBorder: true,
    },
    hideViewBar: false,
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        blockView: {
          ...blockViewSettings,
          [key]: value,
        },
      };
    });
  };

  const handleTableSettingChange = (key: string, value: any) => {
    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        blockView: {
          ...blockViewSettings,
          table: {
            ...blockViewSettings.table,
            [key]: value,
          },
        },
      };
    });
  };

  const viewOptions = [
    { value: 'list', label: 'List' },
    { value: 'table', label: 'Table' },
    { value: 'gallery', label: 'Gallery' },
    { value: 'board', label: 'Board' },
  ];

  const themeOptions = [
    { value: 'default', label: language?.startsWith('zh') ? '默认' : 'Default' },
    { value: 'notion', label: 'Notion' },
    { value: 'linear', label: 'Linear' },
    { value: 'dark', label: language?.startsWith('zh') ? '深色' : 'Dark' },
    { value: 'gradient', label: language?.startsWith('zh') ? '渐变' : 'Gradient' },
    { value: 'custom', label: language?.startsWith('zh') ? '自定义' : 'Custom' },
  ];

  return (
    <div className="ltt-settings-tab-content">
      <p className="ltt-tab-section-description-small">
        {language?.startsWith('zh') ? '配置 Block 视图模块的全局默认行为' : 'Configure block view global settings'}
      </p>

      <div className="ltt-setting-item">
        <label>{language?.startsWith('zh') ? '启用 Block View' : 'Enable Block View'}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={blockViewSettings.enabled}
            onChange={(e) => handleSettingChange('enabled', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{language?.startsWith('zh') ? '默认视图类型' : 'Default View Type'}</label>
        <CustomSelect
          options={viewOptions}
          value={blockViewSettings.defaultView}
          onChange={(value) => handleSettingChange('defaultView', value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{language?.startsWith('zh') ? '隐藏视图切换栏' : 'Hide View Switcher Bar'}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={blockViewSettings.hideViewBar}
            onChange={(e) => handleSettingChange('hideViewBar', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div style={{ margin: '16px 0', fontSize: '12px', color: 'var(--ls-secondary-text-color-plugin, #999)', lineHeight: 1.4 }}>
        {language?.startsWith('zh')
          ? '隐藏视图切换栏后，将使用默认视图展示，仍然可以通过修改宏参数 view=xxx 来切换视图'
          : 'When view switcher bar is hidden, default view will be used. You can still switch views by modifying the macro parameter view=xxx'}
      </div>

      <div style={{ 
        marginTop: '24px', 
        padding: '16px', 
        backgroundColor: 'var(--ls-secondary-background, #f5f5f5)', 
        borderRadius: '8px',
        border: '1px solid var(--ls-border-color, #e5e7eb)'
      }}>
        <h4 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📊</span>
          {language?.startsWith('zh') ? 'Table 设置' : 'Table Settings'}
        </h4>

        <div className="ltt-setting-item">
          <label>{language?.startsWith('zh') ? '默认主题' : 'Default Theme'}</label>
          <CustomSelect
            options={themeOptions}
            value={blockViewSettings.table?.defaultTheme || 'default'}
            onChange={(value) => handleTableSettingChange('defaultTheme', value)}
          />
        </div>

        <div className="ltt-setting-item">
          <label>{language?.startsWith('zh') ? '显示斑马纹行' : 'Show Striped Rows'}</label>
          <label className="ltt-switch">
            <input
              type="checkbox"
              checked={blockViewSettings.table?.defaultShowStriped ?? true}
              onChange={(e) => handleTableSettingChange('defaultShowStriped', e.target.checked)}
            />
            <span className="ltt-switch-slider"></span>
          </label>
        </div>

        <div className="ltt-setting-item">
          <label>{language?.startsWith('zh') ? '显示边框' : 'Show Borders'}</label>
          <label className="ltt-switch">
            <input
              type="checkbox"
              checked={blockViewSettings.table?.defaultShowBorder ?? true}
              onChange={(e) => handleTableSettingChange('defaultShowBorder', e.target.checked)}
            />
            <span className="ltt-switch-slider"></span>
          </label>
        </div>

        {blockViewSettings.table?.defaultTheme === 'custom' && (
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            backgroundColor: 'var(--ls-tertiary-background, #fff)', 
            borderRadius: '6px',
            fontSize: '12px',
            color: 'var(--ls-secondary-text-color-plugin, #666)'
          }}>
            {language?.startsWith('zh')
              ? '自定义主题配置功能开发中...'
              : 'Custom theme configuration coming soon...'}
          </div>
        )}
      </div>

      <div className="ltt-settings-actions">
        <button 
          className="ltt-settings-btn ltt-settings-btn-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? t('settings.saving', language) : language?.startsWith('zh') ? '保存 Block View 设置' : 'Save Block View Settings'}
        </button>
      </div>
    </div>
  );
}

export default BlockViewSettings;
