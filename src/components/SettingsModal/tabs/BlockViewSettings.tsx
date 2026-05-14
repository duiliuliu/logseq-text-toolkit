import React from 'react';
import { t } from '../../../translations/i18n';
import CustomSelect from '../../CustomSelect';
import { TabComponentProps } from '../index';
import { ViewType } from '../../../lib/blockView/ViewTypes';

function BlockViewSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const blockViewSettings = settings?.blockView || {
    defaultView: 'list' as ViewType,
    hideViewBar: false,
  };

  const handleSettingChange = (key: 'defaultView' | 'hideViewBar', value: any) => {
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

  const viewOptions = [
    { value: 'list', label: language?.startsWith('zh') ? 'List' : 'List' },
    { value: 'table', label: language?.startsWith('zh') ? 'Table' : 'Table' },
    { value: 'gallery', label: language?.startsWith('zh') ? 'Gallery' : 'Gallery' },
    { value: 'board', label: language?.startsWith('zh') ? 'Board' : 'Board' },
  ];

  return (
    <div className="ltt-settings-tab-content">
      <p className="ltt-tab-section-description-small">
        {language?.startsWith('zh') ? '配置 Block 视图设置' : 'Configure block view settings'}
      </p>

      <div className="ltt-setting-item">
        <label>{language?.startsWith('zh') ? '默认视图' : 'Default view'}</label>
        <CustomSelect
          options={viewOptions}
          value={blockViewSettings.defaultView}
          onChange={(value) => handleSettingChange('defaultView', value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{language?.startsWith('zh') ? '隐藏视图切换栏' : 'Hide view switcher bar'}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={blockViewSettings.hideViewBar}
            onChange={(e) => handleSettingChange('hideViewBar', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div style={{ margin: '-8px 0 16px 0', fontSize: '12px', color: 'var(--ls-secondary-text-color-plugin, #999)', lineHeight: 1.4 }}>
        {language?.startsWith('zh')
          ? '隐藏视图切换栏后，将使用默认视图展示，仍然可以通过修改宏参数 view=xxx 来切换视图'
          : 'When view switcher bar is hidden, default view will be used. You can still switch views by modifying the macro parameter view=xxx'}
      </div>

      <div className="ltt-settings-actions">
        <button 
          className="ltt-settings-btn ltt-settings-btn-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? t('settings.saving', language) : language?.startsWith('zh') ? '保存设置' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

export default BlockViewSettings;
