import React, { useState, useEffect } from 'react'
import Modal from '../Modal'
import { SummaryType, TemplateType } from '../../lib/summary/types'
import { getAllTemplates } from '../../lib/summary/templates'
import { generateSummary } from '../../lib/summary/register'
import { t } from '../../translations/i18n'
import { useSettingsContext } from '../../settings/useSettings'
import './summary.css'

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

const summaryTypes: { value: SummaryType; label: string }[] = [
  { value: 'weekly', label: '周度总结' },
  { value: 'monthly', label: '月度总结' },
  { value: 'yearly', label: '年度总结' },
  { value: 'custom', label: '自定义时间范围' },
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
  }, [isOpen, settings]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    
    if (summaryType === 'custom') {
      startDate = customStart ? new Date(customStart) : undefined;
      endDate = customEnd ? new Date(customEnd) : undefined;
    }

    await generateSummary(templateType, summaryType, startDate, endDate);
    
    setIsGenerating(false);
    onClose();
  };

  const handleClose = () => {
    setSummaryType('weekly');
    setTemplateType('gtd-work-review');
    setCustomStart('');
    setCustomEnd('');
    onClose();
  };

  return (
    <Modal
      title="📊 生成总结"
      isOpen={isOpen}
      onClose={handleClose}
      width="520px"
      theme={theme}
    >
      <div className="summary-modal-container" data-theme={theme}>
        <div className="ltt-settings-tab-content">
          <p className="ltt-tab-section-description-small">选择总结类型和模版</p>
          
          <div className="ltt-setting-item">
            <label>总结类型</label>
            <div className="radio-group">
              {summaryTypes.map((item) => (
                <label
                  key={item.value}
                  className={`radio-label ${summaryType === item.value ? 'active' : ''}`}
                >
                  <input
                    type="radio"
                    name="summaryType"
                    value={item.value}
                    checked={summaryType === item.value}
                    onChange={(e) => setSummaryType(e.target.value as SummaryType)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {summaryType === 'custom' && (
            <div className="custom-date-section">
              <div className="form-row">
                <div className="ltt-setting-item">
                  <label>开始日期</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                  />
                </div>
                <div className="ltt-setting-item">
                  <label>结束日期</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="ltt-setting-item">
            <label>选择模版</label>
            <select
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value as TemplateType)}
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} - {template.description}
                </option>
              ))}
            </select>
          </div>

          <div className="ltt-settings-actions">
            <button
              type="button"
              className="ltt-settings-btn"
              onClick={handleClose}
              style={{ backgroundColor: 'var(--ls-secondary-background-color, #f5f5f5)', color: 'var(--ls-primary-text-color, #333)' }}
            >
              取消
            </button>
            <button
              type="button"
              className="ltt-settings-btn ltt-settings-btn-save"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? '生成中...' : '生成总结'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
