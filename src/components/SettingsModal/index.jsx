import React, { useState, useEffect, useCallback } from 'react'
import Modal from '../Modal/index.jsx'
import useSettings from '../../hooks/useSettings.js'
import i18n from '../../utils/i18n.js'
import { ChevronDown, ChevronUp, Monitor, Globe, Layout, Palette, CheckCircle2 } from 'lucide-react'
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
  const [collapsedSections, setCollapsedSections] = useState({})

  const currentLanguage = settings?.language || 'zh-CN'
  
  const t = useCallback((key) => {
    return i18n.t(key, currentLanguage)
  }, [currentLanguage])

  useEffect(() => {
    if (isOpen) {
      loadSettings().then(data => {
        if (data) {
          setSettings(data)
        }
      })
    }
  }, [isOpen, loadSettings])

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

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
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
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')} width="560px">
      <div className="settings-container" data-theme={theme}>
        {/* General Settings Section */}
        <div className="settings-section">
          <button 
            className="settings-section-header" 
            onClick={() => toggleSection('general')}
            type="button"
          >
            <div className="settings-section-header-left">
              <Palette className="settings-section-icon" size={18} />
              <h3>{t('settings.generalSettings')}</h3>
            </div>
            {collapsedSections.general ? 
              <ChevronDown className="settings-collapse-icon" size={16} /> : 
              <ChevronUp className="settings-collapse-icon" size={16} />
            }
          </button>
          
          {!collapsedSections.general && (
            <div className="settings-section-content">
              <div className="setting-item">
                <div className="setting-item-label-wrapper">
                  <Monitor className="setting-item-icon" size={16} />
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
                  <Globe className="setting-item-icon" size={16} />
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
        </div>

        {/* Toolbar Settings Section */}
        <div className="settings-section">
          <button 
            className="settings-section-header" 
            onClick={() => toggleSection('toolbar')}
            type="button"
          >
            <div className="settings-section-header-left">
              <Layout className="settings-section-icon" size={18} />
              <h3>{t('settings.toolbarSettings')}</h3>
            </div>
            {collapsedSections.toolbar ? 
              <ChevronDown className="settings-collapse-icon" size={16} /> : 
              <ChevronUp className="settings-collapse-icon" size={16} />
            }
          </button>
          
          {!collapsedSections.toolbar && (
            <div className="settings-section-content">
              <div className="setting-item">
                <div className="setting-item-label">{t('settings.enabled')}</div>
                <div className="setting-item-value">
                  <div className="setting-switch-wrapper">
                    <input 
                      type="checkbox" 
                      id="toolbar-enabled"
                      checked={settings.toolbar.enabled} 
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
                      checked={settings.toolbar.showBorder} 
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
                  <input 
                    type="text" 
                    value={settings.toolbar.width} 
                    onChange={(e) => handleSettingChange('toolbar.width', e.target.value)}
                    placeholder="e.g., 110px"
                    className="setting-input"
                  />
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-item-label">{t('settings.height')}</div>
                <div className="setting-item-value">
                  <input 
                    type="text" 
                    value={settings.toolbar.height} 
                    onChange={(e) => handleSettingChange('toolbar.height', e.target.value)}
                    placeholder="e.g., 24px"
                    className="setting-input"
                  />
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-item-label">{t('settings.hoverDelay')}</div>
                <div className="setting-item-value">
                  <input 
                    type="number" 
                    value={settings.toolbar.hoverDelay} 
                    onChange={(e) => handleSettingChange('toolbar.hoverDelay', parseInt(e.target.value) || 0)}
                    min="0"
                    className="setting-input"
                  />
                </div>
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
              disabled={isSaving}
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
