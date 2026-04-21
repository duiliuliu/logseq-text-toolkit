// 主题类型
export type ThemeType = 'light' | 'dark' | 'system';

// 语言类型
export type LanguageType = 'zh-CN' | 'en' | 'ja' | 'system';

// Toolbar item type
export interface ToolbarItem {
  id: string;
  label: string;
  icon: string;
  binding?: string;
  funcmode: string;
  clickfunc: string;
  hidden?: boolean;
}

// Toolbar group type
export interface ToolbarGroup {
  [key: string]: ToolbarItem;
}

// 全局设置类型
export interface Settings {
  // 主题和语言设置
  theme: ThemeType;
  language: LanguageType;
  useSystemTheme: boolean;
  useSystemLanguage: boolean;
  
  // 工具栏设置
  toolbar: boolean;
  disabled: boolean;
  toolbarShortcut: string;
  
  // 工具栏元素配置
  [key: string]: ToolbarGroup | ToolbarItem | ThemeType | LanguageType | boolean | undefined;
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
