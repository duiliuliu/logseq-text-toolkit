import { t } from '../../../translations/i18n.ts'
import CustomSelect from '../../CustomSelect/index.tsx'
import { Settings, SummarySettings as SummarySettingsType } from '../../../settings/types'
import { TabComponentProps } from '../index'
import { getAllTemplates } from '../../../lib/summary/templates'

function SummarySettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const summarySettings: SummarySettingsType = settings.summary || {
    enabled: true,
    defaultTemplate: 'gtd-work-review',
    defaultType: 'weekly',
    dateFormat: 'yyyy-MM-dd EEE',
    pageNameTemplate: '{{type}}-总结-{{date}}',
    ai: {
      enabled: false,
      provider: 'openai',
      apiKey: '',
      apiUrl: '',
      model: 'gpt-3.5-turbo',
      promptTemplate: ''
    }
  }

  const templates = getAllTemplates()

  const handleSettingChange = (key: keyof SummarySettingsType, value: any) => {
    setSettings(prev => {
      if (!prev) return prev
      return {
        ...prev,
        summary: {
          ...summarySettings,
          [key]: value,
        },
      }
    })
  }

  const handleAiSettingChange = (key: keyof SummarySettingsType['ai'], value: any) => {
    handleSettingChange('ai', {
      ...summarySettings.ai,
      [key]: value,
    })
  }

  const templateOptions = templates.map(template => ({
    value: template.id,
    label: t(`settings.summary.template${template.id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')}`, language) || template.name
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
          onChange={(value) => handleSettingChange('defaultType', value)}
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
        <label>{t('settings.summary.pageNameTemplate', language)}</label>
        <input
          type="text"
          value={summarySettings.pageNameTemplate}
          onChange={(e) => handleSettingChange('pageNameTemplate', e.target.value)}
          placeholder="{{type}}-总结-{{date}}"
        />
      </div>

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
              placeholder="请根据以下内容生成一个总结..."
              style={{ width: '100%', minHeight: '80px' }}
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
          {isSaving ? t('settings.saving', language) : t('settings.saveSummarySettings', language)}
        </button>
      </div>
    </div>
  )
}

export default SummarySettings
