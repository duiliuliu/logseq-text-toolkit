/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * 块视图设置 Tab
 */

import { t } from '../../../translations/i18n.ts'
import CustomSelect from '../../CustomSelect/index.tsx'
import { Settings, BlockViewSettings as BlockViewSettingsType, CustomTableTheme } from '../../../settings/types'
import { TabComponentProps } from '../index'
import { PRESET_THEMES } from '../../../lib/blockView/types'

function BlockViewSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const blockViewSettings: BlockViewSettingsType = settings.blockView || {
    enabled: true,
    defaultViewType: 'table',
    table: {
      defaultTheme: 'default',
      defaultShowStriped: true,
      defaultShowBorder: true,
      defaultColumns: ['marker', 'content', 'page', 'createdAt', 'updatedAt'],
    },
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => {
      if (!prev) return prev
      return {
        ...prev,
        blockView: {
          ...blockViewSettings,
          [key]: value,
        },
      }
    })
  }

  const handleTableSettingChange = (key: string, value: any) => {
    setSettings(prev => {
      if (!prev) return prev
      return {
        ...prev,
        blockView: {
          ...blockViewSettings,
          table: {
            ...blockViewSettings.table,
            [key]: value,
          },
        },
      }
    })
  }

  const handleCustomThemeChange = (key: keyof CustomTableTheme, value: string) => {
    handleTableSettingChange('customTheme', {
      ...blockViewSettings.table.customTheme,
      [key]: value,
    })
  }

  const viewTypeOptions = [
    { value: 'table', label: language?.startsWith('zh') ? '表格' : 'Table' },
    { value: 'list', label: language?.startsWith('zh') ? '列表' : 'List' },
    { value: 'card', label: language?.startsWith('zh') ? '卡片' : 'Card' },
    { value: 'timeline', label: language?.startsWith('zh') ? '时间线' : 'Timeline' },
  ]

  const themeOptions = [
    { value: 'default', label: language?.startsWith('zh') ? '默认' : 'Default' },
    { value: 'notion', label: 'Notion' },
    { value: 'linear', label: 'Linear' },
    { value: 'dark', label: language?.startsWith('zh') ? '深色' : 'Dark' },
    { value: 'gradient', label: language?.startsWith('zh') ? '渐变' : 'Gradient' },
    { value: 'custom', label: language?.startsWith('zh') ? '自定义' : 'Custom' },
  ]

  const columnOptions = [
    { value: 'marker', label: language?.startsWith('zh') ? '状态' : 'Status' },
    { value: 'content', label: language?.startsWith('zh') ? '内容' : 'Content' },
    { value: 'page', label: language?.startsWith('zh') ? '页面' : 'Page' },
    { value: 'createdAt', label: language?.startsWith('zh') ? '创建时间' : 'Created At' },
    { value: 'updatedAt', label: language?.startsWith('zh') ? '更新时间' : 'Updated At' },
  ]

  const isCustomTheme = blockViewSettings.table.defaultTheme === 'custom'
  const activeCustomTheme = isCustomTheme
    ? { ...PRESET_THEMES.default, ...blockViewSettings.table.customTheme }
    : PRESET_THEMES.default

  const handleColumnToggle = (column: string, checked: boolean) => {
    const currentColumns = blockViewSettings.table.defaultColumns || []
    const newColumns = checked
      ? [...currentColumns, column]
      : currentColumns.filter(c => c !== column)
    handleTableSettingChange('defaultColumns', newColumns)
  }

  return (
    <div className="ltt-settings-tab-content">
      <p className="ltt-tab-section-description-small">
        {language?.startsWith('zh')
          ? '块视图用于以不同方式展示子块，如表格、列表等。'
          : 'Block view for displaying child blocks in different ways, such as tables, lists, etc.'}
      </p>

      <div className="ltt-setting-item">
        <label>{language?.startsWith('zh') ? '启用' : 'Enabled'}</label>
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
          options={viewTypeOptions}
          value={blockViewSettings.defaultViewType}
          onChange={(value) => handleSettingChange('defaultViewType', value)}
        />
      </div>

      <div className="ltt-settings-section-title" style={{ marginTop: '24px', marginBottom: '12px', fontWeight: 600, fontSize: '14px' }}>
        {language?.startsWith('zh') ? '表格设置' : 'Table Settings'}
      </div>

      <div className="ltt-setting-item">
        <label>{language?.startsWith('zh') ? '默认主题' : 'Default Theme'}</label>
        <CustomSelect
          options={themeOptions}
          value={blockViewSettings.table.defaultTheme}
          onChange={(value) => handleTableSettingChange('defaultTheme', value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{language?.startsWith('zh') ? '显示斑马线' : 'Show Striped Rows'}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={blockViewSettings.table.defaultShowStriped}
            onChange={(e) => handleTableSettingChange('defaultShowStriped', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{language?.startsWith('zh') ? '显示边框' : 'Show Border'}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={blockViewSettings.table.defaultShowBorder}
            onChange={(e) => handleTableSettingChange('defaultShowBorder', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{language?.startsWith('zh') ? '显示列' : 'Show Columns'}</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          {columnOptions.map((col) => (
            <label key={col.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={(blockViewSettings.table.defaultColumns || []).includes(col.value)}
                onChange={(e) => handleColumnToggle(col.value, e.target.checked)}
              />
              <span>{col.label}</span>
            </label>
          ))}
        </div>
      </div>

      {isCustomTheme && (
        <>
          <div className="ltt-settings-section-title" style={{ marginTop: '24px', marginBottom: '12px', fontWeight: 600, fontSize: '14px' }}>
            {language?.startsWith('zh') ? '自定义主题颜色' : 'Custom Theme Colors'}
          </div>

          <div className="ltt-setting-item">
            <label>{language?.startsWith('zh') ? '边框颜色' : 'Border Color'}</label>
            <input
              type="color"
              value={activeCustomTheme.borderColor}
              onChange={(e) => handleCustomThemeChange('borderColor', e.target.value)}
              style={{ width: '32px', height: '24px', padding: '0', border: '1px solid var(--ls-border-color-plugin, #ccc)', borderRadius: '4px', cursor: 'pointer' }}
            />
          </div>

          <div className="ltt-setting-item">
            <label>{language?.startsWith('zh') ? '表头背景' : 'Header Background'}</label>
            <input
              type="color"
              value={activeCustomTheme.headerBgColor}
              onChange={(e) => handleCustomThemeChange('headerBgColor', e.target.value)}
              style={{ width: '32px', height: '24px', padding: '0', border: '1px solid var(--ls-border-color-plugin, #ccc)', borderRadius: '4px', cursor: 'pointer' }}
            />
          </div>

          <div className="ltt-setting-item">
            <label>{language?.startsWith('zh') ? '表头文字' : 'Header Text'}</label>
            <input
              type="color"
              value={activeCustomTheme.headerTextColor}
              onChange={(e) => handleCustomThemeChange('headerTextColor', e.target.value)}
              style={{ width: '32px', height: '24px', padding: '0', border: '1px solid var(--ls-border-color-plugin, #ccc)', borderRadius: '4px', cursor: 'pointer' }}
            />
          </div>

          <div className="ltt-setting-item">
            <label>{language?.startsWith('zh') ? '行背景' : 'Row Background'}</label>
            <input
              type="color"
              value={activeCustomTheme.rowBgColor}
              onChange={(e) => handleCustomThemeChange('rowBgColor', e.target.value)}
              style={{ width: '32px', height: '24px', padding: '0', border: '1px solid var(--ls-border-color-plugin, #ccc)', borderRadius: '4px', cursor: 'pointer' }}
            />
          </div>

          <div className="ltt-setting-item">
            <label>{language?.startsWith('zh') ? '行悬停背景' : 'Row Hover Background'}</label>
            <input
              type="color"
              value={activeCustomTheme.rowHoverBgColor}
              onChange={(e) => handleCustomThemeChange('rowHoverBgColor', e.target.value)}
              style={{ width: '32px', height: '24px', padding: '0', border: '1px solid var(--ls-border-color-plugin, #ccc)', borderRadius: '4px', cursor: 'pointer' }}
            />
          </div>
        </>
      )}

      <div className="ltt-settings-actions">
        <button
          className="ltt-settings-btn ltt-settings-btn-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving
            ? t('settings.saving', language)
            : language?.startsWith('zh')
            ? '保存块视图设置'
            : 'Save Block View Settings'}
        </button>
      </div>
    </div>
  )
}

export default BlockViewSettings
