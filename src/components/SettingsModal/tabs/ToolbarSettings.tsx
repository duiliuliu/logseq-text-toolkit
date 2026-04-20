import { useState } from 'react'
import { t } from '../../../translations/i18n.ts'
import { Settings } from '../../../settings/types.ts'
import { TabComponentProps } from '../index.tsx'

function ToolbarSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const [jsonError, setJsonError] = useState('')
  
  const handleSettingChange = (path: string, value: any) => {
    setSettings(prev => {
      if (!prev) return prev
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

  const handleJsonChange = (value: string) => {
    setJsonError('')
    try {
      JSON.parse(value)
      handleSettingChange('toolbar.items', JSON.parse(value))
    } catch (error) {
      setJsonError(t('settings.error', language))
    }
  }

  const handleCopyJson = async () => {
    try {
      const jsonString = JSON.stringify(settings.toolbar.items, null, 2)
      await navigator.clipboard.writeText(jsonString)
      // 可以添加一个成功提示
      console.log('JSON copied to clipboard')
    } catch (error) {
      console.error('Failed to copy JSON:', error)
    }
  }

  const handlePasteJson = async () => {
    try {
      const text = await navigator.clipboard.readText()
      handleJsonChange(text)
    } catch (error) {
      console.error('Failed to paste JSON:', error)
    }
  }

  return (
    <div className="settings-tab-content">
      <p className="tab-section-description-small">{t('settings.toolbarSettingsDescription', language)}</p>
      
      <div className="setting-item">
        <label>{t('settings.enabled', language)}</label>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={settings.toolbar.enabled} 
            onChange={(e) => handleSettingChange('toolbar.enabled', e.target.checked)}
          />
          <span className="switch-slider"></span>
        </label>
      </div>

      <div className="setting-item">
        <label>{t('settings.showBorder', language)}</label>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={settings.toolbar.showBorder} 
            onChange={(e) => handleSettingChange('toolbar.showBorder', e.target.checked)}
          />
          <span className="switch-slider"></span>
        </label>
      </div>

      <div className="setting-item">
        <label>赞助栏</label>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={settings.toolbar.sponsorEnabled} 
            onChange={(e) => handleSettingChange('toolbar.sponsorEnabled', e.target.checked)}
          />
          <span className="switch-slider"></span>
        </label>
      </div>

      <div className="setting-item">
        <label>{t('settings.width', language)} (px)</label>
        <input 
          type="number" 
          value={settings.toolbar.width.replace('px', '')} 
          onChange={(e) => handleSettingChange('toolbar.width', `${e.target.value}px`)}
          placeholder="110"
          min="1"
        />
      </div>

      <div className="setting-item">
        <label>{t('settings.height', language)} (px)</label>
        <input 
          type="number" 
          value={settings.toolbar.height.replace('px', '')} 
          onChange={(e) => handleSettingChange('toolbar.height', `${e.target.value}px`)}
          placeholder="24"
          min="1"
        />
      </div>

      <div className="setting-item">
        <label>{t('settings.hoverDelay', language)} (ms)</label>
        <input 
          type="number" 
          value={settings.toolbar.hoverDelay} 
          onChange={(e) => handleSettingChange('toolbar.hoverDelay', parseInt(e.target.value) || 0)}
          min="0"
        />
      </div>

      <div className="setting-item setting-item-json">
        <label>元素</label>
        <div className="json-editor">
          <div className="json-hint">
            <ul>
              <li><strong>单个元素</strong>：直接配置 icon 和 action，如粗体、斜体</li>
              <li><strong>分组元素</strong>：添加 "children" 数组可创建下拉菜单，如颜色高亮组</li>
              <li><strong>隐藏元素</strong>：添加 "hidden": true 可隐藏按钮</li>
              <li><strong>icon 可选值</strong>: bold, italic, underline, highlight, copy, link, comment, type, sparkles</li>
            </ul>
          </div>
          <div className="json-actions">
            <button 
              className="json-action-btn"
              onClick={handleCopyJson}
              title="复制到剪贴板"
            >
              复制
            </button>
            <button 
              className="json-action-btn"
              onClick={handlePasteJson}
              title="从剪贴板粘贴"
            >
              粘贴
            </button>
          </div>
          <textarea 
            value={JSON.stringify(settings.toolbar.items, null, 2)}
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder={t('settings.jsonSettings', language)}
            rows={12}
          />
          {jsonError && <div className="json-error">{jsonError}</div>}
        </div>
      </div>

      <div className="settings-actions">
        <button 
          className="settings-btn settings-btn-save"
          onClick={onSave}
          disabled={isSaving || !!jsonError}
        >
          {isSaving ? t('settings.saving', language) : t('settings.saveToolbarSettings', language)}
        </button>
      </div>
    </div>
  )
}

export default ToolbarSettings
