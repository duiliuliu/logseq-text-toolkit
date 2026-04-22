import { useState, useEffect } from 'react'
import { t } from '../../../translations/i18n.ts'
import { Settings } from '../../../settings/types.ts'
import { TabComponentProps } from '../index.tsx'
import { Textarea } from '../../ui/textarea.tsx'
import '../../ui/textarea.css'

function ToolbarSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const [jsonError, setJsonError] = useState('')
  
  // 直接使用 settings.ToolbarItems 作为工具栏配置
  const [jsonInput, setJsonInput] = useState(JSON.stringify(settings.ToolbarItems || [], null, 2))
  
  // 仅在 settings 从外部变化时更新 jsonInput
  useEffect(() => {
    const currentJson = JSON.stringify(settings.ToolbarItems || [], null, 2)
    if (jsonInput !== currentJson) {
      setJsonInput(currentJson)
    }
  }, [settings.ToolbarItems])
  
  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => {
      if (!prev) return prev
      return {
        ...prev,
        [key]: value
      }
    })
  }

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setJsonInput(value)
    setJsonError('')
    
    try {
      const parsedItems = JSON.parse(value)
      setSettings(prev => {
        if (!prev) return prev
        return {
          ...prev,
          ToolbarItems: parsedItems
        }
      })
    } catch (error) {
      setJsonError(t('settings.error', language))
    }
  }

  return (
    <div className="ltt-settings-tab-content">
      <p className="ltt-tab-section-description-small">{t('settings.toolbarSettingsDescription', language)}</p>
      
      {/* Switch 类型的设置项 */}
      <div className="ltt-setting-item">
        <label>{t('settings.enabled', language)}</label>
        <label className="ltt-switch">
          <input 
            type="checkbox" 
            checked={settings.toolbar} 
            onChange={(e) => handleSettingChange('toolbar', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.showBorder', language)}</label>
        <label className="ltt-switch">
          <input 
            type="checkbox" 
            checked={settings.showBorder} 
            onChange={(e) => handleSettingChange('showBorder', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.sponsorEnabled', language)}</label>
        <label className="ltt-switch">
          <input 
            type="checkbox" 
            checked={settings.sponsorEnabled} 
            onChange={(e) => handleSettingChange('sponsorEnabled', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      {/* Input 类型的设置项 */}
      <div className="ltt-setting-item">
        <label>{t('settings.toolbarShortcut', language)}</label>
        <input 
          type="text" 
          value={settings.toolbarShortcut} 
          onChange={(e) => handleSettingChange('toolbarShortcut', e.target.value)}
          placeholder={t('settings.toolbarShortcutPlaceholder', language)}
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.width', language)}</label>
        <input 
          type="number" 
          value={settings.width ? settings.width.replace('px', '') : '110'} 
          onChange={(e) => handleSettingChange('width', `${e.target.value}px`)}
          placeholder="110"
          min="1"
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.height', language)}</label>
        <input 
          type="number" 
          value={settings.height ? settings.height.replace('px', '') : '24'} 
          onChange={(e) => handleSettingChange('height', `${e.target.value}px`)}
          placeholder="24"
          min="1"
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.hoverDelay', language)}</label>
        <input 
          type="number" 
          value={settings.hoverDelay} 
          onChange={(e) => handleSettingChange('hoverDelay', parseInt(e.target.value) || 0)}
          min="0"
        />
      </div>

      <div className="ltt-setting-item ltt-setting-item-json">
        <label>元素配置</label>
        <div className="ltt-json-editor">
          <div className="ltt-json-hint">
            <ul>
              <li><strong>分组格式</strong>：包含 subItems 数组的对象</li>
              <li><strong>单个元素</strong>：直接定义元素，需要 id, label, icon, funcmode, clickfunc</li>
              <li><strong>隐藏元素</strong>：添加 "hidden": true 可隐藏按钮</li>
              <li><strong>绑定快捷键</strong>：添加 "binding" 字段设置快捷键</li>
            </ul>
          </div>
          <Textarea 
            value={jsonInput}
            onChange={handleJsonChange}
            placeholder={t('settings.jsonSettings', language)}
            rows={12}
          />
          {jsonError && <div className="ltt-json-error">{jsonError}</div>}
        </div>
      </div>

      <div className="ltt-settings-actions">
        <button 
          className="ltt-settings-btn ltt-settings-btn-save"
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
