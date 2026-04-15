import React, { useState, useEffect, useCallback } from 'react'
import Modal from '../Modal/index.jsx'
import useSettings from '../../hooks/useSettings.js'
import i18n from '../../utils/i18n.js'
import defaultSettings from '../../utils/settings.js'
import { Palette, Layout, Code2, CheckCircle2 } from 'lucide-react'
import './settingsModal.css'

function SettingsModal({ isOpen, onClose, theme }) {
  const { 
    settings: loadedSettings, 
    isLoading, 
    isSaving, 
    error, 
    loadSettings, 
    saveSettings, 
    resetSettings 
  } = useSettings()
  
  const [settings, setSettings] = useState(null)
  const [activeTab, setActiveTab] = useState('general') // 'general', 'toolbar', 'elements'
  const [jsonToolbarItems, setJsonToolbarItems] = useState('')

  const currentLanguage = settings?.language || 'zh-CN'
  
  const t = useCallback((key) => {
    return i18n.t(key, currentLanguage)
  }, [currentLanguage])

  useEffect(() => {
    if (isOpen) {
      loadSettings().then(data => {
        if (data) {
          setSettings(data)
          setJsonToolbarItems(JSON.stringify(data.toolbar?.items || {}, null, 2))
        }
      })
    }
  }, [isOpen, loadSettings])

  useEffect(() => {
    if (settings) {
      setJsonToolbarItems(JSON.stringify(settings.toolbar?.items || {}, null, 2))
    }
  }, [settings])

  const validateToolbarItemsSchema = (items) => {
    if (!items || typeof items !== 'object') {
      return 'Toolbar items must be an object'
    }
    
    for (const [key, item] of Object.entries(items)) {
      if (typeof item === 'object' && item !== null) {
        const isGroup = !item.label && !item.icon && !item.funcmode
        if (isGroup) {
          for (const [groupKey, groupItem] of Object.entries(item)) {
            if (typeof groupItem !== 'object' || groupItem === null) {
              return `Group item ${groupKey} must be an object`
            }
            if (!groupItem.label || typeof groupItem.label !== 'string') {
              return `Group item ${groupKey} must have a label`
            }
          }
        } else {
          if (!item.label || typeof item.label !== 'string') {
            return `Item ${key} must have a label`
          }
        }
      }
    }
    
    return null
  }

  const applyJsonToolbarItems = () => {
    try {
      const parsedItems = JSON.parse(jsonToolbarItems)
      
      const validationError = validateToolbarItemsSchema(parsedItems)
      if (validationError) {
        alert(`Schema validation error: ${validationError}`)
        return
      }
      
      setSettings(prev => ({
        ...prev,
        toolbar: {
          ...prev.toolbar,
          items: parsedItems
        }
      }))
      alert('Toolbar items applied successfully!')
    } catch (error) {
      alert('Invalid JSON format')
    }
  }

  const resetJsonToolbarItems = () => {
    if (window.confirm(t('settings.confirmResetItems'))) {
      const defaultItems = defaultSettings.toolbar.items
      setJsonToolbarItems(JSON.stringify(defaultItems, null, 2))
      setSettings(prev => ({
        ...prev,
        toolbar: {
          ...prev.toolbar,
          items: defaultItems
        }
      }))
    }
  }

  const handleSave = async () => {
    if (!settings) return

    const success = await saveSettings(settings)
    if (success) {
      onClose()
    }
  }

  const handleReset = async () => {
    if (window.confirm(t('settings.confirmReset'))) {
      const success = await resetSettings()
      if (success) {
        loadSettings().then(data => {
          if (data) {
            setSettings(data)
          }
        })
      }
    }
  }

  const handleSettingChange = (path, value) => {
    setSettings(prev => {
      const newSettings = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let current = newSettings
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newSettings
    })
  }

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={i18n.t('settings.title', 'zh-CN')}>
        <div className="settings-loading">{i18n.t('settings.loading', 'zh-CN')}</div>
      </Modal>
    )
  }

  if (isOpen && !settings) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={i18n.t('settings.title', 'zh-CN')}>
        <div className="settings-error">{i18n.t('settings.error', 'zh-CN')}</div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')} width="600px">
      <div className="settings-container" data-theme={theme}>
        {/* Tabs Navigation */}
        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
            type="button"
          >
            <Palette size={16} />
            {t('settings.generalSettings')}
          </button>
          <button
            className={`settings-tab ${activeTab === 'toolbar' ? 'active' : ''}`}
            onClick={() => setActiveTab('toolbar')}
            type="button"
          >
            <Layout size={16} />
            {t('settings.toolbarSettings')}
          </button>
          <button
            className={`settings-tab ${activeTab === 'elements' ? 'active' : ''}`}
            onClick={() => setActiveTab('elements')}
            type="button"
          >
            <Code2 size={16} />
            {t('settings.toolbarElements')}
          </button>
        </div>

        {/* Tab Content */}
        <div className="settings-tab-content">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="settings-section-content">
              <div className="setting-item">
                <div className="setting-item-label-wrapper">
                  <div className="setting-item-label-content">
                    <div className="setting-item-label">{t('settings.theme')}</div>
                    <div className="setting-item-description">
                      <CheckCircle2 size={12} className="setting-item-check-icon" />
                      {t('settings.themeFollowSystem')}
                    </div>
                  </div>
                </div>
                <div className="setting-item-value">
                  <div className="setting-input-readonly">
                    {settings.theme}
                  </div>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-item-label-wrapper">
                  <div className="setting-item-label-content">
                    <div className="setting-item-label">{t('settings.language')}</div>
                    <div className="setting-item-description">
                      <CheckCircle2 size={12} className="setting-item-check-icon" />
                      {t('settings.languageFollowSystem')}
                    </div>
                  </div>
                </div>
                <div className="setting-item-value">
                  <div className="setting-input-readonly">
                    {settings.language}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toolbar Settings */}
          {activeTab === 'toolbar' && (
            <div className="settings-section-content">
              <div className="setting-item">
                <div className="setting-item-label">{t('settings.enabled')}</div>
                <div className="setting-item-value">
                  <div className="setting-switch-wrapper">
                    <input 
                      type="checkbox" 
                      id="toolbar-enabled"
                      checked={settings.toolbar?.enabled || false} 
                      onChange={(e) => handleSettingChange('toolbar.enabled', e.target.checked)}
                      className="setting-switch"
                    />
                    <label htmlFor="toolbar-enabled" className="setting-switch-label"></label>
                  </div>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-item-label">{t('settings.showBorder')}</div>
                <div className="setting-item-value">
                  <div className="setting-switch-wrapper">
                    <input 
                      type="checkbox" 
                      id="toolbar-showBorder"
                      checked={settings.toolbar?.showBorder || false} 
                      onChange={(e) => handleSettingChange('toolbar.showBorder', e.target.checked)}
                      className="setting-switch"
                    />
                    <label htmlFor="toolbar-showBorder" className="setting-switch-label"></label>
                  </div>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-item-label">{t('settings.width')}</div>
                <div className="setting-item-value">
                  <div className="setting-input-with-unit">
                    <input 
                      type="text" 
                      value={settings.toolbar?.width || ''} 
                      onChange={(e) => handleSettingChange('toolbar.width', e.target.value)}
                      placeholder="e.g., 110px"
                      className="setting-input"
                    />
                    <span className="setting-input-unit">px</span>
                  </div>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-item-label">{t('settings.height')}</div>
                <div className="setting-item-value">
                  <div className="setting-input-with-unit">
                    <input 
                      type="text" 
                      value={settings.toolbar?.height || ''} 
                      onChange={(e) => handleSettingChange('toolbar.height', e.target.value)}
                      placeholder="e.g., 24px"
                      className="setting-input"
                    />
                    <span className="setting-input-unit">px</span>
                  </div>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-item-label">{t('settings.hoverDelay')}</div>
                <div className="setting-item-value">
                  <div className="setting-input-with-unit">
                    <input 
                      type="number" 
                      value={settings.toolbar?.hoverDelay || 0} 
                      onChange={(e) => handleSettingChange('toolbar.hoverDelay', parseInt(e.target.value) || 0)}
                      min="0"
                      className="setting-input"
                    />
                    <span className="setting-input-unit">ms</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toolbar Elements */}
          {activeTab === 'elements' && (
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
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="settings-actions">
          <button 
            className="settings-btn settings-btn-reset" 
            onClick={handleReset}
            type="button"
          >
            {t('settings.resetToDefault')}
          </button>
          <div className="settings-btn-group">
            <button 
              className="settings-btn settings-btn-cancel" 
              onClick={onClose}
              type="button"
            >
              {t('settings.cancel')}
            </button>
            <button 
              className="settings-btn settings-btn-save" 
              onClick={handleSave}
              disabled={isSaving || !settings}
              type="button"
            >
              {isSaving ? t('settings.saving') : t('settings.save')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default SettingsModal
