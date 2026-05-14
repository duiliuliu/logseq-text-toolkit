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
      customTheme: {
        borderColor: '#e2e8f0',
        headerBgColor: '#f8fafc',
        headerTextColor: '#374151',
        headerBorderColor: '#cbd5e1',
        headerHeight: '40px',
        rowBgColor: '#ffffff',
        rowHoverBgColor: '#f1f5f9',
        rowBorderColor: '#e2e8f0',
        cellPadding: '8px 12px',
        tableBorderRadius: '8px'
      }
    },
    hideViewBar: false,
  };

  const [tableCollapsed, setTableCollapsed] = useState(false);
  const [customThemeCollapsed, setCustomThemeCollapsed] = useState(false);

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

  const handleCustomThemeSettingChange = (key: string, value: any) => {
    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        blockView: {
          ...blockViewSettings,
          table: {
            ...blockViewSettings.table,
            customTheme: {
              ...blockViewSettings.table?.customTheme,
              [key]: value,
            }
          },
        },
      };
    });
  };

  const viewOptions = [
    { value: 'list', label: t('settings.blockView.viewList', language) },
    { value: 'table', label: t('settings.blockView.viewTable', language) },
    { value: 'gallery', label: t('settings.blockView.viewGallery', language) },
    { value: 'board', label: t('settings.blockView.viewBoard', language) },
  ];

  const themeOptions = [
    { value: 'default', label: t('settings.blockView.table.themeDefault', language) },
    { value: 'notion', label: t('settings.blockView.table.themeNotion', language) },
    { value: 'linear', label: t('settings.blockView.table.themeLinear', language) },
    { value: 'dark', label: t('settings.blockView.table.themeDark', language) },
    { value: 'gradient', label: t('settings.blockView.table.themeGradient', language) },
    { value: 'custom', label: t('settings.blockView.table.themeCustom', language) },
  ];

  const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
    <div className="ltt-setting-item" style={{ flex: 1 }}>
      <label>{label}</label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '40px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, padding: '6px 8px', border: '1px solid var(--ls-border-color, #e5e7eb)', borderRadius: '4px', fontSize: '12px' }}
        />
      </div>
    </div>
  );

  const TextInput = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
    <div className="ltt-setting-item" style={{ flex: 1 }}>
      <label>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--ls-border-color, #e5e7eb)', borderRadius: '4px', fontSize: '12px' }}
      />
    </div>
  );

  return (
    <div className="ltt-settings-tab-content">
      <p className="ltt-tab-section-description-small">
        {t('settings.blockView.description', language)}
      </p>

      <div className="ltt-setting-item">
        <label>{t('settings.blockView.enabled', language)}</label>
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
        <label>{t('settings.blockView.defaultView', language)}</label>
        <CustomSelect
          options={viewOptions}
          value={blockViewSettings.defaultView}
          onChange={(value) => handleSettingChange('defaultView', value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.blockView.hideViewBar', language)}</label>
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
        {t('settings.blockView.hideViewBarDescription', language)}
      </div>

      {/* Table Settings - Collapsible */}
      <div style={{ marginTop: '24px', border: '1px solid var(--ls-border-color, #e5e7eb)', borderRadius: '8px', overflow: 'hidden' }}>
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--ls-secondary-background, #f5f5f5)',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
          onClick={() => setTableCollapsed(!tableCollapsed)}
        >
          <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            {t('settings.blockView.table.title', language)}
          </h4>
          <span style={{ fontSize: '18px', transform: tableCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            ▼
          </span>
        </div>

        {!tableCollapsed && (
          <div style={{ padding: '16px' }}>
            <div className="ltt-setting-item">
              <label>{t('settings.blockView.table.defaultTheme', language)}</label>
              <CustomSelect
                options={themeOptions}
                value={blockViewSettings.table?.defaultTheme || 'default'}
                onChange={(value) => handleTableSettingChange('defaultTheme', value)}
              />
            </div>

            <div className="ltt-setting-item">
              <label>{t('settings.blockView.table.showStriped', language)}</label>
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
              <label>{t('settings.blockView.table.showBorder', language)}</label>
              <label className="ltt-switch">
                <input
                  type="checkbox"
                  checked={blockViewSettings.table?.defaultShowBorder ?? true}
                  onChange={(e) => handleTableSettingChange('defaultShowBorder', e.target.checked)}
                />
                <span className="ltt-switch-slider"></span>
              </label>
            </div>

            {/* Custom Theme Configuration - Collapsible */}
            {blockViewSettings.table?.defaultTheme === 'custom' && (
              <div style={{ marginTop: '16px', border: '1px solid var(--ls-border-color, #e5e7eb)', borderRadius: '6px', overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'var(--ls-tertiary-background, #fafafa)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onClick={() => setCustomThemeCollapsed(!customThemeCollapsed)}
                >
                  <h5 style={{ margin: 0, fontSize: '13px' }}>
                    {t('settings.blockView.table.customTheme.title', language)}
                  </h5>
                  <span style={{ fontSize: '16px', transform: customThemeCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    ▼
                  </span>
                </div>

                {!customThemeCollapsed && (
                  <div style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                      <ColorInput
                        label={t('settings.blockView.table.customTheme.borderColor', language)}
                        value={blockViewSettings.table?.customTheme?.borderColor || '#e2e8f0'}
                        onChange={(val) => handleCustomThemeSettingChange('borderColor', val)}
                      />
                      <ColorInput
                        label={t('settings.blockView.table.customTheme.headerBgColor', language)}
                        value={blockViewSettings.table?.customTheme?.headerBgColor || '#f8fafc'}
                        onChange={(val) => handleCustomThemeSettingChange('headerBgColor', val)}
                      />
                      <ColorInput
                        label={t('settings.blockView.table.customTheme.headerTextColor', language)}
                        value={blockViewSettings.table?.customTheme?.headerTextColor || '#374151'}
                        onChange={(val) => handleCustomThemeSettingChange('headerTextColor', val)}
                      />
                      <ColorInput
                        label={t('settings.blockView.table.customTheme.headerBorderColor', language)}
                        value={blockViewSettings.table?.customTheme?.headerBorderColor || '#cbd5e1'}
                        onChange={(val) => handleCustomThemeSettingChange('headerBorderColor', val)}
                      />
                      <TextInput
                        label={t('settings.blockView.table.customTheme.headerHeight', language)}
                        value={blockViewSettings.table?.customTheme?.headerHeight || '40px'}
                        onChange={(val) => handleCustomThemeSettingChange('headerHeight', val)}
                      />
                      <ColorInput
                        label={t('settings.blockView.table.customTheme.rowBgColor', language)}
                        value={blockViewSettings.table?.customTheme?.rowBgColor || '#ffffff'}
                        onChange={(val) => handleCustomThemeSettingChange('rowBgColor', val)}
                      />
                      <ColorInput
                        label={t('settings.blockView.table.customTheme.rowHoverBgColor', language)}
                        value={blockViewSettings.table?.customTheme?.rowHoverBgColor || '#f1f5f9'}
                        onChange={(val) => handleCustomThemeSettingChange('rowHoverBgColor', val)}
                      />
                      <ColorInput
                        label={t('settings.blockView.table.customTheme.rowBorderColor', language)}
                        value={blockViewSettings.table?.customTheme?.rowBorderColor || '#e2e8f0'}
                        onChange={(val) => handleCustomThemeSettingChange('rowBorderColor', val)}
                      />
                      <TextInput
                        label={t('settings.blockView.table.customTheme.cellPadding', language)}
                        value={blockViewSettings.table?.customTheme?.cellPadding || '8px 12px'}
                        onChange={(val) => handleCustomThemeSettingChange('cellPadding', val)}
                      />
                      <TextInput
                        label={t('settings.blockView.table.customTheme.tableBorderRadius', language)}
                        value={blockViewSettings.table?.customTheme?.tableBorderRadius || '8px'}
                        onChange={(val) => handleCustomThemeSettingChange('tableBorderRadius', val)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="ltt-settings-actions">
        <button 
          className="ltt-settings-btn ltt-settings-btn-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? t('settings.saving', language) : t('settings.saveBlockViewSettings', language)}
        </button>
      </div>
    </div>
  );
}

export default BlockViewSettings;
