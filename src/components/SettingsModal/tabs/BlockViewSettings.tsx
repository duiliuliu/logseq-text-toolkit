import React, { useState } from 'react';
import { t } from '../../../translations/i18n';
import CustomSelect from '../../CustomSelect';
import { TabComponentProps } from '../index';
import { ViewType as BlockViewType } from '../../../lib/blockView/types';
import { BlockThemeType } from '../../../settings/types';

function BlockViewSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const blockViewSettings = settings?.blockView || {
    enabled: true,
    defaultView: 'list' as BlockViewType,
    defaultTheme: 'default' as BlockThemeType,
    hideViewBar: false,
    table: {
      showStriped: true,
      showBorder: true,
      customTheme: {
        borderColor: '#e2e8f0',
        headerBgColor: '#f8fafc',
        headerTextColor: '#374151',
        cellTextColor: '#475569',
        headerBorderColor: '#cbd5e1',
        headerHeight: '40px',
        rowBgColor: '#ffffff',
        rowHoverBgColor: '#f1f5f9',
        rowBorderColor: '#e2e8f0',
        cellPadding: '8px 12px',
        tableBorderRadius: '8px'
      }
    },
    gallery: {
      showCardBorders: true,
      cardsPerRow: 3,
      customTheme: {
        borderColor: '#e2e8f0',
        cardBgColor: '#ffffff',
        cardHoverBgColor: '#f8fafc',
        headerBorderColor: '#e2e8f0',
        headerBgColor: 'transparent',
        headerTextColor: '#374151',
        cardTextColor: '#475569',
        cardBorderRadius: '12px',
        cardShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
      }
    },
    board: {
      showColumnBorders: true,
      cardSpacing: '12px',
      customTheme: {
        borderColor: '#e2e8f0',
        columnBgColor: '#ffffff',
        columnHoverBgColor: '#f8fafc',
        headerBgColor: 'transparent',
        headerTextColor: '#374151',
        cardBgColor: '#ffffff',
        cardTextColor: '#475569',
        cardBorderColor: '#e2e8f0',
        cardBorderRadius: '8px'
      }
    }
  };

  const [expandedViews, setExpandedViews] = useState<Set<string>>(new Set(['table', 'gallery', 'board']));

  const toggleViewExpansion = (viewType: string) => {
    const newExpanded = new Set(expandedViews);
    if (newExpanded.has(viewType)) {
      newExpanded.delete(viewType);
    } else {
      newExpanded.add(viewType);
    }
    setExpandedViews(newExpanded);
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

  const handleViewSettingChange = (viewType: 'table' | 'gallery' | 'board', key: string, value: any) => {
    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        blockView: {
          ...blockViewSettings,
          [viewType]: {
            ...blockViewSettings[viewType],
            [key]: value,
          },
        },
      };
    });
  };

  const handleCustomThemeChange = (
    viewType: 'table' | 'gallery' | 'board',
    key: string,
    value: any
  ) => {
    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        blockView: {
          ...blockViewSettings,
          [viewType]: {
            ...blockViewSettings[viewType],
            customTheme: {
              ...blockViewSettings[viewType].customTheme,
              [key]: value,
            },
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
    { value: 'default', label: t('settings.blockView.themeDefault', language) },
    { value: 'notion', label: t('settings.blockView.themeNotion', language) },
    { value: 'linear', label: t('settings.blockView.themeLinear', language) },
    { value: 'dark', label: t('settings.blockView.themeDark', language) },
    { value: 'gradient', label: t('settings.blockView.themeGradient', language) },
    { value: 'tana', label: t('settings.blockView.themeTana', language) },
    { value: 'custom', label: t('settings.blockView.themeCustom', language) },
  ];

  const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
    <div className="ltt-setting-item" style={{ flex: 1, minWidth: '200px' }}>
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
    <div className="ltt-setting-item" style={{ flex: 1, minWidth: '200px' }}>
      <label>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--ls-border-color, #e5e7eb)', borderRadius: '4px', fontSize: '12px' }}
      />
    </div>
  );

  const NumberInput = ({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) => (
    <div className="ltt-setting-item" style={{ flex: 1, minWidth: '200px' }}>
      <label>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--ls-border-color, #e5e7eb)', borderRadius: '4px', fontSize: '12px' }}
      />
    </div>
  );

  const renderViewSection = (
    viewType: 'table' | 'gallery' | 'board',
    titleKey: string,
    customFields: any[]
  ) => {
    const isExpanded = expandedViews.has(viewType);
    const viewConfig = blockViewSettings[viewType];
    const customThemeConfig = viewConfig?.customTheme || {};

    return (
      <div style={{ marginTop: '16px', border: '1px solid var(--ls-border-color, #e5e7eb)', borderRadius: '8px', overflow: 'hidden' }}>
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--ls-secondary-background, #f5f5f5)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => toggleViewExpansion(viewType)}
        >
          <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            {t(`settings.blockView.${viewType}.title`, language)}
          </h4>
          <span style={{ fontSize: '18px', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            ▶
          </span>
        </div>

        {isExpanded && (
          <div style={{ padding: '16px' }}>
            {viewType === 'table' && (
              <>
                <div className="ltt-setting-item">
                  <label>{t('settings.blockView.table.showStriped', language)}</label>
                  <label className="ltt-switch">
                    <input
                      type="checkbox"
                      checked={viewConfig.showStriped}
                      onChange={(e) => handleViewSettingChange(viewType, 'showStriped', e.target.checked)}
                    />
                    <span className="ltt-switch-slider"></span>
                  </label>
                </div>
                <div className="ltt-setting-item">
                  <label>{t('settings.blockView.table.showBorder', language)}</label>
                  <label className="ltt-switch">
                    <input
                      type="checkbox"
                      checked={viewConfig.showBorder}
                      onChange={(e) => handleViewSettingChange(viewType, 'showBorder', e.target.checked)}
                    />
                    <span className="ltt-switch-slider"></span>
                  </label>
                </div>
              </>
            )}

            {viewType === 'gallery' && (
              <>
                <div className="ltt-setting-item">
                  <label>{t('settings.blockView.gallery.showCardBorders', language)}</label>
                  <label className="ltt-switch">
                    <input
                      type="checkbox"
                      checked={viewConfig.showCardBorders}
                      onChange={(e) => handleViewSettingChange(viewType, 'showCardBorders', e.target.checked)}
                    />
                    <span className="ltt-switch-slider"></span>
                  </label>
                </div>
                <NumberInput
                  label={t('settings.blockView.gallery.cardsPerRow', language)}
                  value={viewConfig.cardsPerRow}
                  onChange={(val) => handleViewSettingChange(viewType, 'cardsPerRow', val)}
                />
              </>
            )}

            {viewType === 'board' && (
              <>
                <div className="ltt-setting-item">
                  <label>{t('settings.blockView.board.showColumnBorders', language)}</label>
                  <label className="ltt-switch">
                    <input
                      type="checkbox"
                      checked={viewConfig.showColumnBorders}
                      onChange={(e) => handleViewSettingChange(viewType, 'showColumnBorders', e.target.checked)}
                    />
                    <span className="ltt-switch-slider"></span>
                  </label>
                </div>
                <TextInput
                  label={t('settings.blockView.board.cardSpacing', language)}
                  value={viewConfig.cardSpacing}
                  onChange={(val) => handleViewSettingChange(viewType, 'cardSpacing', val)}
                />
              </>
            )}

            {/* Custom Theme Configuration */}
            {blockViewSettings.defaultTheme === 'custom' && (
              <div style={{ marginTop: '16px', padding: '16px', border: '1px solid var(--ls-border-color, #e5e7eb)', borderRadius: '8px', backgroundColor: 'var(--ls-tertiary-background, #fafafa)' }}>
                <h5 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: 600, color: 'var(--ls-primary-text-color-plugin, #333)' }}>
                  {t(`settings.blockView.${viewType}.customTheme.title`, language)}
                </h5>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {customFields.map((field) => (
                    field.type === 'color' ? (
                      <ColorInput
                        key={field.key}
                        label={t(`settings.blockView.${viewType}.customTheme.${field.key}`, language)}
                        value={customThemeConfig[field.key] || field.defaultValue}
                        onChange={(val) => handleCustomThemeChange(viewType, field.key, val)}
                      />
                    ) : (
                      <TextInput
                        key={field.key}
                        label={t(`settings.blockView.${viewType}.customTheme.${field.key}`, language)}
                        value={customThemeConfig[field.key] || field.defaultValue}
                        onChange={(val) => handleCustomThemeChange(viewType, field.key, val)}
                      />
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const tableCustomFields = [
    { key: 'borderColor', type: 'color', defaultValue: '#e2e8f0' },
    { key: 'headerBgColor', type: 'color', defaultValue: '#f8fafc' },
    { key: 'headerTextColor', type: 'color', defaultValue: '#374151' },
    { key: 'cellTextColor', type: 'color', defaultValue: '#475569' },
    { key: 'headerBorderColor', type: 'color', defaultValue: '#cbd5e1' },
    { key: 'rowBgColor', type: 'color', defaultValue: '#ffffff' },
    { key: 'rowHoverBgColor', type: 'color', defaultValue: '#f1f5f9' },
    { key: 'rowBorderColor', type: 'color', defaultValue: '#e2e8f0' },
    { key: 'headerHeight', type: 'text', defaultValue: '40px' },
    { key: 'cellPadding', type: 'text', defaultValue: '8px 12px' },
    { key: 'tableBorderRadius', type: 'text', defaultValue: '8px' },
  ];

  const galleryCustomFields = [
    { key: 'borderColor', type: 'color', defaultValue: '#e2e8f0' },
    { key: 'cardBgColor', type: 'color', defaultValue: '#ffffff' },
    { key: 'cardTextColor', type: 'color', defaultValue: '#475569' },
    { key: 'cardHoverBgColor', type: 'color', defaultValue: '#f8fafc' },
    { key: 'headerBorderColor', type: 'color', defaultValue: '#e2e8f0' },
    { key: 'headerBgColor', type: 'color', defaultValue: 'transparent' },
    { key: 'headerTextColor', type: 'color', defaultValue: '#374151' },
    { key: 'cardBorderRadius', type: 'text', defaultValue: '12px' },
    { key: 'cardShadow', type: 'text', defaultValue: '0 2px 8px rgba(0, 0, 0, 0.06)' },
  ];

  const boardCustomFields = [
    { key: 'borderColor', type: 'color', defaultValue: '#e2e8f0' },
    { key: 'columnBgColor', type: 'color', defaultValue: '#ffffff' },
    { key: 'columnHoverBgColor', type: 'color', defaultValue: '#f8fafc' },
    { key: 'headerBgColor', type: 'color', defaultValue: 'transparent' },
    { key: 'headerTextColor', type: 'color', defaultValue: '#374151' },
    { key: 'cardBgColor', type: 'color', defaultValue: '#ffffff' },
    { key: 'cardTextColor', type: 'color', defaultValue: '#475569' },
    { key: 'cardBorderColor', type: 'color', defaultValue: '#e2e8f0' },
    { key: 'cardBorderRadius', type: 'text', defaultValue: '8px' },
  ];

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
        <label>{t('settings.blockView.defaultTheme', language)}</label>
        <CustomSelect
          options={themeOptions}
          value={blockViewSettings.defaultTheme}
          onChange={(value) => handleSettingChange('defaultTheme', value)}
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

      {renderViewSection('table', 'table.title', tableCustomFields)}
      {renderViewSection('gallery', 'gallery.title', galleryCustomFields)}
      {renderViewSection('board', 'board.title', boardCustomFields)}

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
