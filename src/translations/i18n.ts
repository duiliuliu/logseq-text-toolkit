/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 */

import en from './en.json'
import ja from './ja.json'
import zhCN from './zh-CN.json'
import { TranslationKeys, SupportedLanguage, TaskProgressStatusNames } from './translations.ts'
import { getSettings } from '../settings/index.ts'
import { logseqAPI } from '../logseq/index.ts'

const builtInTranslations: Record<SupportedLanguage, TranslationKeys> = {
  'en': en as TranslationKeys,
  'ja': ja as TranslationKeys,
  'zh-CN': zhCN as TranslationKeys
}

type DynamicTranslations = Partial<Record<SupportedLanguage, TranslationKeys>>
let dynamicTranslations: DynamicTranslations = {}

const getNestedValue = (obj: any, key: string): string => {
  if (!obj || !key) return key
  const keys = key.split('.')
  let result = obj

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k]
    } else {
      return key
    }
  }

  return result as string
}

const loadLanguageFile = async (langCode: string, filePath: string): Promise<TranslationKeys | null> => {
  try {
    const response = await fetch(`./${filePath}`)
    if (response.ok) {
      const translation = await response.json()
      return translation as TranslationKeys
    }
    return null
  } catch (error) {
    console.warn(`Failed to load language file for ${langCode}:`, error)
    return null
  }
}

export const initI18n = async (): Promise<void> => {
  const settings = getSettings()
  const languageMeta = settings.meta?.language
  
  if (languageMeta?.languages) {
    for (const lang of languageMeta.languages) {
      const translation = await loadLanguageFile(lang.code, lang.path)
      if (translation) {
        dynamicTranslations[lang.code as SupportedLanguage] = translation
      }
    }
  }
}

/**
 * 获取当前语言
 * 逻辑:
 * 1. 读取 settings?.language
 * 2. 没有值则默认 'zh-CN'
 * 3. 如果是 'system' 则根据系统获取
 * 4. 支持任意配置的 language 值
 */
export const getCurrentLanguage = (): SupportedLanguage => {
  try {
    const settings = getSettings()
    const settingsLang = settings?.language
    
    // 没有配置值的情况
    if (!settingsLang) {
      return 'zh-CN'
    }
    
    // 如果是 'system'，需要从系统获取
    if (settingsLang === 'system') {
      let systemLang: string
      
      // 尝试从 Logseq API 获取
      try {
        // 先尝试获取 Logseq 的语言设置
        const appInfo = logseqAPI.App.getAppInfo()
        if (appInfo?.preferredLanguage) {
          systemLang = appInfo.preferredLanguage
        } else {
          // 回退到浏览器语言
          systemLang = typeof navigator !== 'undefined' ? navigator.language : 'zh-CN'
        }
      } catch (error) {
        // 失败回退到浏览器语言
        systemLang = typeof navigator !== 'undefined' ? navigator.language : 'zh-CN'
      }
      
      // 映射系统语言到我们支持的语言
      if (systemLang.startsWith('ja')) {
        return 'ja'
      } else if (systemLang.startsWith('en')) {
        return 'en'
      } else {
        // 默认回退到中文
        return 'zh-CN'
      }
    }
    
    // 直接使用 settings 中配置的 language 值
    // 检查是否是我们支持的语言类型
    if (settingsLang === 'en' || settingsLang === 'ja' || settingsLang === 'zh-CN') {
      return settingsLang as SupportedLanguage
    }
    
    // 如果配置了其他值，默认回退到中文
    return 'zh-CN'
  } catch (error) {
    console.error('[i18n] Error getting current language:', error)
    return 'zh-CN'
  }
}

export const t = (key: string, lang?: SupportedLanguage): string => {
  const language = lang || getCurrentLanguage()
  if (dynamicTranslations[language]) {
    const translation = getNestedValue(dynamicTranslations[language], key)
    if (translation !== key) return translation
  }
  
  const builtInTranslation = builtInTranslations[language] || builtInTranslations['zh-CN']
  return getNestedValue(builtInTranslation, key)
}

export const getStatusName = (status: string, lang?: SupportedLanguage): string => {
  const language = lang || getCurrentLanguage()
  const key = `settings.taskProgress.statusNames.${status}`
  const translation = t(key, language)
  if (translation !== key) return translation
  
  const fallbackNames: TaskProgressStatusNames = {
    todo: '待办',
    doing: '进行中',
    'in-review': '审核中',
    done: '已完成',
    waiting: '等待中',
    canceled: '已取消'
  }
  return fallbackNames[status as keyof TaskProgressStatusNames] || status
}

export default {
  t,
  initI18n,
  getStatusName,
  getCurrentLanguage
}
