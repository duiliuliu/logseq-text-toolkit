import { useEffect, useState } from 'react'
import { t } from '../../../translations/i18n.ts'
import CustomSelect from '../../CustomSelect/index.tsx'
import { HtmlViewerSettings as HtmlViewerSettingsType } from '../../../settings/types'
import { TabComponentProps } from '../index'
import { logseqAPI } from '../../../logseq'

const DEFAULT_SETTINGS: HtmlViewerSettingsType = {
  enabled: true,
  defaultSide: 'right',
  defaultWidth: 56,
  allowScripts: false,
  allowRemote: false,
  writeAnnotationsToGraph: true,
  annotationPagePrefix: 'HTML 标注 - ',
  showToolbarButton: true,
  dashboardAsset: '',
  dashboardFullscreen: true,
  defaultSlashCommandTemplate: ':html-viewer',
}

function HtmlViewerSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const [dashboardAssets, setDashboardAssets] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const files = await logseqAPI.Assets?.listFilesOfCurrentGraph?.(['html', 'htm'])
        if (!cancelled && Array.isArray(files)) {
          setDashboardAssets(files.map((file: any) => String(file.path || '')).filter(Boolean))
        }
      } catch {
        // Manual asset path below remains available.
      }
    })()
    return () => { cancelled = true }
  }, [])

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
    <div className="ltt-settings-tab-content ltt-html-viewer-settings">
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
        <label>{t('settings.htmlViewer.showToolbarButton' as any, language)}</label>
        <label className="ltt-switch">
          <input
            type="checkbox"
            checked={current.showToolbarButton}
            onChange={(e) => update({ showToolbarButton: e.target.checked })}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-settings-section">
        <h4>{t('settings.htmlViewer.dashboardSection' as any, language)}</h4>
        <div className="ltt-setting-item">
          <label>{t('settings.htmlViewer.dashboardAsset' as any, language)}</label>
          <CustomSelect
            options={[
              { value: '', label: t('settings.htmlViewer.dashboardNone' as any, language) },
              ...dashboardAssets.map((path) => ({ value: path, label: path })),
              ...(current.dashboardAsset && !dashboardAssets.includes(current.dashboardAsset)
                ? [{ value: current.dashboardAsset, label: current.dashboardAsset }]
                : []),
            ]}
            value={current.dashboardAsset}
            onChange={(value) => update({ dashboardAsset: value })}
          />
        </div>
        <div className="ltt-setting-item">
          <label>{t('settings.htmlViewer.dashboardFullscreen' as any, language)}</label>
          <label className="ltt-switch">
            <input
              type="checkbox"
              checked={current.dashboardFullscreen}
              onChange={(e) => update({ dashboardFullscreen: e.target.checked })}
            />
            <span className="ltt-switch-slider"></span>
          </label>
        </div>
        <p className="ltt-tab-section-description-small">
          {t('settings.htmlViewer.dashboardHint' as any, language)}
        </p>
        {dashboardAssets.length === 0 && (
          <div className="ltt-setting-item">
            <input
              type="text"
              value={current.dashboardAsset}
              onChange={(e) => update({ dashboardAsset: e.target.value })}
              placeholder={t('settings.htmlViewer.dashboardAssetPlaceholder' as any, language)}
            />
          </div>
        )}
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
