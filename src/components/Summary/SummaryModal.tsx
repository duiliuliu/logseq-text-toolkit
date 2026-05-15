import React, { useState, useEffect } from 'react'
import Modal from '../Modal'
import { SummaryType, TemplateType } from '../../lib/summary/types'
import { getAllTemplates } from '../../lib/summary/templates'
import { generateSummary } from '../../lib/summary/register'
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

export const SummaryModal: React.FC<SummaryModalProps> = ({ isOpen, onClose, theme = 'light' }) => {
  const { settings } = useSettingsContext()
  const [summaryType, setSummaryType] = useState<SummaryType>('weekly')
  const [templateType, setTemplateType] = useState<TemplateType>('gtd-work-review')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const templates = getAllTemplates()

  useEffect(() => {
    if (isOpen && settings?.summary) {
      setSummaryType(settings.summary.defaultType || 'weekly')
      setTemplateType(settings.summary.defaultTemplate || 'gtd-work-review')
    }
  }, [isOpen, settings])

  const handleGenerate = async () => {
    setIsGenerating(true)
    
    let startDate: Date | undefined
    let endDate: Date | undefined
    
    if (summaryType === 'custom') {
      startDate = customStart ? new Date(customStart) : undefined
      endDate = customEnd ? new Date(customEnd) : undefined
    }

    await generateSummary(templateType, summaryType, startDate, endDate)
    
    setIsGenerating(false)
    onClose()
  }

  const handleClose = () => {
    setSummaryType('weekly')
    setTemplateType('gtd-work-review')
    setCustomStart('')
    setCustomEnd('')
    onClose()
  }

  const typeOptions = summaryTypes.map(item => ({
    value: item.value,
    label: t(item.labelKey)
  }))

  const templateOptions = templates.map(template => ({
    value: template.id,
    label: `${template.name}`
  }))

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
            <label className="summary-label">{t('settings.summary.defaultType')}</label>
            <CustomSelect
              options={typeOptions}
              value={summaryType}
              onChange={(value) => setSummaryType(value as SummaryType)}
            />
          </div>

          {summaryType === 'custom' && (
            <div className="summary-section custom-dates">
              <div className="summary-date-field">
                <label className="summary-label summary-label-small">{t('settings.summary.startDate')}</label>
                <input
                  type="date"
                  className="summary-input"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
              </div>
              <div className="summary-date-field">
                <label className="summary-label summary-label-small">{t('settings.summary.endDate')}</label>
                <input
                  type="date"
                  className="summary-input"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="summary-section">
            <label className="summary-label">{t('settings.summary.defaultTemplate')}</label>
            <CustomSelect
              options={templateOptions}
              value={templateType}
              onChange={(value) => setTemplateType(value as TemplateType)}
            />
          </div>

          <div className="summary-actions">
            <button
              type="button"
              className="summary-btn summary-btn-cancel"
              onClick={handleClose}
            >
              {t('settings.cancel')}
            </button>
            <button
              type="button"
              className="summary-btn summary-btn-primary"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? t('settings.saving') : '生成总结'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
