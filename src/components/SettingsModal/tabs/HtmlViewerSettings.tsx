import { useEffect } from 'react'
import { t } from '../../../translations/i18n.ts'
import CustomSelect from '../../CustomSelect/index.tsx'
import { HtmlViewerSettings as HtmlViewerSettingsType } from '../../../settings/types'
import { TabComponentProps } from '../index'

const DEFAULT_SETTINGS: HtmlViewerSettingsType = {
  enabled: true,
  defaultSide: 'right',
  defaultWidth: 56,
  allowScripts: false,
  allowRemote: false,
  writeAnnotationsToGraph: true,
  annotationPagePrefix: 'HTML 标注 - ',
  defaultSlashCommandTemplate: ':html-viewer',
}

function HtmlViewerSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const current: HtmlViewerSettingsType = {
    ...DEFAULT_SETTINGS,
    ...(settings?.htmlViewer || {}),
  }

  const update = (patch: Partial<HtmlViewerSettingsType>) => {
    setSettings(prev => {
      if (!prev) return prev
      return {
        ...prev,
        htmlViewer: {
          ...DEFAULT_SETTINGS,
          ...(prev.htmlViewer || {}),
          ...patch,
        },
      }
    })
  }

  useEffect(() => {
    if (!settings.htmlViewer) {
      update({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sideOptions = [
    { value: 'right', label: t('settings.htmlViewer.sideRight' as any, language) },
    { value: 'left', label: t('settings.htmlViewer.sideLeft' as any, language) },
  ]

  return (
    <div className="ltt-settings-tab-content">
      <p className="ltt-tab-section-description-small">
        {t('settings.htmlViewer.description' as any, language)}
      </p>

      <div className="ltt-setting-item">
        <label>{t('settings.htmlViewer.defaultSide' as any, language)}</label>
        <CustomSelect
          options={sideOptions}
          value={current.defaultSide}
          onChange={(value) => update({ defaultSide: value as 'left' | 'right' })}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.htmlViewer.defaultWidth' as any, language)}</label>
        <input
          type="number"
          min={30}
          max={90}
          step={1}
          value={current.defaultWidth}
          onChange={(e) => update({ defaultWidth: Math.min(90, Math.max(30, Number(e.target.value) || 56)) })}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.htmlViewer.writeAnnotationsToGraph' as any, language)}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={current.writeAnnotationsToGraph}
            onChange={(e) => update({ writeAnnotationsToGraph: e.target.checked })}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.htmlViewer.annotationPagePrefix' as any, language)}</label>
        <input
          type="text"
          value={current.annotationPagePrefix}
          onChange={(e) => update({ annotationPagePrefix: e.target.value })}
          placeholder="HTML 标注 - "
        />
      </div>

      <p className="ltt-tab-section-description-small">
        {t('settings.htmlViewer.annotationHint' as any, language)}
      </p>

      <div className="ltt-setting-item">
        <label>{t('settings.htmlViewer.allowScripts' as any, language)}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={current.allowScripts}
            onChange={(e) => update({ allowScripts: e.target.checked })}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <p className="ltt-tab-section-description-small danger">
        {t('settings.htmlViewer.allowScriptsHint' as any, language)}
      </p>

      <div className="ltt-setting-item">
        <label>{t('settings.htmlViewer.allowRemote' as any, language)}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={current.allowRemote}
            onChange={(e) => update({ allowRemote: e.target.checked })}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <p className="ltt-tab-section-description-small">
        {t('settings.htmlViewer.allowRemoteHint' as any, language)}
      </p>

      <div className="ltt-settings-actions">
        <button
          className="ltt-settings-btn ltt-settings-btn-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? t('settings.saving' as any, language) : t('settings.saveHtmlViewerSettings' as any, language)}
        </button>
      </div>
    </div>
  )
}

export default HtmlViewerSettings
