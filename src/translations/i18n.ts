/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 */

import en from './en.json'
import ja from './ja.json'
import zhCN from './zh-CN.json'
import type { SupportedLanguage, TranslationKey, TranslationResource } from './translations.ts'
import { getSettings } from '../settings/index.ts'
import logger from '../lib/logger/index'

type ConcreteLanguage = Exclude<SupportedLanguage, 'system'>
type LanguageInput = SupportedLanguage | string
type InterpolationParams = Record<string, string | number | boolean>

const builtInTranslations: Record<ConcreteLanguage, TranslationResource> = {
  'en': en,
  'ja': ja,
  'zh-CN': zhCN
}

type DynamicTranslations = Partial<Record<ConcreteLanguage, TranslationResource>>
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

const interpolate = (message: string, params?: InterpolationParams): string => {
  if (!params) return message

  return message.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) => {
    const value = params[name]
    return value === undefined ? match : String(value)
  })
}

const normalizeLanguage = (language?: LanguageInput): ConcreteLanguage => {
  if (language === 'en' || language === 'ja' || language === 'zh-CN') {
    return language
  }

  return 'zh-CN'
}

const loadLanguageFile = async (langCode: string, filePath: string): Promise<TranslationResource | null> => {
  try {
    const response = await fetch(`./${filePath}`)
    if (response.ok) {
      const translation = await response.json()
      return translation as TranslationResource
    }
    return null
  } catch (error) {
    logger.warn(`Failed to load language file for ${langCode}:`, error)
    return null
  }
}

export const initI18n = async (): Promise<void> => {
  const settings = getSettings()
  const languageMeta = (settings as any).meta?.language
  
  if (languageMeta?.languages) {
    for (const lang of languageMeta.languages) {
      const translation = await loadLanguageFile(lang.code, lang.path)
      if (translation) {
        dynamicTranslations[lang.code as ConcreteLanguage] = translation
      }
    }
  }
}

export function t(key: TranslationKey, language?: LanguageInput): string
export function t(key: TranslationKey, params?: InterpolationParams): string
export function t(key: TranslationKey, language: LanguageInput, params: InterpolationParams): string
export function t(key: TranslationKey, params: InterpolationParams, language: LanguageInput): string
export function t(
  key: TranslationKey,
  langOrParams?: LanguageInput | InterpolationParams,
  paramsOrLanguage?: InterpolationParams | LanguageInput
): string {
  const hasExplicitLanguage = typeof langOrParams === 'string'
  const hasLegacyLanguage = typeof paramsOrLanguage === 'string'
  const interpolationParams = hasExplicitLanguage
    ? paramsOrLanguage as InterpolationParams | undefined
    : langOrParams as InterpolationParams | undefined
  const concreteLanguage = normalizeLanguage(
    hasExplicitLanguage
      ? langOrParams
      : hasLegacyLanguage
        ? paramsOrLanguage
        : getSettings()?.language
  )
  
  if (dynamicTranslations[concreteLanguage]) {
    const translation = getNestedValue(dynamicTranslations[concreteLanguage], key)
    if (translation !== key) return interpolate(translation, interpolationParams)
  }
  
  const builtInTranslation = builtInTranslations[concreteLanguage] || builtInTranslations['zh-CN']
  return interpolate(getNestedValue(builtInTranslation, key), interpolationParams)
}

export default {
  t,
  initI18n
}
