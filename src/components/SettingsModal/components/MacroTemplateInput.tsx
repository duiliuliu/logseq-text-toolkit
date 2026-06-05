/**
 * 宏命令模板输入组件
 * 
 * 提供带验证和防抖的宏命令模板输入功能
 */

import React, { useState, useEffect, useRef } from 'react'
import { t } from '../../../translations/i18n'
import { validateMacroTemplate, MacroValidationResult } from '../../../lib/render/macroTemplateValidator'

interface MacroTemplateInputProps {
  value: string
  onChange: (value: string) => void
  macroType: 'taskprogress' | 'heatmap' | 'blockview' | 'milestone'
  language: string
  placeholder?: string
  debounceMs?: number
  align?: 'left' | 'right'
}

/**
 * 宏命令模板输入组件
 */
export const MacroTemplateInput: React.FC<MacroTemplateInputProps> = ({
  value,
  onChange,
  macroType,
  language,
  placeholder,
  debounceMs = 500,
  align = 'right'
}) => {
  const [localValue, setLocalValue] = useState(value)
  const [validation, setValidation] = useState<MacroValidationResult>({ valid: true })
  const [showValidation, setShowValidation] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()
  const isFirstRender = useRef(true)

  // 同步外部值到本地状态（仅首次渲染或显式重置）
  useEffect(() => {
    if (isFirstRender.current || value === '') {
      setLocalValue(value)
      isFirstRender.current = false
    }
  }, [value])

  // 防抖验证和更新
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      // 验证模板
      const result = validateMacroTemplate(localValue, macroType)
      setValidation(result)

      // 如果验证通过或有警告但值改变了，则更新
      if (result.valid) {
        onChange(localValue)
      }

      // 显示验证信息
      setShowValidation(true)
    }, debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [localValue, macroType, debounceMs, onChange])

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    setShowValidation(false)
  }

  // 处理失焦（立即验证并更新）
  const handleBlur = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    const result = validateMacroTemplate(localValue, macroType)
    setValidation(result)
    setShowValidation(true)
    
    if (result.valid) {
      onChange(localValue)
    }
  }

  // 获取宏前缀
  const getMacroPrefix = () => {
    const prefixes: Record<string, string> = {
      taskprogress: ':taskprogress',
      heatmap: ':heatmap',
      blockview: ':blockview',
      milestone: ':milestone'
    }
    return prefixes[macroType] || ':macro'
  }

  // 默认 placeholder
  const defaultPlaceholder = `${getMacroPrefix()}, <param1>=<value1>, <param2>=<value2>`

  return (
    <div className="ltt-macro-template-input-container">
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder || defaultPlaceholder}
        className={`ltt-macro-template-input ${
          showValidation && !validation.valid ? 'ltt-macro-template-input-error' : ''
        } ${showValidation && validation.valid && validation.warnings ? 'ltt-macro-template-input-warning' : ''}`}
      />
      
      {/* 错误信息 */}
      {showValidation && !validation.valid && validation.error && (
        <div className={`ltt-macro-template-error ltt-macro-template-alert-${align}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{validation.error}</span>
        </div>
      )}
      
      {/* 警告信息 */}
      {showValidation && validation.valid && validation.warnings && validation.warnings.length > 0 && (
        <div className={`ltt-macro-template-warning ltt-macro-template-alert-${align}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>{validation.warnings[0]}</span>
        </div>
      )}
      
      {/* 帮助提示 */}
      <div className={`ltt-macro-template-hint ltt-macro-template-alert-${align}`}>
        {t('settings.macroTemplate.hint', language)}
      </div>
    </div>
  )
}

export default MacroTemplateInput
