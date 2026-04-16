import React, { useState, useEffect } from 'react'
import Modal from '../Modal/index.jsx'
import { useSettingsContext } from '../../hooks/useSettings.jsx'
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
  } = useSettingsContext()
  
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

  // 当loadedSettings变化时，更新本地settings状态
  useEffect(() => {
    if (loadedSettings) {
      setSettings(loadedSettings)
    }
  }, [loadedSettings])

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

  const tabs = [
    { id: 'general', component: GeneralSettings, label: t('settings.tabs.general', language) },
    { id: 'toolbar', component: ToolbarSettings, label: t('settings.tabs.toolbar', language) },
    { id: 'advanced', component: AdvancedSettings, label: t('settings.tabs.advanced', language) }
  ]

  const TabComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title', language)}>
      <div className="settings-container" data-theme={theme}>
        <div className="settings-header">
          <div className="settings-tabs">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-content">
          {TabComponent && (
            <div id={`${activeTab}-settings`}>
              <TabComponent 
                settings={settings}
                setSettings={setSettings}
                onSave={() => handleSave(activeTab)}
                isSaving={isSaving}
                language={language}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default SettingsModal
