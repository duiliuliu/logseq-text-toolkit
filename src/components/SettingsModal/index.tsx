import React, { useState, useEffect } from 'react'
import Modal from '../Modal/index.tsx'
import { useSettingsContext } from '../../settings/useSettings.tsx'
import GeneralSettings from './tabs/GeneralSettings.tsx'
import ToolbarSettings from './tabs/ToolbarSettings.tsx'
import AdvancedSettings from './tabs/AdvancedSettings.tsx'
import { t } from '../../translations/i18n.ts'
import { ThemeType, Settings } from '../../settings/types.ts'
import { logseqAPI } from '../../logseq/index.ts'
import './settingsModal.css'

// SettingsModal Props 类型
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeType;
}

// 标签页组件 Props 类型
export interface TabComponentProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings | null>>;
  onSave: () => void;
  isSaving: boolean;
  language: string;
}

function SettingsModal({ isOpen, onClose, theme }: SettingsModalProps) {
  const { 
    settings: loadedSettings, 
    isLoading, 
    isSaving, 
    loadSettings, 
    saveSettings 
  } = useSettingsContext()
  
  const [settings, setSettings] = useState<Settings | null>(null)
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

  const handleSave = async (tab: string) => {
    if (!settings) return

    const success = await saveSettings(settings)
    if (success) {
      console.log(`${tab} settings saved successfully`)
      logseqAPI.UI.showMsg(t('settings.saveSuccessRestart', language), { type: 'success' })
      onClose()
    }
  }

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')} theme={theme}>
        <div className="settings-loading">{t('settings.loading')}</div>
      </Modal>
    )
  }

  if (!settings) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title')} theme={theme}>
        <div className="settings-error">{t('settings.error')}</div>
      </Modal>
    )
  }

  const language = settings.language || 'zh-CN'

  interface Tab {
    id: string
    component: React.ComponentType<TabComponentProps>
    label: string
  }

  const tabs: Tab[] = [
    { id: 'general', component: GeneralSettings, label: t('settings.tabs.general', language) },
    { id: 'toolbar', component: ToolbarSettings, label: t('settings.tabs.toolbar', language) },
    { id: 'advanced', component: AdvancedSettings, label: t('settings.tabs.advanced', language) }
  ]

  const TabComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title', language)} theme={theme}>
      <div className="ltt-settings-container" data-theme={theme}>
        <div className="ltt-settings-header">
          <div className="ltt-settings-tabs">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                className={`ltt-settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ltt-settings-content">
          {TabComponent && (
            <div id={`ltt-${activeTab}-settings`}>
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
