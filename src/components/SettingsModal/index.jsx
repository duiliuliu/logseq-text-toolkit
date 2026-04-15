import React, { useState, useEffect, useCallback } from 'react'
import Modal from '../Modal/index.jsx'
import useSettings from '../../hooks/useSettings.js'
import i18n from '../../utils/i18n.js'
import defaultSettings from '../../utils/settings.js'
import { Settings, Layout, Code2, Cog } from 'lucide-react'
import GeneralSettings from './components/GeneralSettings.jsx'
import ToolbarSettings from './components/ToolbarSettings.jsx'
import AdvancedSettings from './components/AdvancedSettings.jsx'
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
  const [activeTab, setActiveTab] = useState('general') // 'general', 'toolbar', 'advanced'

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

  const handleSaveGeneral = async () => {
    if (!settings) return

    const success = await saveSettings(settings)
    if (success) {
      alert(t('settings.saveSuccess'))
    }
  }

  const handleSaveToolbar = async () => {
    if (!settings) return

    const success = await saveSettings(settings)
    if (success) {
      alert(t('settings.saveSuccess'))
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
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')} width="700px">
      <div className="settings-container" data-theme={theme || ''}>
        <div className="settings-header">
          <h2 className="settings-title">{t('settings.title')}</h2>
          <p className="settings-subtitle">{t('settings.subtitle')}</p>
        </div>
        
        {/* Tabs Navigation */}
        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
            type="button"
          >
            <Settings size={16} />
            <span>{t('settings.generalSettings')}</span>
          </button>
          <button
            className={`settings-tab ${activeTab === 'toolbar' ? 'active' : ''}`}
            onClick={() => setActiveTab('toolbar')}
            type="button"
          >
            <Layout size={16} />
            <span>{t('settings.toolbarSettings')}</span>
          </button>
          <button
            className={`settings-tab ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced')}
            type="button"
          >
            <Cog size={16} />
            <span>{t('settings.advancedSettings')}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="settings-tab-content">
          {/* General Settings */}
          {activeTab === 'general' && (
            <GeneralSettings 
              settings={settings} 
              handleSettingChange={handleSettingChange} 
              handleSaveGeneral={handleSaveGeneral}
              t={t}
              isSaving={isSaving}
            />
          )}

          {/* Toolbar Settings */}
          {activeTab === 'toolbar' && (
            <ToolbarSettings 
              settings={settings} 
              handleSettingChange={handleSettingChange} 
              handleSaveToolbar={handleSaveToolbar}
              t={t}
              isSaving={isSaving}
            />
          )}

          {/* Advanced Settings */}
          {activeTab === 'advanced' && (
            <AdvancedSettings t={t} />
          )}
        </div>
      </div>
    </Modal>
  )
}

export default SettingsModal
