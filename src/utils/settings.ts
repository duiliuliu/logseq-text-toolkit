// 导入默认配置
import defaultSettings from '../config/defaultSettings.ts';
import { Settings } from '../config/types.ts';

// 加载设置
export const loadSettings = async (): Promise<Settings> => {
  try {
    // 在 Logseq 环境中，使用 Logseq 的设置存储
    if (typeof logseq !== 'undefined' && logseq.settings) {
      return { ...defaultSettings, ...logseq.settings };
    }
    
    // 在测试环境中，使用 localStorage
    const savedSettings = localStorage.getItem('text-toolkit-settings');
    if (savedSettings) {
      return { ...defaultSettings, ...JSON.parse(savedSettings) };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return defaultSettings;
};

// 保存设置
export const saveSettings = async (settings: Settings): Promise<boolean> => {
  try {
    // 在 Logseq 环境中，使用 Logseq 的设置存储
    if (typeof logseq !== 'undefined') {
      await logseq.updateSettings(settings);
      return true;
    }
    
    // 在测试环境中，使用 localStorage
    localStorage.setItem('text-toolkit-settings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
};

// 重置设置
export const resetSettings = async (): Promise<boolean> => {
  return await saveSettings(defaultSettings);
};

export default defaultSettings;
