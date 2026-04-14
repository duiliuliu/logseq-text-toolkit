// src/utils/i18n.js
import { getCurrentLanguage } from './state';
import en from '../translations/en.json';
import ja from '../translations/ja.json';
import zhCN from '../translations/zh-CN.json';

const translations = {
  'en': en,
  'ja': ja,
  'zh-CN': zhCN
};

// 获取翻译
export const t = (key, defaultValue = '') => {
  const lang = getCurrentLanguage();
  const translation = translations[lang] || translations['zh-CN'];
  return translation[key] || defaultValue;
};

// 初始化 i18n
export const initI18n = () => {
  // 这里可以从 Logseq 获取用户的语言设置
  // 暂时使用默认语言
};

export default {
  t,
  initI18n
};