import { ToolbarConfig } from '../components/Toolbar/types.ts';

// 主题类型
export type ThemeType = 'light' | 'dark';

// 语言类型
export type LanguageType = 'zh-CN' | 'en' | 'ja';

// 全局设置类型
export interface Settings {
  theme: ThemeType;
  language: LanguageType;
  toolbar: ToolbarConfig;
}

// Settings Context 类型
export interface SettingsContextType {
  settings: Settings | null;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  loadSettings: () => Promise<Settings | null>;
  saveSettings: (settings: Settings) => Promise<boolean>;
  resetSettings: () => Promise<boolean>;
}
