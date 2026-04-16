import en from './en.json'
import ja from './ja.json'
import zhCN from './zh-CN.json'
import { TranslationKeys, SupportedLanguage, Translations } from './translations.ts'

const translations: Translations = {
  'en': en as TranslationKeys,
  'ja': ja as TranslationKeys,
  'zh-CN': zhCN as TranslationKeys
}

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

// 获取翻译
export const t = (key: string, lang: SupportedLanguage = 'zh-CN'): string => {
  const translation = translations[lang] || translations['zh-CN']
  return getNestedValue(translation, key)
}

export default {
  t
}
