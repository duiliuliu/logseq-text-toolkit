import React, { useState, useEffect } from 'react'
import Modal from '../Modal/index.jsx'
import useSettings from '../../hooks/useSettings.js'
import GeneralSettings from './tabs/GeneralSettings.jsx'
import ToolbarSettings from './tabs/ToolbarSettings.jsx'
import AdvancedSettings from './tabs/AdvancedSettings.jsx'
import { t } from '../../translations/i18n.js'
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
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    if (isOpen) {
      loadSettings().then(data => {
        if (data) {
          setSettings(data)
        }
      })
    }
  }, [isOpen, loadSettings])

  const handleSave = async (tab) => {
    if (!settings) return

    const success = await saveSettings(settings)
    if (success) {
      console.log(`${tab} settings saved successfully`)
    }
  }

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')}>
        <div className="settings-loading">{t('settings.loading')}</div>
      </Modal>
    )
  }

  if (!settings) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')}>
        <div className="settings-error">{t('settings.error')}</div>
      </Modal>
    )
  }

  const language = settings.language || 'zh-CN'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title', language)}>
      <div className="settings-container" data-theme={theme}>
        <div className="settings-header">
          <div className="settings-tabs">
            <button 
              className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              {t('settings.tabs.general', language)}
            </button>
            <button 
              className={`settings-tab ${activeTab === 'toolbar' ? 'active' : ''}`}
              onClick={() => setActiveTab('toolbar')}
            >
              {t('settings.tabs.toolbar', language)}
            </button>
            <button 
              className={`settings-tab ${activeTab === 'advanced' ? 'active' : ''}`}
              onClick={() => setActiveTab('advanced')}
            >
              {t('settings.tabs.advanced', language)}
            </button>
          </div>
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <GeneralSettings 
              settings={settings}
              setSettings={setSettings}
              onSave={() => handleSave('general')}
              isSaving={isSaving}
              language={language}
            />
          )}
          
          {activeTab === 'toolbar' && (
            <ToolbarSettings 
              settings={settings}
              setSettings={setSettings}
              onSave={() => handleSave('toolbar')}
              isSaving={isSaving}
              language={language}
            />
          )}
          
          {activeTab === 'advanced' && (
            <AdvancedSettings 
              settings={settings}
              setSettings={setSettings}
              onSave={() => handleSave('advanced')}
              isSaving={isSaving}
              language={language}
            />
          )}
        </div>
      </div>
    </Modal>
  )
}

export default SettingsModal
