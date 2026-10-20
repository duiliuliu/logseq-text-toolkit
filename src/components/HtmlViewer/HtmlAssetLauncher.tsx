import React from 'react'

interface Props {
  path: string
  filename: string
  onOpen: () => void
}

export const HtmlAssetLauncher: React.FC<Props> = ({ path, filename, onOpen }) => (
  <button type="button" className="ltt-html-asset-launcher" onClick={onOpen} title={path}>
    <span className="ltt-html-asset-launcher-icon">HTML</span>
    <span className="ltt-html-asset-launcher-name">{filename}</span>
    <span className="ltt-html-asset-launcher-action">Open</span>
  </button>
)
