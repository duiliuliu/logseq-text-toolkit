import { useState, useEffect } from 'react'
import { t } from '../../../translations/i18n.ts'
import { Settings } from '../../../settings/types.ts'
import { TabComponentProps } from '../index.tsx'
import { logseqAPI } from '../../../logseq/index.ts'
import { Textarea } from '../../ui/textarea.tsx'
import '../../ui/textarea.css'

function ToolbarSettings({ settings, setSettings, onSave, isSaving, language }: TabComponentProps) {
  const [jsonError, setJsonError] = useState('')
  const [jsonInput, setJsonInput] = useState(JSON.stringify(settings.toolbar.items, null, 2))
  
  // 仅在 settings 从外部变化时更新 jsonInput
  useEffect(() => {
    // 只有当 jsonInput 与 settings.toolbar.items 不一致时才更新
    // 避免在用户输入时重置光标位置
    const currentJson = JSON.stringify(settings.toolbar.items, null, 2)
    if (jsonInput !== currentJson) {
      setJsonInput(currentJson)
    }
  }, [settings.toolbar.items])
  
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

  // 防抖函数
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
  }

  // 防抖处理的 JSON 解析
  const debouncedHandleJsonChange = debounce((value: string) => {
    setJsonError('')
    try {
      JSON.parse(value)
      handleSettingChange('toolbar.items', JSON.parse(value))
    } catch (error) {
      setJsonError(t('settings.error', language))
    }
  }, 300)

  const handleJsonChange = (value: string) => {
    setJsonInput(value)
    debouncedHandleJsonChange(value)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text')
    // 直接设置粘贴的内容到 jsonInput，不进行 JSON 解析
    setJsonInput(text)
    // 触发防抖处理的 JSON 解析
    debouncedHandleJsonChange(text)
    logseqAPI.showMsg('内容粘贴成功', 'success')
  }

  return (
    <div className="ltt-settings-tab-content">
      <p className="ltt-tab-section-description-small">{t('settings.toolbarSettingsDescription', language)}</p>
      
      <div className="ltt-setting-item">
        <label>{t('settings.enabled', language)}</label>
        <label className="ltt-switch">
          <input 
            type="checkbox" 
            checked={settings.toolbar.enabled} 
            onChange={(e) => handleSettingChange('toolbar.enabled', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.showBorder', language)}</label>
        <label className="ltt-switch">
          <input 
            type="checkbox" 
            checked={settings.toolbar.showBorder} 
            onChange={(e) => handleSettingChange('toolbar.showBorder', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>赞助栏</label>
        <label className="ltt-switch">
          <input 
            type="checkbox" 
            checked={settings.toolbar.sponsorEnabled} 
            onChange={(e) => handleSettingChange('toolbar.sponsorEnabled', e.target.checked)}
          />
          <span className="ltt-switch-slider"></span>
        </label>
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.width', language)} (px)</label>
        <input 
          type="number" 
          value={settings.toolbar.width.replace('px', '')} 
          onChange={(e) => handleSettingChange('toolbar.width', `${e.target.value}px`)}
          placeholder="110"
          min="1"
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.height', language)} (px)</label>
        <input 
          type="number" 
          value={settings.toolbar.height.replace('px', '')} 
          onChange={(e) => handleSettingChange('toolbar.height', `${e.target.value}px`)}
          placeholder="24"
          min="1"
        />
      </div>

      <div className="ltt-setting-item">
        <label>{t('settings.hoverDelay', language)} (ms)</label>
        <input 
          type="number" 
          value={settings.toolbar.hoverDelay} 
          onChange={(e) => handleSettingChange('toolbar.hoverDelay', parseInt(e.target.value) || 0)}
          min="0"
        />
      </div>

      <div className="ltt-setting-item ltt-setting-item-json">
        <label>元素</label>
        <div className="ltt-json-editor">
          <div className="ltt-json-hint">
            <ul>
              <li><strong>单个元素</strong>：直接配置 icon 和 action，如粗体、斜体</li>
              <li><strong>分组元素</strong>：添加 "children" 数组可创建下拉菜单，如颜色高亮组</li>
              <li><strong>隐藏元素</strong>：添加 "hidden": true 可隐藏按钮</li>
              <li><strong>icon 可选值</strong>: bold, italic, underline, highlight, copy, link, comment, type, sparkles</li>
            </ul>
          </div>
          <Textarea 
            value={jsonInput}
            onChange={(e) => handleJsonChange(e.target.value)}
            onPaste={handlePaste}
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
