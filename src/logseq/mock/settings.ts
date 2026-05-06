import defaultSettings from '../../settings/defaultSettings.ts';

const SETTINGS_KEY = 'text-toolkit-settings';
const settingsChangeHandlers: Array<(newSettings: any, oldSettings: any) => void> = [];

let currentSettings: Record<string, any>;

// 加载设置
const loadSettings = (): Record<string, any> => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return defaultSettings as unknown as Record<string, any>;
};

// 保存设置
const saveSettings = (settings: Record<string, any>): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

// 初始化设置
currentSettings = loadSettings();

// 获取当前设置
export const getSettings = (): Record<string, any> => {
  return currentSettings;
};

// 更新设置
export const updateSettings = async (newSettings: Record<string, any>): Promise<void> => {
  console.log('Updated settings:', newSettings);
  const oldSettings = { ...currentSettings };
  Object.assign(currentSettings, newSettings);
  saveSettings(currentSettings);
  settingsChangeHandlers.forEach(cb => cb(currentSettings, oldSettings));
};

// 监听设置变化
export const onSettingsChanged = <T = any>(cb: (a: T, b: T) => void): (() => void) => {
  console.log('Registered settings change handler');
  settingsChangeHandlers.push(cb as any);
  return () => {
    const index = settingsChangeHandlers.indexOf(cb as any);
    if (index !== -1) {
      settingsChangeHandlers.splice(index, 1);
    }
  };
};
