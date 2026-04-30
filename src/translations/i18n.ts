/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 */

import en from './en.json'
import ja from './ja.json'
import zhCN from './zh-CN.json'
import { TranslationKeys, SupportedLanguage, Translations } from './translations.ts'
import { getSettings } from '../settings/index.ts'

// 内置语言作为 fallback
const builtInTranslations: Translations = {
  'en': en as TranslationKeys,
  'ja': ja as TranslationKeys,
  'zh-CN': zhCN as TranslationKeys
}

// 动态加载的翻译
let dynamicTranslations: Translations = {}

// 递归获取翻译值
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

// 加载语言文件
const loadLanguageFile = async (langCode: string, filePath: string): Promise<TranslationKeys | null> => {
  try {
    // 尝试从 dist 目录加载
    const response = await fetch(`./${filePath}`)
    if (response.ok) {
      const translation = await response.json()
      return translation as TranslationKeys
    }
    // 加载失败，返回 null
    return null
  } catch (error) {
    console.warn(`Failed to load language file for ${langCode}:`, error)
    return null
  }
}

// 初始化语言
export const initI18n = async (): Promise<void> => {
  const settings = getSettings()
  const languageMeta = settings.meta?.language
  
  if (languageMeta?.languages) {
    for (const lang of languageMeta.languages) {
      const translation = await loadLanguageFile(lang.code, lang.path)
      if (translation) {
        dynamicTranslations[lang.code] = translation
      }
    }
  }
}

// 获取翻译
export const t = (key: string, lang: SupportedLanguage = 'zh-CN'): string => {
  // 优先使用动态加载的翻译
  if (dynamicTranslations[lang]) {
    const translation = getNestedValue(dynamicTranslations[lang], key)
    if (translation !== key) return translation
  }
  
  // 降级到内置翻译
  const builtInTranslation = builtInTranslations[lang] || builtInTranslations['zh-CN']
  return getNestedValue(builtInTranslation, key)
}

export default {
  t,
  initI18n
}
