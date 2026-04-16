import en from './en.json'
import ja from './ja.json'
import zhCN from './zh-CN.json'

const translations = {
  'en': en,
  'ja': ja,
  'zh-CN': zhCN
}

// 递归获取翻译值
const getNestedValue = (obj, key) => {
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

  return result
}

// 获取翻译
export const t = (key, lang = 'zh-CN') => {
  const translation = translations[lang] || translations['zh-CN']
  return getNestedValue(translation, key)
}

export default {
  t
}
