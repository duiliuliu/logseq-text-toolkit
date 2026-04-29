// 主题类型
export type ThemeType = 'light' | 'dark' | 'system';

// 语言类型
export type LanguageType = 'zh-CN' | 'en' | 'ja' | 'system';

// 语言配置类型
export interface LanguageConfig {
  code: string;
  name: string;
  path: string;
  isDefault?: boolean;
}

export interface LanguageMeta {
  languages: LanguageConfig[];
  fallbackLanguage: string;
}

// Toolbar item type
export interface ToolbarItem {
  id: string;
  label: string;
  icon: string;
  binding?: string;
  invoke: string;
  invokeParams: string;
  hidden?: boolean;
  funcmode?: string;
  clickfunc?: string;
}

// Toolbar group type
export interface ToolbarGroup extends ToolbarItem {
  subItems: ToolbarItem[];
}

// 全局设置类型
export interface Settings {
  theme: ThemeType;
  language: LanguageType;
  useSystemTheme: boolean;
  
  toolbar: boolean;
  disabled: boolean;
  showBorder: boolean;
  width: string;
  height: string;
  hoverDelay: number;
  sponsorEnabled: boolean;
  developerMode: boolean;
  
  ToolbarItems: Array<ToolbarItem | ToolbarGroup>;
  
  meta?: {
    language?: LanguageMeta;
  };
  
  [key: string]: any;
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
