/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 */

import en from './en.json'
import ja from './ja.json'
import zhCN from './zh-CN.json'
import { TranslationKeys, SupportedLanguage } from './translations.ts'
import { getSettings } from '../settings/index.ts'
import logger from '../lib/logger/index'

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
    logger.warn(`Failed to load language file for ${langCode}:`, error)
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

export const t = (key: string, lang?: SupportedLanguage): string => {
  const language = lang || getSettings()?.language || 'zh-CN'
  if (dynamicTranslations[language]) {
    const translation = getNestedValue(dynamicTranslations[language], key)
    if (translation !== key) return translation
  }
  
  const builtInTranslation = builtInTranslations[language] || builtInTranslations['zh-CN']
  return getNestedValue(builtInTranslation, key)
}

export default {
  t,
  initI18n
}
