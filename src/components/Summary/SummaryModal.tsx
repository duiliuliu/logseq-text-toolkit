import React, { useEffect, useMemo, useState } from 'react'
import Modal from '../Modal'
import { SummaryType, TemplateType } from '../../lib/summary/types'
import { getAllTemplates } from '../../lib/summary/templates'
import { generateSummary } from '../../lib/summary/register'
import { formatLocalDate, parseLocalDate } from '../../lib/summary/dateUtils'
import { t } from '../../translations/i18n'
import { useSettingsContext } from '../../settings/useSettings'
import CustomSelect from '../CustomSelect/index'
import './summary.css'

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

const summaryTypes: { value: SummaryType; labelKey: string }[] = [
  { value: 'weekly', labelKey: 'settings.summary.typeWeekly' },
  { value: 'monthly', labelKey: 'settings.summary.typeMonthly' },
  { value: 'yearly', labelKey: 'settings.summary.typeYearly' },
  { value: 'custom', labelKey: 'settings.summary.typeCustom' },
]

const DEFAULT_SUMMARY_SETTINGS = {
  defaultTemplate: 'gtd-work-review' as TemplateType,
  defaultType: 'weekly' as SummaryType,
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ isOpen, onClose, theme = 'light' }) => {
  const { settings } = useSettingsContext()
  const summarySettings = {
    ...DEFAULT_SUMMARY_SETTINGS,
    ...(settings?.summary || {}),
  }
  const language = (settings?.language || 'zh-CN') as any

  const [summaryType, setSummaryType] = useState<SummaryType>(summarySettings.defaultType)
  const [templateType, setTemplateType] = useState<TemplateType>(summarySettings.defaultTemplate)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const templates = useMemo(() => getAllTemplates(), [])
  const availableTemplates = useMemo(
    () => templates.filter(template => template.supportedTypes.includes(summaryType)),
    [templates, summaryType]
  )

  const today = formatLocalDate(new Date())
  const customDateInvalid = summaryType === 'custom'
    && (!customStart || !customEnd || customStart > customEnd)

  useEffect(() => {
    if (!isOpen) return

    const nextType = summaryTypes.some(item => item.value === summarySettings.defaultType)
      ? summarySettings.defaultType
      : 'weekly'
    const compatible = templates.filter(template => template.supportedTypes.includes(nextType))
    const nextTemplate = compatible.some(template => template.id === summarySettings.defaultTemplate)
      ? summarySettings.defaultTemplate
      : (compatible[0]?.id || 'minimal-dashboard')

    setSummaryType(nextType)
    setTemplateType(nextTemplate)
    setError('')
    if (nextType === 'custom') {
      setCustomStart(prev => prev || today)
      setCustomEnd(prev => prev || today)
    }
  }, [isOpen, summarySettings.defaultType, summarySettings.defaultTemplate, templates, today])

  const handleTypeChange = (nextType: SummaryType) => {
    setSummaryType(nextType)
    setError('')

    const compatible = templates.filter(template => template.supportedTypes.includes(nextType))
    if (!compatible.some(template => template.id === templateType)) {
      setTemplateType(compatible[0]?.id || 'minimal-dashboard')
    }

    if (nextType === 'custom' && (!customStart || !customEnd)) {
      setCustomStart(customStart || today)
      setCustomEnd(customEnd || today)
    }
  }

  const handleGenerate = async () => {
    if (customDateInvalid) {
      setError(t('settings.summary.customDateError', language))
      return
    }

    let startDate: Date | undefined
    let endDate: Date | undefined
    if (summaryType === 'custom') {
      const parsedStart = parseLocalDate(customStart)
      const parsedEnd = parseLocalDate(customEnd)
      if (!parsedStart || !parsedEnd) {
        setError(t('settings.summary.customDateError', language))
        return
      }
      startDate = parsedStart
      endDate = parsedEnd
    }

    setIsGenerating(true)
    setError('')

    try {
      const pageName = await generateSummary(templateType, summaryType, startDate, endDate)
      if (pageName) {
        handleClose()
      } else {
        setError(t('settings.summary.generateFailed', language))
      }
    } catch (generateError) {
      setError(t('settings.summary.generateFailed', language))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    setCustomStart('')
    setCustomEnd('')
    setError('')
    setIsGenerating(false)
    onClose()
  }

  const typeOptions = summaryTypes.map(item => ({
    value: item.value,
    label: t(item.labelKey as any, language),
  }))

  const templateOptions = availableTemplates.map(template => {
    const key = `settings.summary.template${template.id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')}`
    return {
      value: template.id,
      label: t(key as any, language) || template.name,
    }
  })

  return (
    <Modal
      title="📊 生成总结"
      isOpen={isOpen}
      onClose={handleClose}
      width="420px"
      theme={theme}
    >
      <div className="summary-modal-container" data-theme={theme}>
        <div className="summary-content">
          <div className="summary-section">
            <label className="summary-label">{t('settings.summary.defaultType', language)}</label>
            <CustomSelect
              options={typeOptions}
              value={summaryType}
              onChange={(value) => handleTypeChange(value as SummaryType)}
            />
          </div>

          {summaryType === 'custom' && (
            <div className="summary-section custom-dates">
              <div className="summary-date-field">
                <label className="summary-label summary-label-small">{t('settings.summary.startDate', language)}</label>
                <input
                  type="date"
                  className="summary-input"
                  value={customStart}
                  max={customEnd || undefined}
                  onChange={(e) => {
                    setCustomStart(e.target.value)
                    setError('')
                  }}
                />
              </div>
              <div className="summary-date-field">
                <label className="summary-label summary-label-small">{t('settings.summary.endDate', language)}</label>
                <input
                  type="date"
                  className="summary-input"
                  value={customEnd}
                  min={customStart || undefined}
                  onChange={(e) => {
                    setCustomEnd(e.target.value)
                    setError('')
                  }}
                />
              </div>
            </div>
          )}

          <div className="summary-section">
            <label className="summary-label">{t('settings.summary.defaultTemplate', language)}</label>
            <CustomSelect
              options={templateOptions}
              value={templateType}
              onChange={(value) => { setTemplateType(value as TemplateType); setError('') }}
            />
            {availableTemplates.length === 0 && (
              <p className="summary-error">{t('settings.summary.noTemplates', language)}</p>
            )}
          </div>

          {(error || customDateInvalid) && (
            <p className="summary-error" role="alert">
              {error || t('settings.summary.customDateError', language)}
            </p>
          )}

          <div className="summary-actions">
            <button
              type="button"
              className="summary-btn summary-btn-cancel"
              onClick={handleClose}
            >
              {t('settings.cancel', language)}
            </button>
            <button
              type="button"
              className="summary-btn summary-btn-primary"
              onClick={handleGenerate}
              disabled={isGenerating || customDateInvalid || availableTemplates.length === 0}
            >
              {isGenerating
                ? t('settings.summary.generating', language)
                : t('settings.summary.generate', language)}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
