import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '../Modal/index'
import { useSettingsContext } from '../../settings/useSettings'
import GeneralSettings from './tabs/GeneralSettings'
import ToolbarSettings from './tabs/ToolbarSettings'
import TaskProgressSettings from './tabs/TaskProgressSettings'
import HeatmapSettings from './tabs/HeatmapSettings'
import BlockViewSettings from './tabs/BlockViewSettings'
import SummarySettings from './tabs/SummarySettings'
import MilestoneSettings from './tabs/MilestoneSettings'
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
  const modalTheme = settings.theme === 'dark' ? 'dark' : 'light'

  interface Tab {
    id: string
    component: React.ComponentType<TabComponentProps>
    label: string
    icon: string
  }

  // 计算动态 tabs 列表 - 使用 useMemo 确保计算稳定
  // 使用 settings 对象本身作为依赖，避免可选链导致的依赖不稳定
  const featureTabs = useMemo<Tab[]>(() => {
    const s = settings;
    return [
      s.toolbar !== false && { id: 'toolbar', component: ToolbarSettings, label: t('settings.tabs.toolbar', language), icon: '' },
      s.taskProgress?.enabled !== false && { id: 'task-progress', component: TaskProgressSettings, label: t('settings.tabs.taskProgress', language), icon: '' },
      s.heatmap?.enabled !== false && { id: 'heatmap', component: HeatmapSettings, label: t('settings.tabs.heatmap', language), icon: '' },
      s.blockView?.enabled !== false && { id: 'block-view', component: BlockViewSettings, label: t('settings.tabs.blockView', language), icon: '' },
      s.summary?.enabled !== false && { id: 'summary', component: SummarySettings, label: t('settings.tabs.summary', language), icon: '' },
      s.milestone?.enabled !== false && { id: 'milestone', component: MilestoneSettings, label: t('settings.tabs.milestone', language), icon: '' },
    ].filter(Boolean) as Tab[];
  }, [settings, language]);

  const tabs = useMemo<Tab[]>(() => [
    { id: 'general', component: GeneralSettings, label: t('settings.tabs.general', language), icon: '' },
    ...featureTabs,
  ], [featureTabs, language]);

  // 确保 activeTab 有效
  React.useEffect(() => {
    const tabIds = tabs.map(tab => tab.id);
    if (!tabIds.includes(activeTab)) {
      setActiveTab('general');
    }
  }, [activeTab, tabs]);

  const TabComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.title', language)} theme={modalTheme}>
      <div className="ltt-settings-container" data-theme={modalTheme}>
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
