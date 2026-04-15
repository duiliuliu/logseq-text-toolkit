import React from 'react'

function ToolbarElements({ jsonToolbarItems, setJsonToolbarItems, resetJsonToolbarItems, applyJsonToolbarItems, t }) {
  return (
    <div className="settings-section-content">
      <div className="setting-item">
        <div className="setting-item-label">{t('settings.jsonSettings')}</div>
        <div className="setting-item-value">
          <div className="settings-btn-group">
            <button 
              className="settings-btn settings-btn-secondary" 
              onClick={resetJsonToolbarItems}
              type="button"
            >
              {t('settings.resetToDefault')}
            </button>
            <button 
              className="settings-btn settings-btn-save" 
              onClick={applyJsonToolbarItems}
              type="button"
            >
              {t('settings.applyJson')}
            </button>
          </div>
        </div>
      </div>
      <div className="json-editor-container">
        <textarea 
          className="json-editor"
          value={jsonToolbarItems}
          onChange={(e) => setJsonToolbarItems(e.target.value)}
          placeholder="Enter toolbar items JSON here"
        />
      </div>
      <div className="settings-links">
        <div className="settings-link-item">
          <span className="settings-link-label">参考链接:</span>
          <a 
            href="https://8080-ifutmp0kexsh2rvrrtewo-60beb929.sg1.manus.computer/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="settings-link"
          >
            预览链接
          </a>
        </div>
        <div className="settings-link-item">
          <span className="settings-link-label">设计参考:</span>
          <a 
            href="https://www.figma.com/make/Wya3LTmfKZJ2YvQazdlahH/%E5%A4%9A%E6%A0%87%E7%AD%BE%E8%AE%BE%E7%BD%AE%E9%A1%B5%E9%9D%A2?t=iFW1vYkcjkti0Ieb-20&fullscreen=1" 
            target="_blank" 
            rel="noopener noreferrer"
            className="settings-link"
          >
            Figma设计
          </a>
        </div>
      </div>
    </div>
  )
}

export default ToolbarElements
