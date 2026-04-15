import React, { useState, useEffect, useCallback } from 'react'
import Modal from '../Modal/index.jsx'
import useSettings from '../../hooks/useSettings.js'
import i18n from '../../utils/i18n.js'
import defaultSettings from '../../utils/settings.js'
import { Palette, Layout, Code2 } from 'lucide-react'
import GeneralSettings from './components/GeneralSettings.jsx'
import ToolbarSettings from './components/ToolbarSettings.jsx'
import ToolbarElements from './components/ToolbarElements.jsx'
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
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')} width="640px">
      <div className="settings-container" data-theme={theme || ''}>
        {/* Tabs Navigation */}
        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
            type="button"
          >
            <Palette size={18} />
            <span>{t('settings.generalSettings')}</span>
          </button>
          <button
            className={`settings-tab ${activeTab === 'toolbar' ? 'active' : ''}`}
            onClick={() => setActiveTab('toolbar')}
            type="button"
          >
            <Layout size={18} />
            <span>{t('settings.toolbarSettings')}</span>
          </button>
          <button
            className={`settings-tab ${activeTab === 'elements' ? 'active' : ''}`}
            onClick={() => setActiveTab('elements')}
            type="button"
          >
            <Code2 size={18} />
            <span>{t('settings.toolbarElements')}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="settings-tab-content">
          {/* General Settings */}
          {activeTab === 'general' && (
            <GeneralSettings settings={settings} t={t} />
          )}

          {/* Toolbar Settings */}
          {activeTab === 'toolbar' && (
            <ToolbarSettings 
              settings={settings} 
              handleSettingChange={handleSettingChange} 
              t={t} 
            />
          )}

          {/* Toolbar Elements */}
          {activeTab === 'elements' && (
            <ToolbarElements 
              jsonToolbarItems={jsonToolbarItems}
              setJsonToolbarItems={setJsonToolbarItems}
              resetJsonToolbarItems={resetJsonToolbarItems}
              applyJsonToolbarItems={applyJsonToolbarItems}
              t={t}
            />
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
