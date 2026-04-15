import React, { useState, useEffect } from 'react'
import Modal from '../Modal/index.jsx'
import useSettings from '../../hooks/useSettings.js'
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
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
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
      <Modal isOpen={isOpen} onClose={onClose} title="Settings">
        <div className="settings-loading">Loading settings...</div>
      </Modal>
    )
  }

  if (!settings) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Settings">
        <div className="settings-error">Failed to load settings</div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="settings-container" data-theme={theme}>
        <div className="settings-section">
          <h3>General Settings</h3>
          
          <div className="setting-item">
            <label>Theme</label>
            <select 
              value={settings.theme} 
              onChange={(e) => handleSettingChange('theme', e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="setting-item">
            <label>Language</label>
            <select 
              value={settings.language} 
              onChange={(e) => handleSettingChange('language', e.target.value)}
            >
              <option value="zh-CN">中文</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3>Toolbar Settings</h3>
          
          <div className="setting-item">
            <label>Enabled</label>
            <input 
              type="checkbox" 
              checked={settings.toolbar.enabled} 
              onChange={(e) => handleSettingChange('toolbar.enabled', e.target.checked)}
            />
          </div>

          <div className="setting-item">
            <label>Show Border</label>
            <input 
              type="checkbox" 
              checked={settings.toolbar.showBorder} 
              onChange={(e) => handleSettingChange('toolbar.showBorder', e.target.checked)}
            />
          </div>

          <div className="setting-item">
            <label>Width</label>
            <input 
              type="text" 
              value={settings.toolbar.width} 
              onChange={(e) => handleSettingChange('toolbar.width', e.target.value)}
              placeholder="e.g., 110px"
            />
          </div>

          <div className="setting-item">
            <label>Height</label>
            <input 
              type="text" 
              value={settings.toolbar.height} 
              onChange={(e) => handleSettingChange('toolbar.height', e.target.value)}
              placeholder="e.g., 24px"
            />
          </div>

          <div className="setting-item">
            <label>Hover Delay (ms)</label>
            <input 
              type="number" 
              value={settings.toolbar.hoverDelay} 
              onChange={(e) => handleSettingChange('toolbar.hoverDelay', parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
        </div>

        <div className="settings-actions">
          <button className="settings-btn settings-btn-reset" onClick={handleReset}>
            Reset to Default
          </button>
          <div className="settings-btn-group">
            <button className="settings-btn settings-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button 
              className="settings-btn settings-btn-save" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default SettingsModal
