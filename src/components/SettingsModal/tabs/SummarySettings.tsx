import { useEffect } from 'react'
import { t } from '../../../translations/i18n.ts'
import CustomSelect from '../../CustomSelect/index.tsx'
import { SummarySettings as SummarySettingsType } from '../../../settings/types'
import { TabComponentProps } from '../index'
import { getAllTemplates } from '../../../lib/summary/templates'

const DEFAULT_SUMMARY_SETTINGS: SummarySettingsType = {
  enabled: true,
  defaultTemplate: 'gtd-work-review',
  defaultType: 'weekly',
  dateFormat: 'yyyy-MM-dd EEE',
  weeklyPageNameTemplate: '周度总结-{{year}}-W{{week}}',
  monthlyPageNameTemplate: '月度总结-{{year}}-{{month}}',
  yearlyPageNameTemplate: '年度总结-{{year}}',
  customPageNameTemplate: '自定义总结-{{date}}',
  ai: {
    enabled: false,
    provider: 'openai',
    apiKey: '',
    apiUrl: '',
    model: 'gpt-3.5-turbo',
    promptTemplate: ''
  }
}

function SummarySettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  // 合并默认值，兼容旧版本缺少字段的 settings。
  const summarySettings: SummarySettingsType = {
    ...DEFAULT_SUMMARY_SETTINGS,
    ...(settings?.summary || {}),
    ai: {
      ...DEFAULT_SUMMARY_SETTINGS.ai,
      ...(settings?.summary?.ai || {}),
    },
  }

  const templates = getAllTemplates()
  const availableTemplates = templates.filter(template =>
    template.supportedTypes.includes(summarySettings.defaultType)
  )

  const handleSettingChange = (key: keyof SummarySettingsType, value: any) => {
    setSettings(prev => {
      if (!prev) return prev
      // 使用 prev 中的最新 summary，避免连续两次 setSettings 用旧闭包互相覆盖。
      const current: SummarySettingsType = {
        ...DEFAULT_SUMMARY_SETTINGS,
        ...(prev.summary || {}),
        ai: {
          ...DEFAULT_SUMMARY_SETTINGS.ai,
          ...(prev.summary?.ai || {}),
        },
      }
      return {
        ...prev,
        summary: {
          ...current,
          [key]: value,
        },
      }
    })
  }

  const handleAiSettingChange = (key: keyof SummarySettingsType['ai'], value: any) => {
    setSettings(prev => {
      if (!prev) return prev
      const current: SummarySettingsType = {
        ...DEFAULT_SUMMARY_SETTINGS,
        ...(prev.summary || {}),
        ai: {
          ...DEFAULT_SUMMARY_SETTINGS.ai,
          ...(prev.summary?.ai || {}),
        },
      }
      return {
        ...prev,
        summary: {
          ...current,
          ai: {
            ...current.ai,
            [key]: value,
          },
        },
      }
    })
  }

  useEffect(() => {
    if (!availableTemplates.some(template => template.id === summarySettings.defaultTemplate)) {
      const nextTemplate = availableTemplates[0]?.id
      if (nextTemplate) {
        handleSettingChange('defaultTemplate', nextTemplate)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summarySettings.defaultType, summarySettings.defaultTemplate, availableTemplates.length])

  const templateOptions = availableTemplates.map(template => ({
    value: template.id,
    label: t(`settings.summary.template${template.id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')}` as any, language) || template.name
  }))

  const typeOptions = [
    { value: 'weekly', label: t('settings.summary.typeWeekly', language) },
    { value: 'monthly', label: t('settings.summary.typeMonthly', language) },
    { value: 'yearly', label: t('settings.summary.typeYearly', language) },
    { value: 'custom', label: t('settings.summary.typeCustom', language) }
  ]

  const providerOptions = [
    { value: 'openai', label: t('settings.summary.aiProviderOpenAI', language) },
    { value: 'claude', label: t('settings.summary.aiProviderClaude', language) },
    { value: 'custom', label: t('settings.summary.aiProviderCustom', language) }
  ]

  return (
    <div className="ltt-settings-tab-content">
      <p className="ltt-tab-section-description-small">
        {t('settings.summary.description', language)}
      </p>

      {/* 功能开关已移动到通用设置的功能管理，请勿重复设置 */}
      {/* 
      <div className="ltt-setting-item">
        <label>{t('settings.summary.enabled', language)}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={summarySettings.enabled}
            onChange={(e) => handleSettingChange('enabled', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>
      */}

      <div className="ltt-setting-item">
        <label>{t('settings.summary.defaultTemplate', language)}</label>
        <CustomSelect
          options={templateOptions}
          value={summarySettings.defaultTemplate}
          onChange={(value) => handleSettingChange('defaultTemplate', value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.summary.defaultType', language)}</label>
        <CustomSelect
          options={typeOptions}
          value={summarySettings.defaultType}
          onChange={(value) => {
            const compatible = templates.filter(template => template.supportedTypes.includes(value as any))
            handleSettingChange('defaultType', value)
            if (!compatible.some(template => template.id === summarySettings.defaultTemplate)) {
              handleSettingChange('defaultTemplate', compatible[0]?.id || 'minimal-dashboard')
            }
          }}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.summary.dateFormat', language)}</label>
        <input
          type="text"
          value={summarySettings.dateFormat}
          onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.summary.weeklyPageNameTemplate', language)}</label>
        <input
          type="text"
          value={summarySettings.weeklyPageNameTemplate}
          onChange={(e) => handleSettingChange('weeklyPageNameTemplate', e.target.value)}
          placeholder={t('settings.summary.weeklyPageNamePlaceholder', language)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.summary.monthlyPageNameTemplate', language)}</label>
        <input
          type="text"
          value={summarySettings.monthlyPageNameTemplate}
          onChange={(e) => handleSettingChange('monthlyPageNameTemplate', e.target.value)}
          placeholder={t('settings.summary.monthlyPageNamePlaceholder', language)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.summary.yearlyPageNameTemplate', language)}</label>
        <input
          type="text"
          value={summarySettings.yearlyPageNameTemplate}
          onChange={(e) => handleSettingChange('yearlyPageNameTemplate', e.target.value)}
          placeholder={t('settings.summary.yearlyPageNamePlaceholder', language)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.summary.customPageNameTemplate', language)}</label>
        <input
          type="text"
          value={summarySettings.customPageNameTemplate}
          onChange={(e) => handleSettingChange('customPageNameTemplate', e.target.value)}
          placeholder={t('settings.summary.customPageNamePlaceholder', language)}
        />
      </div>

      <p className="ltt-tab-section-description-small" style={{ color: '#666', fontSize: '12px', marginTop: '-8px', marginBottom: '16px' }}>
        {t('settings.summary.pageNameTemplateHelp', language)}
      </p>

      <div className="ltt-settings-section-title" style={{ marginTop: '24px', marginBottom: '12px', fontWeight: 600, fontSize: '14px' }}>
        {t('settings.summary.aiSettings', language)}
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.summary.aiEnabled', language)}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={summarySettings.ai.enabled}
            onChange={(e) => handleAiSettingChange('enabled', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      {summarySettings.ai.enabled && (
        <>
          <div className="ltt-setting-item">
            <label>{t('settings.summary.aiProvider', language)}</label>
            <CustomSelect
              options={providerOptions}
              value={summarySettings.ai.provider}
              onChange={(value) => handleAiSettingChange('provider', value)}
            />
          </div>

          <div className="ltt-setting-item">
            <label>{t('settings.summary.aiApiKey', language)}</label>
            <input
              type="password"
              value={summarySettings.ai.apiKey}
              onChange={(e) => handleAiSettingChange('apiKey', e.target.value)}
              placeholder="sk-..."
            />
          </div>

          <div className="ltt-setting-item">
            <label>{t('settings.summary.aiApiUrl', language)}</label>
            <input
              type="text"
              value={summarySettings.ai.apiUrl || ''}
              onChange={(e) => handleAiSettingChange('apiUrl', e.target.value)}
              placeholder="https://api.openai.com/v1"
            />
          </div>

          <div className="ltt-setting-item">
            <label>{t('settings.summary.aiModel', language)}</label>
            <input
              type="text"
              value={summarySettings.ai.model || ''}
              onChange={(e) => handleAiSettingChange('model', e.target.value)}
              placeholder="gpt-3.5-turbo"
            />
          </div>

          <div className="ltt-setting-item">
        <label>{t('settings.summary.aiPromptTemplate', language)}</label>
        <textarea
          value={summarySettings.ai.promptTemplate || ''}
          onChange={(e) => handleAiSettingChange('promptTemplate', e.target.value)}
          placeholder={t('settings.summary.aiPromptPlaceholder', language)}
          style={{ width: '100%', minHeight: '80px' }}
        />
      </div>
      <p className="ltt-tab-section-description-small">
        {t('settings.summary.aiFallback', language)}
      </p>
        </>
      )}

      <div className="ltt-settings-actions">
        <button
          className="ltt-settings-btn ltt-settings-btn-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? t('settings.saving', language) : t('settings.saveSummarySettings', language)}
        </button>
      </div>
    </div>
  )
}

export default SummarySettings
