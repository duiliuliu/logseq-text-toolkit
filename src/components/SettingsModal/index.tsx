import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '../Modal/index'
import { useSettingsContext } from '../../settings/useSettings'
import GeneralSettings from './tabs/GeneralSettings'
import ToolbarSettings from './tabs/ToolbarSettings'
import AdvancedSettings from './tabs/AdvancedSettings'
import TaskProgressSettings from './tabs/TaskProgressSettings'
import HeatmapSettings from './tabs/HeatmapSettings'
import BlockViewSettings from './tabs/BlockViewSettings'
import SummarySettings from './tabs/SummarySettings'
import { t, getCurrentLanguage } from '../../translations/i18n'
import { ThemeType, Settings } from '../../settings/types'
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
    icon: string
  }

  const tabs: Tab[] = [
    { id: 'general', component: GeneralSettings, label: t('settings.tabs.general', language), icon: '' },
    { id: 'toolbar', component: ToolbarSettings, label: t('settings.tabs.toolbar', language), icon: '' },
    { id: 'task-progress', component: TaskProgressSettings, label: t('settings.tabs.taskProgress', language), icon: '' },
    { id: 'heatmap', component: HeatmapSettings, label: t('settings.tabs.heatmap', language), icon: '' },
    { id: 'block-view', component: BlockViewSettings, label: t('settings.tabs.blockView', language), icon: '' },
    { id: 'summary', component: SummarySettings, label: t('settings.tabs.summary', language), icon: '' },
    { id: 'advanced', component: AdvancedSettings, label: t('settings.tabs.advanced', language), icon: '' }
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
              <span style={{ marginRight: '4px' }}>{tab.icon}</span>
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
