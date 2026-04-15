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
  const [editMode, setEditMode] = useState('json') // Only 'json' mode supported
  const [jsonSettings, setJsonSettings] = useState('')

  const currentLanguage = settings?.language || 'zh-CN'
  
  const t = useCallback((key) => {
    return i18n.t(key, currentLanguage)
  }, [currentLanguage])

  useEffect(() => {
    if (isOpen) {
      loadSettings().then(data => {
        if (data) {
          setSettings(data)
          setJsonSettings(JSON.stringify(data, null, 2))
        }
      })
    }
  }, [isOpen, loadSettings])

  useEffect(() => {
    if (settings) {
      setJsonSettings(JSON.stringify(settings, null, 2))
    }
  }, [settings])

  const handleJsonChange = (value) => {
    setJsonSettings(value)
  }

  const validateToolbarSchema = (toolbar) => {
    if (!toolbar || typeof toolbar !== 'object') {
      return 'Toolbar must be an object'
    }
    
    if (typeof toolbar.enabled !== 'boolean') {
      return 'Toolbar enabled must be a boolean'
    }
    
    if (toolbar.items && typeof toolbar.items !== 'object') {
      return 'Toolbar items must be an object'
    }
    
    if (toolbar.items) {
      for (const [key, item] of Object.entries(toolbar.items)) {
        if (typeof item === 'object' && item !== null) {
          // Check if this is a group (contains nested items)
          const isGroup = !item.label && !item.icon && !item.funcmode
          if (isGroup) {
            // Validate group items
            for (const [groupKey, groupItem] of Object.entries(item)) {
              if (typeof groupItem !== 'object' || groupItem === null) {
                return `Group item ${groupKey} must be an object`
              }
              if (!groupItem.label || typeof groupItem.label !== 'string') {
                return `Group item ${groupKey} must have a label`
              }
            }
          } else {
            // Validate regular item
            if (!item.label || typeof item.label !== 'string') {
              return `Item ${key} must have a label`
            }
          }
        }
      }
    }
    
    return null // No errors
  }

  const applyJsonSettings = () => {
    try {
      const parsedSettings = JSON.parse(jsonSettings)
      
      // Validate toolbar schema
      const validationError = validateToolbarSchema(parsedSettings.toolbar)
      if (validationError) {
        alert(`Schema validation error: ${validationError}`)
        return
      }
      
      setSettings(parsedSettings)
      alert('Settings applied successfully!')
    } catch (error) {
      alert('Invalid JSON format')
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
          
          {!collapsedSections.general && settings && (
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

        {/* Toolbar Elements Management Section */}
        <div className="settings-section">
          <button 
            className="settings-section-header" 
            onClick={() => toggleSection('toolbarItems')}
            type="button"
          >
            <div className="settings-section-header-left">
              <Layout className="settings-section-icon" size={18} />
              <h3>{t('settings.toolbarElements')}</h3>
            </div>
            {collapsedSections.toolbarItems ? 
              <ChevronDown className="settings-collapse-icon" size={16} /> : 
              <ChevronUp className="settings-collapse-icon" size={16} />
            }
          </button>
          
          {!collapsedSections.toolbarItems && settings && (
            <div className="settings-section-content">
              <div className="setting-item">
                <div className="setting-item-label">{t('settings.jsonSettings')}</div>
                <div className="setting-item-value">
                  <button 
                    className="settings-btn settings-btn-save" 
                    onClick={applyJsonSettings}
                    type="button"
                  >
                    {t('settings.applyJson')}
                  </button>
                </div>
              </div>
              <div className="json-editor-container">
                <textarea 
                  className="json-editor"
                  value={jsonSettings}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  placeholder="Enter JSON settings here"
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
