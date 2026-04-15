// 国际化支持
import en from '../translations/en.json';
import ja from '../translations/ja.json';
import zhCN from '../translations/zh-CN.json';

const translations = {
  'en': en,
  'ja': ja,
  'zh-CN': zhCN
};

const getTranslation = (key, lang = 'zh-CN') => {
  const keys = key.split('.');
  let result = translations[lang] || translations['zh-CN'];
  
  for (const k of keys) {
    if (result && result[k] !== undefined) {
      result = result[k];
    } else {
      return key; // 如果没有找到翻译，返回原始键
    }
  }
  
  return result;
};

// 获取带图标的标签
const getTabLabel = (key, lang = 'zh-CN') => {
  const labels = {
    'general': '⚙️ ' + getTranslation('settings.generalSettings', lang),
    'toolbar': '🛠️ ' + getTranslation('settings.toolbarSettings', lang),
    'advanced': '⚡ ' + getTranslation('settings.advancedSettings', lang)
  };
  return labels[key] || key;
};

export { getTranslation, getTabLabel };
