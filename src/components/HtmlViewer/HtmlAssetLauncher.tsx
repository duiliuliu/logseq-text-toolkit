import React from 'react'
import { getSettings } from '../../settings'
import { t } from '../../translations/i18n'

interface Props {
  path: string
  filename: string
  onOpen: () => void
}

export const HtmlAssetLauncher: React.FC<Props> = ({ path, filename, onOpen }) => {
  const language = getSettings().language || 'zh-CN'
  return (
    <button type="button" className="ltt-html-asset-launcher" onClick={onOpen} title={path}>
      <span className="ltt-html-asset-launcher-icon">HTML</span>
      <span className="ltt-html-asset-launcher-name">{filename}</span>
      <span className="ltt-html-asset-launcher-action">{t('settings.htmlViewer.open' as any, language)}</span>
    </button>
  )
}
